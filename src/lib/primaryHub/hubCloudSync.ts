import { supabase } from "@/integrations/supabase/client";
import type { PrimaryHubGrade, PrimaryHubPersist } from "./types";
import {
  hasUnitActivity,
  mergePrimaryHubPersist,
  persistPayload,
  stripEmptyUnits,
} from "./hubCloudMerge";
import { defaultPersist, loadPersist, savePersist, savePersistLocalOnly, clearPersist, PRIMARY_HUB_GRADES } from "./storage";
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
  const payload = persistPayload(stripEmptyUnits(state));
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
 * Pull cloud progress only — does not read or upload localStorage.
 */
export async function hydratePrimaryHubCloudOnly(
  userId: string,
  grade: PrimaryHubGrade,
  options?: { saveLocal?: boolean },
): Promise<PrimaryHubPersist> {
  const remote = await pullPrimaryHubProgress(userId, grade);
  const result = remote ?? defaultPersist(grade);
  if (options?.saveLocal !== false) savePersist(grade, result);
  return result;
}

export type GuestMergeChoice = "merged" | "reset";

export async function deletePrimaryHubCloudProgress(userId: string): Promise<void> {
  const { error } = await supabase
    .from("primary_hub_progress")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(`[primaryHub cloud] delete failed: ${error.message}`);
}

/** Apply user choice after guest-merge prompt (all grades with local activity). */
export async function applyGuestMergeChoice(
  userId: string,
  choice: GuestMergeChoice,
  localByGrade: Partial<Record<PrimaryHubGrade, PrimaryHubPersist>>,
  currentGrade: PrimaryHubGrade,
): Promise<PrimaryHubPersist> {
  if (choice === "reset") {
    cancelPrimaryHubCloudPush();
    await deletePrimaryHubCloudProgress(userId);
    for (const g of PRIMARY_HUB_GRADES) clearPersist(g);
    const fresh = defaultPersist(currentGrade);
    savePersistLocalOnly(currentGrade, fresh);
    return fresh;
  }

  let currentResult = defaultPersist(currentGrade);
  for (const g of PRIMARY_HUB_GRADES) {
    const local = localByGrade[g];
    if (!local) continue;
    const remote = await pullPrimaryHubProgress(userId, g);
    const merged = stripEmptyUnits(
      mergePrimaryHubPersist(local, remote ?? defaultPersist(g)),
    );
    savePersist(g, merged);
    if (g === currentGrade) currentResult = merged;
    await pushNow(userId, g, merged);
  }

  if (!localByGrade[currentGrade]) {
    currentResult = await hydratePrimaryHubCloudOnly(userId, currentGrade);
  }
  return currentResult;
}

/** Provisional state while prompt is open: cloud only, no local merge/upload. */
export async function provisionalCloudStateForGrade(
  userId: string,
  grade: PrimaryHubGrade,
): Promise<PrimaryHubPersist> {
  const remote = await pullPrimaryHubProgress(userId, grade);
  return remote ?? defaultPersist(grade);
}

/**
 * Pull cloud progress, merge with localStorage, persist locally, push merged state.
 * Used when guest_merge_decision is already "merged".
 */
export async function hydratePrimaryHubFromCloud(
  userId: string,
  grade: PrimaryHubGrade,
): Promise<PrimaryHubPersist> {
  const local = stripEmptyUnits(loadPersist(grade));
  const remote = await pullPrimaryHubProgress(userId, grade);

  if (!remote) {
    savePersist(grade, local);
    if (hasUnitActivity(local.units) || local.mistakes.length > 0) {
      await pushNow(userId, grade, local);
    }
    return local;
  }

  const merged = stripEmptyUnits(mergePrimaryHubPersist(local, remote));
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
