import { T } from "@/i18n/T";import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { X, useTBi } from "@/i18n/T";
import { cn } from "@/lib/utils";
import { useCompanionMode } from "@/lib/companionPrefs";
import { useI18n } from "@/i18n/I18nProvider";
import { displayPetName } from "@/lib/petName";

type Pet = {id: string;nickname: string;stage: number;level: number;exp: number;hunger: number;species_id: string;};
type Species = {id: string;emoji_egg: string;emoji_baby: string;emoji_adult: string;emoji_legend: string;};
type Reco = {total_due: number;weakest_module: string | null;};

const DEMO_EMOJIS = ["🥚", "🐣", "🦊", "🐉"];

/**
 * Compact companion strip on the homepage.
 * Visual weight is INTENTIONALLY LOWER than the Today's Task card below it —
 * the companion's job is to *deliver* the next action, not steal it.
 */
export function CompanionHero() {
  const tbi = useTBi();
  const { lang } = useI18n();
  const { animate } = useCompanionMode();
  const [user, setUser] = useState<User | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [sp, setSp] = useState<Species | null>(null);
  const [reco, setReco] = useState<Reco | null>(null);
  const [tickEmoji, setTickEmoji] = useState(0);
  const fetchedForUser = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => {mounted = false;subscription.unsubscribe();};
  }, []);

  useEffect(() => {
    if (!user) {setPet(null);setSp(null);setReco(null);fetchedForUser.current = null;return;}
    if (fetchedForUser.current === user.id) return;
    fetchedForUser.current = user.id;
    let mounted = true;
    (async () => {
      const [{ data: petData }, { data: recoData }] = await Promise.all([
      supabase.rpc("get_my_active_pet"),
      supabase.rpc("get_today_recommendations")]
      );
      if (!mounted) return;
      const p = (Array.isArray(petData) ? petData[0] : petData) as Pet | undefined;
      const r = (Array.isArray(recoData) ? recoData[0] : recoData) as Reco | undefined;
      if (r) setReco(r);
      if (!p) {setPet(null);return;}
      setPet(p);
      const { data: s } = await supabase.from("pet_species").
      select("id,emoji_egg,emoji_baby,emoji_adult,emoji_legend").
      eq("id", p.species_id).maybeSingle();
      if (mounted && s) setSp(s as Species);
    })();
    return () => {mounted = false;};
  }, [user]);

  useEffect(() => {
    if (pet || !animate) return;
    const id = window.setInterval(() => setTickEmoji((x) => (x + 1) % DEMO_EMOJIS.length), 2500);
    return () => window.clearInterval(id);
  }, [pet, animate]);

  const realEmoji = pet && sp ?
  [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][pet.stage] ?? sp.emoji_baby :
  null;
  const emoji = realEmoji ?? DEMO_EMOJIS[tickEmoji];

  // Companion's spoken line — varies by user state
  let line: string;
  if (!user) line = tbi("我在等你 — 登录后我们一起开始 💛");else
  if (!pet) line = tbi("先选一个伙伴吧，我会陪你练每一句英文 ✨");else
  if (reco && reco.total_due > 0) line = tbi(`今天有 ${reco.total_due} 个复习在等我们 — 一起完成？`);else
  line = tbi(`${displayPetName(pet, lang)} 想和你练 5 个新单词 ✨`);

  const ctaTo = pet ? "/pets" : user ? "/pets" : "/auth";
  const ctaLabel = pet ? "去看它" : user ? "立即领养" : "登录领养";

  return (
    <Link
      to={ctaTo}
      aria-label={tbi("我的学习伙伴")}
      className="group relative mb-3 flex items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card px-4 py-2.5 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      
      <div className="relative grid size-10 place-items-center sm:size-12">
        <div className={cn("text-3xl leading-none sm:text-4xl", animate && "animate-companion-breathe")}>
          {emoji}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <Sparkles className="size-3 text-primary" /> <X><T>学习伙伴</T></X>
          {pet && <span className="text-primary">· Lv.{pet.level}</span>}
        </div>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-foreground sm:text-sm">
          {line}
        </p>
      </div>
      <div className="hidden items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-bold text-background transition group-hover:scale-105 sm:inline-flex">
        <X>{ctaLabel}</X> <ArrowRight className="size-3.5" />
      </div>
    </Link>);

}

export default CompanionHero;