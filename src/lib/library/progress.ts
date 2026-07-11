/**
 * 图书馆(/library)· 阅读进度 + 云同步。
 * 表 library_reading_progress:每用户每册一个 JSON blob(照 primary/junior_hub_progress 模式)。
 * 云同步铁律(照搬 hubCloudSync):**local ∪ remote,不覆盖** —— furthest_seq/last_seq/seconds 取 max,
 * 断点(last_seq + 其 chapter_idx)取"走得更远"的那份。1500ms 防抖 push;空云端不清本地。
 *
 * library_reading_progress 未进 types.ts(新表),对 client 做 `as any`。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** state 形状(与 DDL 注释一致)。 */
export type LibraryReadingState = {
  furthest_seq: number; // 到达过的最远句子索引 → 完成度 = (furthest_seq+1)/sentence_count
  last_seq: number; // 上次离开时的句子 → 断点续读跳这里
  seconds: number; // 累计活跃阅读秒数
  chapter_idx: number; // last_seq 所在章(真实章号)
  updated_at: number; // 本地时间戳(ms),仅用于择新
};

export function defaultLibraryState(): LibraryReadingState {
  return { furthest_seq: -1, last_seq: 0, seconds: 0, chapter_idx: 0, updated_at: 0 };
}

function parseState(raw: unknown): LibraryReadingState | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<LibraryReadingState>;
  return {
    ...defaultLibraryState(),
    furthest_seq: Number.isFinite(d.furthest_seq) ? Number(d.furthest_seq) : -1,
    last_seq: Number.isFinite(d.last_seq) ? Number(d.last_seq) : 0,
    seconds: Number.isFinite(d.seconds) ? Number(d.seconds) : 0,
    chapter_idx: Number.isFinite(d.chapter_idx) ? Number(d.chapter_idx) : 0,
    updated_at: Number.isFinite(d.updated_at) ? Number(d.updated_at) : 0,
  };
}

/** 合并:local ∪ remote,不回退。furthest/seconds 取 max;断点取 last_seq 更大的一份(连 chapter_idx 一起)。 */
export function mergeLibraryState(a: LibraryReadingState, b: LibraryReadingState): LibraryReadingState {
  const resumeFrom = b.last_seq > a.last_seq ? b : a; // 谁走得更远,断点用谁(章号随之)
  return {
    furthest_seq: Math.max(a.furthest_seq, b.furthest_seq),
    last_seq: resumeFrom.last_seq,
    chapter_idx: resumeFrom.chapter_idx,
    seconds: Math.max(a.seconds, b.seconds),
    updated_at: Math.max(a.updated_at, b.updated_at),
  };
}

// ---------- 本地(localStorage;游客与离线兜底)----------
const LS_PREFIX = "library.progress.v1.";

export function loadLocalState(bookId: string): LibraryReadingState {
  try {
    const raw = localStorage.getItem(LS_PREFIX + bookId);
    return (raw && parseState(JSON.parse(raw))) || defaultLibraryState();
  } catch {
    return defaultLibraryState();
  }
}

export function saveLocalState(bookId: string, state: LibraryReadingState): void {
  try {
    localStorage.setItem(LS_PREFIX + bookId, JSON.stringify(state));
  } catch {
    /* quota — 忽略 */
  }
}

// ---------- 云端 ----------
export async function pullCloudState(userId: string, bookId: string): Promise<LibraryReadingState | null> {
  const { data, error } = await db
    .from("library_reading_progress")
    .select("state")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  if (error) {
    console.warn("[library cloud] pull failed", error.message);
    return null;
  }
  return data?.state ? parseState(data.state) : null;
}

async function pushNow(userId: string, bookId: string, state: LibraryReadingState): Promise<void> {
  const { error } = await db.from("library_reading_progress").upsert(
    {
      user_id: userId,
      book_id: bookId,
      state: state as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" },
  );
  if (error) console.warn("[library cloud] push failed", error.message);
}

// 1500ms 防抖 push(照 hubCloudSync;阅读器同一时刻只开一本书,单 pending 足够)。
const DEBOUNCE_MS = 1500;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUserId: string | null = null;
let pendingBookId: string | null = null;
let pendingState: LibraryReadingState | null = null;
let inflight: Promise<void> | null = null;

export function scheduleCloudPush(userId: string, bookId: string, state: LibraryReadingState): void {
  pendingUserId = userId;
  pendingBookId = bookId;
  pendingState = state;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushCloudPush();
  }, DEBOUNCE_MS);
}

export async function flushCloudPush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const userId = pendingUserId;
  const bookId = pendingBookId;
  const state = pendingState;
  if (!userId || !bookId || !state) return;
  pendingUserId = null;
  pendingBookId = null;
  pendingState = null;
  if (inflight) await inflight;
  inflight = pushNow(userId, bookId, state);
  try {
    await inflight;
  } finally {
    inflight = null;
  }
}

/**
 * 一组书的进度快照(书架/详情卡显示完成度用)。登录 → 云端一次查全 ∪ 本地;游客 → 仅本地。
 * 返回 Map<bookId, state>;无进度的书不入 Map(卡片按"未开始"渲染)。
 */
export async function fetchProgressMap(
  userId: string | null,
  bookIds: string[],
): Promise<Map<string, LibraryReadingState>> {
  const out = new Map<string, LibraryReadingState>();
  // 本地兜底(游客 + 尚未回流的设备)
  for (const id of bookIds) {
    const local = loadLocalState(id);
    if (local.furthest_seq >= 0 || local.seconds > 0) out.set(id, local);
  }
  if (!userId || !bookIds.length) return out;
  const { data } = await db
    .from("library_reading_progress")
    .select("book_id,state")
    .eq("user_id", userId)
    .in("book_id", bookIds);
  for (const r of (data ?? []) as { book_id: string; state: unknown }[]) {
    const remote = parseState(r.state);
    if (!remote) continue;
    const local = out.get(r.book_id);
    out.set(r.book_id, local ? mergeLibraryState(local, remote) : remote);
  }
  return out;
}

/**
 * 拉云端 → 与本地 merge(union/max)→ 存本地 → 把 merged 推回。
 * 空云端:保留本地并(若有进度)上传,绝不清本地。返回 merged 供阅读器定位断点。
 */
export async function hydrateFromCloud(userId: string, bookId: string): Promise<LibraryReadingState> {
  const local = loadLocalState(bookId);
  const remote = await pullCloudState(userId, bookId);
  if (!remote) {
    saveLocalState(bookId, local);
    if (local.furthest_seq >= 0 || local.seconds > 0) await pushNow(userId, bookId, local);
    return local;
  }
  const merged = mergeLibraryState(local, remote);
  saveLocalState(bookId, merged);
  await pushNow(userId, bookId, merged);
  return merged;
}
