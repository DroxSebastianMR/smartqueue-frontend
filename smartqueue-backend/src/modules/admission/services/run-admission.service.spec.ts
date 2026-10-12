import { RunAdmissionService } from "@/modules/admission/services/run-admission.service";

describe("RunAdmissionService", () => {
  it("selects waiting participants strictly by ascending turn number", async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: "first", turnNumber: 1n },
      { id: "second", turnNumber: 2n },
    ]);
    const tx = {
      queueEntry: { findMany, update: jest.fn().mockResolvedValue({}) },
    };
    const prisma = { $transaction: jest.fn((operation) => operation(tx)) };
    const service = new RunAdmissionService(
      prisma as never,
      { delete: jest.fn() } as never,
      { invalidate: jest.fn() } as never,
    );
    const result = await service.execute("event-1", 2);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { turnNumber: "asc" }, take: 2 }),
    );
    expect(result.entryIds).toEqual(["first", "second"]);
  });
});
