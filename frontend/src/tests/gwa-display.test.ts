import { describe, it, expect } from "vitest";

describe("Academic Record GWA & Standing Helpers", () => {
  const evaluateStanding = (gwa: number): string => {
    if (gwa <= 1.25) return "PRESIDENTS_LIST";
    if (gwa <= 1.75) return "DEANS_LIST";
    if (gwa <= 3.0) return "GOOD_STANDING";
    return "PROBATION";
  };

  it("should classify GWA <= 1.25 as PRESIDENT'S LIST", () => {
    expect(evaluateStanding(1.15)).toBe("PRESIDENTS_LIST");
    expect(evaluateStanding(1.25)).toBe("PRESIDENTS_LIST");
  });

  it("should classify GWA between 1.26 and 1.75 as DEAN'S LIST", () => {
    expect(evaluateStanding(1.45)).toBe("DEANS_LIST");
    expect(evaluateStanding(1.75)).toBe("DEANS_LIST");
  });

  it("should classify GWA between 1.76 and 3.00 as GOOD STANDING", () => {
    expect(evaluateStanding(2.25)).toBe("GOOD_STANDING");
    expect(evaluateStanding(3.0)).toBe("GOOD_STANDING");
  });

  it("should classify GWA > 3.00 as PROBATION", () => {
    expect(evaluateStanding(3.25)).toBe("PROBATION");
    expect(evaluateStanding(5.0)).toBe("PROBATION");
  });
});
