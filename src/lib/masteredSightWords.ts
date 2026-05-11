// 小学 Sight Words mastery → Word Quest 池子。
// mastery_level >= 1 即视为「掌握」(和 PrimarySightWordsLearn 的判定一致)。
import { supabase } from "@/integrations/supabase/client";
import { SIGHT_WORD_ITEMS } from "@/data/primarySightWords";
import { SIGHT_WORD_ITEMS_G2 } from "@/data/primarySightWordsG2";
import { sightWordToGameVocab, type GameVocab } from "./wordGameAdapter";

function poolFor(grade: 1 | 2) {
  return grade === 1 ? SIGHT_WORD_ITEMS : SIGHT_WORD_ITEMS_G2;
}

export async function getMasteredSightWordsCount(
  userId: string,
  grade: 1 | 2
): Promise<number> {
  const all = poolFor(grade);
  const ids = all.map((x) => x.id);
  const { data, error } = await supabase
    .from("primary_sight_word_mastery")
    .select("word_id")
    .eq("user_id", userId)
    .gte("mastery_level", 1)
    .in("word_id", ids);
  if (error || !data) return 0;
  return data.length;
}

export async function getMasteredSightWordsAsVocab(
  userId: string,
  grade: 1 | 2,
  limit = 50
): Promise<GameVocab[]> {
  const all = poolFor(grade);
  const ids = all.map((x) => x.id);
  const { data, error } = await supabase
    .from("primary_sight_word_mastery")
    .select("word_id")
    .eq("user_id", userId)
    .gte("mastery_level", 1)
    .in("word_id", ids);
  if (error || !data) return [];
  const mastered = new Set(data.map((r: any) => r.word_id as string));
  return all
    .filter((it) => mastered.has(it.id))
    .map(sightWordToGameVocab)
    .slice(0, limit);
}