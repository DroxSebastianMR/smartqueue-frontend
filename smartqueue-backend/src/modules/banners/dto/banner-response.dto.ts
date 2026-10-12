import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PageMetaDto } from "@/modules/catalog/dto/list-query.dto";

export class BannerVideoDto {
  @ApiProperty({ enum: ["YOUTUBE", "LOCAL"] }) provider!: "YOUTUBE" | "LOCAL";
  @ApiProperty({ format: "uri" }) url!: string;
  @ApiProperty() muted!: boolean;
}
export class BannerCtaDto {
  @ApiProperty({ example: "Ver avance" }) label!: string;
  @ApiProperty({ example: "/movies/avengers-doomsday" }) href!: string;
}
export class BannerResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() movieSlug!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) logoUrl!: string | null;
  @ApiProperty({ format: "uri" }) backdropUrl!: string;
  @ApiProperty({ type: BannerVideoDto, nullable: true })
  video!: BannerVideoDto | null;
  @ApiProperty({ type: BannerCtaDto }) cta!: BannerCtaDto;
  @ApiProperty() priority!: number;
}
export class BannerPageDto {
  @ApiProperty({ type: [BannerResponseDto] }) data!: BannerResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
