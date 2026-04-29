// Tracks which slang idioms the user has answered correctly.
// Mastered idioms sink to the bottom; unseen / wrong ones float to the top.
// Persists to Supabase when the user is signed in, with a localStorage cache
// so the UI stays snappy and works offline.

import { supabase } from "@/integrations/supabase/client";

const LOCAL_KEY = "slang_mastery_v2";

type Store = {
  correct: Record<number, number>;
  wrong: Record<number, number>;
};

let cache: Store = { correct: {}, wrong: {} };
let loaded = false;

function loadLocal(): Store {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { correct: {}, wrong: {} };
    const p = JSON.parse(raw);
    return { correct: p.correct ?? {}, wrong: p.wrong ?? {} };
  } catch {
    return { correct: {}, wrong: {} };
  }
}

function saveLocal(s: Store) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

/** Pull the user's mastery records from the cloud once per session. */
export async function loadSlangMastery(): Promise<Store> {
  if (loaded) return cache;
  cache = loadLocal();
  loaded = true;
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return cache;
    const { data, error } = await supabase
      .from("slang_mastery")
      .select("idiom_id, correct_count, wrong_count")
      .eq("user_id", uid);
    if (error || !data) return cache;
    const next: Store = { correct: {}, wrong: {} };
    for (const row of data) {
      next.correct[row.idiom_id] = row.correct_count ?? 0;
      next.wrong[row.idiom_id] = row.wrong_count ?? 0;
    }
    cache = next;
    saveLocal(cache);
  } catch {
    /* offline / not signed in — keep local cache */
  }
  return cache;
}

export function getSlangStoreSync(): Store {
  if (!loaded) {
    cache = loadLocal();
    loaded = true;
  }
  return cache;
}

/** Optimistically update the local cache and best-effort sync to cloud. */
export async function recordSlangResult(id: number, correct: boolean) {
  const s = getSlangStoreSync();
  if (correct) s.correct[id] = (s.correct[id] ?? 0) + 1;
  else s.wrong[id] = (s.wrong[id] ?? 0) + 1;
  saveLocal(s);

  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase.from("slang_mastery").upsert(
      {
        user_id: uid,
        idiom_id: id,
        correct_count: s.correct[id] ?? 0,
        wrong_count: s.wrong[id] ?? 0,
        last_result: correct ? "correct" : "wrong",
      },
      { onConflict: "user_id,idiom_id" },
    );
  } catch {
    /* ignore — local cache wins, will sync on next successful write */
  }
}

export function isMasteredSlang(id: number, store = getSlangStoreSync()): boolean {
  return (store.correct[id] ?? 0) >= 1 && (store.correct[id] ?? 0) > (store.wrong[id] ?? 0);
}

/**
 * Sort idioms so unseen / wrong ones come first and mastered ones sink down.
 * Order key (low → high):
 *   0  unseen
 *   1  wrong ≥ correct (still struggling)
 *   2  mastered
 */
export function sortByMastery<T extends { id: number }>(items: T[]): T[] {
  const store = getSlangStoreSync();
  const bucket = (id: number) => {
    const c = store.correct[id] ?? 0;
    const w = store.wrong[id] ?? 0;
    if (c === 0 && w === 0) return 0;
    if (c >= 1 && c > w) return 2;
    return 1;
  };
  return items
    .map((it, i) => ({ it, i, b: bucket(it.id) }))
    .sort((a, b) => a.b - b.b || a.i - b.i)
    .map((x) => x.it);
}
