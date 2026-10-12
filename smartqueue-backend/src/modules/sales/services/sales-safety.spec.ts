import { QueueStatus, ReservationStatus } from "@prisma/client";

import { ConfirmPurchaseService } from "@/modules/sales/services/confirm-purchase.service";
import { ReserveTicketsService } from "@/modules/sales/services/reserve-tickets.service";

const telemetry = {
  capture: jest.fn((_context, operation: () => Promise<unknown>) => operation()),
};
const cache = { delete: jest.fn() };
const queueCache = { invalidate: jest.fn() };

describe("sales transaction safety", () => {
  beforeEach(() => jest.clearAllMocks());

  it("uses an atomic stock guard so concurrent reservations cannot oversell", async () => {
    let stock = 1;
    const tx = {
      purchaseReservation: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(({ data }) => Promise.resolve({ id: data.queueEntryId, ...data })),
      },
      queueEntry: {
        findUnique: jest.fn(({ where }) =>
          Promise.resolve({ id: where.id, eventId: "event-1", status: QueueStatus.ADMITTED }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
      event: {
        updateMany: jest.fn(() => {
          if (stock < 1) return Promise.resolve({ count: 0 });
          stock -= 1;
          return Promise.resolve({ count: 1 });
        }),
      },
    };
    const prisma = { $transaction: jest.fn((operation) => operation(tx)) };
    const service = new ReserveTicketsService(
      prisma as never,
      cache as never,
      queueCache as never,
      telemetry as never,
    );
    const results = await Promise.allSettled([
      service.execute("event-1", "queue-1", 1),
      service.execute("event-1", "queue-2", 1),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(stock).toBe(0);
  });

  it("returns the existing purchase when confirmation is retried", async () => {
    let purchase: { id: string; eventId: string } | null = null;
    const create = jest.fn(() => {
      purchase = { id: "purchase-1", eventId: "event-1" };
      return Promise.resolve(purchase);
    });
    const tx = {
      purchase: { findUnique: jest.fn(() => Promise.resolve(purchase)), create },
      purchaseReservation: {
        findUnique: jest.fn().mockResolvedValue({
          id: "reservation-1",
          eventId: "event-1",
          queueEntryId: "queue-1",
          quantity: 1,
          status: ReservationStatus.ACTIVE,
          expiresAt: new Date(Date.now() + 60_000),
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      queueEntry: { update: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      purchaseReservation: {
        findUnique: jest.fn().mockResolvedValue({ eventId: "event-1", queueEntryId: "queue-1" }),
      },
      $transaction: jest.fn((operation) => operation(tx)),
    };
    const service = new ConfirmPurchaseService(
      prisma as never,
      cache as never,
      queueCache as never,
      telemetry as never,
    );
    const first = await service.execute("reservation-1");
    const second = await service.execute("reservation-1");
    expect(second).toEqual(first);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
