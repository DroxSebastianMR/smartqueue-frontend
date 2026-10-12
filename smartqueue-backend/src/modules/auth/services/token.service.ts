import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppException } from "@/common/exceptions/app.exception";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";

export interface AccessClaims {
  sub: string;
  sid: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

@Injectable()
export class TokenService {
  private readonly secret: string;
  constructor(config: ConfigService) {
    const configured = config.get<string>("AUTH_TOKEN_SECRET");
    if (
      config.get<string>("NODE_ENV") === "production" &&
      (!configured || configured.length < 32)
    )
      throw new Error(
        "AUTH_TOKEN_SECRET debe estar configurado con al menos 32 caracteres",
      );
    this.secret = configured ?? "smartqueue-local-development-secret-change-me";
  }
  issue(
    userId: string,
    sessionId: string,
  ): { accessToken: string; expiresAt: string } {
    const now = Math.floor(Date.now() / 1000);
    const claims: AccessClaims = {
      sub: userId,
      sid: sessionId,
      iat: now,
      exp: now + 3600,
      iss: "cinetrux-api",
      aud: "cinetrux-web",
    };
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return {
      accessToken: `${header}.${body}.${this.sign(`${header}.${body}`)}`,
      expiresAt: new Date(claims.exp * 1000).toISOString(),
    };
  }
  verify(token: string): AccessClaims {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !part)) throw this.invalid();
    const [header, body, signature] = parts;
    const expected = Buffer.from(this.sign(`${header}.${body}`));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
      throw this.invalid();
    try {
      const parsedHeader = JSON.parse(
        Buffer.from(header, "base64url").toString(),
      ) as { alg?: string; typ?: string };
      const claims = JSON.parse(
        Buffer.from(body, "base64url").toString(),
      ) as AccessClaims;
      if (
        parsedHeader.alg !== "HS256" ||
        parsedHeader.typ !== "JWT" ||
        claims.iss !== "cinetrux-api" ||
        claims.aud !== "cinetrux-web" ||
        !claims.sub ||
        !claims.sid ||
        !Number.isInteger(claims.exp)
      )
        throw this.invalid();
      if (claims.exp <= Math.floor(Date.now() / 1000))
        throw new AppException(
          AuthErrorCode.TOKEN_EXPIRED,
          "Token vencido",
          HttpStatus.UNAUTHORIZED,
        );
      return claims;
    } catch (error) {
      if (error instanceof AppException) throw error;
      throw this.invalid();
    }
  }
  private sign(value: string): string {
    return createHmac("sha256", this.secret).update(value).digest("base64url");
  }
  private invalid(): AppException {
    return new AppException(
      AuthErrorCode.TOKEN_INVALID,
      "Token inválido",
      HttpStatus.UNAUTHORIZED,
    );
  }
}
