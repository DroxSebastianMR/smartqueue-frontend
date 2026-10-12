import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
export class DashboardResponseDto {
  @ApiProperty({ example: 120 }) waiting!: number;
  @ApiProperty({ example: 35 }) activeBuyers!: number;
  @ApiProperty({ example: 48 }) completed!: number;
  @ApiPropertyOptional({
    nullable: true,
    type: "object",
    additionalProperties: true,
    description:
      "Última predicción con ventana de métricas; null si aún no existe",
  })
  latest!: Record<string, unknown> | null;
}
