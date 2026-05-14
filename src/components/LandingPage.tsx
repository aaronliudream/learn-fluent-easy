import { Link } from "react-router-dom";
import LiveStatsTicker from "@/components/LiveStatsTicker";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import { ArrowRight, Sparkles, Brain, GraduationCap, Users, BookOpen, Quote, TrendingUp, Clock, Target, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import moonBg from "@/assets/moon-hero-bg.jpg";

/**
 * Big Moon English — landing page
 * 大月亮背景 Hero + 小学/初中/高中三栏卡片，编辑级简洁排版。
 */

const NAV = [
{ to: "/kids", label: "小学" as const },
{ to: "/junior", label: "初中" as const },
{ to: "/gaokao", label: "高中" as const }];


const STAGES = [
{
  to: "/kids",
  eyebrow: "BIG MOON KIDS",
  title: "小学英语",
  range: "G1 — G6",
  desc: "G1-G2 英语启蒙·幼小衔接：字母、自然拼读、听说、简单对话。G3-G6 教材同步·主线课程：对应人教/外研社版核心内容。",
  gradient: "linear-gradient(160deg,#F5A26B 0%,#ED5C8E 100%)"
},
{
  to: "/junior",
  eyebrow: "BIG MOON JUNIOR",
  title: "初中",
  range: "G7 — G9",
  desc: "中考同步词汇、语法、阅读、听力 + AI 错题讲解，朝气向上的备考节奏。",
  gradient: "linear-gradient(160deg,#2BB7A8 0%,#0F8C8C 100%)"
},
{
  to: "/gaokao",
  eyebrow: "BIG MOON SENIOR",
  title: "高中",
  range: "G10 — G12 · 高考",
  desc: "高考英语全模块训练：阅读、完形、语法、词汇、听写。严肃高效，应试导向。",
  gradient: "linear-gradient(160deg,#5B6BE3 0%,#2A2F7A 100%)"
}];


// Pre-computed sparkle positions so they're stable across renders
const SPARKLES = Array.from({ length: 28 }).map((_, i) => {
  const size = 4 + i * 7 % 10;
  return {
    left: `${i * 37 % 100}%`,
    top: `${60 + i * 53 % 35}%`,
    width: `${size}px`,
    height: `${size}px`,
    duration: `${6 + i * 13 % 8}s`,
    delay: `${i * 0.45 % 7}s`
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
          backgroundColor: "#FBF6EC"
        }}>
        
        {/* Parallax moon/mountain background layer */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url(${moonBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(1.06) translate3d(${parallax.x * -18}px, ${parallax.y * -12}px, 0)`,
            transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)"
          }} />
        
        {/* Subtle "breathing" glow over the moon */}
        <div
          className="absolute inset-0 animate-moon-breath will-change-transform"
          style={{
            background:
            "radial-gradient(ellipse 60% 45% at 50% 35%, rgba(255,220,160,0.35) 0%, rgba(255,220,160,0) 60%)",
            transform: `translate3d(${parallax.x * 24}px, ${parallax.y * 16}px, 0)`,
            transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)"
          }} />
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF6EC]/30 via-transparent to-[#FBF6EC]" />

        {/* Floating sparkles rising from the mountains */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            transform: `translate3d(${parallax.x * 12}px, ${parallax.y * 8}px, 0)`,
            transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)"
          }}>
          
          {SPARKLES.map((s, i) =>
          <span
            key={i}
            className="sparkle"
            style={{
              left: s.left,
              top: s.top,
              width: s.width,
              height: s.height,
              animationDuration: s.duration,
              animationDelay: s.delay
            }} />

          )}
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
              {NAV.map((n) =>
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-semibold text-[#3A3A3A] hover:text-[#1A1A1A]">
                
                  <T>{n.label}</T>
                </Link>
              )}
            </div>
            <a
              href="#entries"
              className="rounded-full border border-[#1A1A1A]/15 bg-white/70 px-4 py-2 text-sm font-bold text-[#1A1A1A] backdrop-blur hover:bg-white">
              
              <T>浏览课程</T>
            </a>
            <LangToggleEnZh />
            <UserAvatarMenu variant="inline" />
          </nav>
        </header>

        {/* Hero copy */}
        <div className="relative z-10 mx-auto max-w-[1180px] px-6 pb-8 pt-10 text-center md:pb-12 md:pt-16 animate-hero-fade-up">
          <div className="text-sm font-bold tracking-[0.18em] text-[#7B3FF1] md:text-base">
            <T>陪伴中国孩子真正走进英语世界</T>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            <T>考试要拿分</T>
            <br />
            <T>英语要会用</T>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-[#5A5A5A] md:text-base">
            <T>对照最新中考高考要求 · 同步最新大纲要求 — 让应试和能力同时长进。</T>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#entries"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7B3FF1] to-[#ED3F8C] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#7B3FF1]/25 hover:-translate-y-0.5 transition">
              
              <Sparkles className="size-4" /> <T>浏览课程</T>
            </a>
          </div>

          {/* 🔴 LIVE 数据条 — 紧贴 CTA，社会证明 + 科技感 */}
          <LiveStatsTicker />
        </div>
      </section>

      {/* ============ CORE ENTRIES · 4 大核心入口 ============ */}
      <section id="entries" className="mx-auto max-w-[1180px] scroll-mt-20 px-6 pt-8 md:pt-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          {[
          {
            to: "/kids",
            emoji: "🎒",
            title: "小学英语",
            desc: "启蒙 G1-G2 · 同步 G3-G6",
            bg: "linear-gradient(160deg,#F5A26B 0%,#ED5C8E 100%)"
          },
          {
            to: "/junior",
            emoji: "📚",
            title: "初中英语",
            desc: "语法 · 词汇 · 听说",
            bg: "linear-gradient(160deg,#2BB7A8 0%,#0F8C8C 100%)"
          },
          {
            to: "/gaokao",
            emoji: "🎓",
            title: "高中英语",
            desc: "真题 · 押题 · 写作",
            bg: "linear-gradient(160deg,#5B6BE3 0%,#2A2F7A 100%)"
          },
          {
            to: "/talk",
            emoji: "💬",
            title: "AI 对话练习",
            desc: "24h 外教，随时开口",
            bg: "linear-gradient(160deg,#7B3FF1 0%,#ED3F8C 100%)"
          }].
          map((c) =>
          <Link
            key={c.to}
            to={c.to}
            className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.3)] ring-1 ring-white/10 transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.4)] md:p-7"
            style={{ background: c.bg }}>
            
                <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur md:size-16 md:text-3xl">
                    {c.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl font-black tracking-tight md:text-2xl">
                      <T>{c.title}</T>
                    </h3>
                    <p className="mt-1 text-sm opacity-90"><T>{c.desc}</T></p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
              </Link>
          )}
        </div>
      </section>

      {/* ============ MANIFESTO: why + how ============ */}
      <section className="mx-auto max-w-[1180px] px-6 pt-10 md:pt-14">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-serif text-2xl font-black leading-tight tracking-tight md:text-3xl">
            <T>为什么很多孩子学了多年英语，</T>
            <br className="hidden md:block" />
            <T>依然不会真正使用英语？</T>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Pain points */}
          <div className="rounded-3xl border border-[#1A1A1A]/10 bg-white/60 p-7 backdrop-blur md:p-9">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9A9A9A]">
              <T>传统英语学习</T>
            </div>
            <h3 className="mt-2 font-serif text-xl font-black tracking-tight md:text-2xl">
              <T>问题出在哪里</T>
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#3A3A3A] md:text-base">
              {[
              "只会刷题做卷",
              "没有真实语境输入",
              "缺乏语感与节奏",
              "难以长期积累"].
              map((t) =>
              <li key={t} className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-[#9A9A9A]" />
                  <span><T>{t}</T></span>
                </li>
              )}
            </ul>
          </div>

          {/* Big Moon promise */}
          <div
            className="relative overflow-hidden rounded-3xl p-7 text-white shadow-[0_18px_40px_-16px_rgba(123,63,241,0.35)] md:p-9"
            style={{
              background: "linear-gradient(160deg,#7B3FF1 0%,#ED3F8C 100%)"
            }}>
            
            <span className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-white/15 blur-2xl" />
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-85">
              Big Moon English
            </div>
            <h3 className="mt-2 font-serif text-xl font-black tracking-tight md:text-2xl">
              <T>我们希望帮助孩子</T>
            </h3>
            <ul className="relative mt-5 space-y-3 text-sm md:text-base">
              {[
              "提高考试成绩",
              "建立真实英语能力",
              "听懂真实英语",
              "形成长期英语思维"].
              map((t) =>
              <li key={t} className="flex items-start gap-3">
                  <span className="mt-[2px] inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[11px] font-black">
                    ✓
                  </span>
                  <span className="opacity-95"><T>{t}</T></span>
                </li>
              )}
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
                <T>AI 解决方案</T>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-black leading-tight tracking-tight md:text-4xl">
                <T>AI 持续分析孩子薄弱点，</T>
                <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-[#FFD86B] via-[#ED3F8C] to-[#7B3FF1] bg-clip-text text-transparent">
                  <T>动态生成专属练习</T>
                </span>
                <T>，不再盲目刷题。</T>
              </h3>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-white/85 md:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#10B981]/25 text-[#5EEAD4]">✓</span>
                  <T>符合教育部英语新课标</T>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#10B981]/25 text-[#5EEAD4]">✓</span>
                  <T>适合中国小学初高中学生</T>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ THREE STAGES ============ */}
      <section id="stages" className="mx-auto max-w-[1180px] px-6 py-8 md:py-10">
        {/* Audience picker — 让学生/家长/老师秒速找到自己的入口 */}
        <div className="mb-10 md:mb-14">
          <div className="mb-5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7B3FF1]">
              WHO ARE YOU
            </div>
            <h2 className="mt-2 font-serif text-2xl font-black tracking-tight md:text-3xl">
              <T>你是谁？我们都为你准备好了</T>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
            {
              to: "/auth",
              icon: GraduationCap,
              eyebrow: "FOR STUDENTS",
              title: "我是学生",
              desc: "想提分、想真正会用英语",
              cta: "3 分钟语法闪练 →",
              bg: "linear-gradient(160deg,#7B3FF1 0%,#ED3F8C 100%)"
            },
            {
              to: "/parent",
              icon: Users,
              eyebrow: "FOR PARENTS",
              title: "我是家长",
              desc: "想看孩子学得怎么样、能提多少分",
              cta: "查看家长报告 →",
              bg: "linear-gradient(160deg,#0F8C8C 0%,#2BB7A8 100%)"
            },
            {
              to: "/teacher/cards",
              icon: BookOpen,
              eyebrow: "FOR TEACHERS",
              title: "我是老师",
              desc: "用 AI 给学生生成讲解卡片",
              cta: "进入老师工作台 →",
              bg: "linear-gradient(160deg,#F5A26B 0%,#ED5C8E 100%)"
            }].
            map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.3)] ring-1 ring-white/10 transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.4)]"
                  style={{ background: c.bg }}>
                  
                  <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                        <Icon className="size-5" />
                      </span>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-85">
                        {c.eyebrow}
                      </div>
                    </div>
                    <h3 className="mt-4 font-serif text-2xl font-black tracking-tight"><T>{c.title}</T></h3>
                    <p className="mt-1.5 text-sm opacity-90"><T>{c.desc}</T></p>
                    <div className="mt-5 inline-flex items-center gap-1 text-sm font-bold opacity-95 transition group-hover:translate-x-1">
                      <T>{c.cta}</T>
                    </div>
                  </div>
                </Link>);

            })}
          </div>
        </div>

        {/* Trust metrics — 用数字打动家长 */}
        <div className="mb-10 grid grid-cols-2 gap-3 rounded-3xl border border-[#1A1A1A]/10 bg-white/70 p-6 backdrop-blur md:mb-14 md:grid-cols-4 md:gap-6 md:p-8">
          {[
          { n: "350+", label: "中考高考语法点", icon: Target },
          { n: "10,000+", label: "AI 智能练习题", icon: Sparkles },
          { n: "24/7", label: "AI 助手随时答疑", icon: Clock },
          { n: "100%", label: "对标新课标大纲", icon: ShieldCheck }].
          map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="text-center">
                <Icon className="mx-auto size-5 text-[#7B3FF1]" />
                <div className="mt-2 font-serif text-3xl font-black tracking-tight text-[#1A1A1A] md:text-4xl">
                  {m.n}
                </div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A7A7A] md:text-xs">
                  <T>{m.label}</T>
                </div>
              </div>);

          })}
        </div>

      </section>

      {/* ============ TESTIMONIALS — 学员 & 家长见证 ============ */}
      <section className="mx-auto max-w-[1180px] px-6 pb-10 md:pb-14">
        <div className="mb-6 text-center md:mb-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7B3FF1]">
            REAL VOICES
          </div>
          <h2 className="mt-2 font-serif text-2xl font-black tracking-tight md:text-3xl">
              <T>他们在 Big Moon 找到了节奏</T>
          </h2>
          <p className="mt-2 text-xs text-[#9A9A9A]"><T>用户反馈节选 · 已隐去真实姓名</T></p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
          {
            quote: "孩子以前看到英语题就头疼，现在每天主动打卡 15 分钟，月考从 78 涨到 102。",
            who: "初二学生家长 · 杭州",
            gain: "+24 分",
            accent: "#7B3FF1"
          },
          {
            quote: "语法实验室真的把虚拟语气讲明白了，之前老师讲三遍我都懵，这里一次就懂。",
            who: "高三学生 · 北京",
            gain: "高考语法 0 失分",
            accent: "#ED3F8C"
          },
          {
            quote: "AI 小月会针对错题反复出变式，学生不用我盯着也能查漏补缺。",
            who: "公立中学英语老师 · 成都",
            gain: "课后效率 ×3",
            accent: "#0F8C8C"
          }].
          map((t) =>
          <div
            key={t.who}
            className="relative flex flex-col rounded-3xl border border-[#1A1A1A]/10 bg-white/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.2)]">
            
              <Quote className="size-6 opacity-30" style={{ color: t.accent }} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#3A3A3A] md:text-base">
                "<T>{t.quote}</T>"
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4">
                <div className="text-xs font-semibold text-[#5A5A5A]"><T>{t.who}</T></div>
                <div
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black text-white"
                style={{ background: t.accent }}>
                
                  <TrendingUp className="size-3" /> <T>{t.gain}</T>
                </div>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#1A1A1A]/10 bg-[#FBF6EC] py-10">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-6 text-xs text-[#7A7A7A] md:flex-row">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex items-center gap-5">
            <Link to="/auth" className="hover:text-[#1A1A1A]"><T>登录 / 注册</T></Link>
            <Link to="/about" className="hover:text-[#1A1A1A]"><T>关于我们</T></Link>
            <Link to="/slang" className="hover:text-[#1A1A1A]"><T>美式俚语</T></Link>
            <Link to="/privacy" className="hover:text-[#1A1A1A]"><T>隐私</T></Link>
            <Link to="/terms" className="hover:text-[#1A1A1A]"><T>条款</T></Link>
          </div>
        </div>
      </footer>
    </main>);

}