import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/common/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GoogleProfile } from './interface/googleprofile.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwt: JwtService,
  ) {}

  async register(
    name: string,
    lastName: string,
    email: string,
    password: string,
    empresa: string,
  ) {
    const emailNorm = email.toLowerCase();
    const exist = await this.userModel.findOne({ email: emailNorm });
    if (exist) throw new ConflictException('Email ya registrado');

    const user = (await this.userModel.create({
      name,
      lastName,
      email: emailNorm,
      empresa,
      passwordHash: await bcrypt.hash(password, 10),
      roles: ['customer'],
      oauthOnly: false,
    })) as UserDocument;

    return this.sign(user);
  }

  async login(loginUserDto: LoginAuthDto) {
    const emailNorm = loginUserDto.email.toLowerCase();

    // Selecciona explícitamente el hash
    const user = await this.userModel
      .findOne({ email: emailNorm })
      .select('+passwordHash');

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (user.oauthOnly) {
      throw new UnauthorizedException(
        'Tu cuenta es Google-only. Inicia sesión con Google.',
      );
    }

    const ok = await bcrypt.compare(loginUserDto.password, user.passwordHash!);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.sign(user);
  }

  async loginWithGoogle(profile: GoogleProfile) {
    const email = profile.email?.toLowerCase();
    if (!email)
      throw new UnauthorizedException('Google no retornó email válido');

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = await this.userModel.create({
        name: profile.name || email.split('@')[0],
        lastName: ' ',
        email,
        empresa: 'other',
        passwordHash: null, // sin password local
        roles: ['customer'],
        googleId: profile.googleId,
        avatar: profile.avatar,
        oauthOnly: true,
      });
    } else {
      // Si existe local, linkea Google si faltaba; actualiza avatar si cambió
      const updates: Partial<User> = {};
      if (!user.googleId) updates.googleId = profile.googleId;
      if (profile.avatar && user.avatar !== profile.avatar)
        updates.avatar = profile.avatar;

      if (Object.keys(updates).length) {
        await this.userModel.updateOne({ _id: user._id }, { $set: updates });
        user = await this.userModel.findById(user._id); // refresca
      }
    }

    return this.sign(user as UserDocument);
  }

  private sign(user: UserDocument) {
    const payload = {
      sub: String(user._id),
      email: user.email,
      roles: user.roles || ['customer'],
    };
    const token = this.jwt.sign(payload);
    return {
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        roles: user.roles,
        avatar: user.avatar,
        googleLinked: !!user.googleId,
      },
    };
  }
}
