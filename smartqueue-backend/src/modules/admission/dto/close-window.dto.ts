import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class CloseWindowDto {
  @ApiPropertyOptional({
    format: "date-time",
    description: "Fin de ventana; omitir para usar el último múltiplo de 10 s",
  })
  @IsOptional()
  @IsDateString()
  windowEnd?: string;
}
