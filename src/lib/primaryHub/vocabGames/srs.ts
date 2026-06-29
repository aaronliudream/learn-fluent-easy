import type { GameWord, SrsStore, WordSRS } from "./types";
import { recordGuestQuestion } from "@/lib/guestQuestionQuota";

const KEY = "bme_vocab_srs_v1_g4";

// 盒子 -> 复习间隔。前两格压到分钟级，让一个词在一次游戏里就能巩固到"掌握"；
// box2 起才进入按天的真·遗忘曲线。
const BOX_INTERVALS_MS = [
  2 * 60_000, // box0 → 2 分钟
  2 * 60_000, // box1 → 2 分钟（答对一次后很快再考一遍）
  24 * 3_600_000, // box2 → 1 天（此时已"掌握"，开始拉长间隔）
  3 * 24 * 3_600_000, // box3 → 3 天
  7 * 24 * 3_600_000, // box4 → 7 天
  14 * 24 * 3_600_000, // box5 → 14 天
];
const WRONG_RETRY_MS = 60_000; // 答错后 1 分钟内再出（本局内复现）
export const MASTERED_BOX = 2; // 答对 2 次（box ≥ 2）即算"已掌握"

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
  recordGuestQuestion(); // 游客小学词汇游戏也计入整站 20 题配额(登录用户 no-op)
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

// 从词池里挑 n 个词：到期复习的旧词 + 新词按配比混合，已掌握且没到期的基本不出
export function selectWords(
  pool: GameWord[],
  n: number,
  opts: { reviewRatio?: number; maxMastered?: number } = {},
): GameWord[] {
  const store = load();
  const now = Date.now();
  const reviewRatio = opts.reviewRatio ?? 0.5; // 一局里约一半是"该复习的旧词"
  const maxMastered = opts.maxMastered ?? 1; // 已掌握且没到期的词最多混入几个

  const scored = pool.map((word) => {
    const s = store.words[word.id];
    let bucket: "fresh" | "due" | "resting";
    let priority: number;
    if (!s) {
      bucket = "fresh";
      priority = 100 + Math.random() * 20;
    } else if (s.box >= MASTERED_BOX && now < s.nextDue) {
      bucket = "resting";
      priority = -100; // 已掌握、没到期：基本不出
    } else {
      bucket = "due";
      const overdueMin = Math.max(0, now - s.nextDue) / 60_000;
      priority =
        200 + s.wrong * 40 - s.box * 50 + Math.min(300, overdueMin * 5) + Math.random() * 20;
    }
    return { word, s, bucket, priority };
  });

  const due = scored.filter((x) => x.bucket === "due").sort((a, b) => b.priority - a.priority);
  const fresh = scored.filter((x) => x.bucket === "fresh").sort((a, b) => b.priority - a.priority);
  const resting = scored
    .filter((x) => x.bucket === "resting")
    .sort((a, b) => b.priority - a.priority);

  const wantReview = Math.min(due.length, Math.round(n * reviewRatio));
  const out: GameWord[] = [];
  for (let i = 0; i < wantReview; i++) out.push(due[i].word); // 先放该复习的
  for (const x of fresh) {
    if (out.length >= n) break;
    out.push(x.word);
  } // 再放新词
  for (const x of due) {
    if (out.length >= n) break;
    if (!out.includes(x.word)) out.push(x.word);
  }
  let masteredUsed = 0; // 兜底再混入个别已掌握词温故
  for (const x of resting) {
    if (out.length >= n || masteredUsed >= maxMastered) break;
    out.push(x.word);
    masteredUsed++;
  }
  return out.slice(0, n);
}

// 整个年级的掌握进度（进度条用，渐进式：答对一次就往前挪一点）
export function getProgress(pool: GameWord[]): {
  total: number;
  mastered: number;
  seen: number;
  percent: number;
} {
  const store = load();
  const total = pool.length;
  let mastered = 0,
    seen = 0,
    boxSum = 0;
  for (const w of pool) {
    const s = store.words[w.id];
    if (!s) continue;
    seen++;
    boxSum += Math.min(s.box, MASTERED_BOX); // 每词最多按 MASTERED_BOX 计，封顶
    if (s.box >= MASTERED_BOX) mastered++;
  }
  // 渐进式：答对一次(box1)贡献一半，答对两次(box2)满格 → 与"已掌握"口径一致
  const percent = total ? Math.round((boxSum / (total * MASTERED_BOX)) * 100) : 0;
  return { total, mastered, seen, percent };
}
