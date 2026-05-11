import { T } from "@/i18n/T";import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLogo";

/**
 * Big Moon CET — sub-brand landing for the College English Test (CET-4) line.
 * Currently in development. We surface a clean "coming soon" page with email
 * waitlist intent (mailto) so the route exists and the brand hub can link to it.
 * Visual tone: 灰金 (pewter + gold) — mature & professional.
 */
export default function Cet() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#1A1D24] via-[#22262F] to-[#2C2A24] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60 hover:text-white">
          
          <ArrowLeft className="size-4" /> Home
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          <BrandLockup size={56} />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C8A95B]/40 bg-[#C8A95B]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#E6C879]">
            <Sparkles className="size-3.5" /> <T>Big Moon CET · 大学四级</T>
          </div>
          <h1 className="mt-6 font-serif text-4xl font-extrabold leading-tight md:text-6xl">
            <T>CET-4 备考，</T><span className="text-[#E6C879]"><T>即将上线</T></span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            <T>成熟、专业、为大学生量身打造的大学英语四级（CET-4）训练系统：
            真题词汇、长篇阅读、听力短对话、翻译写作 + AI 评分讲解。</T>
          </p>
          <a
            href="mailto:support@bigmoonenglish.com?subject=CET-4%20Waitlist"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C8A95B] px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#1A1D24] transition hover:bg-[#E6C879]">
            <T>加入等待名单</T>
          
          </a>
          <div className="mt-3 text-xs text-white/40">
            <T>上线后第一时间通知 · support@bigmoonenglish.com</T>
          </div>
        </header>
      </div>
    </main>);

}