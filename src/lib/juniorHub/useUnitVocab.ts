import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UnitDef, VocabItem } from "./types";

/**
 * 统一从 junior_vocab DB 读某 unit 全部词(grade + volume + unit,按 freq_rank 升序)。
 * 无 DB 词(grade7/Starter 等 book 不在表内)→ 回退 JSON unit.vocabulary(含 chunk 例句)。
 * 返回 null = 加载中。
 *
 * ⚠️ 仅供展示/分组用,与掌握度无关(掌握度按 wordId 独立记录,不经此 hook)。
 * 供 核心词汇关(VocabStage)、词义配对(WordMatchingGame)共用,与听音辨词同源。
 */
export function useUnitVocab(unit: UnitDef, grade: number): VocabItem[] | null {
  const [vocab, setVocab] = useState<VocabItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("junior_vocab")
        .select("word,meaning_cn,phrase_en,example_en,example_cn")
        .eq("grade", grade)
        .eq("volume", unit.book)
        .eq("unit", unit.unitKey)
        .order("freq_rank", { ascending: true, nullsFirst: false });
      if (cancelled) return;
      const rows = (data ?? []) as Array<{
        word: string;
        meaning_cn: string | null;
        phrase_en: string | null;
        example_en: string | null;
        example_cn: string | null;
      }>;
      const valid = rows.filter((r) => r.word && r.meaning_cn);
      if (valid.length > 0) {
        setVocab(
          valid.map((r) => ({
            en: r.word.trim(),
            cn: r.meaning_cn as string,
            // 例句优先(en+cn 成对);无例句则用短语 phrase_en(无中文,cn 留空)
            chunks:
              r.example_en && r.example_cn
                ? [{ en: r.example_en, cn: r.example_cn }]
                : r.phrase_en
                ? [{ en: r.phrase_en.trim(), cn: "" }]
                : undefined,
          })),
        );
      } else {
        setVocab(unit.vocabulary); // 回退:无 DB 词 → JSON
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, unit.book, unit.unitKey, grade]);

  return vocab;
}
