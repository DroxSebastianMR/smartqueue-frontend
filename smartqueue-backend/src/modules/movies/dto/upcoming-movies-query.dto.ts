import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

/** Pagination contract exclusive to the upcoming releases catalogue. */
export class UpcomingMoviesQueryDto {
  @ApiPropertyOptional({
    type: "integer",
    format: "int32",
    minimum: 1,
    maximum: 15,
    default: 15,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15)
  limit = 15;

  @ApiPropertyOptional({ type: "integer", format: "int32", minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
}
