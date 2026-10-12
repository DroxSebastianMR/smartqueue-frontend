import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class ReserveTicketsDto {
  @IsUUID()
  eventId: string;
  @IsUUID()
  queueEntryId: string;
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}

