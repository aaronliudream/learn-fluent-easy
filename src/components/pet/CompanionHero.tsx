import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Flame, Star } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { X, useTBi } from "@/i18n/T";
import { cn } from "@/lib/utils";

type Pet = { id: string; nickname: string; stage: number; level: number; exp: number; hunger: number; species_id: string };
type Species = { id: string; emoji_egg: string; emoji_baby: string; emoji_adult: string; emoji_legend: string };

const DEMO_EMOJIS = ["🥚", "🐣", "🦊", "🐉"];
const DEMO_LABELS = ["Egg", "Baby", "Teen", "Legend"];

/**
 * Hero-zone learning-companion module on the homepage.
 * Three states:
 *  1) Logged-in WITH active pet → real pet, name, stage, hunger, CTA "Visit"
 *  2) Logged-in WITHOUT pet → demo egg cycle, CTA "Adopt"
 *  3) Guest → demo egg cycle, CTA "Sign in to adopt"
 * Designed to be the first emotional anchor a visitor sees.
 */
export function CompanionHero() {
  const tbi = useTBi();
  const [user, setUser] = useState<User | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [sp, setSp] = useState<Species | null>(null);
  const [tickEmoji, setTickEmoji] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fetchedForUser = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) { setPet(null); setSp(null); fetchedForUser.current = null; return; }
    if (fetchedForUser.current === user.id) return;
    fetchedForUser.current = user.id;
    let mounted = true;
    (async () => {
      const { data } = await supabase.rpc("get_my_active_pet");
      if (!mounted) return;
      const p = (Array.isArray(data) ? data[0] : data) as Pet | undefined;
      if (!p) { setPet(null); return; }
      setPet(p);
      const { data: s } = await supabase.from("pet_species")
        .select("id,emoji_egg,emoji_baby,emoji_adult,emoji_legend")
        .eq("id", p.species_id).maybeSingle();
      if (mounted && s) setSp(s as Species);
    })();
    return () => { mounted = false; };
  }, [user]);

  // Demo egg cycle for guests / no-pet users
  useEffect(() => {
    if (pet || reduceMotion) return;
    const id = window.setInterval(() => setTickEmoji((x) => (x + 1) % DEMO_EMOJIS.length), 2500);
    return () => window.clearInterval(id);
  }, [pet, reduceMotion]);

  const realEmoji = pet && sp
    ? [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][pet.stage] ?? sp.emoji_baby
    : null;
  const emoji = realEmoji ?? DEMO_EMOJIS[tickEmoji];
  const stageLabel = pet ? DEMO_LABELS[pet.stage] ?? "Companion" : DEMO_LABELS[tickEmoji];

  // CTA target: Pets page handles auth gate itself, so always go there.
  const to = "/pets";
  const ctaKey = pet ? "去看它" : (user ? "立即领养" : "登录领养");

  return (
    <Link
      to={to}
      aria-label={tbi("我的学习伙伴")}
      className="group relative mb-6 grid grid-cols-[auto,1fr] items-center gap-4 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-amber-400/10 p-5 shadow-tile transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_hsl(280_70%_45%/0.45)] sm:grid-cols-[auto,1fr,auto] md:p-7"
    >
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-amber-300/30 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -left-12 -bottom-16 size-44 rounded-full bg-gradient-to-tr from-indigo-400/30 to-sky-300/20 blur-3xl" />

      {/* Pet avatar */}
      <div className="relative grid size-20 place-items-center sm:size-24 md:size-28">
        <span aria-hidden className="absolute inset-0 rounded-full bg-white/40 blur-xl" />
        <div
          className={cn(
            "relative text-5xl leading-none sm:text-6xl md:text-7xl",
            !reduceMotion && "animate-companion-breathe group-hover:animate-bounce",
          )}
        >
          {emoji}
        </div>
        {/* stage chip */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground shadow">
          {stageLabel}
        </div>
      </div>

      {/* Copy */}
      <div className="relative min-w-0">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="size-3" /> <X>你的学习伙伴</X>
        </div>
        <h2 className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl">
          {pet ? (
            <>
              <span className="bg-gradient-to-r from-fuchsia-600 to-amber-500 bg-clip-text text-transparent">{pet.nickname}</span>{" "}
              <X>正在等你来开口</X>
            </>
          ) : (
            <X>遇见你的英语学习伙伴</X>
          )}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground md:text-base">
          {pet
            ? <X>说一句英文，喂一颗星币 · 一起从蛋蛋长成传说</X>
            : <X>陪你说每一句英文 · 答对喂它 · 看它从蛋蛋长成传说</X>}
        </p>
        {pet && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
              <Star className="size-3.5 fill-current" /> Lv.{pet.level}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-rose-500">
              <Flame className="size-3.5" /> {pet.hunger}/100
            </span>
          </div>
        )}
      </div>

      {/* CTA pill */}
      <div className="relative col-span-2 mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background transition group-hover:scale-105 sm:col-span-1 sm:mt-0">
        <X>{ctaKey}</X> <ArrowRight className="size-4" />
      </div>
    </Link>
  );
}

export default CompanionHero;
