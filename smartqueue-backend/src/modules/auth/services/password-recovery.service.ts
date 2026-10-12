import { randomBytes } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import { PasswordService } from "@/modules/auth/services/password.service";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { AuthRepository } from "@/modules/auth/repositories/auth.repository";

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwords: PasswordService,
  ) {}
  change(userId: string, currentPassword: string, newPassword: string): void {
    const account = this.repository.findById(userId);
    if (
      !account ||
      !this.passwords.verify(currentPassword, account.passwordHash)
    )
      throw new AppException(
        AuthErrorCode.PASSWORD_INVALID,
        "Contraseña actual incorrecta",
        HttpStatus.UNAUTHORIZED,
      );
    this.repository.updatePassword(userId, this.passwords.hash(newPassword));
  }
  request(email: string): { message: string; developmentResetToken?: string } {
    const account = this.repository.findByEmail(email.trim().toLowerCase());
    let developmentResetToken: string | undefined;
    if (account) {
      developmentResetToken = randomBytes(32).toString("base64url");
      this.repository.storeReset(
        developmentResetToken,
        account.id,
        Date.now() + 15 * 60_000,
      );
    }
    return {
      message: "Si el correo existe, se generó una solicitud de recuperación.",
      ...(developmentResetToken ? { developmentResetToken } : {}),
    };
  }
  reset(token: string, password: string): void {
    const userId = this.repository.redeemReset(token);
    if (!userId)
      throw new AppException(
        AuthErrorCode.RESET_TOKEN_INVALID,
        "Enlace de recuperación inválido o vencido",
        HttpStatus.BAD_REQUEST,
      );
    this.repository.updatePassword(userId, this.passwords.hash(password));
  }
}
