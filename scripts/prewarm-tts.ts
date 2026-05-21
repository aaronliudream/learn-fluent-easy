/**
 * TTS pre-warm script — pushes high-frequency phrases into Supabase Storage
 * via the `tts` edge function (same cache keys as production speak()).
 *
 * Usage:
 *   bun run scripts/prewarm-tts.ts                         # all datasets
 *   bun run scripts/prewarm-tts.ts --only=primary-vocab
 *   bun run scripts/prewarm-tts.ts --only=junior-vocab,gaokao-vocab
 *   bun run scripts/prewarm-tts.ts --skip=storybooks,suzhou-exam
 *   bun run scripts/prewarm-tts.ts --dry-run               # count only, no API
 *
 * Legacy positional args still work: `bun run scripts/prewarm-tts.ts slang course`
 *
 * Env: VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_* aliases)
 */

import { createClient } from "@supabase/supabase-js";
import {
  DATASET_BUILDERS,
  dedupeJobs,
  estimateChars,
  splitJobsByProvider,
  type DatasetBuilder,
  type JobSpec,
} from "./prewarm-collectors";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error(
    "Missing env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before running.",
  );
  process.exit(1);
}

const TTS_URL = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/tts`;
const CONCURRENCY = 8;

type WarmResult = "hit" | "miss" | "fail";

function parseArgs(argv: string[]) {
  let only: string[] | null = null;
  let skip: string[] = [];
  let dryRun = false;
  const positional: string[] = [];

  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--only=")) {
      only = arg
        .slice("--only=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--skip=")) {
      skip = arg
        .slice("--skip=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("-")) {
      console.warn(`Unknown flag: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.includes("all")) {
    only = null;
  } else if (positional.length > 0 && !only) {
    only = positional;
  }

  return { only, skip, dryRun };
}

function selectBuilders(only: string[] | null, skip: string[]): DatasetBuilder[] {
  const skipSet = new Set(skip);
  let list = DATASET_BUILDERS.filter((d) => !skipSet.has(d.id));

  if (only && only.length > 0) {
    const onlySet = new Set(only);
    list = list.filter((d) => onlySet.has(d.id));
    const missing = only.filter((id) => !DATASET_BUILDERS.some((d) => d.id === id));
    if (missing.length) {
      console.warn(`Unknown dataset id(s): ${missing.join(", ")}`);
    }
  }

  return list;
}

function etaMinutes(jobCount: number, secondsPerJob = 1.8): string {
  const sec = (jobCount / CONCURRENCY) * secondsPerJob;
  if (sec < 60) return `~${Math.ceil(sec)}s`;
  return `~${Math.ceil(sec / 60)}min`;
}

async function warmOne(job: JobSpec, dataset: string): Promise<WarmResult> {
  try {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY!,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        text: job.text,
        voiceId: job.voiceId,
        speed: job.speed,
        accent: job.accent,
        format: "url",
      }),
    });

    if (!res.ok) {
      const body = (await res.text()).slice(0, 200);
      console.error(
        `[prewarm] ✗ ${dataset} ${res.status} "${job.text.slice(0, 60)}…" — ${body}`,
      );
      return "fail";
    }

    const cacheHeader = res.headers.get("x-cache");
    if (cacheHeader === "MISS") return "miss";

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = (await res.json()) as { cached?: boolean };
      return j.cached ? "hit" : "miss";
    }
    return "miss";
  } catch (err) {
    console.error(
      `[prewarm] ✗ ${dataset} error "${job.text.slice(0, 60)}…" —`,
      err instanceof Error ? err.message : err,
    );
    return "fail";
  }
}

async function runPool(jobs: JobSpec[], dataset: string) {
  let i = 0;
  let hit = 0;
  let miss = 0;
  let fail = 0;
  const start = Date.now();

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= jobs.length) return;
      const r = await warmOne(jobs[idx], dataset);
      if (r === "hit") hit++;
      else if (r === "miss") miss++;
      else fail++;

      if ((idx + 1) % 50 === 0 || idx + 1 === jobs.length) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(
          `  [${dataset}] ${idx + 1}/${jobs.length} hit=${hit} new=${miss} fail=${fail} (${elapsed}s)`,
        );
      }
    }
  });

  await Promise.all(workers);
  return { hit, miss, fail };
}

async function buildAllJobs(
  builders: DatasetBuilder[],
): Promise<Array<{ builder: DatasetBuilder; jobs: JobSpec[] }>> {
  const supabase = createClient(SUPABASE_URL!, ANON_KEY!);
  const out: Array<{ builder: DatasetBuilder; jobs: JobSpec[] }> = [];

  for (const builder of builders) {
    const raw = await builder.build(supabase);
    out.push({ builder, jobs: dedupeJobs(raw) });
  }
  return out;
}

function printDryRunSummary(
  datasets: Array<{ builder: DatasetBuilder; jobs: JobSpec[] }>,
) {
  console.log("\n=== DRY RUN — job counts & cost estimate ===\n");

  let totalJobs = 0;
  let totalChars = 0;
  const allJobs: JobSpec[] = [];

  for (const { builder, jobs } of datasets) {
    totalJobs += jobs.length;
    totalChars += estimateChars(jobs);
    allJobs.push(...jobs);
    console.log(
      `[prewarm] ${builder.label}: ${jobs.length} audio jobs, ${estimateChars(jobs).toLocaleString()} chars, ETA ${etaMinutes(jobs.length)} (cold)`,
    );
  }

  const { openai, elevenlabs } = splitJobsByProvider(allJobs);
  const openaiChars = estimateChars(openai);
  const elChars = estimateChars(elevenlabs);

  console.log("\n--- Totals ---");
  console.log(`Jobs: ${totalJobs.toLocaleString()}`);
  console.log(`Characters: ${totalChars.toLocaleString()}`);
  console.log(`OpenAI jobs: ${openai.length.toLocaleString()} (${openaiChars.toLocaleString()} chars)`);
  console.log(`ElevenLabs jobs: ${elevenlabs.length.toLocaleString()} (${elChars.toLocaleString()} chars)`);
  console.log(
    `Est. OpenAI @ $0.015/1K chars: $${((openaiChars / 1000) * 0.015).toFixed(2)} (if all cold)`,
  );
  console.log(
    `Est. ElevenLabs @ ~$0.30/1K chars*: $${((elChars / 1000) * 0.3).toFixed(2)} (if all cold)`,
  );
  console.log(
    "* ElevenLabs pricing varies by plan; adjust multiplier before running.",
  );
  console.log("\nNo API calls made (--dry-run).\n");
}

async function main() {
  const { only, skip, dryRun } = parseArgs(process.argv.slice(2));
  const builders = selectBuilders(only, skip);

  if (builders.length === 0) {
    console.error("No datasets selected. Available ids:");
    console.error(DATASET_BUILDERS.map((d) => d.id).join(", "));
    process.exit(1);
  }

  console.log(`[prewarm] datasets: ${builders.map((b) => b.id).join(", ")}`);
  if (dryRun) console.log("[prewarm] mode: DRY RUN (no API calls)");

  const datasets = await buildAllJobs(builders);

  if (dryRun) {
    printDryRunSummary(datasets);
    return;
  }

  let grandHit = 0;
  let grandMiss = 0;
  let grandFail = 0;

  for (const { builder, jobs } of datasets) {
    if (jobs.length === 0) {
      console.log(`\n[prewarm] ${builder.label}: (empty, skipped)`);
      continue;
    }

    console.log(
      `\n[prewarm] ${builder.label}: ${jobs.length} items, cold start assumed, ETA ${etaMinutes(jobs.length)}`,
    );

    const r = await runPool(jobs, builder.label);
    grandHit += r.hit;
    grandMiss += r.miss;
    grandFail += r.fail;

    console.log(
      `[prewarm] ${builder.label}: ✓ done, ${r.miss} new, ${r.hit} cached, ${r.fail} errors`,
    );
  }

  console.log(
    `\n✅ Pre-warm complete — new=${grandMiss} cached=${grandHit} errors=${grandFail}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
