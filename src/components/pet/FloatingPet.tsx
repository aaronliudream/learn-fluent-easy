import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Pet = { id: string; nickname: string; stage: number; level: number; exp: number; hunger: number; mood: number; species_id: string };
type Species = { id: string; emoji_egg: string; emoji_baby: string; emoji_adult: string; emoji_legend: string };

function pickEmoji(p: Pet, sp?: Species) {
  if (!sp) return "🐣";
  return [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][p.stage] ?? sp.emoji_baby;
}

/**
 * 学习页右下角浮动宠物：
 * - 显示当前活跃宠物 + 等级 + 饱食条
 * - 监听 `pet:react` 事件做表情/弹跳/星星反馈
 * - 点击跳转 /pets
 */
export function FloatingPet() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [sp, setSp] = useState<Species | null>(null);
  const [react, setReact] = useState<null | { kind: string; coins?: number; id: number }>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const { data: pets } = await supabase.from("user_pets").select("*").eq("user_id", u.user.id).eq("is_active", true).limit(1);
      const p = pets?.[0] as Pet | undefined;
      if (!p || !mounted) return;
      setPet(p);
      const { data: s } = await supabase.from("pet_species").select("id,emoji_egg,emoji_baby,emoji_adult,emoji_legend").eq("id", p.species_id).maybeSingle();
      if (mounted) setSp(s as Species);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onReact = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      setReact({ kind: d.kind, coins: d.coins, id: Date.now() });
      window.setTimeout(() => setReact(null), 1600);
    };
    window.addEventListener("pet:react", onReact);
    return () => window.removeEventListener("pet:react", onReact);
  }, []);

  if (!pet) return null;
  const emoji = pickEmoji(pet, sp ?? undefined);
  const isHappy = react?.kind === "correct" || react?.kind === "happy" || react?.kind === "flash";
  const isSad = react?.kind === "wrong";

  return (
    <Link
      to="/pets"
      aria-label={`查看宠物 ${pet.nickname}`}
      className="group fixed bottom-20 right-3 z-40 select-none lg:bottom-6 lg:right-6"
    >
      <div className="relative flex items-end gap-1.5 rounded-full border border-border/60 bg-card/90 px-2.5 py-1.5 shadow-lg backdrop-blur transition hover:-translate-y-0.5">
        <div
          className={cn(
            "text-3xl leading-none transition",
            isHappy && "animate-bounce-slow",
            isSad && "opacity-70 grayscale",
            !react && "group-hover:scale-110",
          )}
        >
          {emoji}
        </div>
        <div className="hidden flex-col text-left leading-tight sm:flex">
          <span className="text-[10px] font-bold">{pet.nickname}</span>
          <span className="text-[10px] text-muted-foreground">Lv.{pet.level}</span>
        </div>
      </div>

      {/* 反馈气泡 */}
      {react && (
        <div
          key={react.id}
          className={cn(
            "pointer-events-none absolute -top-7 right-2 rounded-full px-2 py-0.5 text-[11px] font-extrabold shadow",
            react.kind === "flash" && "bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 animate-bounce",
            react.kind === "correct" && "bg-emerald-500 text-white",
            react.kind === "happy" && "bg-pink-500 text-white",
            react.kind === "wrong" && "bg-muted text-foreground",
          )}
          style={{ animation: "xp-burst 1.4s ease-out forwards" }}
        >
          {react.kind === "flash" && `✨ +${react.coins} 闪光！`}
          {react.kind === "correct" && `+${react.coins ?? 1} ⭐`}
          {react.kind === "happy" && `🎉 +${react.coins ?? 5}`}
          {react.kind === "wrong" && "没事，再来！"}
        </div>
      )}
    </Link>
  );
}

export default FloatingPet;