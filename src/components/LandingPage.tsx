import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Brain } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import moonBg from "@/assets/moon-hero-bg.jpg";

/**
 * Big Moon English — landing page
 * 大月亮背景 Hero + 小学/初中/高中三栏卡片，编辑级简洁排版。
 */

const NAV = [
  { to: "/kids", label: "小学" },
  { to: "/junior", label: "初中" },
  { to: "/gaokao", label: "高中" },
  { to: "/about", label: "关于我们" },
];

const STAGES = [
  {
    to: "/kids",
    eyebrow: "BIG MOON KIDS",
    title: "小学",
    range: "G1 — G6",
    desc: "可爱卡通、安全感十足的英语启蒙。自然拼读、绘本朗读、AI 跟读评分。",
    gradient: "linear-gradient(160deg,#F5A26B 0%,#ED5C8E 100%)",
  },
  {
    to: "/junior",
    eyebrow: "BIG MOON JUNIOR",
    title: "初中",
    range: "G7 — G9",
    desc: "中考同步词汇、语法、阅读、听力 + AI 错题讲解，朝气向上的备考节奏。",
    gradient: "linear-gradient(160deg,#2BB7A8 0%,#0F8C8C 100%)",
  },
  {
    to: "/gaokao",
    eyebrow: "BIG MOON SENIOR",
    title: "高中",
    range: "G10 — G12 · 高考",
    desc: "高考英语全模块训练：阅读、完形、语法、词汇、听写。严肃高效，应试导向。",
    gradient: "linear-gradient(160deg,#5B6BE3 0%,#2A2F7A 100%)",
  },
];

// Pre-computed sparkle positions so they're stable across renders
const SPARKLES = Array.from({ length: 28 }).map((_, i) => {
  const size = 4 + ((i * 7) % 10);
  return {
    left: `${(i * 37) % 100}%`,
    top: `${60 + ((i * 53) % 35)}%`,
    width: `${size}px`,
    height: `${size}px`,
    duration: `${6 + ((i * 13) % 8)}s`,
    delay: `${(i * 0.45) % 7}s`,
  };
});

export default function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setParallax({ x: cx, y: cy }));
    };
    const onLeave = () => setParallax({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="min-h-dvh bg-[#FBF6EC] text-[#1A1A1A] antialiased">
      {/* ============ HERO with big moon ============ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#FBF6EC",
        }}
      >
        {/* Parallax moon/mountain background layer */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url(${moonBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(1.06) translate3d(${parallax.x * -18}px, ${parallax.y * -12}px, 0)`,
            transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {/* Subtle "breathing" glow over the moon */}
        <div
          className="absolute inset-0 animate-moon-breath will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 35%, rgba(255,220,160,0.35) 0%, rgba(255,220,160,0) 60%)",
            transform: `translate3d(${parallax.x * 24}px, ${parallax.y * 16}px, 0)`,
            transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF6EC]/30 via-transparent to-[#FBF6EC]" />

        {/* Floating sparkles rising from the mountains */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            transform: `translate3d(${parallax.x * 12}px, ${parallax.y * 8}px, 0)`,
            transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="sparkle"
              style={{
                left: s.left,
                top: s.top,
                width: s.width,
                height: s.height,
                animationDuration: s.duration,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        {/* Nav */}
        <header className="relative z-10">
          <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
            <Link to="/" className="text-lg font-extrabold tracking-tight">
              <span className="text-[#1A1A1A]">Big Moon </span>
              <span className="bg-gradient-to-r from-[#7B3FF1] to-[#ED3F8C] bg-clip-text text-transparent">
                English
              </span>
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="text-sm font-semibold text-[#3A3A3A] hover:text-[#1A1A1A]"
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <Link
              to="/auth"
              className="rounded-full border border-[#1A1A1A]/15 bg-white/70 px-4 py-2 text-sm font-bold text-[#1A1A1A] backdrop-blur hover:bg-white"
            >
              登录 / 注册
            </Link>
          </nav>
        </header>

        {/* Hero copy */}
        <div className="relative z-10 mx-auto max-w-[1180px] px-6 pb-8 pt-10 text-center md:pb-12 md:pt-16 animate-hero-fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7B3FF1]">
            陪伴中国孩子真正走进英语世界
          </div>
          <h1 className="mt-3 font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            考试要拿分
            <br />
            英语要会用
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-[#5A5A5A] md:text-base">
            对照最新中考高考要求 · 同步最新大纲要求 — 让应试和能力同时长进。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7B3FF1] to-[#ED3F8C] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#7B3FF1]/25 hover:-translate-y-0.5 transition"
            >
              <Sparkles className="size-4" /> 免费开始学习
            </Link>
            <a
              href="#stages"
              className="rounded-full border border-[#1A1A1A]/15 bg-white/70 px-7 py-3 text-sm font-bold text-[#1A1A1A] backdrop-blur hover:bg-white"
            >
              浏览课程
            </a>
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO: why + how ============ */}
      <section className="mx-auto max-w-[1180px] px-6 pt-10 md:pt-14">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-serif text-2xl font-black leading-tight tracking-tight md:text-3xl">
            为什么很多孩子学了多年英语，
            <br className="hidden md:block" />
            依然不会真正使用英语？
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Pain points */}
          <div className="rounded-3xl border border-[#1A1A1A]/10 bg-white/60 p-7 backdrop-blur md:p-9">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9A9A9A]">
              传统英语学习
            </div>
            <h3 className="mt-2 font-serif text-xl font-black tracking-tight md:text-2xl">
              问题出在哪里
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#3A3A3A] md:text-base">
              {[
                "只会刷题做卷",
                "没有真实语境输入",
                "缺乏语感与节奏",
                "难以长期积累",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-[#9A9A9A]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Big Moon promise */}
          <div
            className="relative overflow-hidden rounded-3xl p-7 text-white shadow-[0_18px_40px_-16px_rgba(123,63,241,0.35)] md:p-9"
            style={{
              background: "linear-gradient(160deg,#7B3FF1 0%,#ED3F8C 100%)",
            }}
          >
            <span className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-white/15 blur-2xl" />
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-85">
              Big Moon English
            </div>
            <h3 className="mt-2 font-serif text-xl font-black tracking-tight md:text-2xl">
              我们希望帮助孩子
            </h3>
            <ul className="relative mt-5 space-y-3 text-sm md:text-base">
              {[
                "提高考试成绩",
                "建立真实英语能力",
                "听懂真实英语",
                "形成长期英语思维",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[11px] font-black">
                    ✓
                  </span>
                  <span className="opacity-95">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== AI 解决方案亮带（问题 → 承诺 之间的桥梁） ===== */}
        <div className="relative mt-8 overflow-hidden rounded-3xl bg-[#0E0B1F] p-8 text-white shadow-[0_20px_50px_-20px_rgba(123,63,241,0.5)] md:mt-10 md:p-12">
          <span className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#7B3FF1]/40 blur-3xl" />
          <span className="pointer-events-none absolute -left-16 -bottom-20 size-64 rounded-full bg-[#ED3F8C]/30 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto,1fr]">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B3FF1] to-[#ED3F8C] shadow-lg shadow-[#7B3FF1]/40">
                <Brain className="size-7" />
              </span>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                AI 解决方案
              </div>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-black leading-tight tracking-tight md:text-4xl">
                AI 持续分析孩子薄弱点，
                <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-[#FFD86B] via-[#ED3F8C] to-[#7B3FF1] bg-clip-text text-transparent">
                  动态生成专属练习
                </span>
                ，不再盲目刷题。
              </h3>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-white/85 md:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#10B981]/25 text-[#5EEAD4]">✓</span>
                  符合教育部英语新课标
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#10B981]/25 text-[#5EEAD4]">✓</span>
                  适合中国小学初高中学生
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ THREE STAGES ============ */}
      <section id="stages" className="mx-auto max-w-[1180px] px-6 py-8 md:py-10">
        <div className="mb-6 text-center md:mb-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7B3FF1]">
            COURSE TRACKS
          </div>
          <h2 className="mt-2 font-serif text-2xl font-black tracking-tight md:text-3xl">
            选择你的学习阶段
          </h2>
          <p className="mt-2 text-sm text-[#5A5A5A]">
            小学、初中、高中 — 每个阶段都有专属的内容和节奏
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STAGES.map((s, i) => (
            <Link
              key={s.to}
              to={s.to}
              className="group relative flex min-h-[240px] flex-col items-center justify-between overflow-hidden rounded-3xl p-6 text-center text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.45)] animate-card-float"
              style={{
                background: s.gradient,
                animationDelay: `${i * 1.2}s`,
              }}
            >
              <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-85">
                  {s.eyebrow}
                </div>
                <h3 className="mt-3 font-serif text-3xl font-black tracking-tight md:text-4xl">
                  {s.title}
                </h3>
                <div className="mt-1 text-sm font-semibold opacity-90">{s.range}</div>
                <p className="mt-4 text-sm leading-relaxed opacity-95">{s.desc}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold backdrop-blur transition group-hover:bg-white/30">
                进入 <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ BONUS: AMERICAN SLANG ============ */}
      <section className="mx-auto max-w-[1180px] px-6 pb-10 md:pb-14">
        <Link
          to="/slang"
          className="group relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl p-8 text-center text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.45)] md:p-12"
          style={{
            background:
              "linear-gradient(120deg,#1A1A2E 0%,#3B1E5E 45%,#ED3F8C 100%)",
          }}
        >
          <span className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
          <span className="pointer-events-none absolute -left-10 bottom-[-40px] size-40 rounded-full bg-[#F5A26B]/30 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-85">
              BIG MOON SLANG · BONUS
            </div>
            <h3 className="mt-3 font-serif text-3xl font-black tracking-tight md:text-4xl">
              美国俚语 American Slang
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-95 md:text-base">
              课本之外，真正美国年轻人每天在说的英语。短视频场景 + AI 跟读，让你一开口就像 native。
            </p>
          </div>
          <div className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2 text-xs font-bold backdrop-blur transition group-hover:bg-white/30 md:text-sm">
            进入俚语专区 <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#1A1A1A]/10 bg-[#FBF6EC] py-10">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-6 text-xs text-[#7A7A7A] md:flex-row">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-[#1A1A1A]">关于我们</Link>
            <Link to="/privacy" className="hover:text-[#1A1A1A]">隐私</Link>
            <Link to="/terms" className="hover:text-[#1A1A1A]">条款</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
