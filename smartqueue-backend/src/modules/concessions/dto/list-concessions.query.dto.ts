import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ConcessionCategory } from "@prisma/client";
import { ListQueryDto } from "@/modules/catalog/dto/list-query.dto";

export class ListConcessionsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: ConcessionCategory })
  @IsOptional()
  @IsEnum(ConcessionCategory)
  category?: ConcessionCategory;

  @ApiPropertyOptional({ type: Boolean, description: "Solo productos destacados" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;
}
