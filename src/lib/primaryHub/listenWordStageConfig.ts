// Grade-agnostic config for the listen-and-choose-word stage (ListenWordStage.tsx).
// Mirrors the spellingStageConfig pattern so one component serves g3–g6 + middle/high
// without grade branching. Only g4 is exercised today; the other rows are first-pass
// estimates proving the engine scales. NOTE: this is intentionally separate from
// spellingStageConfig.ts — listen-word has its own grade-varying knobs (reveal dwell)
// and we don't couple the two stages' configs.

import type { GradeKey } from "@/lib/primaryHub/spellingStageConfig";

export type ListenWordGradeConfig = {
  /** TTS playback rate for the spoken prompt word (slower for younger kids). */
  speechRate: number;
  /**
   * How long the 4 Chinese translations stay on screen after a pick, before
   * auto-advancing. Younger kids read slower, so they get more dwell time.
   */
  revealMs: number;
  /** Questions per round. */
  questionCount: number;
};

export const LISTEN_WORD_CONFIG: Record<GradeKey, ListenWordGradeConfig> = {
  g3: { speechRate: 0.75, revealMs: 5000, questionCount: 6 },
  g4: { speechRate: 0.85, revealMs: 4000, questionCount: 6 },
  g5: { speechRate: 0.9, revealMs: 4000, questionCount: 6 },
  g6: { speechRate: 0.95, revealMs: 3500, questionCount: 6 },
  middle: { speechRate: 0.95, revealMs: 3000, questionCount: 8 },
  high: { speechRate: 1.0, revealMs: 3000, questionCount: 8 },
};

export function getListenWordConfig(gradeKey: GradeKey): ListenWordGradeConfig {
  return LISTEN_WORD_CONFIG[gradeKey] ?? LISTEN_WORD_CONFIG.g4;
}
