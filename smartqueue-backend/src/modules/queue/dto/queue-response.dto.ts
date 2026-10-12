import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { QueueStatus } from "@/common/enums/queue-status.enum";

export class QueueEntryDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ format: "uuid" }) eventId!: string;
  @ApiProperty({ example: 42 }) turnNumber!: number;
  @ApiProperty({ enum: QueueStatus }) status!: QueueStatus;
  @ApiPropertyOptional({ format: "date-time", nullable: true })
  admittedAt!: Date | null;
  @ApiPropertyOptional({ format: "date-time", nullable: true })
  accessExpiresAt!: Date | null;
}
export class QueueStatusDto {
  @ApiProperty({ type: QueueEntryDto }) entry!: QueueEntryDto;
  @ApiProperty({ example: 12 }) peopleAhead!: number;
  @ApiPropertyOptional({ example: 6, nullable: true }) estimatedWaitMinutes!:
    number | null;
}
