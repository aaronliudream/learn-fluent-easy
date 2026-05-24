/**
 * Unified high-school (高考) vocabulary pool from Supabase `gaokao_vocab`.
 * Excludes words already in junior / primary curricula.
 */
import { supabase } from "@/integrations/supabase/client";

export type GaokaoVocabRow = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  star_level: number | null;
  accent: "UK" | "US" | "BOTH" | null;
  theme: string | null;
  freq_rank: number | null;
  exam_frequency: number | null;
  gaokao_level: number | null;
  is_hot_topic: boolean | null;
};

const VOCAB_COLS =
  "id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,accent,theme,freq_rank,exam_frequency,gaokao_level,is_hot_topic,sort_order";

const PAGE = 1000;

/** Fallback denominator when Supabase is unreachable. */
export const GAOKAO_VOCAB_POOL_FALLBACK = 2000;

let cachedPool: GaokaoVocabRow[] | null = null;
let loadPromise: Promise<GaokaoVocabRow[]> | null = null;

export function normalizeVocabWordKey(word: string): string {
  return word.toLowerCase().split("/")[0].trim();
}

/** Reject PDF-slug garbage and textbook placeholder glosses. */
export function isValidGaokaoVocabRow(row: { word: string; meaning_cn: string }): boolean {
  const w = row.word.trim();
  const m = row.meaning_cn.trim();
  if (!w || !m) return false;
  if (/^[A-Z]{4,}$/.test(w)) return false;
  if (/课文词汇|必修|选择性必修/.test(m)) return false;
  if (!/[a-zA-Z]/.test(w)) return false;
  return true;
}

async function fetchWordsFromTable(
  table: "junior_vocab" | "gaokao_vocab",
  filter?: { column: string; value: string },
): Promise<string[]> {
  const words: string[] = [];
  for (let from = 0; from < 20000; from += PAGE) {
    let q = supabase.from(table).select("word").range(from, from + PAGE - 1);
    if (filter) q = q.eq(filter.column, filter.value);
    const { data, error } = await q;
    if (error || !data?.length) break;
    for (const row of data as { word: string }[]) words.push(row.word);
    if (data.length < PAGE) break;
  }
  return words;
}

async function fetchExcludeKeys(): Promise<Set<string>> {
  const [junior, primary] = await Promise.all([
    fetchWordsFromTable("junior_vocab"),
    fetchWordsFromTable("gaokao_vocab", { column: "stage", value: "primary" }),
  ]);
  const keys = new Set<string>();
  for (const w of [...junior, ...primary]) keys.add(normalizeVocabWordKey(w));
  return keys;
}

async function fetchSeniorVocabRows(): Promise<GaokaoVocabRow[]> {
  const rows: GaokaoVocabRow[] = [];
  for (let from = 0; from < 20000; from += PAGE) {
    const { data, error } = await supabase
      .from("gaokao_vocab")
      .select(VOCAB_COLS)
      .eq("stage", "senior")
      .order("sort_order", { ascending: true })
      .order("freq_rank", { ascending: true, nullsFirst: false })
      .order("word", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = (data ?? []) as GaokaoVocabRow[];
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  return rows;
}

function dedupeAndFilter(rows: GaokaoVocabRow[], exclude: Set<string>): GaokaoVocabRow[] {
  const seen = new Set<string>();
  const out: GaokaoVocabRow[] = [];
  for (const row of rows) {
    if (!isValidGaokaoVocabRow(row)) continue;
    const key = normalizeVocabWordKey(row.word);
    if (exclude.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

async function loadPool(): Promise<GaokaoVocabRow[]> {
  const [exclude, senior] = await Promise.all([fetchExcludeKeys(), fetchSeniorVocabRows()]);
  return dedupeAndFilter(senior, exclude);
}

/** Load (and cache) the unified high-school-only vocabulary list. */
export async function fetchGaokaoVocabPool(opts?: { force?: boolean }): Promise<GaokaoVocabRow[]> {
  if (!opts?.force && cachedPool) return cachedPool;
  if (!opts?.force && loadPromise) return loadPromise;
  loadPromise = loadPool()
    .then((pool) => {
      cachedPool = pool;
      return pool;
    })
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

export function getCachedGaokaoVocabPool(): GaokaoVocabRow[] | null {
  return cachedPool;
}

export async function countGaokaoVocabPool(): Promise<number> {
  const pool = await fetchGaokaoVocabPool();
  return pool.length > 0 ? pool.length : GAOKAO_VOCAB_POOL_FALLBACK;
}
