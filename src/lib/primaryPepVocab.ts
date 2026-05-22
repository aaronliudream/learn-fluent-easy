import { supabase } from "@/integrations/supabase/client";
import { countPrimaryDue, isPrimaryWordMastered, isPrimaryWordLearned } from "@/lib/primaryMasteryStats";
import type { PepVolume } from "@/lib/primaryDailyPlan";

/** Per-volume totals from docs/vocab/primary_ingest_report.md — keep in sync with DB ingest. */
export const PEP_VOLUME_TOTALS: Record<PepVolume, number> = {
  "3A": 64,
  "3B": 71,
  "4A": 84,
  "4B": 104,
  "5A": 131,
  "5B": 154,
  "6A": 147,
  "6B": 91,
};

export const PEP_VOLUME_GRADE: Record<PepVolume, number> = {
  "3A": 3,
  "3B": 3,
  "4A": 4,
  "4B": 4,
  "5A": 5,
  "5B": 5,
  "6A": 6,
  "6B": 6,
};

export type PrimaryPepVocabRow = {
  id: string;
  word: string;
  pos: string | null;
  ipa: string | null;
  meaning_cn: string;
  example_en: string | null;
  example_cn: string | null;
  theme: string | null;
  grade: number;
  volume: string | null;
  unit: string | null;
  word_id: string | null;
};

export const PRIMARY_VOCAB_SELECT =
  "id,word,pos,ipa,meaning_cn,example_en,example_cn,theme,grade,volume,unit,word_id";

export async function fetchPrimaryVocabByVolume(volume: PepVolume): Promise<PrimaryPepVocabRow[]> {
  const { data, error } = await supabase
    .from("primary_vocab")
    .select(PRIMARY_VOCAB_SELECT)
    .eq("volume", volume)
    .order("word_id");
  if (error) {
    console.error("[primaryPepVocab] fetch by volume:", error);
    return [];
  }
  return (data ?? []) as PrimaryPepVocabRow[];
}

export async function fetchPrimaryVocabIdsByVolume(volume: PepVolume): Promise<string[]> {
  const rows = await fetchPrimaryVocabByVolume(volume);
  return rows.map((r) => r.id);
}

export type VolumeMasteryCounts = {
  total: number;
  mastered: number;
  learned: number;
  due: number;
  untouched: number;
};

/** Aggregate mastery for one PEP volume (word_id must be in vocabIds). */
export function aggregateVolumeMastery(
  vocabIds: Set<string>,
  masteryRows: { word_id: string; mastery_level?: number | null; due_at?: string | null }[]
): VolumeMasteryCounts {
  const total = vocabIds.size;
  let mastered = 0;
  let learned = 0;
  let due = 0;
  const touched = new Set<string>();

  for (const r of masteryRows) {
    if (!vocabIds.has(r.word_id)) continue;
    touched.add(r.word_id);
    const lvl = r.mastery_level ?? 0;
    if (isPrimaryWordMastered(lvl)) mastered += 1;
    else if (isPrimaryWordLearned(lvl)) learned += 1;
    if (isPrimaryWordDue(r)) due += 1;
  }

  const untouched = Math.max(0, total - touched.size);
  return { total, mastered, learned, due, untouched };
}

export async function fetchVolumeMasteryCounts(
  userId: string,
  volume: PepVolume
): Promise<VolumeMasteryCounts> {
  const vocab = await fetchPrimaryVocabByVolume(volume);
  const vocabIds = new Set(vocab.map((v) => v.id));
  const grade = PEP_VOLUME_GRADE[volume];

  if (!vocabIds.size) {
    return { total: PEP_VOLUME_TOTALS[volume], mastered: 0, learned: 0, due: 0, untouched: PEP_VOLUME_TOTALS[volume] };
  }

  const { data } = await supabase
    .from("primary_word_mastery")
    .select("word_id,mastery_level,due_at")
    .eq("user_id", userId)
    .eq("grade", grade);

  const counts = aggregateVolumeMastery(vocabIds, (data ?? []) as any[]);
  if (counts.total === 0) counts.total = PEP_VOLUME_TOTALS[volume];
  return counts;
}

/** List distinct units in a volume, in textbook order. */
export function listUnitsInVolume(rows: PrimaryPepVocabRow[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const r of rows) {
    const u = r.unit?.trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    order.push(u);
  }
  return order;
}

export function filterVocabByUnit(rows: PrimaryPepVocabRow[], unit: string | null): PrimaryPepVocabRow[] {
  if (!unit) return rows;
  return rows.filter((r) => r.unit === unit);
}
