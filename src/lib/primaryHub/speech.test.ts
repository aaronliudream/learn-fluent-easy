import { describe, expect, it, vi } from "vitest";
import {
  isOClockVocabToken,
  OCLOCK_OPENAI_VOICE,
  toHubTtsText,
} from "./speech";

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(),
  speakKid: vi.fn(),
  prefetchTTS: vi.fn(),
  prefetchTTSBatchKid: vi.fn(),
}));

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

describe("isOClockVocabToken", () => {
  it("matches only the vocab token, not sentences", () => {
    expect(isOClockVocabToken("o'clock")).toBe(true);
    expect(isOClockVocabToken("It's 7 o'clock.")).toBe(false);
    expect(isOClockVocabToken("breakfast")).toBe(false);
  });
});

describe("hubSpeak", () => {
  it("routes o'clock vocab through OpenAI shimmer", async () => {
    vi.stubGlobal("window", {});
    const { hubSpeak } = await import("./speech");
    const { speak, speakKid } = await import("@/lib/speak");
    hubSpeak("o'clock", 0.85, 4);
    expect(speak).toHaveBeenCalledWith("o'clock", {
      voiceId: OCLOCK_OPENAI_VOICE,
      speed: 0.85,
      accent: "US",
    });
    expect(speakKid).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
