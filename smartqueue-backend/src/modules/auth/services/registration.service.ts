import { HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import { AuthSessionService } from "@/modules/auth/services/auth-session.service";
import { PasswordService } from "@/modules/auth/services/password.service";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { AuthRepository } from "@/modules/auth/repositories/auth.repository";
import type { LoginResponseDto } from "@/modules/auth/dto/login-response.dto";

@Injectable()
export class RegistrationService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwords: PasswordService,
    private readonly sessions: AuthSessionService,
  ) {}
  execute(email: string, password: string): LoginResponseDto {
    const normalized = email.trim().toLowerCase();
    if (this.repository.findByEmail(normalized))
      throw new AppException(
        AuthErrorCode.EMAIL_TAKEN,
        "El correo ya está registrado",
        HttpStatus.CONFLICT,
      );
    return this.sessions.issue(
      this.repository.createCustomer(normalized, this.passwords.hash(password)),
    );
  }
}
