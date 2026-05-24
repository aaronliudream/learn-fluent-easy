import { describe, expect, it } from "vitest";
import { toHubTtsText } from "./speech";

describe("toHubTtsText", () => {
  it("speaks o'clock as o clock for TTS", () => {
    expect(toHubTtsText("o'clock")).toBe("o clock");
  });

  it("leaves normal words unchanged", () => {
    expect(toHubTtsText("breakfast")).toBe("breakfast");
    expect(toHubTtsText("English class")).toBe("English class");
  });
});
