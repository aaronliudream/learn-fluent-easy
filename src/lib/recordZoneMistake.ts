import { supabase } from "@/integrations/supabase/client";

/**
 * 专区(听力/完形…)错题 → 统一错题本 user_mistakes,每题一条**完整自包含快照**。
 *
 * 背景:专区听力/高中完形原本只走 recordUnifiedAttempt → edge(record-attempt),
 * 而 edge 写 user_mistakes 时**不写 snapshot**、听力还没传题干 → 落成"薄快照"
 * (无题干/无选项/无音频,老师端显示"无题目快照")。本写入器照阅读/完形初中那套,
 * 在做题页**额外直写**一条带完整 snapshot 的行(题干+全选项 A/B/C/D+音频+正确答案+作答),
 * 让专区错题也能完整显示、可重听、可重做。
 *
 * 铁律:纯新增写入,不动判分/掌握度/edge/recordUnifiedAttempt;整段 try/catch,
 *       失败只 console.warn,绝不阻断做题;只对以后生效;不经 edge、无需 deploy。
 *
 * ▶ isCorrect=true → 按 source_key 自动移出(is_resolved=true);false → 写/覆盖完整快照。
 * ▶ source_key = `<module>_<base>_<djb2(题干|选项)>`,同题稳定(重做定位/自动移出)。
 * ▶ 快照格式与语法/闯关那套一致(options{A..}+correct_answer 字母)→ 错题本全选项显示、
 *   RedoQuestionModal 重做、老师端单题渲染全部复用现成组件;audio/audio_url 供「🔊 重听」。
 */

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export async function recordZoneMistake(p: {
  module: string; // 'hub_listening' | 'senior_cloze' | …(带前缀,避开老师端对 'reading'/'cloze'/'listening' 的排除)
  sourceKeyBase: string; // 稳定标识,如 `${exerciseId}:${questionIdx}`
  isCorrect: boolean;
  stem: string;
  options: string[];
  correctIdx: number;
  pickedIdx?: number | null;
  audio?: string | null; // TTS 朗读文本(现场合成,永不失效)
  audioUrl?: string | null; // 真音频文件 URL(如初中听力 e.audio_url),优先播放
  explanation?: string | null;
  sourceLabel?: string | null;
}): Promise<void> {
  try {
    if (!Array.isArray(p.options) || p.options.length < 2) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const sourceKey = `${p.module}_${p.sourceKeyBase}_${djb2(p.stem + "|" + p.options.join("|"))}`;

    if (p.isCorrect) {
      // 做对 → 若之前有该题错题,移出错题本(source_key 命中)。
      await supabase
        .from("user_mistakes")
        .update({ is_resolved: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("module", p.module)
        .eq("source_key", sourceKey)
        .eq("is_resolved", false);
      return;
    }

    const options: Record<string, string> = {};
    p.options.forEach((o, i) => {
      if (LETTERS[i]) options[LETTERS[i]] = o;
    });
    const correctLetter = LETTERS[p.correctIdx] ?? "";
    const userLetter =
      p.pickedIdx != null && p.pickedIdx >= 0 ? LETTERS[p.pickedIdx] ?? null : null;

    const { error } = await supabase.from("user_mistakes").upsert(
      {
        user_id: user.id,
        module: p.module,
        source_key: sourceKey,
        source_label: p.sourceLabel ?? null,
        question: p.stem,
        user_answer: userLetter,
        correct_answer: correctLetter,
        explanation: p.explanation ?? null,
        snapshot: {
          source: p.module,
          question_type: "mcq",
          stem: p.stem,
          options,
          correct_answer: correctLetter,
          ...(p.audio ? { audio: p.audio } : {}),
          ...(p.audioUrl ? { audio_url: p.audioUrl } : {}),
        },
        is_resolved: false,
        last_wrong_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module,source_key" },
    );
    if (error) console.warn("[zone mistake] upsert failed", error);
  } catch (e) {
    console.warn("[zone mistake] write failed", e);
  }
}

/** letter('A'..) / 选项文本 / 数字字符串 → 选项下标;取不到返回 -1。 */
export function answerToIdx(answer: string | number | null | undefined, options: string[]): number {
  if (answer == null) return -1;
  const s = String(answer).trim();
  if (/^[A-H]$/i.test(s)) return LETTERS.indexOf(s.toUpperCase());
  const byText = options.indexOf(s);
  if (byText >= 0) return byText;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n < options.length ? n : -1;
}
