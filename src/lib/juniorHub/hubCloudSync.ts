import { supabase } from "@/integrations/supabase/client";
import type { JuniorHubGrade, JuniorHubPersist } from "./types";
import {
  hasUnitActivity,
  mergeJuniorHubPersist,
  persistPayload,
  stripEmptyUnits,
} from "./hubCloudMerge";
import { defaultPersist, loadPersist, savePersistLocalOnly } from "./storage";

const SYNC_DEBOUNCE_MS = 1500;

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUserId: string | null = null;
let pendingGrade: JuniorHubGrade | null = null;
let pendingState: JuniorHubPersist | null = null;
let inflightPush: Promise<void> | null = null;

function parseCloudState(raw: unknown): JuniorHubPersist | null {
  if (!raw || typeof raw !== "object") return null;
  try {
    const base = defaultPersist();
    const data = raw as Partial<JuniorHubPersist>;
    return {
      ...base,
      ...data,
      user: { ...base.user, ...(data.user ?? {}) },
      units: data.units ?? base.units,
      mistakes: data.mistakes ?? base.mistakes,
      aiTestHistory: data.aiTestHistory ?? base.aiTestHistory,
    };
  } catch {
    return null;
  }
}

export async function pullJuniorHubProgress(
  userId: string,
  grade: JuniorHubGrade,
): Promise<JuniorHubPersist | null> {
  const { data, error } = await supabase
    .from("junior_hub_progress")
    .select("state")
    .eq("user_id", userId)
    .eq("grade", grade)
    .maybeSingle();

  if (error) {
    console.warn("[juniorHub cloud] pull failed", error.message);
    return null;
  }
  if (!data?.state) return null;
  return parseCloudState(data.state);
}

async function pushNow(
  userId: string,
  grade: JuniorHubGrade,
  state: JuniorHubPersist,
): Promise<void> {
  const payload = persistPayload(stripEmptyUnits(state));
  const { error } = await supabase.from("junior_hub_progress").upsert(
    {
      user_id: userId,
      grade,
      state: payload as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,grade" },
  );
  if (error) console.warn("[juniorHub cloud] push failed", error.message);
}

export function scheduleJuniorHubCloudPush(
  userId: string,
  grade: JuniorHubGrade,
  state: JuniorHubPersist,
): void {
  pendingUserId = userId;
  pendingGrade = grade;
  pendingState = state;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushJuniorHubCloudPush();
  }, SYNC_DEBOUNCE_MS);
}

export async function flushJuniorHubCloudPush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const userId = pendingUserId;
  const grade = pendingGrade;
  const state = pendingState;
  if (!userId || grade === null || !state) return;

  pendingUserId = null;
  pendingGrade = null;
  pendingState = null;

  if (inflightPush) await inflightPush;
  inflightPush = pushNow(userId, grade, state);
  try {
    await inflightPush;
  } finally {
    inflightPush = null;
  }
}

export function cancelJuniorHubCloudPush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  pendingUserId = null;
  pendingGrade = null;
  pendingState = null;
}

/**
 * Pull cloud progress, merge with localStorage (union/max), persist locally,
 * push the merged state back. Auto-merge: no guest prompt. Empty cloud → keep
 * local and upload it (never wipes local progress).
 */
export async function hydrateJuniorHubFromCloud(
  userId: string,
  grade: JuniorHubGrade,
): Promise<JuniorHubPersist> {
  const local = stripEmptyUnits(loadPersist(grade));
  const remote = await pullJuniorHubProgress(userId, grade);

  if (!remote) {
    savePersistLocalOnly(grade, local);
    if (hasUnitActivity(local.units) || local.mistakes.length > 0) {
      await pushNow(userId, grade, local);
    }
    return local;
  }

  const merged = stripEmptyUnits(mergeJuniorHubPersist(local, remote));
  savePersistLocalOnly(grade, merged);
  await pushNow(userId, grade, merged);
  return merged;
}
