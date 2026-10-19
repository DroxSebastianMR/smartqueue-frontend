import { ExperimentsService } from "./experiments.service";
import { PrismaService } from "@/common/prisma/prisma.service";

describe("Experiment lifecycle", () => {
  const setup = (status: string, count: number) => {
    const experimentRun = {
      updateMany: jest.fn().mockResolvedValue({ count }),
      findUnique: jest.fn().mockResolvedValue({ id: "run", status }),
    };
    return {
      experimentRun,
      service: new ExperimentsService({
        experimentRun,
      } as unknown as PrismaService),
    };
  };

  it("marks interrupted experiments FAILED without deleting evidence", async () => {
    const { service, experimentRun } = setup("FAILED", 1);
    await expect(service.fail("run")).resolves.toMatchObject({
      status: "FAILED",
    });
    expect(experimentRun.updateMany).toHaveBeenCalledWith({
      where: { id: "run", status: "RUNNING" },
      data: { status: "FAILED", finishedAt: expect.any(Date) },
    });
  });

  it("allows retries of the same terminal outcome", async () => {
    const { service } = setup("COMPLETED", 0);
    await expect(service.finish("run")).resolves.toMatchObject({
      status: "COMPLETED",
    });
  });

  it("cannot relabel a failed experiment as completed", async () => {
    const { service } = setup("FAILED", 0);
    await expect(service.finish("run")).rejects.toThrow("different outcome");
  });

  it("returns not found for missing experiments", async () => {
    const { service, experimentRun } = setup("RUNNING", 0);
    experimentRun.findUnique.mockResolvedValue(null);
    await expect(service.fail("missing")).rejects.toThrow(
      "Experiment not found",
    );
  });
});
