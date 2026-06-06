import type { JuniorGrammarErrorReason, JuniorGrammarMastery } from "@/lib/juniorGrammarFsrs";
import { hasLabContent, type JuniorPointNav } from "@/lib/juniorGrammarNav";

export type LabMistake = {
  phase: string;
  stem: string;
  picked: string;
  correct: string;
  why?: string;
};

export type RevengeQueueEntry = {
  pointId: string;
  pointTitle: string;
  mistake: LabMistake;
  at: string;
};

const LAB_KEY_PREFIX = "junior-lab:v2:";
const QUEUE_KEY = "junior-grammar:revenge-queue";
const MAX_QUEUE = 60;

export function labStorageKey(pointId: string) {
  return `${LAB_KEY_PREFIX}${pointId}`;
}

export function loadLabMistakesForPoint(pointId: string): LabMistake[] {
  try {
    const raw = localStorage.getItem(labStorageKey(pointId));
    if (!raw) return [];
    const state = JSON.parse(raw) as { mistakes?: LabMistake[] };
    return state.mistakes ?? [];
  } catch {
    return [];
  }
}

export function clearLabMistakesForPoint(pointId: string) {
  try {
    const raw = localStorage.getItem(labStorageKey(pointId));
    if (!raw) return;
    const state = JSON.parse(raw);
    state.mistakes = [];
    localStorage.setItem(labStorageKey(pointId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function loadQueue(): RevengeQueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as RevengeQueueEntry[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(entries: RevengeQueueEntry[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(entries.slice(0, MAX_QUEUE)));
  } catch {
    /* ignore */
  }
}

/** Append a mistake to the cross-point revenge queue (deduped). */
export function enqueueLabMistake(pointId: string, pointTitle: string, mistake: LabMistake) {
  const key = `${pointId}|${mistake.phase}|${mistake.stem}|${mistake.correct}`;
  const queue = loadQueue().filter((e) => `${e.pointId}|${e.mistake.phase}|${e.mistake.stem}|${e.mistake.correct}` !== key);
  queue.unshift({
    pointId,
    pointTitle,
    mistake,
    at: new Date().toISOString(),
  });
  saveQueue(queue);
}

export function countPendingRevengeMistakes(): number {
  const fromQueue = loadQueue().length;
  let fromLabs = 0;
  const seen = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(LAB_KEY_PREFIX)) continue;
    for (const m of loadLabMistakesForPoint(key.slice(LAB_KEY_PREFIX.length))) {
      const k = `${key}|${m.stem}|${m.correct}`;
      if (!seen.has(k)) {
        seen.add(k);
        fromLabs++;
      }
    }
  }
  return Math.max(fromQueue, seen.size);
}

/** Flatten queue + per-point lab storage into one revenge session list. */
export function collectRevengeMistakes(opts?: {
  pointId?: string;
  reason?: JuniorGrammarErrorReason;
  pointTitles?: Record<string, string>;
  dominantByPoint?: Record<string, JuniorGrammarErrorReason | null>;
}): Array<LabMistake & { pointId: string; pointTitle: string }> {
  const seen = new Set<string>();
  const out: Array<LabMistake & { pointId: string; pointTitle: string }> = [];

  const push = (pointId: string, pointTitle: string, m: LabMistake) => {
    if (opts?.pointId && pointId !== opts.pointId) return;
    if (opts?.reason && opts.dominantByPoint?.[pointId] !== opts.reason) return;
    const key = `${pointId}|${m.phase}|${m.stem}|${m.correct}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...m, pointId, pointTitle });
  };

  for (const e of loadQueue()) {
    push(e.pointId, e.pointTitle, e.mistake);
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(LAB_KEY_PREFIX)) continue;
    const pointId = key.slice(LAB_KEY_PREFIX.length);
    const title = opts?.pointTitles?.[pointId] ?? pointId;
    for (const m of loadLabMistakesForPoint(pointId)) {
      push(pointId, title, m);
    }
  }

  return out;
}

export function clearRevengeForPoint(pointId: string) {
  clearLabMistakesForPoint(pointId);
  saveQueue(loadQueue().filter((e) => e.pointId !== pointId));
}

export function dominantErrorReason(
  errors?: Record<string, number> | null,
): JuniorGrammarErrorReason | null {
  if (!errors) return null;
  let best: JuniorGrammarErrorReason | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(errors)) {
    if ((v as number) > max) {
      max = v as number;
      best = k as JuniorGrammarErrorReason;
    }
  }
  return max > 0 ? best : null;
}

export type WeakPointRow = {
  point: JuniorPointNav;
  score: number;
  mistakeCount: number;
  wrongCount: number;
  isDue: boolean;
  dominantError: JuniorGrammarErrorReason | null;
};

export function rankWeakPoints(
  pts: JuniorPointNav[],
  mastery: Record<string, JuniorGrammarMastery>,
): WeakPointRow[] {
  const now = Date.now();
  return pts
    .map((point) => {
      const ms = mastery[point.id];
      const mistakeCount = ms?.mastery_matrix?.wrongQ?.length ?? 0;
      const wrongCount = ms?.wrong_count ?? 0;
      const isDue = !!(ms?.due_at && new Date(ms.due_at).getTime() <= now);
      const lvl = ms?.mastery_level ?? 0;
      const dominantError = dominantErrorReason(ms?.mastery_matrix?.errors);
      const score =
        mistakeCount * 12 +
        wrongCount * 2 +
        (isDue ? 8 : 0) +
        Math.max(0, 3 - lvl) * 3;
      return { point, score, mistakeCount, wrongCount, isDue, dominantError };
    })
    .filter((r) => r.score > 0 && (r.mistakeCount > 0 || r.wrongCount > 0 || r.isDue))
    .sort((a, b) => b.score - a.score);
}

export function pickBestRevengePoint(
  pts: JuniorPointNav[],
  mastery: Record<string, JuniorGrammarMastery>,
): WeakPointRow | null {
  const ranked = rankWeakPoints(pts, mastery).filter((r) => hasLabContent(r.point));
  if (!ranked.length) return null;
  const withMistakes = ranked.find((r) => r.mistakeCount > 0);
  return withMistakes ?? ranked[0];
}
