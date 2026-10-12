import { ApiProperty } from "@nestjs/swagger";
export class EventResponseDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ example: "avengers-doomsday" }) slug!: string;
  @ApiProperty({ example: "Avengers: Doomsday" }) name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ format: "date-time" }) startsAt!: Date;
  @ApiProperty({ example: 300 }) capacity!: number;
  @ApiProperty({ example: 120 }) availableStock!: number;
  @ApiProperty({ example: true }) isActive!: boolean;
}
