import { ApiProperty } from "@nestjs/swagger";
import { PageMetaDto } from "@/modules/catalog/dto/list-query.dto";
import { BannerCtaDto } from "@/modules/banners/dto/banner-response.dto";

export class PromotionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ nullable: true }) imageUrl!: string | null;
  @ApiProperty({ type: BannerCtaDto }) cta!: BannerCtaDto;
  @ApiProperty({ format: "date-time", nullable: true }) startsAt!:
    string | null;
  @ApiProperty({ format: "date-time", nullable: true }) endsAt!: string | null;
}
export class PromotionPageDto {
  @ApiProperty({ type: [PromotionResponseDto] }) data!: PromotionResponseDto[];
  @ApiProperty({ type: PageMetaDto }) meta!: PageMetaDto;
}
