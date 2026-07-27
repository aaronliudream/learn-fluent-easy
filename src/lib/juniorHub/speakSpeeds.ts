import { prefetchTTSBatchKid } from "@/lib/speak";

/**
 * 初中 hub 的朗读语速——**唯一来源**。
 *
 * ⚠️ 预热与播放必须都从这里取。任何一侧写字面量（哪怕写的就是同一个数）都会给两侧
 * 再次分叉的机会：小学审计里的 C2-1/C2-2 就是"播放写死 0.85、预热漏传 speed 落到
 * getKidSpeed(grade)"，结果整个模块的预热全部灌到没人播的 key 上；初中 WriteStage
 * 的 :846 是同一个毛病（漏传 → 落到 getKidSpeed(7/8/9)=1.0，而播放是 0.85 / 0.7）。
 *
 * 档位含义来自 docs/audio/JUNIOR_1_speed_matrix.md（逐个调用点核过的可达档位）。
 */
export const JUNIOR_SPEAK_SPEED = {
  /** 词卡点读 / 语块点读 / 句型对话 / 默写关答对正音 */
  normal: 0.85,
  /** 听力题干（含听音辨词的目标词，走 ListenMcStage） */
  listen: 0.8,
  /** 慢速正音：听力选项正音 / 默写关答错正音 / 默写关词表点读 */
  slow: 0.7,
} as const;

/**
 * 默写关（WriteStage）**同一批词会用两个速度播**：
 *   答对 → normal(0.85)，答错 → slow(0.7)，词表点读 → slow(0.7)。
 * 所以预热必须覆盖两档：只热一档，另一档必然是冷合成。
 */
export const WRITE_STAGE_SPEEDS = [JUNIOR_SPEAK_SPEED.normal, JUNIOR_SPEAK_SPEED.slow] as const;

/**
 * 默写关预热入口：把同一批词按**播放侧真实用到的每一档**各热一遍。
 * 组件里不要再直接调 prefetchTTSBatchKid —— 那样就又有机会漏传 speed。
 */
export function prefetchJuniorWriteStage(texts: string[], grade: number): void {
  const list = texts.filter(Boolean);
  if (!list.length) return;
  for (const speed of WRITE_STAGE_SPEEDS) {
    prefetchTTSBatchKid(list, { grade, speed });
  }
}
