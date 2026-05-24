import type { PhonicsConfig } from "@/lib/primaryHub/phonicsRegistry";
import type { UnitDef, VocabGroupConfig, VocabItem } from "@/lib/primaryHub/types";
import { warnRegistryDev } from "./registryDiscovery";

export type VocabGroupDef = {
  id: 1 | 2 | 3;
  label: string;
  header: string;
  items: VocabItem[];
  offset: number;
  showPhonicsRule?: boolean;
};

type VocabGroupsUnit = Pick<UnitDef, "vocabulary" | "vocabGroups">;

function resolveGroupIndices(
  config: VocabGroupConfig,
  vocabulary: VocabItem[],
): number[] {
  if (config.indices?.length) {
    if (config.match) {
      warnRegistryDev(
        `vocabGroups: "${config.id}" has both match and indices; using indices.`,
      );
    }
    return config.indices;
  }

  if (config.match?.type) {
    return vocabulary.reduce<number[]>((acc, word, index) => {
      if (word.type === config.match!.type) {
        acc.push(index);
      }
      return acc;
    }, []);
  }

  warnRegistryDev(
    `vocabGroups: "${config.id}" must specify match.type or indices; skipping group.`,
  );
  return [];
}

function validateVocabGrouping(unit: VocabGroupsUnit): void {
  const { vocabulary, vocabGroups } = unit;
  if (!vocabGroups?.length) return;

  const usesTypeMatch = vocabGroups.some((group) => group.match?.type && !group.indices?.length);
  if (usesTypeMatch) {
    vocabulary.forEach((word, index) => {
      if (!word.type) {
        warnRegistryDev(
          `vocabGroups: word "${word.en}" at index ${index} is missing type.`,
        );
      }
    });
  }

  const covered = new Set<number>();
  for (const group of vocabGroups) {
    for (const index of resolveGroupIndices(group, vocabulary)) {
      if (index >= 0 && index < vocabulary.length) {
        covered.add(index);
      }
    }
  }

  vocabulary.forEach((word, index) => {
    if (!covered.has(index)) {
      warnRegistryDev(
        `vocabGroups: word "${word.en}" at index ${index} is not covered by any group.`,
      );
    }
  });
}

export function getVocabGroups(unit: VocabGroupsUnit): VocabGroupDef[] | null {
  const { vocabulary, vocabGroups } = unit;
  if (!vocabGroups?.length) return null;

  if (import.meta.env.DEV) {
    validateVocabGrouping(unit);
  }

  const groups: VocabGroupDef[] = [];

  vocabGroups.forEach((config, groupIndex) => {
    if (groupIndex >= 3) {
      warnRegistryDev(
        `vocabGroups: only the first 3 groups render as tabs; skipping "${config.id}".`,
      );
      return;
    }

    const rawIndices = resolveGroupIndices(config, vocabulary);
    const indices = rawIndices.filter((index) => index >= 0 && index < vocabulary.length);

    if (indices.length !== rawIndices.length) {
      warnRegistryDev(
        `vocabGroups: "${config.id}" contains out-of-range indices for vocabulary length ${vocabulary.length}.`,
      );
    }

    if (indices.length === 0) {
      warnRegistryDev(`vocabGroups: "${config.id}" resolved to 0 words; skipping group.`);
      return;
    }

    const items = indices.map((index) => vocabulary[index]);
    const offset = indices[0];
    const header =
      config.header ?? `${config.name} · ${items.length} 个词`;

    groups.push({
      id: (groupIndex + 1) as 1 | 2 | 3,
      label: config.name,
      header,
      items,
      offset,
      showPhonicsRule: config.showPhonicsRule,
    });
  });

  return groups.length > 0 ? groups : null;
}

export function getPhonicsRuleText(phonics: PhonicsConfig | null): string | null {
  if (!phonics) return null;
  return phonics.rule_explanation;
}
