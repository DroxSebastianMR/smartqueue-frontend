import { HttpStatus, Injectable } from "@nestjs/common";
import { AppException } from "@/common/exceptions/app.exception";
import {
  type CreatePaymentIntentDto,
  type CreateReceiptRequestDto,
  type PaymentMethodDto,
  type PaymentMethodsResponseDto,
  type PaymentMethodQueryDto,
  type ReceiptTypesResponseDto,
} from "@/modules/payments/dto/payment.dto";
import {
  FiscalDocumentType,
  PaymentChannel,
  PaymentErrorCode,
  PaymentMethodCode,
  ReceiptErrorCode,
} from "@/modules/payments/enums/payment.enum";

const METHODS: readonly Omit<PaymentMethodDto, "availability" | "provider">[] =
  [
    {
      code: PaymentMethodCode.CARD,
      label: "Tarjeta de crédito o débito",
      channel: PaymentChannel.ONLINE,
    },
    {
      code: PaymentMethodCode.PREPAID_CARD,
      label: "Tarjeta prepago",
      channel: PaymentChannel.ONLINE,
    },
    {
      code: PaymentMethodCode.YAPE,
      label: "Yape",
      channel: PaymentChannel.ONLINE,
    },
    {
      code: PaymentMethodCode.PAGOEFECTIVO,
      label: "PagoEfectivo",
      channel: PaymentChannel.ONLINE,
    },
    {
      code: PaymentMethodCode.BANK_TRANSFER,
      label: "Transferencia bancaria",
      channel: PaymentChannel.ONLINE,
    },
    {
      code: PaymentMethodCode.CASH,
      label: "Efectivo en taquilla",
      channel: PaymentChannel.BOX_OFFICE,
    },
    {
      code: PaymentMethodCode.CARD_TERMINAL,
      label: "Tarjeta en terminal de taquilla",
      channel: PaymentChannel.BOX_OFFICE,
    },
  ];

@Injectable()
export class PaymentsService {
  methods(query: PaymentMethodQueryDto): PaymentMethodsResponseDto {
    return {
      countryCode: query.countryCode,
      currency: query.countryCode === "PE" ? "PEN" : "N/A",
      readyForCheckout: false,
      data:
        query.countryCode === "PE"
          ? METHODS.filter((method) => method.channel === query.channel).map(
              (method) => ({
                ...method,
                availability: "NOT_CONFIGURED",
                provider: null,
              }),
            )
          : [],
    };
  }
  createIntent(_input: CreatePaymentIntentDto, idempotencyKey?: string): never {
    if (!idempotencyKey || !/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey))
      throw new AppException(
        PaymentErrorCode.ORDER_NOT_CONNECTED,
        "Idempotency-Key de 16 a 128 caracteres requerido",
        HttpStatus.BAD_REQUEST,
      );
    throw new AppException(
      PaymentErrorCode.NOT_CONFIGURED,
      "No hay reservas persistentes ni pasarela conectada; no se ha iniciado ningún cobro",
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
  receiptTypes(): ReceiptTypesResponseDto {
    return {
      data: [
        {
          code: FiscalDocumentType.BOLETA,
          label: "Boleta de venta electrónica",
          availability: "NOT_CONFIGURED",
          requiresRuc: false,
        },
        {
          code: FiscalDocumentType.FACTURA,
          label: "Factura electrónica",
          availability: "NOT_CONFIGURED",
          requiresRuc: true,
        },
      ],
    };
  }
  requestReceipt(input: CreateReceiptRequestDto): never {
    if (
      input.type === FiscalDocumentType.FACTURA &&
      !/^\d{11}$/.test(input.documentNumber ?? "")
    )
      throw new AppException(
        ReceiptErrorCode.NOT_CONFIGURED,
        "La factura requiere RUC de 11 dígitos",
        HttpStatus.BAD_REQUEST,
      );
    throw new AppException(
      ReceiptErrorCode.NOT_CONFIGURED,
      "No hay orden pagada ni emisor electrónico conectado; no se ha emitido comprobante",
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
