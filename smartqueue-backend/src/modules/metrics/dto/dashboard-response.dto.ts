import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardResponseDto {
  @ApiPropertyOptional({
    type: "object",
    nullable: true,
    additionalProperties: true,
  })
  run!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: "object",
    nullable: true,
    additionalProperties: true,
  })
  kpis!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: "object",
    nullable: true,
    additionalProperties: true,
  })
  prediction!: Record<string, unknown> | null;

  @ApiProperty({
    type: "array",
    items: { type: "object", additionalProperties: true },
  })
  history!: Record<string, unknown>[];

  @ApiProperty({
    type: "array",
    items: { type: "object", additionalProperties: true },
  })
  comparison!: Record<string, unknown>[];

  @ApiPropertyOptional({ nullable: true })
  message!: string | null;
}
