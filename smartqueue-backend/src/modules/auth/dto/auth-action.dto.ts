import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "cliente@ejemplo.com" }) @IsEmail() email!: string;
  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
export class RefreshDto {
  @ApiProperty() @IsString() @MaxLength(512) refreshToken!: string;
}
export class ChangePasswordDto {
  @ApiProperty() @IsString() currentPassword!: string;
  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword!: string;
}
export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email!: string;
}
export class ResetPasswordDto {
  @ApiProperty() @IsString() @MaxLength(512) token!: string;
  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword!: string;
}
export class MessageDto {
  @ApiProperty({ example: "Sesión cerrada" }) message!: string;
}
export class SessionDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ format: "date-time" }) expiresAt!: string;
}
export class ForgotPasswordResponseDto {
  @ApiProperty({
    example: "Si el correo existe, se generó una solicitud de recuperación.",
  })
  message!: string;
  @ApiProperty({
    required: false,
    description: "Solo disponible en el adaptador local de desarrollo",
  })
  developmentResetToken?: string;
}
