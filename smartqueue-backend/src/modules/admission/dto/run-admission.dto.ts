import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class RunAdmissionDto {
  @ApiProperty({ minimum: 1, maximum: 50, default: 1 })
  @IsInt()
  @Min(1)
  @Max(50)
  slots = 1;
}
