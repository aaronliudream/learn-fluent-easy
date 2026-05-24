/**
 * Scenario A/B/C API checks for guest merge prompt.
 * Run: node scripts/test_guest_merge_scenarios.mjs
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
const pass = `Test-${ts}-Aa1!`;

async function signUp(email) {
  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  // Scenario A: brand-new user, no cloud row, no decision
  const emailA = `scn-a-${ts}@test.bigmoon.local`;
  const userA = await signUp(emailA);
  const { data: rowA } = await supabase
    .from("primary_hub_progress")
    .select("user_id")
    .eq("user_id", userA)
    .maybeSingle();
  const { data: profA } = await supabase
    .from("profiles")
    .select("guest_merge_decision")
    .eq("user_id", userA)
    .single();
  if (rowA) throw new Error("Scenario A: new user should have no cloud row");
  console.log("✅ Scenario A: new user — no cloud row, decision =", profA?.guest_merge_decision ?? "null");

  await supabase.auth.signOut();

  // Scenario B/C setup: simulate reset vs merge decision persistence
  const emailB = `scn-b-${ts}@test.bigmoon.local`;
  const userB = await signUp(emailB);
  await supabase.from("profiles").update({ guest_merge_decision: "reset" }).eq("user_id", userB);
  const { data: profB } = await supabase
    .from("profiles")
    .select("guest_merge_decision")
    .eq("user_id", userB)
    .single();
  if (profB?.guest_merge_decision !== "reset") throw new Error("Scenario B: decision not persisted");
  console.log("✅ Scenario B/D: guest_merge_decision='reset' persisted on profile");

  await supabase.auth.signOut();
  const emailC = `scn-c-${ts}@test.bigmoon.local`;
  const userC = await signUp(emailC);
  await supabase.from("profiles").update({ guest_merge_decision: "merged" }).eq("user_id", userC);
  await supabase.from("primary_hub_progress").upsert({
    user_id: userC,
    grade: 4,
    state: { units: { g4v2_u2: { completedStages: [0], stars: 5, reviewSchedule: [], reviewHistory: [], firstCompleteDate: null } } },
    updated_at: new Date().toISOString(),
  });
  const { data: rowC } = await supabase
    .from("primary_hub_progress")
    .select("state")
    .eq("user_id", userC)
    .maybeSingle();
  if (!rowC?.state?.units?.g4v2_u2) throw new Error("Scenario C: cloud row missing after merge");
  console.log("✅ Scenario C: merged user cloud row exists with stage 0 complete");
}

main().catch((e) => {
  console.error("❌", e.message ?? e);
  process.exit(1);
});
