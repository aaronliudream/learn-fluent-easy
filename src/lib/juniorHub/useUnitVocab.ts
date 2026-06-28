import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UnitDef, VocabItem } from "./types";

/** useUnitVocab 返回项:VocabItem + junior_vocab.id + 拆出的 phrase_en / 例句(供听音辨词用)。 */
export type UnitVocabItem = VocabItem & {
  id?: string; // junior_vocab.id;JSON 回退词无 id
  phrase?: string; // phrase_en(短语/语块)
  example?: { en: string; cn: string }; // example_en/cn 成对
};

/**
 * 统一从 junior_vocab DB 读某 unit 全部词(grade + volume + unit,按 freq_rank 升序)。
 * 无 DB 词(grade7/Starter 等 book 不在表内)→ 回退 JSON unit.vocabulary(含 chunk 例句,无 id)。
 * 返回 null = 加载中。
 *
 * ⚠️ 仅供展示/分组用,与掌握度无关(掌握度按 wordId 独立记录,不经此 hook)。
 * 供 核心词汇关(VocabStage)、词义配对(WordMatchingGame)、听音辨词共用。
 */
export function useUnitVocab(unit: UnitDef, grade: number, publisher?: string | null): UnitVocabItem[] | null {
  const [vocab, setVocab] = useState<UnitVocabItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let vq = supabase
        .from("junior_vocab")
        .select("id,word,phonetic,meaning_cn,phrase_en,example_en,example_cn")
        .eq("grade", grade)
        .eq("volume", unit.book)
        .eq("unit", unit.unitKey);
      if (publisher) vq = vq.eq("publisher", publisher); // /gaokao→'pep';/junior→不传,行为不变
      const { data } = await vq.order("freq_rank", { ascending: true, nullsFirst: false });
      if (cancelled) return;
      const rows = (data ?? []) as Array<{
        id: string;
        word: string;
        phonetic: string | null;
        meaning_cn: string | null;
        phrase_en: string | null;
        example_en: string | null;
        example_cn: string | null;
      }>;
      const valid = rows.filter((r) => r.word && r.meaning_cn);
      if (valid.length > 0) {
        setVocab(
          valid.map((r) => {
            const example =
              r.example_en && r.example_cn ? { en: r.example_en, cn: r.example_cn } : undefined;
            const phrase = r.phrase_en?.trim() || undefined;
            return {
              id: r.id,
              en: r.word.trim(),
              cn: r.meaning_cn as string,
              phonetic: r.phonetic?.trim() || undefined,
              phrase,
              example,
              // 核心词汇关翻卡用 chunks:例句优先,无例句则用短语(无中文,cn 留空)
              chunks: example ? [example] : phrase ? [{ en: phrase, cn: "" }] : undefined,
            };
          }),
        );
      } else {
        setVocab(unit.vocabulary as UnitVocabItem[]); // 回退:无 DB 词 → JSON(无 id)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, unit.book, unit.unitKey, grade, publisher]);

  return vocab;
}

/** 掌握门槛(与 useJuniorVocabMastery 一致):连对/正确达到此值 = 该通道掌握。 */
const MASTERED_AT = 2;
export type RankedChannel = "listen" | "match";

export type RankedUnitVocab = {
  words: UnitVocabItem[] | null; // 已按"未掌握优先"排序(掌握沉底,桶内保持 freq_rank);null=加载中
  masteredCount: number; // 本 unit 在该通道已掌握的词数
  total: number; // 本 unit 总词数
  loading: boolean;
};

/**
 * 在 useUnitVocab 基础上,按 junior_word_mastery 的指定通道掌握度排序:
 * 未掌握词在前、已掌握词沉底(桶内保持 freq_rank)。⚠️ 排序非过滤,掌握词保留(可继续复习)。
 * 掌握口径:match → match_consec ≥ 2;listen → listen_correct ≥ 2。
 * 游客 / 未登录 / 无数据 → 不排序,等于按 freq_rank(=现状)。
 * 供 听音辨词(channel="listen")、词义配对(channel="match")用。
 */
export function useRankedUnitVocab(unit: UnitDef, grade: number, channel: RankedChannel, publisher?: string | null): RankedUnitVocab {
  const words = useUnitVocab(unit, grade, publisher);
  const [out, setOut] = useState<{ words: UnitVocabItem[] | null; masteredCount: number; total: number }>(
    { words: null, masteredCount: 0, total: 0 },
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!words) {
        setOut({ words: null, masteredCount: 0, total: 0 });
        return;
      }
      const ids = words.map((w) => w.id).filter((x): x is string => !!x);
      const col = channel === "listen" ? "listen_correct" : "match_consec";
      const mastered = new Set<string>();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user && ids.length) {
        for (let i = 0; i < ids.length; i += 200) {
          const slice = ids.slice(i, i + 200);
          const { data, error } = await supabase
            .from("junior_word_mastery")
            .select(`word_id,${col}`)
            .eq("user_id", user.id)
            .in("word_id", slice);
          if (cancelled) return;
          if (error) break;
          for (const r of (data ?? []) as Record<string, unknown>[]) {
            if (Number(r[col] ?? 0) >= MASTERED_AT) mastered.add(String(r.word_id));
          }
        }
      }
      // 稳定排序:未掌握(0)在前、掌握(1)沉底;同桶按原 freq_rank 顺序(idx)。
      const sorted = words
        .map((w, idx) => ({ w, idx, m: w.id && mastered.has(w.id) ? 1 : 0 }))
        .sort((a, b) => a.m - b.m || a.idx - b.idx)
        .map((x) => x.w);
      if (cancelled) return;
      setOut({ words: sorted, masteredCount: mastered.size, total: words.length });
    })();
    return () => {
      cancelled = true;
    };
  }, [words, grade, channel]);

  return { ...out, loading: words === null || out.words === null };
}
