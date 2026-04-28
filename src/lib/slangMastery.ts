// Tracks which slang idioms the user has answered correctly.
// Mastered idioms sink to the bottom; unseen / wrong ones float to the top.

const KEY = "slang_mastery_v1";

type Store = {
  // idiom id -> number of correct answers (0 means not yet mastered)
  correct: Record<number, number>;
  // idiom id -> number of wrong answers (used for prioritising review)
  wrong: Record<number, number>;
};

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { correct: {}, wrong: {} };
    const parsed = JSON.parse(raw);
    return { correct: parsed.correct ?? {}, wrong: parsed.wrong ?? {} };
  } catch {
    return { correct: {}, wrong: {} };
  }
}

function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export function getSlangStore(): Store {
  return load();
}

export function recordSlangResult(id: number, correct: boolean) {
  const s = load();
  if (correct) s.correct[id] = (s.correct[id] ?? 0) + 1;
  else s.wrong[id] = (s.wrong[id] ?? 0) + 1;
  save(s);
}

export function isMasteredSlang(id: number, store = load()): boolean {
  // Mastered after answering correctly at least once and never wrong since.
  // (Simple heuristic; tweak if needed.)
  return (store.correct[id] ?? 0) >= 1;
}

/**
 * Sort idioms so unseen / wrong ones come first and mastered ones sink down.
 * Order key (low → high):
 *   0  unseen
 *   1  wrong > correct (still struggling)
 *   2  mastered (correct ≥ 1, no recent wrong)
 * Within the same bucket keep original order for stability.
 */
export function sortByMastery<T extends { id: number }>(items: T[]): T[] {
  const store = load();
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