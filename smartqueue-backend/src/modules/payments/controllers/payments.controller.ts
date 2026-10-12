import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ErrorResponseDto } from "@/common/dto/error-response.dto";
import { Permissions } from "@/modules/auth/decorators/permissions.decorator";
import { Permission } from "@/modules/auth/enums/permission.enum";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token.guard";
import { PermissionsGuard } from "@/modules/auth/guards/permissions.guard";
import {
  CreatePaymentIntentDto,
  CreateReceiptRequestDto,
  PaymentMethodQueryDto,
  PaymentMethodsResponseDto,
  ReceiptTypesResponseDto,
} from "@/modules/payments/dto/payment.dto";
import { PaymentsService } from "@/modules/payments/services/payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get("methods")
  @ApiOperation({
    summary: "Métodos de pago por país y canal",
    description:
      "Catálogo de integración planeada; todos figuran NOT_CONFIGURED hasta contratar y probar proveedor/taquilla.",
  })
  @ApiOkResponse({ type: PaymentMethodsResponseDto })
  methods(@Query() query: PaymentMethodQueryDto): PaymentMethodsResponseDto {
    return this.payments.methods(query);
  }

  @Post("intents")
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(Permission.TICKET_PURCHASE)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Iniciar pago de una orden reservada",
    description:
      "Contrato preparado. Actualmente devuelve 503 sin crear cargos; requiere orden persistente, proveedor, webhooks verificados e idempotencia.",
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  createIntent(
    @Body() input: CreatePaymentIntentDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ): never {
    return this.payments.createIntent(input, idempotencyKey);
  }
}

@ApiTags("receipts")
@Controller("receipts")
export class ReceiptsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get("types")
  @ApiOperation({ summary: "Tipos de comprobante previstos para Perú" })
  @ApiOkResponse({ type: ReceiptTypesResponseDto })
  types(): ReceiptTypesResponseDto {
    return this.payments.receiptTypes();
  }

  @Post("requests")
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(Permission.TICKET_PURCHASE)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Solicitar boleta o factura para una orden pagada",
    description:
      "Contrato preparado; 503 hasta integrar ventas y emisión SUNAT/OSE. No genera numeración ficticia.",
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  request(@Body() input: CreateReceiptRequestDto): never {
    return this.payments.requestReceipt(input);
  }
}
