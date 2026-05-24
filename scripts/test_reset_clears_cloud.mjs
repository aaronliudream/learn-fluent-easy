/**
 * Scenario B': reset deletes all primary_hub_progress rows for the user.
 * Run: node scripts/test_reset_clears_cloud.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dirname, "..", ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const ts = Date.now();
const email = `reset-cloud-${ts}@test.bigmoon.local`;
const password = `Test-${ts}-Aa1!`;

const dirtyState = {
  units: {
    g4v2_u2: {
      completedStages: [0, 1],
      stars: 10,
      vocabViewed: [0, 1, 2, 3, 4],
      stageProgress: { 0: 28 },
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    },
  },
  mistakes: [],
};

async function countRows(userId) {
  const { data, error } = await supabase
    .from("primary_hub_progress")
    .select("grade")
    .eq("user_id", userId);
  if (error) throw error;
  return data?.length ?? 0;
}

async function main() {
  console.log("1. signUp + seed polluted cloud row…");
  const { data: signUp, error: suErr } = await supabase.auth.signUp({ email, password });
  if (suErr) throw suErr;
  const userId = signUp.user?.id;
  if (!userId) throw new Error("no user id");

  const { error: upErr } = await supabase.from("primary_hub_progress").upsert({
    user_id: userId,
    grade: 4,
    state: dirtyState,
    updated_at: new Date().toISOString(),
  });
  if (upErr) throw upErr;

  const before = await countRows(userId);
  if (before !== 1) throw new Error(`expected 1 cloud row before reset, got ${before}`);
  console.log(`   cloud rows before reset: ${before}`);

  console.log("2. simulate reset — DELETE cloud (then profile mark)…");
  const { error: delErr } = await supabase
    .from("primary_hub_progress")
    .delete()
    .eq("user_id", userId);
  if (delErr) throw delErr;

  const afterDelete = await countRows(userId);
  if (afterDelete !== 0) throw new Error(`expected 0 rows after delete, got ${afterDelete}`);
  console.log(`   cloud rows after delete: ${afterDelete}`);

  await supabase.from("profiles").upsert(
    { user_id: userId, guest_merge_decision: "reset" },
    { onConflict: "user_id" },
  );

  console.log("3. signOut + signIn — cloud still empty…");
  await supabase.auth.signOut();
  const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
  if (siErr) throw siErr;

  const afterRelogin = await countRows(userId);
  if (afterRelogin !== 0) throw new Error(`expected 0 rows after re-login, got ${afterRelogin}`);

  const { data: prof } = await supabase
    .from("profiles")
    .select("guest_merge_decision")
    .eq("user_id", userId)
    .single();
  if (prof?.guest_merge_decision !== "reset") {
    throw new Error(`expected guest_merge_decision=reset, got ${prof?.guest_merge_decision}`);
  }

  console.log("\n✅ Scenario B' API: cloud rows deleted, decision=reset, re-login still 0 rows");
  console.log(`   user_id=${userId}`);
}

main().catch((e) => {
  console.error("\n❌", e.message ?? e);
  process.exit(1);
});
