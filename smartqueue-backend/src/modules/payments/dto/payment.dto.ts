import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";
import {
  FiscalDocumentType,
  PaymentChannel,
  PaymentMethodCode,
} from "@/modules/payments/enums/payment.enum";

export class PaymentMethodQueryDto {
  @ApiPropertyOptional({ enum: PaymentChannel, default: PaymentChannel.ONLINE })
  @IsOptional()
  @IsEnum(PaymentChannel)
  channel: PaymentChannel = PaymentChannel.ONLINE;
  @ApiPropertyOptional({ example: "PE", default: "PE" })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  countryCode = "PE";
}
export class PaymentMethodDto {
  @ApiProperty({ enum: PaymentMethodCode }) code!: PaymentMethodCode;
  @ApiProperty() label!: string;
  @ApiProperty({ enum: PaymentChannel }) channel!: PaymentChannel;
  @ApiProperty({ enum: ["NOT_CONFIGURED"] }) availability!: "NOT_CONFIGURED";
  @ApiProperty({ nullable: true }) provider!: string | null;
}
export class PaymentMethodsResponseDto {
  @ApiProperty({ example: "PE" }) countryCode!: string;
  @ApiProperty({ example: "PEN" }) currency!: string;
  @ApiProperty({ example: false }) readyForCheckout!: false;
  @ApiProperty({ type: [PaymentMethodDto] }) data!: PaymentMethodDto[];
}
export class CreatePaymentIntentDto {
  @ApiProperty({
    format: "uuid",
    description: "Orden de reserva confirmada, no un showtime directo",
  })
  @IsUUID()
  orderId!: string;
  @ApiProperty({ enum: PaymentMethodCode })
  @IsEnum(PaymentMethodCode)
  method!: PaymentMethodCode;
}
export class ReceiptTypeDto {
  @ApiProperty({ enum: FiscalDocumentType }) code!: FiscalDocumentType;
  @ApiProperty() label!: string;
  @ApiProperty({ enum: ["NOT_CONFIGURED"] }) availability!: "NOT_CONFIGURED";
  @ApiProperty() requiresRuc!: boolean;
}
export class ReceiptTypesResponseDto {
  @ApiProperty({ type: [ReceiptTypeDto] }) data!: ReceiptTypeDto[];
}
export class CreateReceiptRequestDto {
  @ApiProperty({ format: "uuid" }) @IsUUID() orderId!: string;
  @ApiProperty({ enum: FiscalDocumentType })
  @IsEnum(FiscalDocumentType)
  type!: FiscalDocumentType;
  @ApiProperty({ example: "Nombre o razón social" })
  @IsString()
  @MaxLength(200)
  buyerName!: string;
  @ApiPropertyOptional({
    example: "12345678",
    description: "DNI u otro documento para boleta; RUC para factura",
  })
  @IsOptional()
  @Matches(/^\d{8}$|^\d{11}$/)
  documentNumber?: string;
  @ApiProperty({ example: "cliente@example.com" })
  @IsEmail()
  buyerEmail!: string;
}
