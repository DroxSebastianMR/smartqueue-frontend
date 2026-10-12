import { PaymentsService } from "@/modules/payments/services/payments.service";
import {
  FiscalDocumentType,
  PaymentChannel,
  PaymentMethodCode,
} from "@/modules/payments/enums/payment.enum";

describe("contratos de pagos y comprobantes", () => {
  const service = new PaymentsService();

  it("lista categorías sin afirmar que alguna está habilitada", () => {
    const online = service.methods({
      countryCode: "PE",
      channel: PaymentChannel.ONLINE,
    });
    expect(online.readyForCheckout).toBe(false);
    expect(
      online.data.some((method) => method.code === PaymentMethodCode.CASH),
    ).toBe(false);
    expect(
      online.data.every((method) => method.availability === "NOT_CONFIGURED"),
    ).toBe(true);
    const boxOffice = service.methods({
      countryCode: "PE",
      channel: PaymentChannel.BOX_OFFICE,
    });
    expect(
      boxOffice.data.some((method) => method.code === PaymentMethodCode.CASH),
    ).toBe(true);
  });

  it("no crea cobros ni comprobantes mientras faltan orden y proveedores", () => {
    const orderId = "8df07586-7c28-44b7-bc0a-9817c4f60e3d";
    expect(() =>
      service.createIntent(
        { orderId, method: PaymentMethodCode.CARD },
        "key-0123456789abcdef",
      ),
    ).toThrow("no se ha iniciado ningún cobro");
    expect(() =>
      service.requestReceipt({
        orderId,
        type: FiscalDocumentType.BOLETA,
        buyerName: "Cliente",
        buyerEmail: "cliente@example.com",
      }),
    ).toThrow("no se ha emitido comprobante");
    expect(() =>
      service.requestReceipt({
        orderId,
        type: FiscalDocumentType.FACTURA,
        buyerName: "Empresa",
        buyerEmail: "empresa@example.com",
      }),
    ).toThrow("RUC");
  });
});
