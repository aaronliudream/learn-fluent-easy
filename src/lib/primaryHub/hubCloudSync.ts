import { supabase } from "@/integrations/supabase/client";
import type { PrimaryHubGrade, PrimaryHubPersist } from "./types";
import { mergePrimaryHubPersist, persistPayload } from "./hubCloudMerge";
import { defaultPersist, loadPersist, savePersist } from "./storage";
import { migratePersistUnits } from "./stageProgressMigrate";

const SYNC_DEBOUNCE_MS = 1500;

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUserId: string | null = null;
let pendingGrade: PrimaryHubGrade | null = null;
let pendingState: PrimaryHubPersist | null = null;
let inflightPush: Promise<void> | null = null;

function parseCloudState(raw: unknown, grade: PrimaryHubGrade): PrimaryHubPersist | null {
  if (!raw || typeof raw !== "object") return null;
  try {
    const base = defaultPersist(grade);
    const data = raw as Partial<PrimaryHubPersist>;
    const merged: PrimaryHubPersist = {
      ...base,
      ...data,
      user: { ...base.user, ...data.user },
      units: data.units ?? base.units,
      mistakes: data.mistakes ?? base.mistakes,
      aiTestHistory: data.aiTestHistory ?? base.aiTestHistory,
    };
    return migratePersistUnits(merged);
  } catch {
    return null;
  }
}

export async function pullPrimaryHubProgress(
  userId: string,
  grade: PrimaryHubGrade,
): Promise<PrimaryHubPersist | null> {
  const { data, error } = await supabase
    .from("primary_hub_progress")
    .select("state")
    .eq("user_id", userId)
    .eq("grade", grade)
    .maybeSingle();

  if (error) {
    console.warn("[primaryHub cloud] pull failed", error.message);
    return null;
  }
  if (!data?.state) return null;
  return parseCloudState(data.state, grade);
}

async function pushNow(userId: string, grade: PrimaryHubGrade, state: PrimaryHubPersist): Promise<void> {
  const payload = persistPayload(state);
  const { error } = await supabase.from("primary_hub_progress").upsert(
    {
      user_id: userId,
      grade,
      state: payload as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,grade" },
  );
  if (error) console.warn("[primaryHub cloud] push failed", error.message);
}

/** Save to localStorage; debounce cloud upsert when signed in. */
export function persistPrimaryHubState(
  grade: PrimaryHubGrade,
  state: PrimaryHubPersist,
  userId: string | null,
): void {
  savePersist(grade, state);
  if (userId) schedulePrimaryHubCloudPush(userId, grade, state);
}

export function schedulePrimaryHubCloudPush(
  userId: string,
  grade: PrimaryHubGrade,
  state: PrimaryHubPersist,
): void {
  pendingUserId = userId;
  pendingGrade = grade;
  pendingState = state;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushPrimaryHubCloudPush();
  }, SYNC_DEBOUNCE_MS);
}

export async function flushPrimaryHubCloudPush(): Promise<void> {
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

/**
 * Pull cloud progress, merge with localStorage, persist locally, push merged state.
 */
export async function hydratePrimaryHubFromCloud(
  userId: string,
  grade: PrimaryHubGrade,
): Promise<PrimaryHubPersist> {
  const local = loadPersist(grade);
  const remote = await pullPrimaryHubProgress(userId, grade);

  if (!remote) {
    savePersist(grade, local);
    if (Object.keys(local.units).length > 0 || local.mistakes.length > 0) {
      await pushNow(userId, grade, local);
    }
    return local;
  }

  const merged = mergePrimaryHubPersist(local, remote);
  savePersist(grade, merged);
  await pushNow(userId, grade, merged);
  return merged;
}

export function cancelPrimaryHubCloudPush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  pendingUserId = null;
  pendingGrade = null;
  pendingState = null;
}
