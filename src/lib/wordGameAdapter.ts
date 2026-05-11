// 把小学 Sight Word 转成 Word Quest / Word Rush 等游戏组件需要的 Vocab 形状。
// 字段名差异:meaningCn → meaning_cn / ipa → phonetic / exampleSentence → example_en
import type { SightWordItem } from "@/data/primarySightWords";

export type GameVocab = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  accent: "UK" | "US" | "BOTH" | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  synonyms?: any;
  star_level?: number;
  freq_rank?: number;
};

export function sightWordToGameVocab(sw: SightWordItem): GameVocab {
  return {
    id: sw.id,
    word: sw.word,
    phonetic: sw.ipa ?? null,
    pos: sw.pos ?? null,
    accent: null,
    meaning_cn: sw.meaningCn,
    meaning_en: null,
    example_en: sw.exampleSentence ?? null,
    example_cn: sw.exampleSentenceCn ?? null,
    synonyms: null,
    star_level: 1,
    freq_rank: sw.rank ?? 0,
  };
}