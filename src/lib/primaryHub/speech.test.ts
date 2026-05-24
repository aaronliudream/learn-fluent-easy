import { describe, expect, it } from "vitest";
import { toHubTtsText } from "./speech";

describe("toHubTtsText", () => {
  it("preserves o'clock for TTS (one word, apostrophe intact)", () => {
    expect(toHubTtsText("o'clock")).toBe("o'clock");
    expect(toHubTtsText("It's 7 o'clock.")).toBe("It's 7 o'clock.");
  });

  it("normalizes curly apostrophes to ASCII only", () => {
    expect(toHubTtsText("o\u2019clock")).toBe("o'clock");
    expect(toHubTtsText("John\u2019s")).toBe("John's");
  });

  it("leaves normal words unchanged", () => {
    expect(toHubTtsText("breakfast")).toBe("breakfast");
    expect(toHubTtsText("English class")).toBe("English class");
  });
});
