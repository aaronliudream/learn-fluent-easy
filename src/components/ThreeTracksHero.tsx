import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Three-track entry section shown at the very top of the homepage.
 * Maps the three primary user intents (exam / career / beginner) to existing modules.
 * Uses brand gradients (violet → magenta → coral) on the warm-paper canvas.
 */
const ALL_TRACKS = [
  {
    to: "/levels",
    cefr: "CEFR Pre-A1 — A2",
    zh: "系统学习课程",
    en: "Structured Course",
    gradient: "linear-gradient(160deg, #F47C45 0%, #F59E0B 100%)",
    btnTextColor: "#F47C45",
    chinaOnly: false,
  },
  {
    to: "/workplace",
    cefr: "CEFR B1 — C1",
    zh: "职场英语",
    en: "Career Track",
    gradient: "linear-gradient(160deg, #ED3F8C 0%, #F47C45 100%)",
    btnTextColor: "#ED3F8C",
    badge: "热门",
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
            className={`group relative flex flex-col rounded-2xl p-4 text-white shadow-tile transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(0,0,0,0.35)] md:p-5 ${
              i === 1 ? "md:scale-[1.03]" : ""
            }`}
            style={{ background: tr.gradient }}
          >
            {tr.badge && (
              <span className="absolute -top-2 right-4 rounded-full bg-[hsl(var(--brand-amber))] px-2 py-0.5 text-[9px] font-bold text-[#1d2233]">
                <T>{tr.badge}</T>
              </span>
            )}
            <div className="text-[9px] font-mono uppercase tracking-[0.18em] opacity-75">
              {tr.cefr}
            </div>
            <h3 className="mt-1 flex items-center justify-between gap-2 text-lg font-extrabold leading-tight">
              <T>{tr.zh}</T>
              <ArrowRight className="size-4 shrink-0 opacity-70 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75">
              {tr.en}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}