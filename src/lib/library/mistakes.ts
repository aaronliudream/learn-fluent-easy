import { supabase } from "@/integrations/supabase/client";
import type { LibraryFavoriteKind } from "@/lib/library/favorites";

/**
 * 图书馆词库复习错题 → 统一错题本 user_mistakes(module='library_vocab')。
 * 🚨 红线(DECISIONS.md D14):module 用 'library_vocab',**不用 'reading'/'cloze'**(老师端 RPC 保留名)。
 * 一术语一张卡(按 kind:term 定位):做错 upsert;做对(任一题型)→ 该术语错题 is_resolved=true。
 * 铁律:整段 try/catch,失败只 console.warn,绝不阻断做题;不经 edge;不碰掌握表。
 */
const MODULE = "library_vocab";
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// 一术语一张卡(题型无关):同 kind+term 每次同 key → 重做定位/做对自动移出生效。
const sourceKey = (kind: LibraryFavoriteKind, term: string) => `libvocab_${kind}_${djb2(term)}`;

export async function recordLibraryVocabMistake(p: {
  kind: LibraryFavoriteKind;
  term: string;
  stem: string;
  opts: string[];
  answerIdx: number;
  pickedIdx?: number | null;
  explanation?: string | null;
}): Promise<void> {
  try {
    if (!Array.isArray(p.opts) || p.opts.length < 2) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const options: Record<string, string> = {};
    p.opts.forEach((o, i) => {
      if (LETTERS[i]) options[LETTERS[i]] = o;
    });
    const correctLetter = LETTERS[p.answerIdx] ?? "";
    const userLetter = p.pickedIdx != null && p.pickedIdx >= 0 ? LETTERS[p.pickedIdx] ?? null : null;

    const { error } = await supabase.from("user_mistakes").upsert(
      {
        user_id: user.id,
        module: MODULE,
        source_key: sourceKey(p.kind, p.term),
        source_label: p.term,
        question: p.stem,
        user_answer: userLetter,
        correct_answer: correctLetter,
        explanation: p.explanation ?? null,
        snapshot: {
          source: MODULE,
          question_type: "mcq",
          stem: p.stem,
          options,
          correct_answer: correctLetter,
        },
        is_resolved: false,
        last_wrong_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module,source_key" },
    );
    if (error) console.warn("[library vocab mistake] upsert failed", error);
  } catch (e) {
    console.warn("[library vocab mistake] write failed", e);
  }
}

/** 做对该术语(任一题型)→ 把它的错题卡标记已解决。 */
export async function resolveLibraryVocabMistake(kind: LibraryFavoriteKind, term: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("user_mistakes")
      .update({ is_resolved: true })
      .eq("user_id", user.id)
      .eq("module", MODULE)
      .eq("source_key", sourceKey(kind, term))
      .eq("is_resolved", false);
  } catch (e) {
    console.warn("[library vocab mistake] resolve failed", e);
  }
}
