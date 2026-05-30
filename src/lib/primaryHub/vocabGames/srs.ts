import type { GameWord, SrsStore, WordSRS } from "./types";

const KEY = "bme_vocab_srs_v1_g4";

// 盒子 -> 复习间隔（遗忘曲线，按小孩节奏压缩，让进度几天内看得见变化）
const BOX_INTERVALS_MS = [
  10 * 60_000, // box0 → 10 分钟
  60 * 60_000, // box1 → 1 小时
  24 * 3_600_000, // box2 → 1 天
  3 * 24 * 3_600_000, // box3 → 3 天
  7 * 24 * 3_600_000, // box4 → 7 天
  21 * 24 * 3_600_000, // box5 → 21 天
];
const WRONG_RETRY_MS = 60_000; // 答错后 1 分钟内可再出现（本局内复现）
export const MASTERED_BOX = 4; // box ≥ 4 计入"已掌握"，进度条按这个算

function emptyStore(): SrsStore {
  return { version: 1, words: {}, updatedAt: Date.now() };
}

function load(): SrsStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1 && parsed.words) return parsed as SrsStore;
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

function save(store: SrsStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* 忽略配额错误 */
  }
}

function freshWord(): WordSRS {
  return { box: 0, correct: 0, wrong: 0, streak: 0, lastSeen: 0, nextDue: 0 };
}

// 答题后更新（任意游戏、任意题型都调用它）
export function recordResult(id: string, correct: boolean): void {
  const store = load();
  const now = Date.now();
  const w = store.words[id] ?? freshWord();
  if (correct) {
    w.correct++;
    w.streak++;
    w.box = Math.min(5, w.box + 1);
    w.nextDue = now + BOX_INTERVALS_MS[w.box];
  } else {
    w.wrong++;
    w.streak = 0;
    w.box = Math.max(0, w.box - 2); // 错了往回退两格
    w.nextDue = now + WRONG_RETRY_MS; // 很快再出
  }
  w.lastSeen = now;
  store.words[id] = w;
  store.updatedAt = now;
  save(store);
}

function isMasteredResting(s: WordSRS | undefined, now: number): boolean {
  return !!s && s.box >= MASTERED_BOX && now < s.nextDue;
}

// 从词池里挑 n 个词：没测过的最优先，错得多/逾期久的其次，已掌握的基本不出
export function selectWords(
  pool: GameWord[],
  n: number,
  opts: { maxMastered?: number } = {},
): GameWord[] {
  const store = load();
  const now = Date.now();
  const maxMastered = opts.maxMastered ?? 1; // 已掌握的词最多混入几个（做点温故）

  const scored = pool.map((word) => {
    const s = store.words[word.id];
    let priority: number;
    if (!s) {
      priority = 1000; // 没测过：最高
    } else if (isMasteredResting(s, now)) {
      priority = -100; // 已掌握且没到复习期：基本不出
    } else {
      const overdueHrs = Math.max(0, now - s.nextDue) / 3_600_000;
      priority =
        300 +
        s.wrong * 40 - // 错得越多越优先
        s.box * 50 + // box 越高越靠后
        Math.min(200, overdueHrs * 10); // 越逾期越优先
    }
    priority += Math.random() * 25; // 加点随机，别每局一模一样
    return { word, s, priority };
  });
  scored.sort((a, b) => b.priority - a.priority);

  const out: GameWord[] = [];
  let masteredUsed = 0;
  for (const item of scored) {
    if (isMasteredResting(item.s, now)) {
      if (masteredUsed >= maxMastered) continue;
      masteredUsed++;
    }
    out.push(item.word);
    if (out.length >= n) break;
  }
  // 兜底：词池实在不够就补满
  if (out.length < n) {
    for (const item of scored) {
      if (!out.includes(item.word)) out.push(item.word);
      if (out.length >= n) break;
    }
  }
  return out;
}

// 整个年级的掌握进度（进度条用）
export function getProgress(pool: GameWord[]): {
  total: number;
  mastered: number;
  seen: number;
  percent: number;
} {
  const store = load();
  const total = pool.length;
  let mastered = 0,
    seen = 0;
  for (const w of pool) {
    const s = store.words[w.id];
    if (!s) continue;
    seen++;
    if (s.box >= MASTERED_BOX) mastered++;
  }
  return { total, mastered, seen, percent: total ? Math.round((mastered / total) * 100) : 0 };
}
