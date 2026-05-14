// Map a storybook page's "speaker" tag to a TTS voice.
//
// 我们用 ElevenLabs 多个真人音色来区分角色,让孩子在听绘本时
// 能立刻分辨出谁在讲话。全部使用美式发音(避免英式/苏格兰口音):
//   • kid            → Jessica(明亮友好的美式女声)
//   • narrator       → Sarah(温和的美式女声叙述者)
//   • mom            → Matilda(美式讲故事妈妈)
//   • dad            → Brian(温和的美式成年男声)
//   • spark          → Liam(年轻的美式男声,贴合小狐狸 Spark)
import type { StoryBookPage } from "@/data/primaryStoryBooks";
import { getKidSpeed } from "@/lib/speak";

export type StoryVoice = { voiceId: string; speed: number };

export function pickStoryVoice(speaker: StoryBookPage["speaker"]): StoryVoice {
  const kidSpeed = getKidSpeed();          // 0.7 (G1) → 1.0 (G4+)
  const adultSpeed = Math.max(0.85, kidSpeed); // 大人讲话稍快一点点,但仍照顾低龄
  switch (speaker) {
    case "mom":      return { voiceId: "el:matilda", speed: adultSpeed };
    case "dad":      return { voiceId: "el:brian",   speed: adultSpeed };
    case "spark":    return { voiceId: "el:liam",    speed: adultSpeed };
    case "narrator": return { voiceId: "el:sarah",   speed: adultSpeed };
    case "kid":
    default:         return { voiceId: "el:jessica", speed: kidSpeed };
  }
}
