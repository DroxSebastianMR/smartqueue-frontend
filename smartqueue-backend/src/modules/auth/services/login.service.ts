import { createHash } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import { AppException } from "@/common/exceptions/app.exception";
import { AuthSessionService } from "@/modules/auth/services/auth-session.service";
import { PasswordService } from "@/modules/auth/services/password.service";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import { AuthRepository } from "@/modules/auth/repositories/auth.repository";
import type { LoginResponseDto } from "@/modules/auth/dto/login-response.dto";

@Injectable()
export class LoginService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwords: PasswordService,
    private readonly sessions: AuthSessionService,
    private readonly cache: CacheStoreService,
  ) {}
  async execute(email: string, password: string): Promise<LoginResponseDto> {
    const normalized = email.trim().toLowerCase();
    const key = `auth:login:attempts:${createHash("sha256").update(normalized).digest("hex")}`;
    const count = await this.cache.increment(key, 60);
    if (count > 5)
      throw new AppException(
        AuthErrorCode.RATE_LIMITED,
        "Demasiados intentos. Espera un minuto.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    const account = this.repository.findByEmail(normalized);
    if (
      !account ||
      !this.passwords.verify(password, account.passwordHash) ||
      account.status !== "ACTIVE"
    ) {
      throw new AppException(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Credenciales inválidas",
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.cache.delete(key);
    return this.sessions.issue(account);
  }
}
