import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { T, useT } from "@/i18n/T";

/**
 * 4-planet companion world map — culturally neutral, level-gated unlock system.
 *
 * Each planet maps to a CEFR band so the pet's narrative grows with the learner.
 * Locked planets show a soft "?" silhouette instead of names — preserves curiosity
 * without spoilers, matches Duolingo / Khan Academy progression UX.
 */

type Planet = {
  code: string;
  name_cn: string;
  name_en: string;
  emoji: string;
  band: "A1" | "A2" | "B1" | "B2";
  unlock_level: number;
  blurb_cn: string;
  hue: string;
};

const PLANETS: Planet[] = [
  { code: "alphabet_isle", name_cn: "字母岛",   name_en: "Alphabet Isle",   emoji: "🏝️", band: "A1", unlock_level: 1,  blurb_cn: "26 个字母在这里冒险", hue: "from-amber-300 to-orange-400" },
  { code: "convo_forest",  name_cn: "对话森林", name_en: "Conversation Wood", emoji: "🌳", band: "A2", unlock_level: 5,  blurb_cn: "学会和不同伙伴打招呼",   hue: "from-emerald-300 to-teal-500" },
  { code: "story_river",   name_cn: "故事之河", name_en: "Story River",     emoji: "🌊", band: "B1", unlock_level: 10, blurb_cn: "沿着河流读懂长篇文章",   hue: "from-sky-300 to-indigo-500" },
  { code: "writing_peak",  name_cn: "写作高地", name_en: "Writing Highlands", emoji: "🏔️", band: "B2", unlock_level: 20, blurb_cn: "在云端写出自己的故事",   hue: "from-fuchsia-300 to-rose-500" },
];

export default function PlanetMap() {
  const t = useT();
  const [petLevel, setPetLevel] = useState(1);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_my_active_pet").then((r: any) =>
        ({ data: Array.isArray(r.data) ? r.data[0] : r.data })
      );
      if (data?.level) setPetLevel(Number(data.level) || 1);
    })();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">🌌 <T>学习星图</T></h3>
        <span className="text-[11px] text-muted-foreground"><T>伙伴</T> Lv.{petLevel}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PLANETS.map(p => {
          const unlocked = petLevel >= p.unlock_level;
          return (
            <div
              key={p.code}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.hue} p-4 text-white shadow-tile transition ${
                unlocked ? "" : "grayscale opacity-60"
              }`}
            >
              <div className="text-3xl">{unlocked ? p.emoji : "❔"}</div>
              <div className="mt-2 text-sm font-bold">
                {unlocked ? <T>{p.name_cn}</T> : <T>未知星球</T>}
              </div>
              <div className="text-[11px] opacity-90">
                {unlocked ? `${p.name_en} · ${p.band}` : `Lv.${p.unlock_level} ${t("解锁")}`}
              </div>
              {unlocked && <p className="mt-2 text-[11px] leading-snug opacity-90"><T>{p.blurb_cn}</T></p>}
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] text-muted-foreground">
        🌍 <T>全球学习者一起探索 · 没有竞赛，只有发现</T>
      </p>
    </div>
  );
}