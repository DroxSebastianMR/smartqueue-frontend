import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { ValidateSeatSelectionDto } from './seat-map.dto';

export enum TicketCategory { GENERAL = 'GENERAL', CHILD = 'CHILD', SENIOR = 'SENIOR' }
export class TicketQuantityDto {
  @ApiProperty({ enum: TicketCategory }) @IsEnum(TicketCategory) category!: TicketCategory;
  @ApiProperty({ minimum: 1, maximum: 6 }) @IsInt() @Min(1) @Max(6) quantity!: number;
}
export class TicketQuoteRequestDto extends ValidateSeatSelectionDto {
  @ApiProperty({ type: [TicketQuantityDto], minItems: 1, maxItems: 3 })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(3) @ValidateNested({ each: true }) @Type(() => TicketQuantityDto)
  tickets!: TicketQuantityDto[];
}
export class TicketRateDto {
  @ApiProperty({ enum: TicketCategory }) category!: TicketCategory;
  @ApiProperty() label!: string;
  @ApiProperty() description!: string;
  @ApiProperty() unitPriceCents!: number;
}
export class TicketRatesDto {
  @ApiProperty() currency!: string;
  @ApiProperty() policy!: string;
  @ApiProperty({ type: [TicketRateDto] }) rates!: TicketRateDto[];
}
export class TicketQuoteLineDto extends TicketRateDto {
  @ApiProperty() quantity!: number;
  @ApiProperty() subtotalCents!: number;
}
export class TicketQuoteDto {
  @ApiProperty() showtimeId!: string;
  @ApiProperty() currency!: string;
  @ApiProperty() totalCents!: number;
  @ApiProperty({ example: false }) reserved!: boolean;
  @ApiProperty({ type: [TicketQuoteLineDto] }) lines!: TicketQuoteLineDto[];
}
