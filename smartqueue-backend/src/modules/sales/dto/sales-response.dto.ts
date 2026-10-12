import { ApiProperty } from "@nestjs/swagger";
import { ReservationStatus } from "@prisma/client";

export class ReservationResponseDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ format: "uuid" }) eventId!: string;
  @ApiProperty({ format: "uuid" }) queueEntryId!: string;
  @ApiProperty({ example: 2 }) quantity!: number;
  @ApiProperty({ enum: ReservationStatus }) status!: ReservationStatus;
  @ApiProperty({ format: "date-time" }) expiresAt!: Date;
}
export class PurchaseResponseDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ format: "uuid" }) reservationId!: string;
  @ApiProperty({ example: "SQ-A1B2C3D4" }) confirmationCode!: string;
  @ApiProperty({ example: 2 }) quantity!: number;
  @ApiProperty({ format: "date-time" }) createdAt!: Date;
}
