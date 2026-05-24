import { describe, expect, it } from "vitest";
import { pickHubEnglishVoice } from "./webSpeech";

describe("pickHubEnglishVoice", () => {
  it("prefers en-US female-friendly voices", () => {
    const voices = [
      { name: "Microsoft David", lang: "en-US", localService: true, default: false, voiceURI: "" },
      { name: "Microsoft Zira", lang: "en-US", localService: true, default: false, voiceURI: "" },
      { name: "Daniel", lang: "en-GB", localService: true, default: false, voiceURI: "" },
    ] as SpeechSynthesisVoice[];

    expect(pickHubEnglishVoice(voices)?.name).toBe("Microsoft Zira");
  });
});
