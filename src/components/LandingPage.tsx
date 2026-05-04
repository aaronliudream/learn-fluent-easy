import { Link } from "react-router-dom";
import { ArrowRight, Mic, BookOpen, Flame, GraduationCap, Sparkles, Globe2, Quote } from "lucide-react";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { BrandLockup } from "@/components/brand/BrandLogo";

/**
 * Public landing page (cold traffic).
 *
 * Editorial / education-product tone:
 *   - cream background, deep forest text, warm orange accent
 *   - serif display + clean sans body
 *   - "show first, ask later" — placement test demoted to bottom CTA,
 *     primary action is "Explore lessons"
 */
export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[#FAF8F3] text-[#1F3A2E] antialiased">
      {/* NAV */}
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <BrandLockup size={36} />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            to="/auth"
            className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/70 hover:text-[#1F3A2E] md:inline"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-[#1F3A2E] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#FAF8F3] transition hover:bg-[#27513f]"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-[1100px] px-6 pb-20 pt-10 md:px-10 md:pb-32 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#1F3A2E]/15 bg-white/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/70">
            <Globe2 className="size-3.5" /> Learners in 30+ countries
          </div>
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
            Learn English the way<br className="hidden md:block" />
            <span className="italic text-[#E8743C]"> natives actually speak it.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-[#1F3A2E]/75 md:text-lg">
            From CEFR placement to slang, real-life scenes, and an AI talk partner —
            one structured path, from kids to adults.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/levels"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F3A2E] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#FAF8F3] transition hover:bg-[#27513f]"
            >
              Browse lessons <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/placement"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3A2E]/25 bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#1F3A2E] transition hover:bg-[#1F3A2E]/5"
            >
              Take the 3-min test
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#1F3A2E]/55">
            No sign-up needed.{" "}
            <a href="#whats-inside" className="font-bold text-[#1F3A2E] underline-offset-4 hover:underline">
              See what&apos;s inside ↓
            </a>
          </p>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section id="whats-inside" className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/50">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
                01 — What&apos;s inside
              </div>
              <h2 className="max-w-xl font-serif text-3xl font-medium leading-tight md:text-5xl">
                Four ways to actually <span className="italic">use</span> English.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#1F3A2E]/65">
              Every module works on its own — pick what you need today, or follow
              the full path from A1 to C2.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FeatureCard
              to="/levels"
              eyebrow="Structured Path"
              title="CEFR Levels A1 → C2"
              desc="Six levels, units and short lessons. Vocabulary, grammar, reading and listening all in one path."
              icon={<BookOpen className="size-5" />}
            />
            <FeatureCard
              to="/talk"
              eyebrow="Speaking"
              title="AI Talk Partner"
              desc="Press to talk, get instant pronunciation feedback. Practice meetings, interviews, daily chat — anytime."
              icon={<Mic className="size-5" />}
            />
            <FeatureCard
              to="/scenes"
              eyebrow="Real Life"
              title="Real-world Scenes"
              desc="Airport, café, doctor, job interview. 100+ situational dialogues you can rehearse out loud."
              icon={<Sparkles className="size-5" />}
            />
            <FeatureCard
              to="/slang"
              eyebrow="Modern English"
              title="Slang & Native Phrases"
              desc='From "lowkey" to "it\u2019s giving" — the words people actually use on TikTok, Reddit and at work.'
              icon={<Flame className="size-5" />}
            />
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              02 — Who it&apos;s for
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              Built for kids, students <span className="italic">and</span> grown-ups.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Audience
              tag="Kids · 8–14"
              title="A friendlier alternative to tutoring."
              points={[
                "Phonics, sight words, short readings",
                "Game-style XP and daily streaks",
                "Parent dashboard to track progress",
              ]}
              link="/primary"
            />
            <Audience
              tag="Teens · 中考 / 高考"
              title="Exam-ready, without the cram drill."
              points={[
                "Reading, cloze, grammar, listening",
                "Mistake book auto-built as you study",
                "AI explainer for every wrong answer",
              ]}
              link="/gaokao"
            />
            <Audience
              tag="Adults · Work & Life"
              title="Speak up in meetings, emails, travel."
              points={[
                "Workplace scenes & email patterns",
                "Slang to keep up in social settings",
                "5-min sessions that fit your day",
              ]}
              link="/talk"
            />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#1F3A2E] text-[#FAF8F3]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              03 — Why people stay
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <span className="italic text-[#E8743C]">12,847</span> learners studied this week.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="My daughter actually asks to do her English now. The streak is what got her hooked."
              name="Wei L."
              role="Parent · Shanghai"
            />
            <Testimonial
              quote="I went from freezing in standups to leading them in 3 months. The AI feedback is the part nobody else has."
              name="Marisol G."
              role="PM · Mexico City"
            />
            <Testimonial
              quote="Finally an English app that doesn't feel like homework. 127-day streak and counting."
              name="Akira T."
              role="Engineer · Tokyo"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-24 text-center md:px-10 md:py-32">
          <GraduationCap className="mx-auto mb-6 size-10 text-[#E8743C]" />
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-medium leading-tight md:text-5xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-[#1F3A2E]/70">
            Take the 3-minute placement test. We&apos;ll map your level and build
            a personal path. No sign-up required.
          </p>
          <Link
            to="/placement"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-[#E8743C] px-9 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#d4632d]"
          >
            Find my level <ArrowRight className="size-4" />
          </Link>
          <div className="mt-6 text-xs text-[#1F3A2E]/50">
            Already a member?{" "}
            <Link to="/auth" className="font-bold text-[#1F3A2E] underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/40">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/55 md:flex-row md:px-10">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-[#1F3A2E]">About</Link>
            <Link to="/privacy" className="hover:text-[#1F3A2E]">Privacy</Link>
            <Link to="/terms" className="hover:text-[#1F3A2E]">Terms</Link>
            <a href="mailto:support@bigmoonenglish.com" className="hover:text-[#1F3A2E]">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  to, eyebrow, title, desc, icon,
}: { to: string; eyebrow: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:border-[#1F3A2E]/25 hover:shadow-[0_20px_50px_-25px_rgba(31,58,46,0.3)] md:p-9"
    >
      <div className="flex items-center justify-between">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#1F3A2E]/5 text-[#1F3A2E]">
          {icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/45">
          {eyebrow}
        </div>
      </div>
      <h3 className="font-serif text-2xl font-medium leading-tight md:text-3xl">{title}</h3>
      <p className="text-sm leading-relaxed text-[#1F3A2E]/65">{desc}</p>
      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#E8743C]">
        See examples <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function Audience({
  tag, title, points, link,
}: { tag: string; title: string; points: string[]; link: string }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 md:p-8">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">{tag}</div>
      <h3 className="font-serif text-xl font-medium leading-snug md:text-2xl">{title}</h3>
      <ul className="space-y-2.5 border-t border-[#1F3A2E]/10 pt-5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-[#1F3A2E]/75">
            <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-[#E8743C]" />
            {p}
          </li>
        ))}
      </ul>
      <Link
        to={link}
        className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#1F3A2E] hover:text-[#E8743C]"
      >
        See an example lesson <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <figure className="flex flex-col gap-5 rounded-3xl border border-[#FAF8F3]/15 bg-[#27513f]/40 p-7 md:p-8">
      <Quote className="size-6 text-[#E8743C]" />
      <blockquote className="text-base leading-relaxed text-[#FAF8F3]/90">
        {quote}
      </blockquote>
      <figcaption className="border-t border-[#FAF8F3]/10 pt-4">
        <div className="text-sm font-bold text-[#FAF8F3]">{name}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FAF8F3]/55">{role}</div>
      </figcaption>
    </figure>
  );
}
