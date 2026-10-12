import { Module } from "@nestjs/common";

import { AuthService } from "@/modules/auth/services/auth.service";
import { AuthSessionService } from "@/modules/auth/services/auth-session.service";
import { LoginService } from "@/modules/auth/services/login.service";
import { RegistrationService } from "@/modules/auth/services/registration.service";
import { PasswordRecoveryService } from "@/modules/auth/services/password-recovery.service";
import { PasswordService } from "@/modules/auth/services/password.service";
import { TokenService } from "@/modules/auth/services/token.service";
import { AuthRepository } from "@/modules/auth/repositories/auth.repository";
import { AuthController } from "@/modules/auth/controllers/auth.controller";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";

@Module({
  controllers: [AuthController],
  providers: [
    AuthRepository,
    PasswordService,
    TokenService,
    AuthSessionService,
    LoginService,
    RegistrationService,
    PasswordRecoveryService,
    AuthService,
    AccessTokenGuard,
    PermissionsGuard,
  ],
  exports: [AuthService, AccessTokenGuard, PermissionsGuard],
})
export class AuthModule {}
