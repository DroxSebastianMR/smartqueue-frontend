import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from "class-validator";
import {
  ListQueryDto,
  PageMetaDto,
} from "@/modules/catalog/dto/list-query.dto";
import { ShowtimeStatus } from "@/modules/showtimes/enums/showtime-catalog.enum";

export class CreateShowtimeDto {
  @ApiProperty({ example: "avengers-doomsday" })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  movieSlug!: string;
  @ApiProperty({ format: "uuid" }) @IsUUID() movieVersionId!: string;
  @ApiProperty({ format: "uuid" }) @IsUUID() auditoriumId!: string;
  @ApiProperty({ format: "date-time" }) @IsDateString() startsAt!: string;
  @ApiProperty({ format: "date-time" }) @IsDateString() endsAt!: string;
  @ApiProperty({ type: "integer", minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePriceCents!: number;
  @ApiPropertyOptional({ example: "PEN", default: "PEN" })
  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;
  @ApiPropertyOptional({ format: "date-time", nullable: true })
  @IsOptional()
  @IsDateString()
  bookingOpensAt?: string | null;
}
export class UpdateShowtimeDto extends PartialType(
  OmitType(CreateShowtimeDto, [
    "movieSlug",
    "movieVersionId",
    "auditoriumId",
  ] as const),
) {}
export class ShowtimeResponseDto extends CreateShowtimeDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ example: "cinetrux-centro" }) cinemaSlug!: string;
  @ApiProperty({ enum: ShowtimeStatus }) status!: ShowtimeStatus;
}
export class ShowtimePageDto {
  @ApiProperty({ type: [ShowtimeResponseDto] }) data!: ShowtimeResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
export class ShowtimeQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ example: "Lima" })
  @IsOptional()
  @IsString()
  city?: string;
  @ApiPropertyOptional({ example: "cinetrux-centro" })
  @IsOptional()
  @IsString()
  cinemaSlug?: string;
  @ApiPropertyOptional({ example: "avengers-doomsday" })
  @IsOptional()
  @IsString()
  movieSlug?: string;
  @ApiPropertyOptional({ example: "2026-12-17" })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
export class ShowtimeAvailabilityDto {
  @ApiProperty({ format: "uuid" }) showtimeId!: string;
  @ApiProperty({ enum: ["NOT_CONNECTED"] }) status!: "NOT_CONNECTED";
  @ApiProperty({ type: "integer" }) configuredSeats!: number;
  @ApiProperty({ type: "integer", nullable: true }) availableSeats!: null;
  @ApiProperty({
    description:
      "No se calcula disponibilidad hasta conectar entradas y reservas reales",
  })
  message!: string;
}
