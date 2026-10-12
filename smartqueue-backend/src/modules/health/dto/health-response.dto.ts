import { ApiProperty } from "@nestjs/swagger";
export class HealthResponseDto {
  @ApiProperty({ example: "ok" }) status!: string;
  @ApiProperty({ example: "smartqueue-backend" }) service!: string;
  @ApiProperty({ format: "date-time" }) timestamp!: string;
}
