// Maps a storybook page's "speaker" to an OpenAI TTS voice + speed combo.
// We don't have child voices natively in OpenAI TTS, so we approximate
// kids by using "shimmer" (the brightest female timbre) at slightly
// faster speed, which reads as a more youthful, energetic narration.
// Adults use deeper/calmer timbres at normal speed.
import type { StoryBookPage } from "@/data/primaryStoryBooks";

export type StoryVoice = { voiceId: string; speed: number };

export function pickStoryVoice(speaker: StoryBookPage["speaker"]): StoryVoice {
  switch (speaker) {
    case "mom":      return { voiceId: "nova",    speed: 0.95 }; // 温柔成年女声
    case "dad":      return { voiceId: "onyx",    speed: 0.95 }; // 低沉成年男声
    case "spark":    return { voiceId: "fable",   speed: 1.05 }; // Spark 角色专属
    case "narrator": return { voiceId: "alloy",   speed: 0.95 }; // 中性旁白
    case "kid":
    default:         return { voiceId: "shimmer", speed: 1.10 }; // 童声(亮 + 略快)
  }
}
