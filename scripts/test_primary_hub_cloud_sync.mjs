/**
 * Smoke test: primary_hub_progress RLS + upsert/select for authenticated user.
 * Run: node scripts/test_primary_hub_cloud_sync.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      const k = l.slice(0, i).trim();
      const v = l.slice(i + 1).trim().replace(/^"|"$/g, "");
      return [k, v];
    }),
);

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);
const grade = 4;
const unitId = "g4v2_u2";
const testEmail = `php-sync-${Date.now()}@test.bigmoon.local`;
const testPassword = `Test-${Date.now()}-Aa1!`;

function sampleState(completed = [0], vocabViewed = [0, 1, 2, 3, 4]) {
  return {
    user: { name: "CloudTest", avatar: "🐻" },
    units: {
      [unitId]: {
        completedStages: completed,
        stars: completed.length * 5,
        stageProgress: { 0: Math.round((vocabViewed.length / 18) * 100) },
        vocabViewed,
        firstCompleteDate: null,
        reviewSchedule: [],
        reviewHistory: [],
      },
    },
    mistakes: [],
    lastAITest: null,
    aiTestCount: 0,
    aiTestHistory: [],
    currentUnit: unitId,
    currentSemester: "g4v2",
  };
}

async function main() {
  console.log("1. signUp test user…");
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  if (signUpErr) throw signUpErr;
  const userId = signUp.user?.id;
  if (!userId) throw new Error("No user id after signUp");

  console.log("2. upsert progress…");
  const stateA = sampleState([0, 1], [0, 1, 2, 3, 4]);
  const { error: upsertErr } = await supabase.from("primary_hub_progress").upsert(
    {
      user_id: userId,
      grade,
      state: stateA,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,grade" },
  );
  if (upsertErr) throw upsertErr;

  console.log("3. pull progress…");
  const { data: row, error: pullErr } = await supabase
    .from("primary_hub_progress")
    .select("state")
    .eq("user_id", userId)
    .eq("grade", grade)
    .maybeSingle();
  if (pullErr) throw pullErr;
  const remote = row?.state;
  const remoteUnit = remote?.units?.[unitId];
  if (!remoteUnit?.completedStages?.includes(1)) {
    throw new Error(`Expected stage 1 completed, got ${JSON.stringify(remoteUnit?.completedStages)}`);
  }
  if ((remoteUnit?.vocabViewed?.length ?? 0) !== 5) {
    throw new Error(`Expected 5 vocabViewed, got ${remoteUnit?.vocabViewed?.length}`);
  }

  console.log("4. merge simulation (guest local + remote)…");
  const localGuest = sampleState([2], [5, 6, 7]);
  localGuest.units[unitId].stars = 10;
  const mergedStages = [...new Set([...localGuest.units[unitId].completedStages, ...remoteUnit.completedStages])].sort(
    (a, b) => a - b,
  );
  const mergedStars = Math.max(localGuest.units[unitId].stars, remoteUnit.stars);
  const mergedVocab = [...new Set([...(localGuest.units[unitId].vocabViewed ?? []), ...(remoteUnit.vocabViewed ?? [])])];
  if (JSON.stringify(mergedStages) !== JSON.stringify([0, 1, 2])) {
    throw new Error(`Merge stages failed: ${JSON.stringify(mergedStages)}`);
  }
  if (mergedStars !== 10) throw new Error(`Merge stars failed: ${mergedStars}`);
  if (mergedVocab.length !== 8) throw new Error(`Merge vocab failed: ${mergedVocab.length}`);

  console.log("5. signOut + signIn (simulate re-login)…");
  await supabase.auth.signOut();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (signInErr) throw signInErr;
  const { data: row2, error: pull2Err } = await supabase
    .from("primary_hub_progress")
    .select("state")
    .eq("user_id", userId)
    .eq("grade", grade)
    .maybeSingle();
  if (pull2Err) throw pull2Err;
  if (!row2?.state?.units?.[unitId]?.completedStages?.includes(1)) {
    throw new Error("Progress lost after re-login");
  }

  console.log("\n✅ All cloud sync smoke checks passed.");
  console.log(`   test user: ${testEmail}`);
}

main().catch((e) => {
  console.error("\n❌", e.message ?? e);
  process.exit(1);
});
