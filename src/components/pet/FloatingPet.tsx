import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings2, X as XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useCompanionMode, type CompanionMode } from "@/lib/companionPrefs";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { displayPetName } from "@/lib/petName";
import { useDraggable } from "@/hooks/useDraggable";

type Pet = { id: string; nickname: string; stage: number; level: number; exp: number; hunger: number; mood: number; species_id: string; equipped_skin_id?: string | null };
type Species = { id: string; emoji_egg: string; emoji_baby: string; emoji_adult: string; emoji_legend: string };


function pickEmoji(p: Pet, sp?: Species) {
  if (!sp) return "🐣";
  return [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][p.stage] ?? sp.emoji_baby;
}

const HIDDEN_KEY = "bme_companion_hidden";

/**
 * Floating learning companion (bottom-right).
 * - Warm, non-punitive copy: "她在等你练习" instead of "I'm hungry".
 * - Three intensity modes (quiet / standard / focus) and a hide toggle.
 * - Honors prefers-reduced-motion (WCAG 2.2.2).
 */
export function FloatingPet() {
  const t = useT();
  const { lang } = useI18n();
  const { mode, setMode, animate, showHungerAlert } = useCompanionMode();
  // v2: 旧 key 里可能存着用户拖到屏幕中段的偏移,换 key 让定位回到默认右下
  const drag = useDraggable("bme_pet_pos_v2");
  const [pet, setPet] = useState<Pet | null>(null);
  const [sp, setSp] = useState<Species | null>(null);
  const [skinFilter, setSkinFilter] = useState<string>("");
  const [react, setReact] = useState<null | { kind: string; coins?: number; id: number }>(null);
  const [authState, setAuthState] = useState<"loading" | "guest" | "authed">("loading");
  const [demoTick, setDemoTick] = useState(0);
  const [openSettings, setOpenSettings] = useState(false);
  const [hidden, setHidden] = useState<boolean>(() =>
    typeof window !== "undefined" && localStorage.getItem(HIDDEN_KEY) === "1"
  );
  const lastFetchRef = useRef(0);

  const refresh = async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 30000) return;
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
    if (p.equipped_skin_id) {
      const { data: sk } = await (supabase as any).from("pet_skins")
        .select("css_filter").eq("id", p.equipped_skin_id).maybeSingle();
      setSkinFilter((sk as any)?.css_filter || "");
    } else setSkinFilter("");
  };

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      lastFetchRef.current = 0;
      refresh();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pet || !animate) return;
    const id = window.setInterval(() => setDemoTick((x) => (x + 1) % 4), 2500);
    return () => window.clearInterval(id);
  }, [pet, animate]);

  useEffect(() => {
    const onReact = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      setReact({ kind: d.kind, coins: d.coins, id: Date.now() });
      window.setTimeout(() => setReact(null), 1600);
      if (d.kind === "correct" || d.kind === "happy" || d.kind === "flash") refresh();
    };
    window.addEventListener("pet:react", onReact);
    return () => window.removeEventListener("pet:react", onReact);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hidden by user → render only a tiny restore chip
  if (hidden) {
    return (
      <button
        onClick={() => { localStorage.removeItem(HIDDEN_KEY); setHidden(false); }}
        aria-label={t("显示学习伙伴")}
        className="fixed right-3 z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+250px)] grid size-9 place-items-center rounded-full border border-border/60 bg-card/80 text-base shadow-md backdrop-blur transition hover:scale-105 lg:right-4"
      >
        🐾
      </button>
    );
  }

  const hideAll = () => { localStorage.setItem(HIDDEN_KEY, "1"); setHidden(true); setOpenSettings(false); };

  // Settings popover (shared)
  const SettingsPopover = (
    openSettings && (
      <div
        role="dialog"
        aria-label={t("伙伴设置")}
        className="absolute bottom-full right-0 mb-2 w-56 rounded-2xl border border-border bg-card p-3 text-left shadow-2xl"
        onClick={(e) => e.preventDefault()}
      >
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><T>伙伴模式</T></div>
        <div className="space-y-1">
          {([
            ["quiet", "🤫 安静模式", "无动画、无主动提醒"],
            ["standard", "🌿 标准模式", "平衡的陪伴感"],
            ["focus", "🔥 关注模式", "更频繁的鼓励反馈"],
          ] as [CompanionMode, string, string][]).map(([k, label, hint]) => (
            <button
              key={k}
              onClick={(e) => { e.preventDefault(); setMode(k); }}
              className={cn(
                "w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                mode === k ? "bg-primary/15 font-bold text-primary" : "hover:bg-muted"
              )}
            >
              <div><T>{label}</T></div>
              <div className="text-[10px] font-normal text-muted-foreground"><T>{hint}</T></div>
            </button>
          ))}
        </div>
        <div className="mt-2 border-t border-border pt-2">
          <button
            onClick={(e) => { e.preventDefault(); hideAll(); }}
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-muted"
          >
            <XIcon className="size-3.5" /> <T>完全隐藏伙伴</T>
          </button>
        </div>
      </div>
    )
  );

  // Demo (guest or authed-but-petless)
  if (!pet && authState !== "loading") {
    const demoEmojis = ["🥚", "🐣", "🦊", "🐉"];
    const isGuest = authState === "guest";
    return (
      <div
        ref={drag.ref}
        style={drag.style}
        {...drag.handlers}
        className="fixed right-3 z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+250px)] cursor-grab select-none active:cursor-grabbing lg:right-4"
      >
        {SettingsPopover}
        <Link
          to="/pets"
          onClick={(e) => { if (drag.wasDragging()) e.preventDefault(); }}
          aria-label={isGuest ? t("登录后领养你的学习伙伴") : t("领养你的学习伙伴")}
          className="group relative flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-2.5 py-1.5 shadow-lg backdrop-blur transition hover:-translate-y-0.5"
        >
          {drag.dragging && <span className="drag-wings" aria-hidden />}
          <div className={cn("text-3xl leading-none transition", animate && "animate-companion-breathe group-hover:scale-110")}>
            {demoEmojis[demoTick]}
          </div>
          <div className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-[10px] font-bold"><T>遇见伙伴</T></span>
            <span className="text-[10px] text-muted-foreground"><T>学习伙伴</T></span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setOpenSettings((v) => !v); }}
            aria-label={t("伙伴设置")}
            className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <Settings2 className="size-3" />
          </button>
        </Link>
      </div>
    );
  }
  if (!pet) return null;
  const emoji = pickEmoji(pet, sp ?? undefined);
  const petName = displayPetName(pet, lang);
  const isHappy = react?.kind === "correct" || react?.kind === "happy" || react?.kind === "flash";
  const isSad = react?.kind === "wrong";
  const isWaiting = pet.hunger < 25;

  return (
    <div
      ref={drag.ref}
      style={drag.style}
      {...drag.handlers}
      className="fixed right-3 z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+250px)] cursor-grab select-none active:cursor-grabbing lg:right-4"
    >
      {SettingsPopover}
      <Link
        to="/pets"
        onClick={(e) => { if (drag.wasDragging()) e.preventDefault(); }}
        aria-label={`${t("查看你的学习伙伴")} ${petName}`}
        className="group relative block"
      >
        {drag.dragging && <span className="drag-wings" aria-hidden />}
        <div className={cn(
          "relative flex items-end gap-1.5 rounded-full border border-border/60 bg-card/90 px-2.5 py-1.5 shadow-lg backdrop-blur transition hover:-translate-y-0.5",
          isWaiting && showHungerAlert && !react && animate && "ring-2 ring-amber-300/60",
        )}>
          <div
            className={cn(
              "text-3xl leading-none transition",
              animate && isHappy && "animate-bounce",
              isSad && "opacity-70 grayscale",
              animate && isSad && "animate-shake-x",
              !react && animate && "group-hover:scale-110",
            )}
            style={{ filter: !isSad && skinFilter ? skinFilter : undefined }}
          >
            {emoji}
          </div>
          <div className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-[10px] font-bold">{petName}</span>
            <span className="text-[10px] text-muted-foreground">Lv.{pet.level}</span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setOpenSettings((v) => !v); }}
            aria-label={t("伙伴设置")}
            className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <Settings2 className="size-3" />
          </button>
          <div className="pointer-events-none absolute inset-x-2 -bottom-0.5 h-0.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pet.hunger < 25 ? "bg-amber-400" : pet.hunger < 60 ? "bg-emerald-400" : "bg-emerald-500"
              )}
              style={{ width: `${Math.max(8, pet.hunger)}%` }}
            />
          </div>
        </div>

        {react && mode !== "quiet" && (
          <div
            key={react.id}
            className={cn(
              "pointer-events-none absolute -top-7 right-2 rounded-full px-2 py-0.5 text-[11px] font-extrabold shadow",
              react.kind === "flash" && "bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900",
              react.kind === "correct" && "bg-emerald-500 text-white",
              react.kind === "happy" && "bg-pink-500 text-white",
              react.kind === "wrong" && "bg-muted text-foreground",
              animate && react.kind === "flash" && "animate-bounce",
            )}
            style={{ animation: animate ? "xp-burst 1.4s ease-out forwards" : undefined }}
          >
            {react.kind === "flash" && `✨ +${react.coins} ${t("闪光！")}`}
            {react.kind === "correct" && `+${react.coins ?? 1} ⭐ ${t("真棒")}`}
            {react.kind === "happy" && `🎉 +${react.coins ?? 5}`}
            {react.kind === "wrong" && t("没事，再来一次 💛")}
          </div>
        )}
        {isWaiting && showHungerAlert && !react && (
          <div className={cn(
            "pointer-events-none absolute -top-7 right-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 shadow",
            animate && "animate-pulse"
          )}>
            💛 <T>在等你练习</T>
          </div>
        )}
      </Link>
    </div>
  );
}

export default FloatingPet;
