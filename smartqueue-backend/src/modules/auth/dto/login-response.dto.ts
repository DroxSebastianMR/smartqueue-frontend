import { ApiProperty } from "@nestjs/swagger";

import { UserRole } from "@/modules/auth/enums/user-role.enum";
import { Permission } from "@/modules/auth/enums/permission.enum";

export class SessionUserDto {
  @ApiProperty({ example: "demo-customer" })
  id!: string;

  @ApiProperty({ example: "demo@cinetrux.test" })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ enum: UserRole, isArray: true, example: [UserRole.CUSTOMER] })
  roles!: UserRole[];

  @ApiProperty({
    enum: Permission,
    isArray: true,
    example: [Permission.PROFILE_READ, Permission.TICKET_PURCHASE],
  })
  permissions!: Permission[];
}

export class LoginResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<signature>",
  })
  accessToken!: string;

  @ApiProperty({ example: "Bearer" })
  tokenType!: "Bearer";

  @ApiProperty({
    description: "Vencimiento ISO 8601 del token",
    example: "2026-10-11T13:00:00.000Z",
  })
  expiresAt!: string;

  @ApiProperty({
    description: "Token opaco para renovar la sesión; se rota en cada uso",
    example: "session-id.<random-secret>",
  })
  refreshToken!: string;

  @ApiProperty({ example: "2026-10-18T12:00:00.000Z" })
  refreshExpiresAt!: string;

  @ApiProperty({ type: SessionUserDto })
  user!: SessionUserDto;
}
