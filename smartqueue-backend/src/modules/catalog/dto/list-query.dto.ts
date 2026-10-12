import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class ListQueryDto {
  @ApiPropertyOptional({
    type: "integer",
    format: "int32",
    minimum: 1,
    maximum: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit = 10;

  @ApiPropertyOptional({
    type: "integer",
    format: "int32",
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
}

export class CompactListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    type: "integer",
    format: "int32",
    minimum: 1,
    maximum: 5,
    default: 5,
  })
  @Max(5)
  override limit = 5;
}

export class PageMetaDto {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 10 }) count!: number;
  @ApiProperty({ example: 25 }) total!: number;
  @ApiProperty({ example: true }) hasNextPage!: boolean;
}

export interface Page<T> {
  data: T[];
  meta: PageMetaDto;
}

export function paginate<T>(items: readonly T[], query: ListQueryDto): Page<T> {
  const start = (query.page - 1) * query.limit;
  const data = items.slice(start, start + query.limit);
  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      count: data.length,
      total: items.length,
      hasNextPage: start + data.length < items.length,
    },
  };
}
