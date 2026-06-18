import { describe, it, expect } from "vitest";
import { cleanForTTS, expandSpeechAbbrev } from "./ttsClean";

describe("expandSpeechAbbrev", () => {
  it("expands the textbook abbreviations TTS would mis-read as letters", () => {
    expect(expandSpeechAbbrev("take sb's breath away")).toBe("take somebody's breath away");
    expect(expandSpeechAbbrev("share sth with sb")).toBe("share something with somebody");
    expect(expandSpeechAbbrev("ready to do sth")).toBe("ready to do something");
    expect(expandSpeechAbbrev("put oneself in sb's shoes")).toBe("put oneself in somebody's shoes");
    expect(expandSpeechAbbrev("fight against sb/sth")).toBe("fight against somebody/something");
    expect(expandSpeechAbbrev("etc.")).toBe("et cetera");
  });

  it("leaves one's / oneself alone (they read fine)", () => {
    expect(expandSpeechAbbrev("try one's best")).toBe("try one's best");
    expect(expandSpeechAbbrev("enjoy oneself")).toBe("enjoy oneself");
  });

  it("never touches letters inside real words (\\b-guarded)", () => {
    expect(expandSpeechAbbrev("USB cable")).toBe("USB cable");
    expect(expandSpeechAbbrev("a sketch of etching")).toBe("a sketch of etching");
    expect(expandSpeechAbbrev("myths and months")).toBe("myths and months");
    expect(expandSpeechAbbrev("absent")).toBe("absent");
  });

  it("is a no-op for abbreviation-free text (cache hash preserved)", () => {
    const s = "How tall is your father?";
    expect(expandSpeechAbbrev(s)).toBe(s);
    expect(cleanForTTS(s)).toBe(s);
  });

  it("cleanForTTS applies expansion after label stripping", () => {
    expect(cleanForTTS("help sb with sth")).toBe("help somebody with something");
  });
});
