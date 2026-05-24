import type { PhonicsConfig } from "@/lib/primaryHub/phonicsRegistry";
import type { VocabItem } from "@/lib/primaryHub/types";

export type VocabGroupDef = {
  id: 1 | 2 | 3;
  label: string;
  header: string;
  items: VocabItem[];
  offset: number;
  showPhonicsRule?: boolean;
};

/** Three-group vocab layout for g4v2_u1 (8 + 5 + 6 = 19 words). */
export function getVocabGroups(
  unitId: string,
  vocabulary: VocabItem[],
): VocabGroupDef[] | null {
  if (unitId !== "g4v2_u1" || vocabulary.length < 19) return null;
  return [
    {
      id: 1,
      label: "学校场所",
      header: "学校场所 · 8 个词",
      items: vocabulary.slice(0, 8),
      offset: 0,
    },
    {
      id: 2,
      label: "日常用词",
      header: "日常用词 · 5 个词",
      items: vocabulary.slice(8, 13),
      offset: 8,
    },
    {
      id: 3,
      label: "🔤 拼读词",
      header: "拼读词 · 6 个词",
      items: vocabulary.slice(13, 19),
      offset: 13,
      showPhonicsRule: true,
    },
  ];
}

export function getPhonicsRuleText(phonics: PhonicsConfig | null): string | null {
  if (!phonics) return null;
  return phonics.rule_explanation;
}
