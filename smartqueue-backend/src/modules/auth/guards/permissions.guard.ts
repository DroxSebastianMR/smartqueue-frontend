import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppException } from "@/common/exceptions/app.exception";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { PERMISSIONS_KEY } from "@/modules/auth/decorators/permissions.decorator";
import type { AuthenticatedRequest } from "@/modules/auth/guards/access-token.guard";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (
      !user ||
      !required.every((permission) => user.permissions.includes(permission))
    )
      throw new AppException(
        AuthErrorCode.PERMISSION_FORBIDDEN,
        "Permisos insuficientes",
        HttpStatus.FORBIDDEN,
      );
    return true;
  }
}
