import { describe, expect, it, vi } from "vitest";
import { hubSpeak, toHubTtsText } from "./speech";

vi.mock("@/lib/speak", () => ({
  speakKid: vi.fn(),
  speakFromUrl: vi.fn(),
}));

describe("toHubTtsText", () => {
  it("speaks o'clock as oh clock for TTS (not letter O)", () => {
    expect(toHubTtsText("o'clock")).toBe("oh clock");
    expect(toHubTtsText("It's 7 o'clock.")).toBe("It s 7 oh clock.");
  });

  it("normalizes possessives and contractions for Unit 5+ prep", () => {
    expect(toHubTtsText("John's")).toBe("John s");
    expect(toHubTtsText("it's")).toBe("it s");
    expect(toHubTtsText("What's the weather like?")).toBe("What s the weather like?");
  });

  it("leaves normal words unchanged", () => {
    expect(toHubTtsText("breakfast")).toBe("breakfast");
    expect(toHubTtsText("English class")).toBe("English class");
  });
});

describe("hubSpeak", () => {
  it("uses bundled MP3 for o'clock vocab token", async () => {
    vi.stubGlobal("window", {});
    const { speakFromUrl, speakKid } = await import("@/lib/speak");
    hubSpeak("o'clock", 0.85, 4);
    expect(speakFromUrl).toHaveBeenCalledWith("/audio/hub/oclock.mp3");
    expect(speakKid).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
