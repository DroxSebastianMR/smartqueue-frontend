import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsUUID, Max, Min } from "class-validator";

export class ReserveTicketsDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  eventId: string;
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  queueEntryId: string;
  @ApiProperty({ minimum: 1, maximum: 10, example: 2 })
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
