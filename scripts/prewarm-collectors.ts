/**
 * Data collectors for scripts/prewarm-tts.ts
 * Each collector returns JobSpec[] ready for the TTS edge function.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { LESSON_OUTPUT_SAMPLES } from "../src/data/lessonSamples";
import { IDIOMS } from "../src/data/idioms";
import { PLACEMENT_BANK } from "../src/data/placementBank";
import { LEVELS, LESSON_CONTENT } from "../src/data/course";
import { SIGHT_WORD_ITEMS } from "../src/data/primarySightWords";
import { SIGHT_WORD_ITEMS_G2 } from "../src/data/primarySightWordsG2";
import {
  PHONICS_ITEMS,
  PHONICS_WORDS,
} from "../src/data/primaryPhonics";
import {
  PHONICS_ITEMS_G2,
} from "../src/data/primaryPhonicsG2";
import { PRIMARY_STORY_BOOKS } from "../src/data/primaryStoryBooks";
import { PRIMARY_STORY_BOOKS_G2 } from "../src/data/primaryStoryBooksG2";
import { PRIMARY_ROLE_PLAYS } from "../src/data/primaryRolePlays";
import { PRIMARY_ROLE_PLAYS_G2 } from "../src/data/primaryRolePlaysG2";
import { SCENE_DIALOGUES } from "../src/data/scenes";
import { WORK_DIALOGUES } from "../src/data/workplace";
import { SUZHOU_2022 } from "../src/data/exams/suzhou-2022";
import type { StoryBookPage } from "../src/data/primaryStoryBooks";
import type { DialogueLine } from "../src/data/primaryRolePlays";

// Mirrors src/lib/speak.ts KID_VOICE_ID + getKidSpeed() breakpoints.
export const KID_VOICE_ID = "el:lily";
export const KID_SPEEDS = [0.7, 0.85, 1.0] as const;

export type JobSpec = {
  text: string;
  voiceId: string;
  accent: string;
  speed: number;
};

export type DatasetSpec = {
  id: string;
  label: string;
  jobs: JobSpec[];
};

export function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

export function isEnglish(s: string): boolean {
  if (!s || s.length < 2) return false;
  const ascii = s.replace(/[^A-Za-z]/g, "").length;
  return ascii >= Math.max(3, s.length * 0.4);
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 4000);
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

function jobsForTexts(
  texts: string[],
  voices: Array<{ voiceId: string; accent: string; speed: number }>,
): JobSpec[] {
  const out: JobSpec[] = [];
  for (const text of uniq(texts).filter(isEnglish)) {
    for (const v of voices) {
      out.push({ text, ...v });
    }
  }
  return out;
}

function kidSpeedJobs(texts: string[]): JobSpec[] {
  return KID_SPEEDS.flatMap((speed) =>
    jobsForTexts(texts, [{ voiceId: KID_VOICE_ID, accent: "US", speed }]),
  );
}

function alloyJobs(texts: string[], speed = 1.0): JobSpec[] {
  return jobsForTexts(texts, [{ voiceId: "alloy", accent: "US", speed }]);
}

/** Roleplay line → ElevenLabs voice (mirrors PrimaryRolePlays.tsx voiceFor). */
function voiceForRoleplay(emoji?: string, speaker?: string): string {
  const s = (speaker || "").toLowerCase();
  if (/(mom|妈妈|奶奶|grandma|妈)/.test(s)) return "el:matilda";
  if (/(dad|爸爸|爷爷|grandpa|爸|teacher|ms\.|mr\.|smith)/.test(s)) return "el:brian";
  if (emoji === "👩" || emoji === "👵") return "el:matilda";
  if (emoji === "👨" || emoji === "👴") return "el:brian";
  if (emoji === "👧") return "el:jessica";
  return "el:liam";
}

/** Story page → voice (mirrors storyVoice.ts pickStoryVoice, grade-1 defaults). */
function storyVoiceFor(speaker?: StoryBookPage["speaker"]): { voiceId: string; speed: number } {
  const kidSpeed = 0.7;
  const adultSpeed = 0.85;
  switch (speaker) {
    case "mom":
      return { voiceId: "el:matilda", speed: adultSpeed };
    case "dad":
      return { voiceId: "el:brian", speed: adultSpeed };
    case "spark":
      return { voiceId: "el:liam", speed: adultSpeed };
    case "narrator":
      return { voiceId: "el:sarah", speed: adultSpeed };
    case "kid":
    default:
      return { voiceId: "el:jessica", speed: kidSpeed };
  }
}

async function fetchAllSupabaseRows<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  select: string,
): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

// ─── Legacy datasets (unchanged sources) ───────────────────────────────────

export function collectSlangJobs(): JobSpec[] {
  const texts = uniq(IDIOMS.flatMap((i) => [i.example, i.phrase])).filter(isEnglish);
  return alloyJobs(texts, 0.95);
}

export function collectLessonJobs(): JobSpec[] {
  const texts: string[] = [];
  for (const sample of Object.values(LESSON_OUTPUT_SAMPLES)) {
    texts.push(sample);
    texts.push(...splitSentences(sample));
  }
  return alloyJobs(uniq(texts).filter(isEnglish), 0.95);
}

export function collectPlacementJobs(): JobSpec[] {
  const texts: string[] = [];
  for (const q of PLACEMENT_BANK) {
    if (q.context) texts.push(...splitSentences(q.context));
    if (q.prompt) texts.push(q.prompt);
  }
  return alloyJobs(uniq(texts).filter(isEnglish), 0.95);
}

export function collectCourseJobs(): JobSpec[] {
  const texts: string[] = [];
  for (const level of LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        const c = LESSON_CONTENT[lesson.title];
        if (!c) continue;
        for (const r of c.reading || []) if (r.en) texts.push(r.en);
        for (const e of c.expressions || []) if (e.en) texts.push(e.en);
        for (const v of c.vocab || []) if (v.example) texts.push(v.example);
      }
    }
  }
  return alloyJobs(uniq(texts).filter(isEnglish), 0.95);
}

export function collectIeltsJobs(): JobSpec[] {
  return [];
}

// ─── New datasets ──────────────────────────────────────────────────────────

export async function collectPrimaryVocabJobs(supabase: SupabaseClient): Promise<JobSpec[]> {
  type Row = { word: string; example_en: string | null };
  const rows = await fetchAllSupabaseRows<Row>(
    supabase,
    "primary_vocab",
    "word,example_en",
  );

  const texts = uniq(
    rows.flatMap((r) => {
      const w = r.word.split("/")[0];
      return [w, r.example_en ?? ""];
    }),
  ).filter(isEnglish);

  const alloy = alloyJobs(texts, 1.0);
  const lily = kidSpeedJobs(texts);
  return [...alloy, ...lily];
}

export function collectPrimarySightWordsJobs(): JobSpec[] {
  const items = [...SIGHT_WORD_ITEMS, ...SIGHT_WORD_ITEMS_G2];
  const texts = uniq(
    items.flatMap((i) => [i.word, i.exampleSentence]),
  ).filter(isEnglish);
  // SightWordsLearn uses speakKid → el:lily + grade speed; also warm alloy for browse.
  return [...alloyJobs(texts, 1.0), ...kidSpeedJobs(texts)];
}

export function collectPrimaryPhonicsJobs(): JobSpec[] {
  const texts: string[] = [];

  for (const item of [...PHONICS_ITEMS, ...PHONICS_ITEMS_G2]) {
    texts.push(item.letterUpper ?? item.letter);
    if (item.chantEn) texts.push(item.chantEn);
    if (item.exampleSentence) texts.push(item.exampleSentence);
    for (const w of item.exampleWords) texts.push(w.word);
  }
  for (const w of PHONICS_WORDS) {
    texts.push(w.word);
    if (w.exampleSentence) texts.push(w.exampleSentence);
  }

  return kidSpeedJobs(uniq(texts).filter(isEnglish));
}

export async function collectJuniorVocabJobs(supabase: SupabaseClient): Promise<JobSpec[]> {
  type Row = { word: string; example_en: string | null; accent: string | null };
  const rows = await fetchAllSupabaseRows<Row>(
    supabase,
    "junior_vocab",
    "word,example_en,accent",
  );

  const jobs: JobSpec[] = [];
  for (const r of rows) {
    const word = r.word.split("/")[0].trim();
    const texts = [word, r.example_en ?? ""].filter(isEnglish);
    const accent = r.accent === "UK" ? "UK" : "US";
    const voiceId = accent === "UK" ? "fable" : "alloy";
    for (const text of uniq(texts)) {
      jobs.push({ text, voiceId, accent, speed: 1.0 });
    }
  }
  return jobs;
}

export async function collectGaokaoVocabJobs(supabase: SupabaseClient): Promise<JobSpec[]> {
  type Row = { word: string; example_en: string | null; accent: string | null };
  const rows = await fetchAllSupabaseRows<Row>(
    supabase,
    "gaokao_vocab",
    "word,example_en,accent",
  );

  const jobs: JobSpec[] = [];
  for (const r of rows) {
    const word = r.word.split("/")[0].trim();
    const texts = [word, r.example_en ?? ""].filter(isEnglish);
    const accent = r.accent === "UK" ? "UK" : "US";
    const voiceId = accent === "UK" ? "fable" : "alloy";
    for (const text of uniq(texts)) {
      jobs.push({ text, voiceId, accent, speed: 1.0 });
    }
  }
  return jobs;
}

export function collectStoryBookJobs(): JobSpec[] {
  const books = [...PRIMARY_STORY_BOOKS, ...PRIMARY_STORY_BOOKS_G2];
  const jobs: JobSpec[] = [];
  const seen = new Set<string>();

  for (const book of books) {
    for (const page of book.pages) {
      const text = page.text_en?.trim();
      if (!text || !isEnglish(text)) continue;
      const { voiceId, speed } = storyVoiceFor(page.speaker);
      const key = `${voiceId}|${speed}|US|${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      jobs.push({ text, voiceId, accent: "US", speed });
    }
  }
  return jobs;
}

function roleplayLineJobs(lines: DialogueLine[]): JobSpec[] {
  const jobs: JobSpec[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const text = line.text_en?.trim();
    if (!text || !isEnglish(text)) continue;
    const voiceId = voiceForRoleplay(line.emoji, line.speaker);
    const key = `${voiceId}|0.95|US|${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push({ text, voiceId, accent: "US", speed: 0.95 });
  }
  return jobs;
}

export function collectRolePlayJobs(): JobSpec[] {
  const plays = [...PRIMARY_ROLE_PLAYS, ...PRIMARY_ROLE_PLAYS_G2];
  const jobs: JobSpec[] = [];
  for (const rp of plays) {
    jobs.push(...roleplayLineJobs(rp.lines));
    for (const c of rp.choices) {
      if (isEnglish(c.text_en)) {
        jobs.push({
          text: c.text_en.trim(),
          voiceId: "el:liam",
          accent: "US",
          speed: 0.95,
        });
      }
    }
  }
  return jobs;
}

export function collectScenesWorkplaceJobs(): JobSpec[] {
  const texts: string[] = [];
  for (const d of [...SCENE_DIALOGUES, ...WORK_DIALOGUES]) {
    for (const line of d.lines) {
      texts.push(stripHtml(line.en));
    }
  }
  return alloyJobs(uniq(texts).filter(isEnglish), 1.0);
}

export function collectSuzhouExamJobs(): JobSpec[] {
  const texts: string[] = [];

  for (const passage of Object.values(SUZHOU_2022.passages)) {
    texts.push(...splitSentences(passage));
  }

  const restoreOpts = SUZHOU_2022.resources?.restore_options;
  if (restoreOpts && typeof restoreOpts === "object") {
    for (const v of Object.values(restoreOpts as Record<string, string>)) {
      if (typeof v === "string") texts.push(v);
    }
  }

  for (const q of SUZHOU_2022.questions) {
    if (q.stem && isEnglish(q.stem)) texts.push(q.stem);
    if (q.options) {
      for (const v of Object.values(q.options)) {
        if (isEnglish(v)) texts.push(v);
      }
    }
  }

  return alloyJobs(uniq(texts).filter(isEnglish), 1.0);
}

export type DatasetBuilder = {
  id: string;
  label: string;
  build: (supabase: SupabaseClient) => Promise<JobSpec[]> | JobSpec[];
};

export const DATASET_BUILDERS: DatasetBuilder[] = [
  { id: "slang", label: "Slang", build: () => collectSlangJobs() },
  { id: "lesson", label: "LessonSamples", build: () => collectLessonJobs() },
  { id: "placement", label: "Placement", build: () => collectPlacementJobs() },
  { id: "course", label: "Course", build: () => collectCourseJobs() },
  { id: "ielts", label: "IELTS", build: () => collectIeltsJobs() },
  {
    id: "primary-vocab",
    label: "PrimaryVocab",
    build: (sb) => collectPrimaryVocabJobs(sb),
  },
  {
    id: "primary-sightwords",
    label: "PrimarySightWords",
    build: () => collectPrimarySightWordsJobs(),
  },
  {
    id: "primary-phonics",
    label: "PrimaryPhonics",
    build: () => collectPrimaryPhonicsJobs(),
  },
  {
    id: "junior-vocab",
    label: "JuniorVocab",
    build: (sb) => collectJuniorVocabJobs(sb),
  },
  {
    id: "gaokao-vocab",
    label: "GaokaoVocab",
    build: (sb) => collectGaokaoVocabJobs(sb),
  },
  { id: "storybooks", label: "StoryBooks", build: () => collectStoryBookJobs() },
  { id: "roleplays", label: "RolePlays", build: () => collectRolePlayJobs() },
  {
    id: "scenes-workplace",
    label: "ScenesWorkplace",
    build: () => collectScenesWorkplaceJobs(),
  },
  { id: "suzhou-exam", label: "SuzhouExam2022", build: () => collectSuzhouExamJobs() },
];

export function dedupeJobs(jobs: JobSpec[]): JobSpec[] {
  const seen = new Set<string>();
  const out: JobSpec[] = [];
  for (const j of jobs) {
    const key = `${j.voiceId}|${j.speed}|${j.accent}|${j.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}

export function estimateChars(jobs: JobSpec[]): number {
  return jobs.reduce((n, j) => n + j.text.length, 0);
}

export function splitJobsByProvider(jobs: JobSpec[]): {
  openai: JobSpec[];
  elevenlabs: JobSpec[];
} {
  const openai: JobSpec[] = [];
  const elevenlabs: JobSpec[] = [];
  for (const j of jobs) {
    if (j.voiceId.startsWith("el:")) elevenlabs.push(j);
    else openai.push(j);
  }
  return { openai, elevenlabs };
}
