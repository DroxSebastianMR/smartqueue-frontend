import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  ListQueryDto,
  PageMetaDto,
} from "@/modules/catalog/dto/list-query.dto";
import {
  AuditoriumStatus,
  CinemaStatus,
  SeatType,
} from "@/modules/cinemas/enums/cinema-catalog.enum";
import { MovieProjectionFormat } from "@/modules/movies/enums/movie-catalog.enum";

export class CreateCinemaDto {
  @ApiProperty({ example: "cinetrux-centro" })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;
  @ApiProperty({ example: "Cinetrux Centro" })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;
  @ApiProperty({ example: "Lima" })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city!: string;
  @ApiPropertyOptional({ example: "PE", default: "PE" })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;
  @ApiPropertyOptional({ example: "Lima" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  region?: string;
  @ApiPropertyOptional({ example: "Miraflores" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  district?: string;
  @ApiProperty({ example: "Av. Principal 123" })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  address!: string;
  @ApiProperty({ example: "America/Lima" })
  @IsString()
  @MaxLength(80)
  timeZone!: string;
  @ApiPropertyOptional({ example: -12.109, minimum: -90, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;
  @ApiPropertyOptional({ example: -77.035, minimum: -180, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;
}
export class UpdateCinemaDto extends PartialType(
  OmitType(CreateCinemaDto, ["slug"] as const),
) {
  @ApiPropertyOptional({ enum: CinemaStatus })
  @IsOptional()
  @IsEnum(CinemaStatus)
  status?: CinemaStatus;
}
export class CinemaResponseDto extends CreateCinemaDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ enum: CinemaStatus }) status!: CinemaStatus;
}
export class CinemaPageDto {
  @ApiProperty({ type: [CinemaResponseDto] }) data!: CinemaResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
export class CinemaQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ example: "Lima" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;
  @ApiPropertyOptional({ example: "PE" })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;
  @ApiPropertyOptional({ example: "Miraflores" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  district?: string;
}
export class NearbyCinemasQueryDto extends ListQueryDto {
  @ApiProperty({ example: -12.109 })
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude!: number;
  @ApiProperty({ example: -77.035 })
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude!: number;
  @ApiPropertyOptional({ example: "PE" })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;
}
export class NearbyCinemaDto extends CinemaResponseDto {
  @ApiProperty({
    type: "number",
    description: "Distancia aproximada en línea recta, no ruta vial",
  })
  distanceKm!: number;
}
export class NearbyCinemasPageDto {
  @ApiProperty({ type: [NearbyCinemaDto] }) data!: NearbyCinemaDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
  @ApiProperty({ enum: ["STRAIGHT_LINE"] }) distanceType!: "STRAIGHT_LINE";
}
export class CreateAuditoriumDto {
  @ApiProperty({ example: "Sala 1" })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;
  @ApiProperty({ type: "integer", minimum: 1, maximum: 1000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity!: number;
  @ApiProperty({ enum: MovieProjectionFormat, isArray: true })
  @IsArray()
  @IsEnum(MovieProjectionFormat, { each: true })
  supportedFormats!: MovieProjectionFormat[];
  @ApiPropertyOptional({
    type: "integer",
    minimum: 0,
    maximum: 120,
    default: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  cleanupBufferMinutes?: number;
}
export class UpdateAuditoriumDto extends PartialType(CreateAuditoriumDto) {
  @ApiPropertyOptional({ enum: AuditoriumStatus })
  @IsOptional()
  @IsEnum(AuditoriumStatus)
  status?: AuditoriumStatus;
}
export class AuditoriumResponseDto extends CreateAuditoriumDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() cinemaSlug!: string;
  @ApiProperty({ enum: AuditoriumStatus }) status!: AuditoriumStatus;
}
export class CreateSeatDto {
  @ApiProperty({ example: "A" }) @Matches(/^[A-Z]{1,3}$/) row!: string;
  @ApiProperty({ type: "integer", minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  number!: number;
  @ApiPropertyOptional({ enum: SeatType, default: SeatType.STANDARD })
  @IsOptional()
  @IsEnum(SeatType)
  type?: SeatType;
}
export class SeatResponseDto extends CreateSeatDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() auditoriumId!: string;
  @ApiProperty({ enum: ["AVAILABLE", "BLOCKED", "MAINTENANCE"] }) status!:
    "AVAILABLE" | "BLOCKED" | "MAINTENANCE";
}
