import { recordZoneMistake } from "@/lib/recordZoneMistake";
import type { QuizItem } from "@/components/american/QuizRunner";

/**
 * 新概念/美语做题 → 统一错题本 user_mistakes(除词汇外的任何测试题,做错即入册)。
 *
 * ▶ 铁律·SRS 隔离:本文件**只**调 recordZoneMistake(只写 user_mistakes),**绝不 import /
 *   调用 recordMastery、绝不碰 american_user_mastery**。SRS(due_at/next_review_at/lapses/
 *   srs_step)仍由各关 onAnswer 里的 recordMastery 独立写,两者各写各的表、互不读写。
 *   错题本"重做→做对移出"走 /mistakes 的 RedoModal,只改 user_mistakes.is_resolved,
 *   代码里根本没有通往 american_user_mastery 的路径 → 重做美语错题物理上改不到 SRS。
 *
 * ▶ module 自动路由(老师端黑名单机制:下列 module 全自动可见、已 label):
 *   reveal(开放题)→ american_scenario(⑤-B 起用);context(填空)→ senior_cloze;
 *   passage(阅读)→ hub_reading;audio(听力)→ hub_listening;其余 choice → senior_grammar。
 *
 * ▶ source_key = american_questions.id(uuid 稳定)→ 去重/跨3天连对移出天然可靠。
 */
/** 错题来源标签:`L{课号}·{中文/英文标题}`,供错题本/老师端显示是哪一课。 */
export function americanLessonLabel(lesson: { lesson_no?: number | null; title_cn?: string | null; title_en?: string | null }): string {
  const t = (lesson.title_cn || lesson.title_en || "").trim();
  return lesson.lesson_no != null ? `L${lesson.lesson_no}${t ? "·" + t : ""}` : t;
}

function moduleFor(item: QuizItem): string {
  if (item.kind === "reveal") return "american_scenario";
  if (item.context) return "senior_cloze";
  if (item.passage) return "hub_reading";
  if (item.audio) return "hub_listening";
  return "senior_grammar";
}

export function recordAmericanMistake(
  item: QuizItem,
  picked: number | null,
  isCorrect: boolean,
  sourceLabel?: string | null,
): void {
  const module = moduleFor(item);

  if (item.kind === "reveal") {
    // 开放题(句型转换/情景应答):存参考答案 + 学生自评,做对按 source_key 走连对移出。
    void recordZoneMistake({
      module,
      sourceKeyBase: item.id,
      isCorrect,
      openEnded: true,
      stem: item.prompt,
      referenceAnswer: item.answer,
      selfGrade: isCorrect ? "correct" : "wrong",
      explanation: item.explanation ?? null,
      sourceLabel: sourceLabel ?? null,
    });
    return;
  }

  // 选项按内容排序后再传:source_key 含选项串的哈希,关10 重考会打散选项 → 不排序则同题
  // 每轮 key 漂移、做对移不掉。排序后同一题(内容集相同)key 稳定,去重/连对移出可靠。
  const order = item.options.map((_, i) => i).sort((a, b) => item.options[a].localeCompare(item.options[b]));
  const sortedOpts = order.map((i) => item.options[i]);
  const correctIdx = order.indexOf(item.answerIndex);
  const pickedIdx = picked == null ? null : order.indexOf(picked);

  // 选择题:题干取填空整句(cloze 的 context 含 ___)否则取 stem;听力题带 TTS 文本(无 MP3)。
  void recordZoneMistake({
    module,
    sourceKeyBase: item.id,
    isCorrect,
    stem: item.context?.trim() ? item.context : item.stem,
    options: sortedOpts,
    correctIdx,
    pickedIdx,
    audio: item.audio ?? null,
    explanation: item.explanation ?? null,
    sourceLabel: sourceLabel ?? null,
  });
}
