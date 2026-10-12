import { IsString, IsUUID, MinLength } from 'class-validator';

export class JoinQueueDto {
  @IsUUID()
  eventId: string;

  @IsString()
  @MinLength(16)
  participantToken: string;
}

