import { Link } from "react-router-dom";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import AiDashboardMock from "@/components/landing/AiDashboardMock";
import {
  ArrowRight,
  Award,
  Backpack,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  Clock,
  Cpu,
  Database,
  GraduationCap,
  Headphones,
  LineChart,
  Menu,
  Quote,
  Shield,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

/** 首页营销落地页（新版式）— 仅用于 `/`，旧学习中枢见 `/?hub=1` */

const NAV_LINKS = [
  { href: "/kids", label: "小学" as const },
  { href: "/junior", label: "初中" as const },
  { href: "/gaokao", label: "高中" as const },
  { href: "/talk", label: "AI个性化学习" as const },
  { href: "#testimonials", label: "成功案例" as const },
  { href: "/about", label: "关于我们" as const },
] as const;

const HERO_BULLETS = [
  "AI 个性化学习路径",
  "真题大数据分析",
  "专业教研团队",
] as const;

const COURSE_CARDS = [
  {
    to: "/kids",
    icon: Backpack,
    iconWrap: "bg-rose-100 text-rose-500",
    title: "小学英语",
    desc: "趣味启蒙 打好基础",
    tag: "三年级 - 六年级",
  },
  {
    to: "/junior",
    icon: BookOpen,
    iconWrap: "bg-sky-100 text-sky-600",
    title: "初中英语",
    desc: "中考同步 高效提分",
    tag: "七年级 - 九年级",
  },
  {
    to: "/gaokao",
    icon: GraduationCap,
    iconWrap: "bg-indigo-100 text-indigo-600",
    title: "高中英语",
    desc: "高考冲刺 真题训练",
    tag: "高一 - 高三",
  },
  {
    to: "/talk",
    icon: Cpu,
    iconWrap: "bg-amber-100 text-amber-600",
    title: "AI 智能练习",
    desc: "24 小时 AI 助教",
    tag: "智能诊断 · 个性推题",
  },
  {
    to: "/levels",
    icon: Target,
    iconWrap: "bg-emerald-100 text-emerald-600",
    title: "成人英语",
    desc: "职场口语 CEFR 分级",
    tag: "A1 - C2",
  },
];

const WHY_ITEMS = [
  {
    icon: Brain,
    title: "AI 精准诊断",
    lines: ["精准定位语法、词汇、阅读薄弱项", "告别盲目刷题，只练不会的"],
  },
  {
    icon: Sparkles,
    title: "个性化学习路径",
    lines: ["根据年级与水平动态生成练习", "越学越省力，节奏刚刚好"],
  },
  {
    icon: Database,
    title: "真题大数据",
    lines: ["历年中考高考真题智能归类", "高频考点一目了然"],
  },
  {
    icon: Users,
    title: "专业教研团队",
    lines: ["对标新课标与考纲要求", "内容持续更新迭代"],
  },
];

const AI_FEATURES = [
  { icon: Zap, label: "智能错题" },
  { icon: BarChart3, label: "实时反馈" },
  { icon: Target, label: "错题强化" },
];

const STATS = [
  { value: "350万+", label: "学生信赖之选", icon: Users },
  { value: "10,000+", label: "AI 题库资源", icon: Sparkles },
  { value: "24/7", label: "AI 助教随时答疑", icon: Clock },
  { value: "98.3%", label: "家长满意度", icon: Award },
];

const TESTIMONIALS = [
  {
    quote: "孩子以前看到英语题就头疼，现在每天主动打卡 15 分钟，月考从 78 涨到 102。",
    name: "张妈妈",
    role: "初二学生家长 · 杭州",
    avatar: "/landing/avatar1.png",
  },
  {
    quote: "语法实验室把虚拟语气讲明白了，老师讲三遍都懵，这里一次就懂，高考语法基本没丢分。",
    name: "王同学",
    role: "高三学生 · 北京",
    avatar: "/landing/avatar2.png",
  },
  {
    quote: "AI 小月会针对错题反复出变式，学生不用我盯着也能查漏补缺，课后效率提升很明显。",
    name: "李老师",
    role: "公立中学英语老师 · 成都",
    avatar: "/landing/avatar3.png",
  },
];

const FOOTER_GUARANTEES = [
  { icon: LineChart, label: "学习效果跟踪体系" },
  { icon: BookOpen, label: "定期学习报告" },
  { icon: Headphones, label: "专属学习顾问" },
  { icon: Shield, label: "不满意退款保障" },
];

const HERO_AVATARS = ["/landing/avatar1.png", "/landing/avatar2.png", "/landing/avatar3.png"] as const;

const HERO_FLOATS = [
  { label: "智能诊断", className: "left-[4%] top-[12%] md:left-[8%] md:top-[18%]" },
  { label: "个性化学习", className: "right-[4%] top-[22%] md:right-[12%] md:top-[28%]" },
  { label: "学情报告", className: "right-[8%] bottom-[18%] md:right-[18%] md:bottom-[22%]" },
];

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const isHash = href.startsWith("#");
  const className = "text-sm font-semibold text-white/85 transition hover:text-amber-300";
  if (isHash) {
    return (
      <a href={href} className={className} onClick={onNavigate}>
        <T>{label}</T>
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onNavigate}>
      <T>{label}</T>
    </Link>
  );
}

function AvatarImg({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative block size-9 shrink-0 overflow-hidden rounded-full border-2 border-[#0a1628] bg-slate-600 ring-1 ring-white/20">
      <img
        src={src}
        alt={alt}
        className="size-full object-cover object-center"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-dvh bg-[#f4f6f9] text-slate-900 antialiased">
      {/* ═══ 深色导航 + Hero ═══ */}
      <section className="relative overflow-hidden bg-[#0a1628] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 75% 35%, rgba(229,181,103,0.22) 0%, transparent 55%), radial-gradient(ellipse 45% 35% at 15% 85%, rgba(59,130,246,0.12) 0%, transparent 50%)",
          }}
          aria-hidden
        />

        <header className="relative z-20 border-b border-white/10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 md:px-6 md:py-4">
            <Link to="/" className="shrink-0 text-base font-extrabold tracking-tight md:text-lg">
              <span className="text-white">Big Moon </span>
              <span className="text-[#e5b567]">English</span>
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-5 lg:flex lg:gap-7">
              {NAV_LINKS.map((n) => (
                <NavLink key={n.href} href={n.href} label={n.label} />
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <Link
                to="/auth"
                className="hidden text-sm font-semibold text-white/90 hover:text-white sm:inline">
                <T>登录</T>
              </Link>
              <Link
                to="/auth"
                className="rounded-full bg-[#e5b567] px-3.5 py-2 text-xs font-extrabold text-[#0a1628] shadow-lg shadow-amber-500/20 hover:bg-[#f0c97d] md:px-5 md:text-sm">
                <T>免费试用</T>
              </Link>
              <div className="hidden sm:block">
                <LangToggleEnZh />
              </div>
              <UserAvatarMenu variant="inline" />
              <button
                type="button"
                className="rounded-lg p-2 text-white lg:hidden"
                aria-label="打开菜单"
                onClick={() => setMobileOpen(true)}>
                <Menu className="size-6" />
              </button>
            </div>
          </nav>

          {mobileOpen && (
            <div className="border-t border-white/10 bg-[#0a1628] px-4 py-4 lg:hidden">
              <div className="mb-3 flex justify-end">
                <button type="button" aria-label="关闭菜单" onClick={() => setMobileOpen(false)}>
                  <X className="size-6" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {NAV_LINKS.map((n) => (
                  <NavLink
                    key={n.href}
                    href={n.href}
                    label={n.label}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
                <Link to="/auth" className="text-sm font-semibold" onClick={() => setMobileOpen(false)}>
                  <T>登录</T>
                </Link>
              </div>
            </div>
          )}
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:gap-10 md:px-6 md:py-14 lg:py-16">
          <div className="text-center md:text-left">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[#e5b567]/40 bg-[#e5b567]/10 px-3 py-1 text-[11px] font-bold text-[#e5b567] md:text-xs">
              <Shield className="size-3.5 shrink-0" aria-hidden />
              <T>专为中国孩子打造的智能英语学习平台</T>
            </p>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl lg:text-[2.35rem] lg:leading-[1.15]">
              <T>让孩子自信开口说英语，</T>
              <br />
              <span className="text-[#e5b567]">
                <T>赢在未来每一步</T>
              </span>
            </h1>
            <ul className="mx-auto mt-5 max-w-md space-y-2 md:mx-0">
              {HERO_BULLETS.map((line) => (
                <li key={line} className="flex items-start justify-center gap-2 text-sm text-white/85 md:justify-start">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#e5b567]" strokeWidth={3} aria-hidden />
                  <T>{line}</T>
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/70 md:mx-0">
              <T>科学规划，高效提分，让英语学习更轻松</T>
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-[#e5b567] px-6 py-3 text-sm font-extrabold text-[#0a1628] shadow-lg hover:bg-[#f0c97d]">
                <T>免费试用</T>
              </Link>
              <a
                href="#courses"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#e5b567]/60 px-6 py-3 text-sm font-bold text-[#e5b567] hover:bg-[#e5b567]/10">
                <T>了解学习方案</T>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <div className="flex -space-x-2">
                {HERO_AVATARS.map((src, i) => (
                  <AvatarImg key={src} src={src} alt={`家长 ${i + 1}`} />
                ))}
              </div>
              <p className="text-left text-xs leading-relaxed text-white/80">
                <span className="font-extrabold text-white">1,087,452+</span> <T>家长的信赖之选</T>
                <span className="mx-1.5 text-white/40">|</span>
                <span className="font-bold text-[#e5b567]">98.3%</span> <T>家长满意度</T>
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg shrink-0 md:max-w-none">
            <div className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-3 ring-1 ring-white/10">
              <img
                src="/landing/hero.png"
                alt=""
                className="block h-auto max-h-[min(440px,72vh)] w-full max-w-full object-contain object-center"
                loading="eager"
                decoding="async"
              />
              <span
                className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-4xl font-black tracking-tighter text-[#e5b567]/30 md:text-5xl"
                aria-hidden>
                AI
              </span>
              {HERO_FLOATS.map((f) => (
                <span
                  key={f.label}
                  className={`absolute ${f.className} rounded-lg border border-[#e5b567]/50 bg-[#0a1628]/90 px-2 py-1 text-[10px] font-bold text-[#e5b567] shadow-lg backdrop-blur-sm md:text-xs`}>
                  <T>{f.label}</T>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 课程卡（左）+ 为什么选择（右） ═══ */}
      <section id="courses" className="scroll-mt-20 bg-[#f4f6f9] py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[1.15fr_1fr] md:gap-8 md:px-6 lg:gap-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {COURSE_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)] last:sm:col-span-2 lg:last:col-span-1">
                  <span
                    className={`inline-flex size-11 shrink-0 aspect-square items-center justify-center rounded-xl ${c.iconWrap}`}>
                    <Icon className="size-5 shrink-0" strokeWidth={2.2} aria-hidden />
                  </span>
                  <h3 className="mt-3 text-base font-extrabold text-slate-900">
                    <T>{c.title}</T>
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    <T>{c.desc}</T>
                  </p>
                  <span className="mt-2 inline-block w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {c.tag}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-sky-600 group-hover:gap-2">
                    <T>去学习</T> <ArrowRight className="size-3.5 shrink-0" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div id="why" className="scroll-mt-20">
            <h2 className="text-lg font-extrabold text-slate-900 md:text-xl">
              <T>为什么选择 Big Moon English?</T>
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {WHY_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title}>
                    <span className="inline-flex size-12 shrink-0 aspect-square items-center justify-center rounded-full bg-[#e5b567]/15 text-[#c9922e] ring-4 ring-[#e5b567]/10">
                      <Icon className="size-6 shrink-0" aria-hidden />
                    </span>
                    <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                      <T>{item.title}</T>
                    </h3>
                    {item.lines.map((line) => (
                      <p key={line} className="mt-1 text-xs leading-relaxed text-slate-500">
                        <T>{line}</T>
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AI Banner（左）+ 家长反馈（右） ═══ */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:gap-8 md:px-6">
          <div className="overflow-hidden rounded-3xl bg-[#0a1628] p-6 text-white shadow-xl md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <AiDashboardMock />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold leading-snug md:text-xl">
                  <T>AI 持续分析孩子薄弱点，</T>
                  <span className="text-[#e5b567]">
                    <T>动态生成专属练习</T>
                  </span>
                  <T>，不再盲目刷题。</T>
                </h2>
                <div className="mt-5 flex flex-wrap gap-4">
                  {AI_FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className="flex items-center gap-2 text-xs text-white/85">
                        <Icon className="size-4 shrink-0 text-[#e5b567]" aria-hidden />
                        <T>{f.label}</T>
                      </div>
                    );
                  })}
                </div>
                <Link
                  to="/talk"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e5b567] px-5 py-2.5 text-sm font-extrabold text-[#0a1628] hover:bg-[#f0c97d]">
                  <T>体验 AI 学习</T> <ArrowRight className="size-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>

          <div id="testimonials" className="scroll-mt-20">
            <h2 className="text-lg font-extrabold text-slate-900 md:text-xl">
              <T>家长们的真实反馈</T>
            </h2>
            <div className="mt-6 space-y-4">
              {TESTIMONIALS.map((t) => (
                <article
                  key={t.name}
                  className="rounded-2xl border border-slate-200/80 bg-[#f8f9fb] p-5 shadow-sm">
                  <Quote className="size-7 text-[#e5b567]/50" aria-hidden />
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    &ldquo;<T>{t.quote}</T>&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-slate-200/80 pt-4">
                    <AvatarImg src={t.avatar} alt={t.name} />
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">
                        <T>{t.role}</T>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 数据统计条 ═══ */}
      <section className="border-y border-slate-200/80 bg-white py-12 md:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <span className="mx-auto inline-flex size-11 shrink-0 aspect-square items-center justify-center rounded-full bg-[#e5b567]/10 text-[#c9922e]">
                  <Icon className="size-5 shrink-0" aria-hidden />
                </span>
                <div className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  <T>{s.label}</T>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 底部深色 CTA（无合作伙伴） ═══ */}
      <footer className="bg-[#0a1628] py-10 text-white md:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex gap-4">
            <span className="inline-flex size-12 shrink-0 aspect-square items-center justify-center rounded-xl bg-[#e5b567]/15 text-[#e5b567]">
              <Shield className="size-7 shrink-0" aria-hidden />
            </span>
            <h3 className="text-lg font-extrabold md:text-xl">
              <T>效果看得见，家长更放心</T>
            </h3>
          </div>
          <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4 md:w-auto md:gap-8">
            {FOOTER_GUARANTEES.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label} className="text-center md:text-left">
                  <span className="inline-flex size-10 shrink-0 aspect-square items-center justify-center rounded-lg bg-[#e5b567]/10 text-[#e5b567] md:mx-0 mx-auto">
                    <Icon className="size-5 shrink-0" aria-hidden />
                  </span>
                  <div className="mt-2 text-[11px] font-bold leading-snug text-white/85">
                    <T>{g.label}</T>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/10 px-4 pt-6 text-xs text-white/45 md:flex-row md:px-6">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/auth" className="hover:text-white">
              <T>登录 / 注册</T>
            </Link>
            <Link to="/about" className="hover:text-white">
              <T>关于我们</T>
            </Link>
            <Link to="/privacy" className="hover:text-white">
              <T>隐私</T>
            </Link>
            <Link to="/terms" className="hover:text-white">
              <T>条款</T>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
