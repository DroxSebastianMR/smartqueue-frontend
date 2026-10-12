import { ConfigService } from "@nestjs/config";
import { AppException } from "@/common/exceptions/app.exception";

import { AuthService } from "@/modules/auth/services/auth.service";
import { AuthSessionService } from "@/modules/auth/services/auth-session.service";
import { LoginService } from "@/modules/auth/services/login.service";
import { RegistrationService } from "@/modules/auth/services/registration.service";
import { PasswordRecoveryService } from "@/modules/auth/services/password-recovery.service";
import { CacheStoreService } from "@/common/cache/cache-store.service";
import type { CacheConfig } from "@/config/cache/cache-config.interface";
import { PasswordService } from "@/modules/auth/services/password.service";
import { TokenService } from "@/modules/auth/services/token.service";
import { AuthRepository } from "@/modules/auth/repositories/auth.repository";
import { UserRole } from "@/modules/auth/enums/user-role.enum";

const config = {
  get: (key: string) => (key === "NODE_ENV" ? "test" : undefined),
} as ConfigService;

describe("AuthService", () => {
  const passwords = new PasswordService();
  const repository = new AuthRepository(config, passwords);
  const sessions = new AuthSessionService(repository, new TokenService(config));
  const cacheConfig: CacheConfig = {
    driver: "memory",
    maxMemoryEntries: 100,
    redis: { host: "localhost", port: 6379, database: 0, keyPrefix: "test:" },
  };
  const cache = new CacheStoreService({
    getOrThrow: () => cacheConfig,
  } as unknown as ConfigService);
  const service = new AuthService(
    new LoginService(repository, passwords, sessions, cache),
    new RegistrationService(repository, passwords, sessions),
    sessions,
    new PasswordRecoveryService(repository, passwords),
  );

  it("emite y verifica la sesión del cliente", async () => {
    const session = await service.login(
      "demo@cinetrux.test",
      "CinetruxDemo2026!",
    );
    expect(session.user.role).toBe(UserRole.CUSTOMER);
    expect(service.verify(session.accessToken)).toEqual(session.user);
  });

  it("emite y verifica la sesión del administrador", async () => {
    const session = await service.login(
      "admin@cinetrux.test",
      "CinetruxAdmin2026!",
    );
    expect(session.user.role).toBe(UserRole.ADMIN);
    expect(service.verify(session.accessToken)).toEqual(session.user);
  });

  it("rechaza credenciales y tokens inválidos", async () => {
    await expect(
      service.login("demo@cinetrux.test", "incorrecta"),
    ).rejects.toThrow(AppException);
    expect(() => service.verify("token-invalido")).toThrow(AppException);
  });

  it("rota el refresh token e invalida el anterior", async () => {
    const first = await service.login(
      "demo@cinetrux.test",
      "CinetruxDemo2026!",
    );
    const second = service.refresh(first.refreshToken);
    expect(() => service.refresh(first.refreshToken)).toThrow(AppException);
    expect(() => service.verify(first.accessToken)).toThrow(AppException);
    expect(service.verify(second.accessToken).id).toBe(first.user.id);
  });

  it("registra clientes y revoca las sesiones al cambiar contraseña", async () => {
    const session = service.register(
      "nuevo@cinetrux.test",
      "PasswordSeguro123!",
    );
    expect(session.user.role).toBe(UserRole.CUSTOMER);
    service.changePassword(
      session.user.id,
      "PasswordSeguro123!",
      "PasswordNuevo123!",
    );
    expect(() => service.verify(session.accessToken)).toThrow(AppException);
    expect(
      (await service.login("nuevo@cinetrux.test", "PasswordNuevo123!")).user.id,
    ).toBe(session.user.id);
  });

  it("consume el token de recuperación una sola vez", async () => {
    const session = service.register(
      "recuperar@cinetrux.test",
      "PasswordSeguro123!",
    );
    const reset = service.forgotPassword(session.user.email);
    expect(reset.developmentResetToken).toBeDefined();
    service.resetPassword(reset.developmentResetToken!, "PasswordNuevo123!");
    expect(() =>
      service.resetPassword(reset.developmentResetToken!, "OtroPassword123!"),
    ).toThrow(AppException);
    expect(() => service.verify(session.accessToken)).toThrow(AppException);
    expect(
      (await service.login(session.user.email, "PasswordNuevo123!")).user.id,
    ).toBe(session.user.id);
  });

  it("cierra la sesión actual sin afectar a otra sesión", async () => {
    const first = await service.login(
      "demo@cinetrux.test",
      "CinetruxDemo2026!",
    );
    const second = await service.login(
      "demo@cinetrux.test",
      "CinetruxDemo2026!",
    );
    service.logout(first.user.id, service.sessionId(first.accessToken));
    expect(() => service.verify(first.accessToken)).toThrow(AppException);
    expect(service.verify(second.accessToken).id).toBe(second.user.id);
  });

  it("limita intentos de login usando el almacén de caché", async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await expect(
        service.login("bloqueado@cinetrux.test", "incorrecta"),
      ).rejects.toThrow(AppException);
    }
    await expect(
      service.login("bloqueado@cinetrux.test", "incorrecta"),
    ).rejects.toMatchObject({
      response: { code: "AUTH_RATE_LIMITED" },
    });
  });
});
