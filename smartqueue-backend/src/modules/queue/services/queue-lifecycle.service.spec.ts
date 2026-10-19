import { QueueLifecycleService } from "./queue-lifecycle.service";

describe("QueueLifecycleService", () => {
  it("releases reserved stock once even when cancellation is retried", async () => {
    const entry = { id: "entry", status: "RESERVED" };
    const reservation = { id: "reservation", status: "ACTIVE", quantity: 2 };
    const tx = {
      $queryRaw: jest.fn(),
      queueEntry: {
        findUnique: jest.fn(async () => entry),
        update: jest.fn(async ({ data }) => Object.assign(entry, data)),
      },
      purchaseReservation: {
        findUnique: jest.fn(async () => reservation),
        update: jest.fn(async ({ data }) => Object.assign(reservation, data)),
      },
      event: { update: jest.fn() },
    };
    const prisma = { $transaction: jest.fn((callback) => callback(tx)) };
    const service = new QueueLifecycleService(
      prisma as never,
      { invalidate: jest.fn() } as never,
    );
    await service.cancel("event", "participant");
    await service.cancel("event", "participant");
    expect(tx.event.update).toHaveBeenCalledTimes(1);
    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: "event" },
      data: { availableStock: { increment: 2 } },
    });
    expect(entry.status).toBe("CANCELLED");
  });

  it("expires a reservation and returns its stock exactly once", async () => {
    let active = true;
    const reservation = {
      id: "r",
      eventId: "event",
      queueEntryId: "q",
      quantity: 3,
    };
    const tx = {
      $queryRaw: jest.fn(),
      purchaseReservation: {
        findMany: jest.fn(async () => (active ? [reservation] : [])),
        update: jest.fn(async () => {
          active = false;
        }),
      },
      event: { update: jest.fn() },
      queueEntry: { update: jest.fn(), updateMany: jest.fn() },
    };
    const prisma = {
      purchaseReservation: {
        findMany: jest.fn(async () => (active ? [reservation] : [])),
      },
      queueEntry: { findMany: jest.fn(async () => []) },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = new QueueLifecycleService(
      prisma as never,
      { invalidate: jest.fn() } as never,
    );
    await service.sweep();
    await service.sweep();
    expect(tx.event.update).toHaveBeenCalledTimes(1);
    expect(tx.queueEntry.update).toHaveBeenCalledWith({
      where: { id: "q" },
      data: { status: "EXPIRED" },
    });
  });
});
