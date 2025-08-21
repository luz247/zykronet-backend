import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Token expired');
    }

    if (err) {
      const message = err.message || 'Authentication error';
      throw new UnauthorizedException(message);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    return user;
  }
}
