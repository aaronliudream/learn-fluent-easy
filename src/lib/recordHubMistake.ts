import { supabase } from "@/integrations/supabase/client";

/**
 * Hub 闯关(初中/高中)阅读·听力错题 → 统一错题本 user_mistakes(额外写一份)。
 *
 * 现状:Hub 做错原本只写 localStorage(state.mistakes),老师端/`/mistakes` 看不到。
 * 本写入器在各 Hub 的 reading/listening onWrong 处**额外**调用,把自包含单题快照
 * 落到 user_mistakes(题干+全部选项 A/B/C/D+正确答案+学生作答),让错题进统一错题本+老师端。
 *
 * 铁律:纯新增写入,不动 Hub 本地 addMistake 逻辑、不碰判分/做题核心;
 *       整段 try/catch,失败只 console.warn,绝不阻断闯关;只对以后生效;不经 edge。
 *
 * ▶ source_key 稳定合成:`hub_<grade>_<module>_<unitId>_<djb2(题干|选项)>`——
 *   只由题干+选项内容决定,同题每次同 key(重做定位/自动移出生效),不同题不撞。
 * ▶ 快照格式与语法那套一致(options{A..}+correct_answer 字母),错题本"全选项显示"、
 *   "重做"(RedoQuestionModal)、老师端单题渲染全部复用现成组件。
 * ▶ module 用 hub_reading / hub_listening —— 避开老师端 RPC 对 'reading' 的排除。
 */

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// deterministic djb2(绝不用 Date/random,保证同内容同 key)。
function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export async function recordHubMistake(p: {
  grade: number;
  module: "hub_reading" | "hub_listening";
  unitId: string;
  unitTitle?: string | null;
  stem: string;
  opts: string[];
  answerIdx: number;
  pickedIdx?: number | null;
  explanation?: string | null;
  /** 听力题:朗读文本(= 现场 hubSpeak/TTS 合成的原句)。存进快照供错题本/老师端「🔊 重听」,无音频文件 URL、不会失效。 */
  audio?: string | null;
}): Promise<void> {
  try {
    if (!p.unitId || !Array.isArray(p.opts) || p.opts.length < 2) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const hash = djb2(p.stem + "|" + p.opts.join("|"));
    const sourceKey = `hub_${p.grade}_${p.module}_${p.unitId}_${hash}`;

    const options: Record<string, string> = {};
    p.opts.forEach((o, i) => {
      if (LETTERS[i]) options[LETTERS[i]] = o;
    });
    const correctLetter = LETTERS[p.answerIdx] ?? "";
    const userLetter =
      p.pickedIdx != null && p.pickedIdx >= 0 ? LETTERS[p.pickedIdx] ?? null : null;

    const { error } = await supabase.from("user_mistakes").upsert(
      {
        user_id: user.id,
        module: p.module,
        source_key: sourceKey,
        source_label: p.unitTitle ?? null,
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
          // 听力:存朗读原文,错题本/老师端渲染「🔊 重听」按钮 → hubSpeak 现场合成。
          ...(p.audio ? { audio: p.audio } : {}),
        },
        is_resolved: false,
        last_wrong_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module,source_key" },
    );
    if (error) console.warn("[hub mistake] upsert failed", error);
  } catch (e) {
    console.warn("[hub mistake] write failed", e);
  }
}
