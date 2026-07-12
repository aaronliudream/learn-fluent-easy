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
  src_sentence: string | null;
  src_zh: string | null;
  book_id: string | null;
  created_at: string;
  recall_hit_count: number | null;
  recall_miss_count: number | null;
  last_recalled_at: string | null;
};

export type AddFavoriteArgs = {
  term: string;
  kind: LibraryFavoriteKind;
  zh?: string;
  ipa?: string;
  pos?: string;
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
