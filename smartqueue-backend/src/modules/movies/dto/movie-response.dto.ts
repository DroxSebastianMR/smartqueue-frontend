import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PageMetaDto } from "@/modules/catalog/dto/list-query.dto";

export class MovieVersionDto {
  @ApiPropertyOptional({ format: "uuid" }) id?: string;
  @ApiProperty({
    example: "TWO_D",
    enum: ["TWO_D", "THREE_D", "INFINITY_VISION"],
  })
  format!: string;
  @ApiProperty({ example: "es-419", description: "Idioma de audio BCP 47" })
  audioLanguage!: string;
  @ApiPropertyOptional({ example: "es-PE", nullable: true }) subtitleLanguage!:
    string | null;
}

export class MovieTrailerDto {
  @ApiProperty() id!: string;
  @ApiProperty() movieSlug!: string;
  @ApiProperty({ enum: ["YOUTUBE", "LOCAL"] }) provider!: "YOUTUBE" | "LOCAL";
  @ApiProperty({ format: "uri" }) url!: string;
  @ApiProperty({ example: "es-419" }) locale!: string;
  @ApiProperty({ enum: ["TRAILER", "TEASER"] }) kind!: "TRAILER" | "TEASER";
}

export class MovieResponseDto {
  @ApiProperty({ example: "avengers-doomsday" }) slug!: string;
  @ApiProperty({ example: "Avengers: Doomsday" }) title!: string;
  @ApiProperty({ nullable: true }) synopsis!: string | null;
  @ApiProperty({ format: "uri" }) posterUrl!: string;
  @ApiProperty({ nullable: true }) backdropUrl!: string | null;
  @ApiProperty({ format: "date", nullable: true }) releaseDate!: string | null;
  @ApiProperty({ nullable: true }) durationMinutes!: number | null;
  @ApiProperty({ nullable: true }) ageRating!: string | null;
  @ApiProperty({ type: [String] }) genres!: string[];
  @ApiProperty({ type: [MovieVersionDto] }) versions!: MovieVersionDto[];
  @ApiProperty() presale!: boolean;
}

export class MoviePageDto {
  @ApiProperty({ type: [MovieResponseDto] }) data!: MovieResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
