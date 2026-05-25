import { describe, expect, it } from "vitest";
import { findUnit, isUnitListed, isUnitPublished } from "./courseData";

describe("isUnitPublished", () => {
  it("treats missing published as true", () => {
    const u2 = findUnit("g4v2_u2");
    expect(u2).not.toBeNull();
    expect(isUnitPublished(u2!)).toBe(true);
    expect(isUnitListed(u2!)).toBe(true);
  });

  it("hides g4v2_u4–u6 on main until content launch", () => {
    for (const id of ["g4v2_u4", "g4v2_u5", "g4v2_u6"] as const) {
      const unit = findUnit(id);
      expect(unit).not.toBeNull();
      expect(unit!.published).toBe(false);
      expect(isUnitPublished(unit!)).toBe(false);
      expect(isUnitListed(unit!)).toBe(false);
    }
  });
});
