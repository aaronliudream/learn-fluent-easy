import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { AMERICAN_COURSE_NAME, AMERICAN_COURSE_PATH } from "@/lib/american/brand";

/**
 * Three-track entry section shown at the very top of the homepage.
 * Maps the three primary user intents (exam / career / beginner) to existing modules.
 * Uses brand gradients (violet → magenta → coral) on the warm-paper canvas.
 */
const ALL_TRACKS: {
  to: string;
  cefr: string;
  zh: string;
  en: string;
  gradient: string;
  btnTextColor: string;
  chinaOnly: boolean;
  badge?: string;
}[] = [
  {
    to: AMERICAN_COURSE_PATH,
    cefr: "American · 12 单元",
    zh: AMERICAN_COURSE_NAME,
    en: "American English",
    gradient: "linear-gradient(160deg, #F47C45 0%, #F59E0B 100%)",
    btnTextColor: "#F47C45",
    chinaOnly: false,
  },
  {
    to: "/china",
    cefr: "CEFR A2 — B2",
    zh: "中国学生专区",
    en: "China Students",
    gradient: "linear-gradient(160deg, #7B3FF1 0%, #5B2BC9 100%)",
    btnTextColor: "#7B3FF1",
    chinaOnly: true,
  },
];

export default function ThreeTracksHero() {
  const t = useT();
  const { lang } = useI18n();
  const isChinese = lang === "zh" || lang === "zh-TW";
  // International users don't need the "China Students" exam track — surface
  // the two universal tracks and let them grow from there. Chinese-language
  // users continue to see all three.
  const tracks = isChinese ? ALL_TRACKS : ALL_TRACKS.filter((t) => !t.chinaOnly);
  const gridCols = tracks.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-center text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
        <T>你今天想学什么？</T>
      </h2>
      <div className={`grid gap-3 ${gridCols}`}>
        {tracks.map((tr, i) => (
          <Link
            key={tr.to}
            to={tr.to}
            className={`group relative flex min-h-[120px] flex-col justify-between rounded-2xl p-5 text-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.45)] md:min-h-[148px] md:p-6 ${
              i === 1 ? "md:scale-[1.04]" : ""
            }`}
            style={{ background: tr.gradient }}
          >
            {tr.badge && (
              <span className="absolute -top-2 right-4 rounded-full bg-[hsl(var(--brand-amber))] px-2.5 py-0.5 text-[10px] font-bold text-[#1d2233] shadow-md">
                <T>{tr.badge}</T>
              </span>
            )}
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] opacity-80">
              {tr.cefr}
            </div>
            <h3 className="mt-2 flex items-center justify-between gap-2 text-2xl font-extrabold leading-tight md:text-[26px]">
              <T>{tr.zh}</T>
              <ArrowRight className="size-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest opacity-80">
              {tr.en}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}