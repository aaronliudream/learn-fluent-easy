import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Pet = { id: string; nickname: string; stage: number; level: number; exp: number; hunger: number; mood: number; species_id: string; equipped_skin_id?: string | null };
type Species = { id: string; emoji_egg: string; emoji_baby: string; emoji_adult: string; emoji_legend: string };

function pickEmoji(p: Pet, sp?: Species) {
  if (!sp) return "🐣";
  return [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][p.stage] ?? sp.emoji_baby;
}

/**
 * 学习页右下角浮动宠物：
 * - 自动饥饿度衰减（调用 get_my_active_pet RPC，每次挂载/答题刷新）
 * - 答对蹦跳、答错抖动灰色、闪光币金色弹出
 * - 低饥饿（<25）持续脉冲提醒；点击跳转 /pets
 */
export function FloatingPet() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [sp, setSp] = useState<Species | null>(null);
  const [skinFilter, setSkinFilter] = useState<string>("");
  const [react, setReact] = useState<null | { kind: string; coins?: number; id: number }>(null);
  const [authState, setAuthState] = useState<"loading" | "guest" | "authed">("loading");
  const [demoTick, setDemoTick] = useState(0);
  const lastFetchRef = useRef(0);

  const refresh = async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 30000) return; // 30s 节流
    lastFetchRef.current = now;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setAuthState("guest"); setPet(null); return; }
    setAuthState("authed");
    const { data } = await supabase.rpc("get_my_active_pet");
    const p = (Array.isArray(data) ? data[0] : data) as Pet | undefined;
    if (!p) { setPet(null); return; }
    setPet(p);
    if (!sp || sp.id !== p.species_id) {
      const { data: s } = await supabase.from("pet_species")
        .select("id,emoji_egg,emoji_baby,emoji_adult,emoji_legend")
        .eq("id", p.species_id).maybeSingle();
      if (s) setSp(s as Species);
    }
    // 装备皮肤滤镜
    if (p.equipped_skin_id) {
      const { data: sk } = await (supabase as any).from("pet_skins")
        .select("css_filter").eq("id", p.equipped_skin_id).maybeSingle();
      setSkinFilter((sk as any)?.css_filter || "");
    } else {
      setSkinFilter("");
    }
  };

  useEffect(() => {
    refresh();
    // Re-evaluate when auth changes (sign-in / sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      lastFetchRef.current = 0;
      refresh();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Demo egg cycle for guests AND authed-but-petless users
  useEffect(() => {
    if (pet) return;
    const id = window.setInterval(() => setDemoTick((x) => (x + 1) % 4), 2500);
    return () => window.clearInterval(id);
  }, [pet]);

  useEffect(() => {
    const onReact = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      setReact({ kind: d.kind, coins: d.coins, id: Date.now() });
      window.setTimeout(() => setReact(null), 1600);
      // 答对超过若干次后悄悄刷新一次饱食状态
      if (d.kind === "correct" || d.kind === "happy" || d.kind === "flash") refresh();
    };
    window.addEventListener("pet:react", onReact);
    return () => window.removeEventListener("pet:react", onReact);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Demo mode (guest OR signed-in without pet) → adopt CTA
  if (!pet && authState !== "loading") {
    const demoEmojis = ["🥚", "🐣", "🦊", "🐉"];
    const isGuest = authState === "guest";
    return (
      <Link
        to="/pets"
        aria-label={isGuest ? "Sign in to adopt your learning companion" : "Adopt your learning companion"}
        className="group fixed bottom-20 right-3 z-40 select-none lg:bottom-6 lg:right-6"
      >
        <div className="relative flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-2.5 py-1.5 shadow-lg backdrop-blur transition hover:-translate-y-0.5">
          <div className="text-3xl leading-none transition animate-companion-breathe group-hover:scale-110">
            {demoEmojis[demoTick]}
          </div>
          <div className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-[10px] font-bold">Adopt me</span>
            <span className="text-[10px] text-muted-foreground">领养我</span>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-7 right-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow animate-bounce">
          ✨ Tap me
        </div>
      </Link>
    );
  }
  if (!pet) return null;
  const emoji = pickEmoji(pet, sp ?? undefined);
  const isHappy = react?.kind === "correct" || react?.kind === "happy" || react?.kind === "flash";
  const isSad = react?.kind === "wrong";
  const isHungry = pet.hunger < 25;

  return (
    <Link
      to="/pets"
      aria-label={`Visit your companion ${pet.nickname}`}
      className="group fixed bottom-20 right-3 z-40 select-none lg:bottom-6 lg:right-6"
    >
      <div className={cn(
        "relative flex items-end gap-1.5 rounded-full border border-border/60 bg-card/90 px-2.5 py-1.5 shadow-lg backdrop-blur transition hover:-translate-y-0.5",
        isHungry && !react && "animate-pulse ring-2 ring-amber-400/60",
      )}>
        <div
          className={cn(
            "text-3xl leading-none transition",
            isHappy && "animate-bounce",
            isSad && "opacity-70 grayscale animate-shake-x",
            !react && "group-hover:scale-110",
          )}
          style={{ filter: !isSad && skinFilter ? skinFilter : undefined }}
        >
          {emoji}
        </div>
        <div className="hidden flex-col text-left leading-tight sm:flex">
          <span className="text-[10px] font-bold">{pet.nickname}</span>
          <span className="text-[10px] text-muted-foreground">Lv.{pet.level} · 🍖{pet.hunger}</span>
        </div>
        {/* 饥饿小条 */}
        <div className="pointer-events-none absolute inset-x-2 -bottom-0.5 h-0.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              pet.hunger < 25 ? "bg-rose-500" : pet.hunger < 60 ? "bg-amber-400" : "bg-emerald-500"
            )}
            style={{ width: `${pet.hunger}%` }}
          />
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
      {isHungry && !react && (
        <div className="pointer-events-none absolute -top-7 right-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow animate-bounce">
          🍖 我饿了…
        </div>
      )}
    </Link>
  );
}

export default FloatingPet;