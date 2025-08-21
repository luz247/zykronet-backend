import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GOOGLE_OAUTH_CLIENT } from './constants/auth.constants';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(GOOGLE_OAUTH_CLIENT) private readonly google: OAuth2Client,
  ) {}

  @Post('register')
  register(@Body() user: CreateAuthDto) {
    return this.authService.register(
      user.name,
      user.lastName,
      user.email,
      user.password,
      user.empresa,
    );
  }

  @Post('login')
  login(@Body() user: LoginAuthDto) {
    return this.authService.login(user);
  }

  @Post('google-token')
  async googleToken(@Body() body: { idToken: string }) {
    const audience = this.configService.get<string>('GOOGLE_CLIENT_ID');
    try {
      const ticket = await this.google.verifyIdToken({
        idToken: body.idToken,
        audience,
      });

      const payload = ticket.getPayload();
      if (!payload?.email || !payload?.sub) {
        throw new UnauthorizedException('Token de Google inválido');
      }
      return this.authService.loginWithGoogle({
        email: payload.email,
        name: payload.name ?? undefined,
        googleId: payload.sub,
        avatar: payload.picture ?? undefined,
      });
    } catch {
      throw new UnauthorizedException('Token de Google inválido');
    }
  }
}
