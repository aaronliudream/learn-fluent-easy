import { supabase } from "@/integrations/supabase/client";

/**
 * 全学段专区/闯关错题 → 统一错题本 user_mistakes,每题一条**完整自包含快照**。
 *
 * 背景:很多做题路径原本只走 recordUnifiedAttempt→edge(写 user_mistakes 但不带 snapshot)、
 * 或只写 localStorage / 掌握度表 → 老师端/`/mistakes` 看不到或只见"薄快照"。本写入器照阅读
 * 那套,在做题页**额外直写**一条带完整 snapshot 的行,让错题完整显示、可重听/看图、可重做。
 *
 * 铁律:纯新增写入,不动判分/掌握度/edge/SRS;整段 try/catch,失败只 console.warn,
 *       绝不阻断做题;只对以后生效;不经 edge、无需 deploy。
 *
 * ▶ isCorrect=true → 按 source_key 自动移出(is_resolved=true);false → 写/覆盖完整快照。
 * ▶ source_key = `<module>_<base>_<djb2(题干|选项)>`,同题稳定(重做定位/自动移出)。
 * ▶ 快照 schema(块0 一次性定型,全学段共用;JSONB 加键、无表迁移):
 *     source, question_type: "mcq" | "open",
 *     stem, stem_image?,                       // 题干文本 + 题干图(小学看图题)
 *     options{A..}, option_images{A..}?,       // MCQ 文本选项 + 选项图(小学看图题)
 *     correct_answer(字母),
 *     reference_answer?, self_grade?, judged_by?, // 开放题(美语情景应答·学生自评)
 *     audio?(TTS 文本), audio_url?(真音频文件)
 *   → 错题本 optionPairs/RedoQuestionModal、老师端渲染均按此结构读取。
 */

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export async function recordZoneMistake(p: {
  module: string; // 带前缀,避开老师端对 'reading'/'cloze'/'listening' 的排除
  sourceKeyBase: string; // 稳定标识,如 `${exerciseId}:${questionIdx}`
  isCorrect: boolean;
  stem: string;
  // ── MCQ(选择题)──
  options?: string[];
  correctIdx?: number;
  pickedIdx?: number | null;
  // ── 块0 扩展:图片题(小学看图选词/看图选句)──
  stemImage?: string | null; // 题干图 URL
  optionImages?: (string | null | undefined)[]; // 选项图 URL,与 options 同序
  // ── 块0 扩展:开放题(美语情景应答·学生自评,无选项)──
  openEnded?: boolean;
  referenceAnswer?: string | null; // 参考答案
  selfGrade?: "correct" | "wrong" | null; // 学生自评结果
  // ── 通用 ──
  audio?: string | null; // TTS 朗读文本(现场合成,永不失效)
  audioUrl?: string | null; // 真音频文件 URL(如初中听力 e.audio_url),优先播放
  explanation?: string | null;
  sourceLabel?: string | null;
}): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // ══ 开放题(无选项):存参考答案 + 学生自评,判定来源标 self ══
    if (p.openEnded) {
      const sourceKey = `${p.module}_${p.sourceKeyBase}_${djb2(p.stem)}`;
      // 学生自评为"对"(或调用方判对)→ 移出。
      if (p.isCorrect || p.selfGrade === "correct") {
        await supabase
          .from("user_mistakes")
          .update({ is_resolved: true, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("module", p.module)
          .eq("source_key", sourceKey)
          .eq("is_resolved", false);
        return;
      }
      const { error } = await supabase.from("user_mistakes").upsert(
        {
          user_id: user.id,
          module: p.module,
          source_key: sourceKey,
          source_label: p.sourceLabel ?? null,
          question: p.stem,
          user_answer: p.selfGrade ?? null,
          correct_answer: p.referenceAnswer ?? null,
          explanation: p.explanation ?? null,
          snapshot: {
            source: p.module,
            question_type: "open",
            stem: p.stem,
            reference_answer: p.referenceAnswer ?? null,
            self_grade: p.selfGrade ?? null,
            judged_by: "self",
            ...(p.stemImage ? { stem_image: p.stemImage } : {}),
            ...(p.audio ? { audio: p.audio } : {}),
            ...(p.audioUrl ? { audio_url: p.audioUrl } : {}),
          },
          is_resolved: false,
          last_wrong_at: new Date().toISOString(),
        },
        { onConflict: "user_id,module,source_key" },
      );
      if (error) console.warn("[zone mistake:open] upsert failed", error);
      return;
    }

    // ══ MCQ(选择题)══
    if (!Array.isArray(p.options) || p.options.length < 2) return;
    const sourceKey = `${p.module}_${p.sourceKeyBase}_${djb2(p.stem + "|" + p.options.join("|"))}`;

    if (p.isCorrect) {
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
    const optionImages: Record<string, string> = {};
    p.options.forEach((o, i) => {
      const L = LETTERS[i];
      if (!L) return;
      options[L] = o;
      const img = p.optionImages?.[i];
      if (img) optionImages[L] = img;
    });
    const correctLetter = p.correctIdx != null ? LETTERS[p.correctIdx] ?? "" : "";
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
          ...(Object.keys(optionImages).length ? { option_images: optionImages } : {}),
          ...(p.stemImage ? { stem_image: p.stemImage } : {}),
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
