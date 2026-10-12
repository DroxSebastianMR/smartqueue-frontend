import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import { TokenService } from "@/modules/auth/services/token.service";
import { permissionsFor } from "@/modules/auth/constants/role-permissions.constant";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import {
  AuthAccount,
  AuthRepository,
} from "@/modules/auth/repositories/auth.repository";
import type {
  LoginResponseDto,
  SessionUserDto,
} from "@/modules/auth/dto/login-response.dto";

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokens: TokenService,
  ) {}

  issue(account: AuthAccount): LoginResponseDto {
    const id = randomUUID();
    const refreshToken = `${id}.${randomBytes(32).toString("base64url")}`;
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 3600_000);
    this.repository.saveSession({
      id,
      userId: account.id,
      tokenHash: this.repository.digest(refreshToken),
      expiresAt: refreshExpiresAt.getTime(),
    });
    return {
      ...this.tokens.issue(account.id, id),
      tokenType: "Bearer",
      refreshToken,
      refreshExpiresAt: refreshExpiresAt.toISOString(),
      user: this.toUser(account),
    };
  }
  refresh(refreshToken: string): LoginResponseDto {
    const [id, secret, extra] = refreshToken.split(".");
    const session =
      id && secret && !extra ? this.repository.findSession(id) : undefined;
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= Date.now() ||
      !this.equal(this.repository.digest(refreshToken), session.tokenHash)
    ) {
      throw new AppException(
        AuthErrorCode.SESSION_REVOKED,
        "Sesión inválida o vencida",
        HttpStatus.UNAUTHORIZED,
      );
    }
    const account = this.repository.findById(session.userId);
    if (!account || account.status !== "ACTIVE")
      throw new AppException(
        AuthErrorCode.SESSION_REVOKED,
        "Sesión inválida",
        HttpStatus.UNAUTHORIZED,
      );
    this.repository.revokeSession(session.id, account.id);
    return this.issue(account);
  }
  verify(token: string): SessionUserDto {
    const claims = this.tokens.verify(token);
    const session = this.repository.findSession(claims.sid);
    const account = this.repository.findById(claims.sub);
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= Date.now() ||
      session.userId !== claims.sub ||
      !account ||
      account.status !== "ACTIVE"
    ) {
      throw new AppException(
        AuthErrorCode.SESSION_REVOKED,
        "Sesión revocada",
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.toUser(account);
  }
  sessionId(token: string): string {
    return this.tokens.verify(token).sid;
  }
  logout(userId: string, sessionId: string): void {
    this.repository.revokeSession(sessionId, userId);
  }
  logoutAll(userId: string): void {
    this.repository.revokeAll(userId);
  }
  listSessions(userId: string): Array<{ id: string; expiresAt: string }> {
    return this.repository
      .listSessions(userId)
      .map((s) => ({
        id: s.id,
        expiresAt: new Date(s.expiresAt).toISOString(),
      }));
  }
  revokeSession(userId: string, sessionId: string): void {
    if (!this.repository.revokeSession(sessionId, userId))
      throw new AppException(
        AuthErrorCode.SESSION_REVOKED,
        "Sesión no encontrada",
        HttpStatus.NOT_FOUND,
      );
  }
  private toUser(account: AuthAccount): SessionUserDto {
    return {
      id: account.id,
      email: account.email,
      role: account.roles[0],
      roles: account.roles,
      permissions: permissionsFor(account.roles),
    };
  }
  private equal(left: string, right: string): boolean {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
