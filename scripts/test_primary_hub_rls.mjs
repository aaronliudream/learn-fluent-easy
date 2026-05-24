/**
 * Verify primary_hub_progress RLS: user A cannot read user B's row.
 * Run: node scripts/test_primary_hub_rls.mjs
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

async function pullAll() {
  const { data, error } = await supabase.from("primary_hub_progress").select("user_id, grade, state");
  if (error) throw error;
  return data ?? [];
}

async function main() {
  const emailA = `rls-a-${ts}@test.bigmoon.local`;
  const emailB = `rls-b-${ts}@test.bigmoon.local`;

  const userA = await signUp(emailA);
  await supabase.from("primary_hub_progress").upsert({
    user_id: userA,
    grade: 4,
    state: { units: { g4v2_u2: { completedStages: [0], stars: 5, reviewSchedule: [], reviewHistory: [], firstCompleteDate: null } } },
    updated_at: new Date().toISOString(),
  });

  const rowsA = await pullAll();
  if (rowsA.length !== 1 || rowsA[0].user_id !== userA) {
    throw new Error(`User A should see only own row, got: ${JSON.stringify(rowsA)}`);
  }

  await supabase.auth.signOut();
  const userB = await signUp(emailB);
  const rowsB = await pullAll();
  const leaked = rowsB.filter((r) => r.user_id === userA);
  if (leaked.length > 0) {
    throw new Error(`RLS LEAK: User B saw User A data: ${JSON.stringify(leaked)}`);
  }
  if (rowsB.some((r) => r.user_id !== userB)) {
    throw new Error(`User B saw unexpected rows: ${JSON.stringify(rowsB)}`);
  }

  console.log("✅ RLS OK — users only see own primary_hub_progress rows");
  console.log(`   userA=${userA}, userB=${userB}`);
}

main().catch((e) => {
  console.error("❌", e.message ?? e);
  process.exit(1);
});
