// Map a storybook page's "speaker" tag to a TTS voice.
//
// 我们用 ElevenLabs 多个真人音色来区分角色,让孩子在听绘本时
// 能立刻分辨出谁在讲话:
//   • kid / narrator → Lily(温柔的幼师女声,接近孩子的明亮音色)
//   • mom            → Matilda(温暖的讲故事妈妈)
//   • dad            → Brian(温和的成年男声)
//   • spark          → Callum(俏皮的男声,贴合小狐狸 Spark)
import type { StoryBookPage } from "@/data/primaryStoryBooks";
import { getKidSpeed } from "@/lib/speak";

export type StoryVoice = { voiceId: string; speed: number };

export function pickStoryVoice(speaker: StoryBookPage["speaker"]): StoryVoice {
  const kidSpeed = getKidSpeed();          // 0.7 (G1) → 1.0 (G4+)
  const adultSpeed = Math.max(0.85, kidSpeed); // 大人讲话稍快一点点,但仍照顾低龄
  switch (speaker) {
    case "mom":      return { voiceId: "el:matilda", speed: adultSpeed };
    case "dad":      return { voiceId: "el:brian",   speed: adultSpeed };
    case "spark":    return { voiceId: "el:callum",  speed: adultSpeed };
    case "narrator": return { voiceId: "el:sarah",   speed: adultSpeed };
    case "kid":
    default:         return { voiceId: "el:lily",    speed: kidSpeed };
  }
}
