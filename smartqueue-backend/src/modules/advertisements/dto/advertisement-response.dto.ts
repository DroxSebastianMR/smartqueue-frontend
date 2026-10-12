import { ApiProperty } from "@nestjs/swagger";
import { PageMetaDto } from "@/modules/catalog/dto/list-query.dto";
import { BannerCtaDto } from "@/modules/banners/dto/banner-response.dto";

export class AdvertisementResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ nullable: true }) imageUrl!: string | null;
  @ApiProperty({ type: BannerCtaDto }) cta!: BannerCtaDto;
  @ApiProperty({ enum: ["HOME", "CHECKOUT"] }) placement!: "HOME" | "CHECKOUT";
  @ApiProperty() priority!: number;
}
export class AdvertisementPageDto {
  @ApiProperty({ type: [AdvertisementResponseDto] })
  data!: AdvertisementResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
