import { randomUUID, createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@/modules/auth/enums/user-role.enum";
import { PasswordService } from "@/modules/auth/services/password.service";

export interface AuthAccount {
  id: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  status: "ACTIVE" | "DISABLED";
}
export interface AuthSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  revokedAt?: number;
}

/** Volatile adapter. Replace with a Prisma-backed repository before production. */
@Injectable()
export class AuthRepository {
  private readonly users = new Map<string, AuthAccount>();
  private readonly sessions = new Map<string, AuthSession>();
  private readonly resets = new Map<
    string,
    { userId: string; expiresAt: number }
  >();

  constructor(config: ConfigService, passwords: PasswordService) {
    if (config.get<string>("NODE_ENV") === "production")
      throw new Error(
        "El repositorio de autenticación en memoria no está permitido en producción",
      );
    this.seed(
      "demo-customer",
      config.get<string>("AUTH_DEMO_EMAIL") ?? "demo@cinetrux.test",
      config.get<string>("AUTH_DEMO_PASSWORD") ?? "CinetruxDemo2026!",
      UserRole.CUSTOMER,
      passwords,
    );
    this.seed(
      "demo-admin",
      config.get<string>("AUTH_ADMIN_EMAIL") ?? "admin@cinetrux.test",
      config.get<string>("AUTH_ADMIN_PASSWORD") ?? "CinetruxAdmin2026!",
      UserRole.ADMIN,
      passwords,
    );
  }
  private seed(
    id: string,
    email: string,
    password: string,
    role: UserRole,
    passwords: PasswordService,
  ): void {
    this.users.set(email.toLowerCase(), {
      id,
      email: email.toLowerCase(),
      passwordHash: passwords.hash(password),
      roles: [role],
      status: "ACTIVE",
    });
  }
  findByEmail(email: string): AuthAccount | undefined {
    return this.users.get(email.toLowerCase());
  }
  findById(id: string): AuthAccount | undefined {
    return [...this.users.values()].find((user) => user.id === id);
  }
  createCustomer(email: string, passwordHash: string): AuthAccount {
    const user: AuthAccount = {
      id: randomUUID(),
      email: email.toLowerCase(),
      passwordHash,
      roles: [UserRole.CUSTOMER],
      status: "ACTIVE",
    };
    this.users.set(user.email, user);
    return user;
  }
  updatePassword(userId: string, passwordHash: string): void {
    const user = this.findById(userId);
    if (user) user.passwordHash = passwordHash;
    this.revokeAll(userId);
  }
  saveSession(session: AuthSession): void {
    this.sessions.set(session.id, session);
  }
  findSession(id: string): AuthSession | undefined {
    return this.sessions.get(id);
  }
  listSessions(userId: string): AuthSession[] {
    return [...this.sessions.values()].filter(
      (session) =>
        session.userId === userId &&
        !session.revokedAt &&
        session.expiresAt > Date.now(),
    );
  }
  revokeSession(id: string, userId: string): boolean {
    const session = this.sessions.get(id);
    if (!session || session.userId !== userId || session.revokedAt)
      return false;
    session.revokedAt = Date.now();
    return true;
  }
  revokeAll(userId: string): void {
    for (const session of this.sessions.values())
      if (session.userId === userId) session.revokedAt = Date.now();
  }
  storeReset(rawToken: string, userId: string, expiresAt: number): void {
    this.resets.set(this.digest(rawToken), { userId, expiresAt });
  }
  redeemReset(rawToken: string): string | undefined {
    const key = this.digest(rawToken);
    const reset = this.resets.get(key);
    this.resets.delete(key);
    return reset && reset.expiresAt > Date.now() ? reset.userId : undefined;
  }
  digest(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}
