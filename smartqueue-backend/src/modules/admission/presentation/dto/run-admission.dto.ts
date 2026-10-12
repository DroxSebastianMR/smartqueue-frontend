import { IsInt, Max, Min } from 'class-validator';

export class RunAdmissionDto {
  @IsInt()
  @Min(1)
  @Max(50)
  slots = 1;
}
