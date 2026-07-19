import { recordZoneMistake } from "@/lib/recordZoneMistake";

/**
 * 单元通关 finalQuiz 做错 → 统一错题本 user_mistakes(块②)。
 *
 * finalQuiz 是混合题型,按维度(初中 kind / 高中 dim)分流到**已存在、老师端可见**的 module,
 * 零新 module、零 SQL(老师端 get_student_mistakes 源1 是黑名单 module not in
 * ('cloze','reading','listening') → 下列 module 天然可见):
 *   grammar   → senior_grammar(语法错题,junior/senior 语法专区同用)
 *   listening → hub_listening(听力,存 TTS 朗读文本供「🔊 重听」)
 *   reading   → hub_reading(闯关阅读)
 *   vocab     → 跳过(全局铁律:词汇不进错题本)
 *   其它/缺失 → 跳过
 *
 * 复用现成写入器 recordZoneMistake:完整快照(题干+全选项+正确+所选+听力音频),
 * 做对自动移出。纯新增写入,不碰判分/掌握度/edge/SRS;失败只 warn,绝不阻断做题。
 */

type FinalQuizDim = "vocab" | "grammar" | "reading" | "listening" | "writing" | undefined;

const DIM_TO_MODULE: Record<string, string> = {
  grammar: "senior_grammar",
  listening: "hub_listening",
  reading: "hub_reading",
};

export async function recordFinalQuizMistake(p: {
  dim: FinalQuizDim; // 初中传 q.kind ?? q.dim,高中传 q.dim
  unitId: string;
  unitTitle?: string | null;
  stem: string;
  opts: string[];
  answerIdx: number;
  pickedIdx?: number | null;
  audio?: string | null; // 听力题朗读文本(TTS,现场合成兜底)
  audioUrl?: string | null; // 听力题真 MP3(junior_listening_items.audio_url,做题实际播放来源,优先)
  explanation?: string | null;
  /** 稳定标识后缀:语法题有 questionId 时传它,否则留空(内部按题干+选项哈希兜底)。 */
  idSuffix?: string | null;
}): Promise<void> {
  const module = p.dim ? DIM_TO_MODULE[p.dim] : undefined;
  if (!module) return; // vocab / writing / 缺失 → 跳过
  await recordZoneMistake({
    module,
    sourceKeyBase: `finalquiz_${p.unitId}:${p.idSuffix ?? ""}`,
    isCorrect: false,
    stem: p.stem,
    options: p.opts,
    correctIdx: p.answerIdx,
    pickedIdx: p.pickedIdx ?? null,
    // 听力题才带音频;真 MP3(audioUrl)优先,TTS 文本(audio)兜底;其余 module 无音频。
    audio: p.dim === "listening" ? p.audio ?? null : null,
    audioUrl: p.dim === "listening" ? p.audioUrl ?? null : null,
    explanation: p.explanation ?? null,
    sourceLabel: p.unitTitle ?? null,
  });
}
