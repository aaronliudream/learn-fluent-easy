/**
 * 图书馆精读 · 用户词库(收藏)数据层。照 src/lib/examFavorites.ts 模板。
 * 表 library_vocab_favorites(用户私有,追加式,全局跨书);按 (term, kind) 去重(再收藏=更新)。
 * 不碰任何掌握表。library_vocab_favorites 未进 types.ts(新表)→ 对 client 做 `as any`。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type LibraryFavoriteKind = "word" | "chunk";

export type LibraryFavorite = {
  id: string;
  user_id: string;
  term: string;
  kind: LibraryFavoriteKind;
  zh: string | null;
  ipa: string | null;
  pos: string | null;
  sense_key: string | null; // 多义词冻结的义(复习按此义测);单义为 null
  src_sentence: string | null;
  src_zh: string | null;
  book_id: string | null;
  created_at: string;
  recall_hit_count: number | null;
  recall_miss_count: number | null;
  last_recalled_at: string | null;
  correct_streak: number | null;      // 跨天连对计数(复习用)
  last_correct_date: string | null;   // 上次做对的北京日期 YYYY-MM-DD
};

/** 跨天掌握阈值:连对 N 个不同的北京日 → 已掌握。 */
export const VOCAB_MASTER_STREAK = 3;

/**
 * 一轮复习的词数上限(分批)。改这一个常量即可调整一轮长度。
 * 为什么要分批:不分批时"今日待复习"全量进一轮 —— 200 个词的账号点开就是 200 题一堵墙。
 */
export const REVIEW_BATCH_SIZE = 20;

/** 北京时间(UTC+8)今天 YYYY-MM-DD。同天重复做对不计,保证"跨天"语义。 */
export function bjToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

export type VocabStreakResult = { streak: number; mastered: boolean; alreadyToday: boolean };

// ---- 状态口径(纯函数,前端算,零查询)。掌握=streak≥3;学习中=0<streak<3;今日待复习=未掌握且今天还没答对。----
export type VocabStatus = "due" | "learning" | "mastered";
export function vocabStreakOf(f: LibraryFavorite): number {
  return f.correct_streak ?? 0;
}
export function vocabIsMastered(f: LibraryFavorite): boolean {
  return vocabStreakOf(f) >= VOCAB_MASTER_STREAK;
}
/** 今日待复习:未掌握 且 上次做对不是今天(北京日)。已掌握的不再出题。 */
export function vocabIsDueToday(f: LibraryFavorite): boolean {
  return !vocabIsMastered(f) && f.last_correct_date !== bjToday();
}
/** 学习中:连对 1-2 次(未掌握、已起步)。与「今日待复习」是不同视角,可重叠。 */
export function vocabIsLearning(f: LibraryFavorite): boolean {
  const s = vocabStreakOf(f);
  return s > 0 && s < VOCAB_MASTER_STREAK;
}
/** 列表分栏用的互斥主状态:已掌握 > 学习中 > 待复习(streak=0 也归 due)。 */
export function vocabStatusOf(f: LibraryFavorite): VocabStatus {
  if (vocabIsMastered(f)) return "mastered";
  if (vocabIsLearning(f)) return "learning";
  return "due";
}

/**
 * 分批取词前的优先级排序(确定性,不随机):
 *  ① correct_streak 降序 —— 接近掌握的先测,快速清队列、给正反馈;
 *  ② last_recalled_at 升序(null 排最前)—— 久未复习的优先;
 *  ③ created_at 升序 —— 兜底,保证同分时批次稳定、不会每次刷新换一批。
 * 只排序不截断(截断在调用方按 REVIEW_BATCH_SIZE 切);题序仍由 buildReviewQuestions 内部 shuffle 决定。
 */
export function sortForReview(favs: LibraryFavorite[]): LibraryFavorite[] {
  return favs.slice().sort((a, b) => {
    const byStreak = (b.correct_streak ?? 0) - (a.correct_streak ?? 0);
    if (byStreak !== 0) return byStreak;
    const ra = a.last_recalled_at;
    const rb = b.last_recalled_at;
    if (ra !== rb) {
      if (!ra) return -1; // 从没复习过的排前面
      if (!rb) return 1;
      return ra < rb ? -1 : 1;
    }
    const ca = a.created_at ?? "";
    const cb = b.created_at ?? "";
    if (ca === cb) return 0;
    return ca < cb ? -1 : 1;
  });
}

/**
 * 复习一题后更新跨天连对(方案 ②,规则照搬 main 给 user_mistakes 的 bump_mistake_correct):
 *  · 做对 + 且非同一天(UTC+8)→ streak+1、last_correct_date=今天;
 *  · 做对 + 同一天 → 不加(防刷,alreadyToday=true);
 *  · 做错 → streak 清零、last_correct_date=NULL。
 *  streak>=VOCAB_MASTER_STREAK → 已掌握。只写 library_vocab_favorites 自己的字段。
 */
export async function recordVocabStreak(
  term: string,
  kind: LibraryFavoriteKind,
  correct: boolean,
): Promise<VocabStreakResult | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data: cur } = await db
    .from("library_vocab_favorites")
    .select("correct_streak,last_correct_date")
    .eq("user_id", user.id)
    .eq("term", term)
    .eq("kind", kind)
    .maybeSingle();
  if (!cur) return null;

  const streak = cur.correct_streak ?? 0;
  const today = bjToday();

  if (!correct) {
    await db
      .from("library_vocab_favorites")
      .update({ correct_streak: 0, last_correct_date: null })
      .eq("user_id", user.id)
      .eq("term", term)
      .eq("kind", kind);
    return { streak: 0, mastered: false, alreadyToday: false };
  }
  if (cur.last_correct_date === today) {
    // 同一天已计过,不重复加(防刷次数)。
    return { streak, mastered: streak >= VOCAB_MASTER_STREAK, alreadyToday: true };
  }
  const next = streak + 1;
  await db
    .from("library_vocab_favorites")
    .update({ correct_streak: next, last_correct_date: today })
    .eq("user_id", user.id)
    .eq("term", term)
    .eq("kind", kind);
  return { streak: next, mastered: next >= VOCAB_MASTER_STREAK, alreadyToday: false };
}

export type AddFavoriteArgs = {
  term: string;
  kind: LibraryFavoriteKind;
  zh?: string;
  ipa?: string;
  pos?: string;
  senseKey?: string; // 多义词:冻结点词时解析出的义(复习按此义测);单义/无则 null
  srcSentence?: string;
  srcZh?: string;
  bookId?: string;
};

export async function addLibraryFavorite(args: AddFavoriteArgs): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const { error } = await db.from("library_vocab_favorites").upsert(
    {
      user_id: user.id,
      term: args.term,
      kind: args.kind,
      zh: args.zh ?? null,
      ipa: args.ipa ?? null,
      pos: args.pos ?? null,
      sense_key: args.senseKey ?? null,
      src_sentence: args.srcSentence ?? null,
      src_zh: args.srcZh ?? null,
      book_id: args.bookId ?? null,
    },
    { onConflict: "user_id,term,kind" },
  );
  if (error) throw error;
}

export async function removeLibraryFavorite(term: string, kind: LibraryFavoriteKind): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const { error } = await db
    .from("library_vocab_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("term", term)
    .eq("kind", kind);
  if (error) throw error;
}

export async function listLibraryFavorites(kind?: LibraryFavoriteKind): Promise<LibraryFavorite[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  let q = db
    .from("library_vocab_favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) {
    console.warn("[library_vocab_favorites] list error", error);
    return [];
  }
  return (data ?? []) as LibraryFavorite[];
}

/** 当前用户所有收藏词/语块的小写集合(正文高亮 + 微提取判定用)。 */
export async function listFavoritedTerms(): Promise<Set<string>> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return new Set();
  const { data, error } = await db
    .from("library_vocab_favorites")
    .select("term")
    .eq("user_id", user.id);
  if (error) return new Set();
  return new Set(((data ?? []) as { term: string }[]).map((r) => String(r.term).toLowerCase()));
}

/**
 * 记一次「微提取」结果(先回忆后揭晓):想起来了 → recall_hit_count+1;想不起来 → recall_miss_count+1。
 * 只记在收藏表,暂不接掌握引擎(那三张掌握表的坑留下一轮)。读后自增(低频,可接受两次查询)。
 */
export async function recordRecall(
  term: string,
  kind: LibraryFavoriteKind,
  remembered: boolean,
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  const { data: cur } = await db
    .from("library_vocab_favorites")
    .select("recall_hit_count,recall_miss_count")
    .eq("user_id", user.id)
    .eq("term", term)
    .eq("kind", kind)
    .maybeSingle();
  if (!cur) return;
  const patch = remembered
    ? { recall_hit_count: (cur.recall_hit_count ?? 0) + 1 }
    : { recall_miss_count: (cur.recall_miss_count ?? 0) + 1 };
  await db
    .from("library_vocab_favorites")
    .update({ ...patch, last_recalled_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("term", term)
    .eq("kind", kind);
}

export async function isLibraryFavorite(term: string, kind: LibraryFavoriteKind): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;
  const { data, error } = await db
    .from("library_vocab_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("term", term)
    .eq("kind", kind)
    .maybeSingle();
  if (error) return false;
  return !!data;
}
