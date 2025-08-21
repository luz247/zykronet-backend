import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/common/entities/user.entity';
import { JwtPayload } from '../interface/jwt.interface';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false, // explícito
      // issuer: 'tu-dominio',     // opcional, si también lo pones al firmar
      // audience: 'tu-frontend',  // opcional
    });
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload; // o const { sub: id } = payload;

    const user = await this.userModel
      .findById(sub)
      .select('_id email name roles isActive') // evita exponer password u otros
      .lean();

    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

   

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive, talk with an admin');
    }

    // Esto será request.user
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      roles: user.roles ?? [],
    };
  }
}
