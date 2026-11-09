import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ConcessionCategory } from "@prisma/client";
import { PageMetaDto } from "@/modules/catalog/dto/list-query.dto";

export class ConcessionProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ enum: ConcessionCategory }) category!: ConcessionCategory;
  @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
  @ApiProperty({ example: 2990, description: "Monto en céntimos" }) priceCents!: number;
  @ApiProperty({ example: "PEN" }) currency!: string;
  @ApiProperty() available!: boolean;
  @ApiProperty() featured!: boolean;
}

export class ConcessionProductPageDto {
  @ApiProperty({ type: [ConcessionProductResponseDto] }) data!: ConcessionProductResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
