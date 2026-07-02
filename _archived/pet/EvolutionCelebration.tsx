import { useEffect, useState } from "react";
import { fireConfetti } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { T, useT } from "@/i18n/T";

type Detail = {
  kind: "evolve" | "levelup";
  emoji?: string;
  prevEmoji?: string;
  title?: string;
  subtitle?: string;
};

/**
 * 全屏庆祝层：进化 / 升级时由 `pet:celebrate` 事件唤起。
 * 进化：5 秒大型庆典 + confetti（celebrate 强度）+ emoji 蜕变
 * 升级：2.5 秒轻量庆典 + confetti（normal）
 */
export function EvolutionCelebration() {
  const t = useT();
  const [d, setD] = useState<Detail | null>(null);
  const [phase, setPhase] = useState<"in" | "show" | "out">("in");

  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent).detail as Detail | undefined;
      if (!detail) return;
      setD(detail);
      setPhase("in");
      fireConfetti(detail.kind === "evolve" ? "celebrate" : "normal");
      const total = detail.kind === "evolve" ? 4500 : 2200;
      const t1 = window.setTimeout(() => setPhase("show"), 60);
      const t2 = window.setTimeout(() => setPhase("out"), total - 400);
      const t3 = window.setTimeout(() => setD(null), total);
      return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
    };
    window.addEventListener("pet:celebrate", onEvt);
    return () => window.removeEventListener("pet:celebrate", onEvt);
  }, []);

  if (!d) return null;
  const isEvolve = d.kind === "evolve";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm transition-opacity duration-300",
        phase === "out" ? "opacity-0" : "opacity-100"
      )}
      onClick={() => setD(null)}
      role="dialog"
      aria-live="polite"
    >
      <div
        className={cn(
          "relative mx-6 max-w-sm rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 p-8 text-center text-white shadow-2xl transition-all duration-500",
          phase === "in" ? "scale-90 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/80">
          {isEvolve ? "EVOLUTION" : "LEVEL UP"}
        </div>
        <div className="mt-3 flex items-end justify-center gap-3">
          {isEvolve && d.prevEmoji && (
            <>
              <span className="text-5xl opacity-60 grayscale">{d.prevEmoji}</span>
              <span className="pb-2 text-3xl">→</span>
            </>
          )}
          <span
            className={cn(
              "text-7xl drop-shadow-2xl",
              isEvolve ? "animate-bounce" : "animate-pop-bounce"
            )}
            style={
              isEvolve
                ? { filter: "drop-shadow(0 0 24px rgba(255,255,255,0.8))" }
                : undefined
            }
          >
            {d.emoji ?? "✨"}
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold drop-shadow">
          {d.title ?? (isEvolve ? t("进化啦！") : t("升级！"))}
        </h2>
        {d.subtitle && (
          <p className="mt-1 text-sm font-bold text-white/90">{d.subtitle}</p>
        )}
        <button
          className="mt-5 rounded-full bg-white/20 px-5 py-1.5 text-xs font-extrabold backdrop-blur hover:bg-white/30"
          onClick={(e) => { e.stopPropagation(); setD(null); }}
        >
          <T>继续 →</T>
        </button>
      </div>
    </div>
  );
}

export function celebratePet(detail: Detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pet:celebrate", { detail }));
}

export default EvolutionCelebration;