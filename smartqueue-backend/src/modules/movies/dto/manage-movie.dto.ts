import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
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
  MovieAssetKind,
  MovieCatalogSection,
  MovieMediaProvider,
  MovieProjectionFormat,
  MoviePublicationStatus,
} from "@/modules/movies/enums/movie-catalog.enum";
import { MovieResponseDto } from "@/modules/movies/dto/movie-response.dto";
import {
  ListQueryDto,
  PageMetaDto,
} from "@/modules/catalog/dto/list-query.dto";

export class CreateMovieDto {
  @ApiProperty({ example: "nueva-pelicula" })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ example: "Nueva película" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  synopsis?: string | null;

  @ApiProperty({ example: "https://example.com/poster.jpg" })
  @Matches(/^(https?:\/\/|\/)[^\s]+$/)
  posterUrl!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Matches(/^(https?:\/\/|\/)[^\s]+$/)
  backdropUrl?: string | null;

  @ApiPropertyOptional({ example: "2026-12-17", nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  releaseDate?: string | null;

  @ApiPropertyOptional({ minimum: 1, maximum: 500, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  durationMinutes?: number | null;

  @ApiPropertyOptional({ example: "+13", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ageRating?: string | null;

  @ApiPropertyOptional({ type: [String], example: ["Acción", "Aventura"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  presale?: boolean;
}

export class UpdateMovieDto extends PartialType(
  OmitType(CreateMovieDto, ["slug"] as const),
) {}

export class MoviePlacementDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 999, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  priority = 0;
}

export class CreateMovieVersionDto {
  @ApiProperty({ enum: MovieProjectionFormat })
  @IsEnum(MovieProjectionFormat)
  format!: MovieProjectionFormat;

  @ApiProperty({ example: "es-419" })
  @Matches(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/)
  audioLanguage!: string;

  @ApiPropertyOptional({ example: "es-PE", nullable: true })
  @IsOptional()
  @Matches(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/)
  subtitleLanguage?: string | null;
}

export class CreateMovieAssetDto {
  @ApiProperty({ enum: MovieAssetKind })
  @IsEnum(MovieAssetKind)
  kind!: MovieAssetKind;

  @ApiProperty({ example: "https://example.com/trailer.mp4" })
  @Matches(/^(https?:\/\/|\/)[^\s]+$/)
  url!: string;

  @ApiPropertyOptional({
    enum: MovieMediaProvider,
    default: MovieMediaProvider.EXTERNAL,
  })
  @IsOptional()
  @IsEnum(MovieMediaProvider)
  provider?: MovieMediaProvider;

  @ApiPropertyOptional({ example: "es-419", nullable: true })
  @IsOptional()
  @IsString()
  locale?: string | null;
}

export class ManagedMovieDto extends MovieResponseDto {
  @ApiProperty({ enum: MoviePublicationStatus })
  publicationStatus!: MoviePublicationStatus;
  @ApiProperty({ enum: MovieCatalogSection, isArray: true })
  sections!: MovieCatalogSection[];
}

export class MovieAssetDto extends CreateMovieAssetDto {
  @ApiProperty({ format: "uuid" }) id!: string;
}

export class MovieSearchQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ example: "aventura" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ example: "Acción" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  genre?: string;
}

export class MovieRankingItemDto {
  @ApiProperty({ example: "avengers-doomsday" }) movieSlug!: string;
  @ApiProperty({ type: "integer", minimum: 0 }) ticketsSold!: number;
}

export class MovieRankingDto {
  @ApiProperty({ example: "NO_SALES_DATA", enum: ["READY", "NO_SALES_DATA"] })
  status!: "READY" | "NO_SALES_DATA";
  @ApiProperty({
    type: [MovieRankingItemDto],
    description:
      "Películas ordenadas por entradas pagadas; vacío hasta integrar ventas de cine",
  })
  data!: MovieRankingItemDto[];
  @ApiProperty({ nullable: true, format: "date-time" })
  calculatedAt!: string | null;
}

export class AdminMovieQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: MoviePublicationStatus })
  @IsOptional()
  @IsEnum(MoviePublicationStatus)
  status?: MoviePublicationStatus;

  @ApiPropertyOptional({ example: "aventura" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class ManagedMoviePageDto {
  @ApiProperty({ type: [ManagedMovieDto] }) data!: ManagedMovieDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
