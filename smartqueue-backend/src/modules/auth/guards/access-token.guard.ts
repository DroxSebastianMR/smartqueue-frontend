import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { AuthService } from "@/modules/auth/services/auth.service";
import type { SessionUserDto } from "@/modules/auth/dto/login-response.dto";

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  user: SessionUserDto;
  sessionId: string;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token)
      throw new AppException(
        AuthErrorCode.TOKEN_INVALID,
        "Token de acceso requerido",
        HttpStatus.UNAUTHORIZED,
      );
    request.user = this.auth.verify(token);
    request.sessionId = this.auth.sessionId(token);
    return true;
  }
}
