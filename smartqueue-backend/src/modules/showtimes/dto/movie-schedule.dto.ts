import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";
import { MovieProjectionFormat } from "@/modules/movies/enums/movie-catalog.enum";
import { ShowtimeStatus } from "@/modules/showtimes/enums/showtime-catalog.enum";

export class MovieScheduleQueryDto {
  @ApiPropertyOptional({ example: "cinetrux-centro" })
  @IsOptional()
  @IsString()
  cinemaSlug?: string;
  @ApiPropertyOptional({ example: -12.109 })
  @IsOptional()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;
  @ApiPropertyOptional({ example: -77.035 })
  @IsOptional()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;
  @ApiPropertyOptional({ type: "integer", minimum: 1, maximum: 5, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  days = 5;
  @ApiPropertyOptional({ enum: MovieProjectionFormat })
  @IsOptional()
  @IsEnum(MovieProjectionFormat)
  format?: MovieProjectionFormat;
  @ApiPropertyOptional({ example: "es-419" })
  @IsOptional()
  @Matches(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/)
  audioLanguage?: string;
}
export class ScheduleSlotDto {
  @ApiProperty({ format: "uuid" }) showtimeId!: string;
  @ApiProperty({ format: "date-time" }) startsAt!: string;
  @ApiProperty({ example: "17:10" }) localTime!: string;
  @ApiProperty({ enum: ShowtimeStatus }) status!: ShowtimeStatus;
  @ApiProperty() bookable!: boolean;
  @ApiProperty({ type: "integer" }) basePriceCents!: number;
  @ApiProperty({ example: "PEN" }) currency!: string;
  @ApiProperty({ enum: ["UNKNOWN"] }) seatAvailability!: "UNKNOWN";
}
export class ScheduleGroupDto {
  @ApiProperty({ enum: MovieProjectionFormat }) format!: MovieProjectionFormat;
  @ApiProperty({ example: "es-419" }) audioLanguage!: string;
  @ApiProperty({ nullable: true, example: "es-PE" }) subtitleLanguage!:
    string | null;
  @ApiProperty({ type: [ScheduleSlotDto] }) slots!: ScheduleSlotDto[];
}
export class ScheduleDayDto {
  @ApiProperty({ example: "2026-10-12" }) date!: string;
  @ApiProperty({ example: "lunes" }) weekday!: string;
  @ApiProperty({ type: [ScheduleGroupDto] }) groups!: ScheduleGroupDto[];
}
export class MovieScheduleDto {
  @ApiProperty({ example: "avengers-doomsday" }) movieSlug!: string;
  @ApiProperty({ nullable: true, example: "cinetrux-centro" }) cinemaSlug!:
    string | null;
  @ApiProperty({ nullable: true, example: "America/Lima" }) timeZone!:
    string | null;
  @ApiProperty({ enum: ["SELECTED", "NEARBY", "NO_GEOCODED_CINEMA"] })
  locationStatus!: "SELECTED" | "NEARBY" | "NO_GEOCODED_CINEMA";
  @ApiProperty({ type: "number", nullable: true }) distanceKm!: number | null;
  @ApiProperty({ type: [ScheduleDayDto] }) days!: ScheduleDayDto[];
}
