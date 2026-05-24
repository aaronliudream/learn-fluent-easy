/**
 * End-to-end: brand-new user must have zero primary hub progress after hydrate.
 * Run: node scripts/test_new_user_zero_progress.mjs
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
const email = `zero-progress-${ts}@test.bigmoon.local`;
const password = `Test-${ts}-Aa1!`;

async function main() {
  const { data: signUp, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const userId = signUp.user?.id;
  if (!userId) throw new Error("no user id");

  const { data: row, error: pullErr } = await supabase
    .from("primary_hub_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("grade", 4)
    .maybeSingle();
  if (pullErr) throw pullErr;

  if (row != null) {
    const units = row.state?.units ?? {};
    const keys = Object.keys(units);
    throw new Error(`New user should have no cloud row, got units: ${keys.join(", ")}`);
  }

  console.log("✅ Brand-new user has zero primary_hub_progress rows");
  console.log(`   ${email}`);
}

main().catch((e) => {
  console.error("❌", e.message ?? e);
  process.exit(1);
});
