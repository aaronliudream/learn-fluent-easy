import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { T, useT } from "@/i18n/T";

/**
 * Three-track entry section shown at the very top of the homepage.
 * Maps the three primary user intents (exam / career / beginner) to existing modules.
 * Uses brand gradients (violet → magenta → coral) on the warm-paper canvas.
 */
const tracks = [
  {
    to: "/levels",
    cefr: "CEFR Pre-A1 — A2",
    zh: "零基础起步",
    en: "Beginner Track",
    desc: "大字体 · 语音主导 · 每课 5 分钟。",
    bullets: ["拼读发音领读", "强制复习上一课", "生活场景为主"],
    gradient: "linear-gradient(160deg, #F47C45 0%, #F59E0B 100%)",
    btnTextColor: "#F47C45",
  },
  {
    to: "/workplace",
    cefr: "CEFR B1 — C1",
    zh: "职场英语",
    en: "Career Track",
    desc: "采购 / 会议 / 谈判 / 邮件 — 场景定制。",
    bullets: ["职业角色分流", "AI 角色扮演对话", "邮件 / 报告改写"],
    gradient: "linear-gradient(160deg, #ED3F8C 0%, #F47C45 100%)",
    btnTextColor: "#ED3F8C",
    badge: "热门",
  },
  {
    to: "/china",
    cefr: "CEFR A2 — B2",
    zh: "中国学生专区",
    en: "China Students",
    desc: "小学 · 初中 · 高中 · 高考 — 校内同步 + 考点突破。",
    bullets: ["按学段精准提分", "历年真题 + 80% 掌握解锁", "错题间隔重复"],
    gradient: "linear-gradient(160deg, #7B3FF1 0%, #5B2BC9 100%)",
    btnTextColor: "#7B3FF1",
  },
];

export default function ThreeTracksHero() {
  const t = useT();
  return (
    <section className="mb-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          <T>你今天想学什么？</T>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          <T>三条路径 · 一样的科学诊断</T> — Beginner · Career · China
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tracks.map((tr, i) => (
          <Link
            key={tr.to}
            to={tr.to}
            className={`group relative flex flex-col rounded-3xl p-6 text-white shadow-tile transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(0,0,0,0.35)] md:p-7 ${
              i === 1 ? "md:scale-[1.03]" : ""
            }`}
            style={{ background: tr.gradient }}
          >
            {tr.badge && (
              <span className="absolute -top-2 right-6 rounded-full bg-[hsl(var(--brand-amber))] px-2.5 py-0.5 text-[10px] font-bold text-[#1d2233]">
                <T>{tr.badge}</T>
              </span>
            )}
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-75">
              {tr.cefr}
            </div>
            <h3 className="mt-2 text-2xl font-extrabold"><T>{tr.zh}</T></h3>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {tr.en}
            </p>
            <p className="mt-4 text-sm leading-relaxed opacity-95"><T>{tr.desc}</T></p>
            <ul className="mt-4 mb-6 flex-1 space-y-1.5 text-sm opacity-90">
              {tr.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-white/80" />
                  <span><T>{b}</T></span>
                </li>
              ))}
            </ul>
            <span
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-sm font-bold transition group-hover:bg-white/90"
              style={{ color: tr.btnTextColor }}
            >
              <T>开始诊断</T> <ArrowRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}