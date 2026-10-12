import { Injectable } from "@nestjs/common";
import { AuthSessionService } from "@/modules/auth/services/auth-session.service";
import { LoginService } from "@/modules/auth/services/login.service";
import { PasswordRecoveryService } from "@/modules/auth/services/password-recovery.service";
import { RegistrationService } from "@/modules/auth/services/registration.service";
import type {
  LoginResponseDto,
  SessionUserDto,
} from "@/modules/auth/dto/login-response.dto";

/** Thin facade that preserves the public API while each flow has one responsibility. */
@Injectable()
export class AuthService {
  constructor(
    private readonly loginService: LoginService,
    private readonly registration: RegistrationService,
    private readonly sessions: AuthSessionService,
    private readonly passwords: PasswordRecoveryService,
  ) {}
  login(email: string, password: string): Promise<LoginResponseDto> {
    return this.loginService.execute(email, password);
  }
  register(email: string, password: string): LoginResponseDto {
    return this.registration.execute(email, password);
  }
  refresh(token: string): LoginResponseDto {
    return this.sessions.refresh(token);
  }
  verify(token: string): SessionUserDto {
    return this.sessions.verify(token);
  }
  sessionId(token: string): string {
    return this.sessions.sessionId(token);
  }
  logout(userId: string, sessionId: string): void {
    this.sessions.logout(userId, sessionId);
  }
  logoutAll(userId: string): void {
    this.sessions.logoutAll(userId);
  }
  listSessions(userId: string): Array<{ id: string; expiresAt: string }> {
    return this.sessions.listSessions(userId);
  }
  revokeSession(userId: string, sessionId: string): void {
    this.sessions.revokeSession(userId, sessionId);
  }
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): void {
    this.passwords.change(userId, currentPassword, newPassword);
  }
  forgotPassword(email: string): {
    message: string;
    developmentResetToken?: string;
  } {
    return this.passwords.request(email);
  }
  resetPassword(token: string, password: string): void {
    this.passwords.reset(token, password);
  }
}
