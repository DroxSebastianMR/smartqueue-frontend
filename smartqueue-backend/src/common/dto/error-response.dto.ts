import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
export class ErrorResponseDto {
  @ApiProperty({ example: 400 }) statusCode!: number;
  @ApiProperty({ example: "BAD_REQUEST" }) error!: string;
  @ApiProperty({ example: "VALIDATION_ERROR" }) code!: string;
  @ApiProperty({ example: "El correo debe ser válido" }) message!: string;
  @ApiProperty({ example: "/api/v1/auth/login" }) path!: string;
  @ApiProperty({ example: "2026-10-11T12:00:00.000Z", format: "date-time" })
  timestamp!: string;
  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  meta?: Record<string, unknown>;
}
