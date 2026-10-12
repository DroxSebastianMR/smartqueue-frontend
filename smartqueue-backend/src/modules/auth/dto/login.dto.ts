import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "demo@cinetrux.test" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "CinetruxDemo2026!", minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
