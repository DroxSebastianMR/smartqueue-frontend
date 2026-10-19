import { ApiProperty } from '@nestjs/swagger';
import { SeatType } from '@prisma/client';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export enum SeatAvailability {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export class SeatMapItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() row!: string;
  @ApiProperty() number!: number;
  @ApiProperty({ enum: SeatType }) type!: SeatType;
  @ApiProperty({ enum: SeatAvailability }) availability!: SeatAvailability;
}

export class SeatMapDto {
  @ApiProperty() showtimeId!: string;
  @ApiProperty() movieTitle!: string;
  @ApiProperty({ nullable: true, type: String }) posterUrl!: string | null;
  @ApiProperty() cinemaName!: string;
  @ApiProperty() auditoriumName!: string;
  @ApiProperty() timeZone!: string;
  @ApiProperty() startsAt!: string;
  @ApiProperty() format!: string;
  @ApiProperty() audioLanguage!: string;
  @ApiProperty() basePriceCents!: number;
  @ApiProperty() currency!: string;
  @ApiProperty() bookable!: boolean;
  @ApiProperty() maxSelection!: number;
  @ApiProperty() observedAt!: string;
  @ApiProperty({ type: [SeatMapItemDto] }) seats!: SeatMapItemDto[];
}

export class ValidateSeatSelectionDto {
  @ApiProperty({ type: [String], minItems: 1, maxItems: 6, description: 'IDs de butacas de la sala de esta función' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  seatIds!: string[];
}

export class SeatSelectionDto {
  @ApiProperty() showtimeId!: string;
  @ApiProperty({ type: [SeatMapItemDto] }) seats!: SeatMapItemDto[];
  @ApiProperty() totalCents!: number;
  @ApiProperty() currency!: string;
  @ApiProperty({ example: false, description: 'Validar no bloquea ni reserva las butacas' }) reserved!: boolean;
}
