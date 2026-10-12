import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ControlMode, ExperimentScenario } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class StartExperimentDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  eventId!: string;

  @ApiProperty({ enum: ExperimentScenario })
  @IsEnum(ExperimentScenario)
  scenario!: ExperimentScenario;

  @ApiProperty({ enum: ControlMode })
  @IsEnum(ControlMode)
  controlMode!: ControlMode;

  @ApiProperty({ example: 42 })
  @IsInt()
  seed!: number;

  @ApiProperty({ example: "http-generator-v1" })
  @IsString()
  generatorVersion!: string;

  @ApiProperty({ minimum: 30, maximum: 3600, default: 300 })
  @IsInt()
  @Min(30)
  @Max(3600)
  durationSeconds = 300;

  @ApiProperty({ minimum: 1, default: 2 })
  @IsInt()
  @Min(1)
  minLimit = 2;

  @ApiProperty({ minimum: 1, default: 30 })
  @IsInt()
  @Min(1)
  maxLimit = 30;

  @ApiProperty({ minimum: 1, default: 12 })
  @IsInt()
  @Min(1)
  initialLimit = 12;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  stepUp?: number;

  @ApiPropertyOptional({ minimum: 1, default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  stepDown?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 1, default: 0.65 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  highThreshold?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 1, default: 0.35 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  lowThreshold?: number;

  @ApiPropertyOptional({ minimum: 1, default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cooldownWindows?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  purchaseProbability?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  abandonProbability?: number;
}
