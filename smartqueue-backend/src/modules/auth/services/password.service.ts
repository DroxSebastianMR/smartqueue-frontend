import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordService {
  hash(password: string): string {
    const salt = randomBytes(16);
    return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
  }
  verify(password: string, stored: string): boolean {
    const [algorithm, salt, digest] = stored.split(":");
    if (algorithm !== "scrypt" || !salt || !digest) return false;
    const expected = Buffer.from(digest, "hex");
    const actual = scryptSync(
      password,
      Buffer.from(salt, "hex"),
      expected.length,
    );
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
