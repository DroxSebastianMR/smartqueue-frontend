import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MinLength } from "class-validator";

export class JoinQueueDto {
  @ApiProperty({
    format: "uuid",
    description: "Evento comercial asociado a la cola",
  })
  @IsUUID()
  eventId: string;

  @ApiProperty({ minLength: 16, description: "Token opaco del participante" })
  @IsString()
  @MinLength(16)
  participantToken: string;
}
