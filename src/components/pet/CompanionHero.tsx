import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { X, useTBi } from "@/i18n/T";

type Pet = { id: string; nickname: string; stage: number; level: number; hunger: number; species_id: string };
type Species = { id: string; emoji_egg: string; emoji_baby: string; emoji_adult: string; emoji_legend: string };

const DEMO_EMOJIS = ["🥚", "🐣", "🦊", "🐉"];

/**
 * Hero-zone learning-companion module on the homepage.
 * - Logged-in user with active pet → real pet, breathing/blinking
 * - Guest or no pet → animated demo egg with adoption CTA
 * Designed to be the FIRST emotional anchor a visitor sees.
 */
export function CompanionHero() {
  const tbi = useTBi();
  const [user, setUser] = useState<User | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [sp, setSp] = useState<Species | null>(null);
  const [hover, setHover] = useState(false);
  const [tickEmoji, setTickEmoji] = useState(0); // demo egg cycle

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setPet(null); return; }
    (async () => {
      const { data } = await supabase.rpc("get_my_active_pet");
      const p = (Array.isArray(data) ? data[0] : data) as Pet | undefined;
      if (!p) return;
      setPet(p);
      const { data: s } = await supabase.from("pet_species")
        .select("id,emoji_egg,emoji_baby,emoji_adult,emoji_legend")
        .eq("id", p.species_id).maybeSingle();
      if (s) setSp(s as Species);
    })();
  }, [user]);

  // demo egg evolution preview (cycle through stages every 2.5s)
  useEffect(() => {
    if (pet) return;
    const id = window.setInterval(() => setTickEmoji((x) => (x + 1) % DEMO_EMOJIS.length), 2500);
    return () => window.clearInterval(id);
  }, [pet]);

  const realEmoji = pet && sp
    ? [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][pet.stage] ?? sp.emoji_baby
    : null;
  const emoji = realEmoji ?? DEMO_EMOJIS[tickEmoji];
  const isGuest = !pet;
  const to = isGuest ? (user ? "/pets" : "/auth?next=/pets") : "/pets";

  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={tbi("我的学习伙伴")}
      className="group relative mb-6 grid grid-cols-[auto,1fr,auto] items-center gap-4 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-amber-400/10 p-5 shadow-tile transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_hsl(280_70%_45%/0.45)] md:p-7"
    >
      {/* Decorative orbs */}
      <span className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-amber-300/30 blur-3xl" />
      <span className="pointer-events-none absolute -left-12 -bottom-16 size-44 rounded-full bg-gradient-to-tr from-indigo-400/30 to-sky-300/20 blur-3xl" />

      {/* Pet stage with breathing + bounce on hover */}
      <div className="relative grid size-24 place-items-center md:size-28">
        <span className="absolute inset-0 animate-pulse rounded-full bg-white/40 blur-xl" />
        <div
          className="relative text-6xl leading-none transition-transform duration-500 md:text-7xl"
          style={{
            animation: hover
              ? "bounce 0.6s ease-in-out infinite"
              : "breathe 3s ease-in-out infinite",
          }}
        >
          {emoji}
        </div>
        <style>{`
          @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        `}</style>
      </div>

      <div className="relative min-w-0">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="size-3" /> <X>你的学习伙伴</X>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold leading-tight md:text-3xl">
          {pet ? (
            <span>
              <span className="bg-gradient-to-r from-fuchsia-600 to-amber-500 bg-clip-text text-transparent">{pet.nickname}</span>
              <span className="text-foreground"> </span>
              <X>正在等你来开口</X>
            </span>
          ) : (
            <X>遇见你的英语学习伙伴</X>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {pet
            ? <X>说一句英文，喂一颗星币 · 一起从蛋蛋长成传说</X>
            : <X>陪你说每一句英文 · 答对喂它 · 看它从蛋蛋长成传说</X>}
        </p>
      </div>

      <div className="relative hidden shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background transition group-hover:scale-105 sm:inline-flex">
        {pet ? <X>去看它</X> : <X>领养它</X>} <ArrowRight className="size-4" />
      </div>
    </Link>
  );
}

export default CompanionHero;
