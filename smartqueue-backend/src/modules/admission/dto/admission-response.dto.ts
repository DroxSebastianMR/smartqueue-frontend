import { ApiProperty } from "@nestjs/swagger";
export class AdmissionResponseDto {
  @ApiProperty({ example: 10 }) admitted!: number;
  @ApiProperty({
    type: String,
    isArray: true,
    description: "IDs de entradas admitidas",
  })
  entryIds!: string[];
  @ApiProperty({ format: "date-time" }) accessExpiresAt!: Date;
}
