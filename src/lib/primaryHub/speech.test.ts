import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  formatHubVocabDisplay,
  isOClockVocabToken,
  toHubTtsText,
} from "./speech";

const speakWebSpeechMock = vi.fn().mockResolvedValue(true);
const speakKidMock = vi.fn();

vi.mock("@/lib/webSpeech", () => ({
  isWebSpeechSupported: vi.fn(() => true),
  speakWebSpeech: (...args: unknown[]) => speakWebSpeechMock(...args),
}));

vi.mock("@/lib/speak", () => ({
  speakKid: (...args: unknown[]) => speakKidMock(...args),
  stopSpeaking: vi.fn(),
  prefetchTTSBatchKid: vi.fn(),
  isSynthInFlight: vi.fn(() => false),
  KID_VOICE_ID: "el:lily",
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

describe("formatHubVocabDisplay", () => {
  it("returns stored English unchanged", () => {
    expect(formatHubVocabDisplay("o'clock")).toBe("o'clock");
    expect(formatHubVocabDisplay("now")).toBe("now");
  });
});

describe("hubSpeak", () => {
  beforeEach(() => {
    speakWebSpeechMock.mockClear();
    speakKidMock.mockClear();
    vi.stubGlobal("window", {});
  });

  it("uses Web Speech only for vocab o'clock", async () => {
    const { hubSpeak } = await import("./speech");
    hubSpeak("o\u2019clock", 0.85, 4);
    expect(speakWebSpeechMock).toHaveBeenCalledWith("o'clock", 0.85);
    expect(speakKidMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("uses cloud TTS for non-o'clock words (not Web Speech)", async () => {
    const { hubSpeak } = await import("./speech");
    hubSpeak("breakfast", 0.85, 4);
    expect(speakWebSpeechMock).not.toHaveBeenCalled();
    expect(speakKidMock).toHaveBeenCalledWith("breakfast", { grade: 4, speed: 0.85 });
    vi.unstubAllGlobals();
  });

  it("falls back to speakKid when Web Speech fails for o'clock", async () => {
    speakWebSpeechMock.mockResolvedValueOnce(false);
    const { hubSpeak } = await import("./speech");
    hubSpeak("o'clock", 0.85, 4);
    await Promise.resolve();
    expect(speakWebSpeechMock).toHaveBeenCalledWith("o'clock", 0.85);
    expect(speakKidMock).toHaveBeenCalledWith("o'clock", { grade: 4, speed: 0.85 });
    vi.unstubAllGlobals();
  });
});
