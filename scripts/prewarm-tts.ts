/**
 * TTS pre-warm script.
 *
 * Iterates through all high-frequency English sentences across the project
 * and calls the `tts` edge function once for each, forcing a cold synthesis
 * and pushing the resulting MP3 into Supabase Storage. After this runs,
 * every new user gets an instant CDN hit (≈50–200 ms) instead of paying the
 * 1–3 s cold-path latency.
 *
 * Usage:
 *   bun run scripts/prewarm-tts.ts                # all datasets, voice=alloy
 *   bun run scripts/prewarm-tts.ts slang          # only one dataset
 *   bun run scripts/prewarm-tts.ts slang lesson   # multiple datasets
 *
 * Datasets: slang | lesson | placement | course | ielts | all (default)
 * Voices warmed: alloy (US default), fable (UK).
 */

import { LESSON_OUTPUT_SAMPLES } from "../src/data/lessonSamples";
import { IDIOMS } from "../src/data/idioms";
import { PLACEMENT_BANK } from "../src/data/placementBank";
import { LEVELS, LESSON_CONTENT } from "../src/data/course";

const TTS_URL = "https://fottntyhwolbsdvkwriq.supabase.co/functions/v1/tts";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdHRudHlod29sYnNkdmt3cmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzg2NzUsImV4cCI6MjA5MjkxNDY3NX0.s7YXfJzG_DRIGWwrYmX4gehxwmPEXbWLOqrLEzAueM4";

// Tunables.
const CONCURRENCY = 6;       // parallel TTS requests
const SPEED = 0.95;          // matches client default in src/lib/voice.ts
const VOICES: Array<{ voiceId: string; accent: string }> = [
  { voiceId: "alloy", accent: "US" },
  // Uncomment to also pre-warm UK accent (doubles cost):
  // { voiceId: "fable", accent: "UK" },
];

type Job = { text: string; voiceId: string; accent: string; tag: string };

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

// Skip strings that are mostly Chinese / non-Latin — TTS for those would
// just be wasted bytes since the app only plays English audio.
function isEnglish(s: string): boolean {
  if (!s || s.length < 2) return false;
  const ascii = s.replace(/[^A-Za-z]/g, "").length;
  return ascii >= Math.max(3, s.length * 0.4);
}

// Split a long passage into sentence-ish chunks the way the client's
// SegmentedReader splits them, so the cache keys match real playback.
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 400);
}

function collectSlang(): string[] {
  return uniq(IDIOMS.flatMap((i) => [i.example, i.phrase])).filter(isEnglish);
}

function collectLessonSamples(): string[] {
  // Each "Output sample" is a short paragraph — pre-warm both the whole
  // paragraph and each sentence (clients play either depending on the view).
  const out: string[] = [];
  for (const sample of Object.values(LESSON_OUTPUT_SAMPLES)) {
    out.push(sample);
    out.push(...splitSentences(sample));
  }
  return uniq(out).filter(isEnglish);
}

function collectPlacement(): string[] {
  const out: string[] = [];
  for (const q of PLACEMENT_BANK) {
    if (q.context) out.push(...splitSentences(q.context));
    if (q.prompt) out.push(q.prompt);
  }
  return uniq(out).filter(isEnglish);
}

function collectCourse(): string[] {
  const out: string[] = [];
  // Walk every lesson's reading + expressions + vocab examples.
  for (const level of LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        const c = LESSON_CONTENT[lesson.title];
        if (!c) continue;
        for (const r of c.reading || []) if (r.en) out.push(r.en);
        for (const e of c.expressions || []) if (e.en) out.push(e.en);
        for (const v of c.vocab || []) if (v.example) out.push(v.example);
      }
    }
  }
  return uniq(out).filter(isEnglish);
}

// IELTS examiner Part 1 / 2 / 3 prompts are loaded dynamically by the
// session page from an edge function, so we skip them here. If you want to
// pre-warm specific IELTS sentences, drop them into this array.
function collectIelts(): string[] {
  return [];
}

async function warmOne(job: Job): Promise<"hit" | "miss" | "fail"> {
  try {
    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        text: job.text,
        voiceId: job.voiceId,
        accent: job.accent,
        speed: SPEED,
        format: "url",
      }),
    });
    if (!res.ok) {
      console.warn(`  ✗ ${job.tag} ${res.status}: ${(await res.text()).slice(0, 120)}`);
      return "fail";
    }
    const cacheHeader = res.headers.get("x-cache");
    if (cacheHeader === "MISS") return "miss";
    // Cached responses come back as JSON with cached:true.
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j.cached ? "hit" : "miss";
    }
    return "miss";
  } catch (err) {
    console.warn(`  ✗ ${job.tag} error:`, err instanceof Error ? err.message : err);
    return "fail";
  }
}

async function runPool(jobs: Job[]) {
  let i = 0;
  let hit = 0, miss = 0, fail = 0;
  const start = Date.now();
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= jobs.length) return;
      const r = await warmOne(jobs[idx]);
      if (r === "hit") hit++;
      else if (r === "miss") miss++;
      else fail++;
      if ((idx + 1) % 25 === 0 || idx + 1 === jobs.length) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(
          `  [${idx + 1}/${jobs.length}] hit=${hit} miss=${miss} fail=${fail} (${elapsed}s)`,
        );
      }
    }
  });
  await Promise.all(workers);
  return { hit, miss, fail };
}

async function main() {
  const args = process.argv.slice(2);
  const want = args.length === 0 ? ["all"] : args;
  const all = want.includes("all");

  const sets: Array<{ name: string; texts: string[] }> = [];
  if (all || want.includes("slang"))     sets.push({ name: "slang",     texts: collectSlang() });
  if (all || want.includes("lesson"))    sets.push({ name: "lesson",    texts: collectLessonSamples() });
  if (all || want.includes("placement")) sets.push({ name: "placement", texts: collectPlacement() });
  if (all || want.includes("course"))    sets.push({ name: "course",    texts: collectCourse() });
  if (all || want.includes("ielts"))     sets.push({ name: "ielts",     texts: collectIelts() });

  for (const s of sets) {
    if (s.texts.length === 0) {
      console.log(`\n→ ${s.name}: (empty, skipped)`);
      continue;
    }
    const jobs: Job[] = [];
    for (const v of VOICES) {
      for (const text of s.texts) {
        jobs.push({ text, voiceId: v.voiceId, accent: v.accent, tag: `${s.name}/${v.accent}` });
      }
    }
    console.log(`\n→ ${s.name}: ${s.texts.length} unique sentences × ${VOICES.length} voice(s) = ${jobs.length} requests`);
    const r = await runPool(jobs);
    console.log(`  ✓ done — hit=${r.hit} miss(new)=${r.miss} fail=${r.fail}`);
  }

  console.log("\n✅ Pre-warm complete. New users now hit CDN on first play.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});