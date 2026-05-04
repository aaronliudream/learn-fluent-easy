import { Link } from "react-router-dom";
import { ArrowRight, Mic, Sparkles, Trophy, Globe2, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { BrandLockup } from "@/components/brand/BrandLogo";

/**
 * Landing page for cold/global traffic.
 *
 * Goals (per audit):
 *  - Above-the-fold value prop + primary CTA in <1s
 *  - Trust signals (learner count, ratings, country reach)
 *  - 3 feature pillars matching real product modules
 *  - Emotional hook (streak + XP demo) using the Duolingo "arcade bubble"
 *    visual language we picked in the prototype review.
 *
 * Logged-in users never see this — Index.tsx routes them straight to the
 * existing study hub.
 */
export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[#F2F9FF] text-[#1E2B4D] antialiased">
      {/* ======================== NAV ======================== */}
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-5 md:px-8 md:py-7">
        <BrandLockup size={40} />
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="hidden font-bold uppercase tracking-wider md:inline-flex">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-xl border-2 border-[#009BD6] bg-[#00C4FF] font-extrabold uppercase tracking-wider text-white shadow-[0_4px_0_#009BD6] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_#009BD6]"
          >
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </nav>

      {/* ======================== HERO ======================== */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-8 md:grid-cols-2 md:gap-16 md:px-8 md:pb-24 md:pt-12">
        {/* Copy */}
        <div className="flex flex-col gap-7">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-[#00C4FF]/25 bg-[#00C4FF]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009BD6]">
            <span className="block size-2 animate-pulse rounded-full bg-[#FF7A00]" />
            <Globe2 className="size-3.5" /> Live in 184 countries
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Speak English like<br className="hidden md:block" /> you&apos;re winning a game.
          </h1>

          <p className="max-w-[46ch] text-pretty text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
            Bite-sized lessons, instant speaking feedback, and streaks that
            actually stick. Five minutes a day is all you need to start.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/placement"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#D66600] bg-[#FF7A00] px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-[0_8px_0_#D66600] transition-all hover:brightness-110 active:translate-y-[6px] active:shadow-[0_2px_0_#D66600] md:text-lg"
            >
              Start free <ArrowRight className="size-5" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-extrabold uppercase tracking-widest text-[#1E2B4D] shadow-[0_8px_0_#E2E8F0] transition-all hover:bg-slate-50 active:translate-y-[6px] active:shadow-[0_2px_0_#E2E8F0] md:text-lg"
            >
              I have an account
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-4 flex items-center gap-5 border-t-2 border-slate-200/70 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-11 overflow-hidden rounded-full border-[3px] border-[#F2F9FF] bg-slate-200"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i * 12}`}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              ))}
              <div className="grid size-11 place-items-center rounded-full border-[3px] border-[#F2F9FF] bg-[#00C4FF] text-[10px] font-black text-white">
                +14M
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-0.5 text-[#FF7A00]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                4.9 average rating
              </span>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto aspect-square w-full max-w-[480px] md:ml-auto">
          <div className="absolute inset-12 rounded-full bg-[#00C4FF]/30 blur-[80px]" />

          {/* App-frame mockup */}
          <div className="absolute inset-4 rotate-3 rounded-[3rem] border-[6px] border-slate-100 bg-white p-5 shadow-[0_24px_0_#E2E8F0] transition-transform duration-500 hover:rotate-0">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-3 w-12 rounded-full bg-slate-200" />
                <div className="h-3 w-7 rounded-full bg-slate-200" />
              </div>
              <div className="rounded-full border-2 border-[#00C4FF]/20 bg-[#00C4FF]/10 px-3 py-1 text-[10px] font-black text-[#009BD6]">
                Unit 04
              </div>
            </div>
            <div className="flex h-[calc(100%-40px)] flex-col gap-3 rounded-[2rem] border-4 border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white p-3">
                <div className="grid size-9 place-items-center rounded-xl bg-[#00C4FF]/10 text-[#009BD6]">
                  <Mic className="size-4" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-2 w-1/2 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="flex-1 rounded-2xl border-2 border-slate-100 bg-white p-3">
                <div className="mb-3 h-2.5 w-1/3 rounded-full bg-slate-200" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 rounded-xl border-2 border-[#00C4FF]/20 bg-[#00C4FF]/10" />
                  <div className="h-9 rounded-xl bg-slate-100" />
                  <div className="h-9 rounded-xl bg-slate-100" />
                  <div className="h-9 rounded-xl bg-slate-100" />
                </div>
              </div>
              <button className="rounded-2xl border-b-4 border-[#00B343] bg-[#00E054] py-2.5 text-xs font-black uppercase tracking-widest text-white">
                Check
              </button>
            </div>
          </div>

          {/* Floating XP */}
          <div className="absolute -left-4 top-[18%] -rotate-6 rounded-3xl border-4 border-[#00B343] bg-[#00E054] p-4 text-white shadow-[0_12px_0_#00B343] md:-left-8">
            <div className="text-3xl font-black leading-none">+15</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-widest opacity-90">
              Daily XP
            </div>
          </div>

          {/* Floating streak */}
          <div className="absolute -right-2 bottom-[18%] rotate-12 rounded-3xl border-4 border-slate-100 bg-white p-4 shadow-[0_12px_0_#E2E8F0] md:-right-4">
            <div className="text-3xl font-black leading-none text-[#FF7A00]">42</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Day streak
            </div>
          </div>
        </div>
      </section>

      {/* ======================== FEATURE PILLARS ======================== */}
      <section className="mx-auto max-w-[1280px] px-5 pb-20 md:px-8 md:pb-28">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight md:text-4xl">
          Built to make English <span className="text-[#00C4FF]">stick</span>.
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Pillar
            n={1}
            color="#00C4FF"
            soft="#00C4FF"
            icon={<Sparkles className="size-7" />}
            title="Smart bite-sized lessons"
            desc="Spaced-repetition quizzes, vocab bento and reading passages tuned to your CEFR level."
          />
          <Pillar
            n={2}
            color="#FF7A00"
            soft="#FF7A00"
            icon={<Mic className="size-7" />}
            title="Speak with AI, instantly"
            desc="Press, talk, get scored. No classroom, no judgment — just real-time pronunciation feedback."
          />
          <Pillar
            n={3}
            color="#00B343"
            soft="#00E054"
            icon={<Trophy className="size-7" />}
            title="Streaks that you'll defend"
            desc="Adopt a study companion, climb leaderboards, unlock daily rewards. Miss a day and they'll notice."
          />
        </div>
      </section>

      {/* ======================== CTA STRIP ======================== */}
      <section className="mx-auto max-w-[1280px] px-5 pb-20 md:px-8 md:pb-28">
        <div className="overflow-hidden rounded-[2.5rem] border-4 border-slate-100 bg-white p-8 shadow-[0_12px_0_#E2E8F0] md:p-14">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#FF7A00]/25 bg-[#FF7A00]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#D66600]">
              <Zap className="size-3.5" /> Free forever to start
            </div>
            <h2 className="max-w-2xl text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              Take the 3-minute placement test.
            </h2>
            <p className="max-w-xl text-pretty text-base text-slate-600 md:text-lg">
              We&apos;ll map your CEFR level and build a personal path — beginner,
              career English, or exam prep. No credit card.
            </p>
            <Link
              to="/placement"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#D66600] bg-[#FF7A00] px-10 py-5 text-base font-black uppercase tracking-widest text-white shadow-[0_8px_0_#D66600] transition-all hover:brightness-110 active:translate-y-[6px] active:shadow-[0_2px_0_#D66600] md:text-lg"
            >
              Find my level <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="border-t border-slate-200/70 bg-white/40">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-5 py-8 text-xs font-bold uppercase tracking-widest text-slate-400 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Big Moon English</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-[#1E2B4D]">Privacy</Link>
            <Link to="/terms" className="hover:text-[#1E2B4D]">Terms</Link>
            <Link to="/disclaimer" className="hover:text-[#1E2B4D]">Disclaimer</Link>
            <Link to="/auth" className="hover:text-[#1E2B4D]">Sign in</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Pillar({
  n,
  color,
  soft,
  icon,
  title,
  desc,
}: {
  n: number;
  color: string;
  soft: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[2.5rem] border-4 border-slate-100 bg-white p-7 shadow-[0_12px_0_#E2E8F0] transition-transform hover:-translate-y-1">
      <div
        className="mb-6 grid size-14 -rotate-3 place-items-center rounded-2xl border-2"
        style={{ borderColor: `${soft}33`, backgroundColor: `${soft}1A`, color }}
      >
        {icon}
      </div>
      <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        Pillar 0{n}
      </div>
      <h3 className="mb-2 text-xl font-extrabold leading-tight text-[#1E2B4D]">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}