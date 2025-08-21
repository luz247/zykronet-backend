import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/common/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_OAUTH_CLIENT } from './constants/auth.constants';
import { JwtStrategy } from './strategies/jwt-strategy';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRED'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: GOOGLE_OAUTH_CLIENT,
      useFactory: (config: ConfigService) =>
        new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID')),
      inject: [ConfigService],
    },
  ],
  exports:[JwtStrategy, JwtModule]
})
export class AuthModule {}
