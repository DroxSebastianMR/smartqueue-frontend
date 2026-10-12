import { percentile } from "@/modules/metrics/services/metric-window.service";

describe("metric window feature helpers", () => {
  it("calculates interpolated latency percentiles", () => {
    expect(percentile([100, 200, 300, 400], 0.5)).toBe(250);
    expect(percentile([100, 200, 300, 400], 0.95)).toBeCloseTo(385);
    expect(percentile([], 0.99)).toBe(0);
  });
});
