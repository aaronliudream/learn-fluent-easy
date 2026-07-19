/**
 * 图书馆精读 · 书签数据层。照 favorites.ts 模板(登录用户私有、RLS 隔离、as any 客户端)。
 * 表 library_bookmarks:每用户每书多个精准阅读点,按 (user_id, book_id, seq) 去重。
 * 与"继续阅读"library_reading_progress 独立(续读=自动一个;书签=手动多个)。
 * preview/preview_cn 加书签时快照进表,面板展示不依赖实时查句子表。
 * library_bookmarks 未进 types.ts(新表)→ 对 client 做 as any。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type LibraryBookmark = {
  id: string;
  user_id: string;
  book_id: string;
  seq: number;
  chapter_idx: number;
  preview: string | null;
  preview_cn: string | null;
  created_at: string;
};

export type AddBookmarkArgs = {
  bookId: string;
  seq: number;
  chapterIdx: number;
  preview?: string;
  previewCn?: string;
};

/** 加书签(幂等:同一 seq 再点 = 更新)。登录才写;返回新行供前端本地插入。 */
export async function addBookmark(args: AddBookmarkArgs): Promise<LibraryBookmark | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const { data, error } = await db
    .from("library_bookmarks")
    .upsert(
      {
        user_id: user.id,
        book_id: args.bookId,
        seq: args.seq,
        chapter_idx: args.chapterIdx,
        preview: args.preview ?? null,
        preview_cn: args.previewCn ?? null,
      },
      { onConflict: "user_id,book_id,seq" },
    )
    .select()
    .single();
  if (error) throw error;
  return (data ?? null) as LibraryBookmark | null;
}

/** 删书签(按 book+seq)。 */
export async function removeBookmark(bookId: string, seq: number): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const { error } = await db
    .from("library_bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .eq("seq", seq);
  if (error) throw error;
}

/** 某书全部书签(按 seq 升序 = 阅读顺序)。未登录 / 出错 → 空数组(优雅降级)。 */
export async function listBookmarks(bookId: string): Promise<LibraryBookmark[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await db
    .from("library_bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .order("seq", { ascending: true });
  if (error) {
    console.warn("[library_bookmarks] list error", error);
    return [];
  }
  return (data ?? []) as LibraryBookmark[];
}
