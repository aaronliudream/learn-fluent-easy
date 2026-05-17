import { Link } from "react-router-dom";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import {
  ArrowRight,
  Backpack,
  BarChart3,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  GraduationCap,
  LineChart,
  Menu,
  MessageSquare,
  Quote,
  Shield,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

/** 首页营销落地页 — 仅用于 `/`，旧学习中枢见 `/?hub=1` */

const NAV_LINKS = [
  { href: "/kids", label: "小学" as const },
  { href: "/junior", label: "初中" as const },
  { href: "/gaokao", label: "高中" as const },
  { href: "/talk", label: "AI个性化学习" as const },
  { href: "#testimonials", label: "成功案例" as const },
  { href: "/about", label: "关于我们" as const },
] as const;

const COURSE_CARDS = [
  {
    to: "/kids",
    cta: "去学习 →",
    icon: Backpack,
    iconWrap: "bg-rose-100 text-rose-500",
    title: "小学英语",
    desc: "G1-G6 启蒙与教材同步，自然拼读与趣味阅读",
    tags: ["三年级", "四年级", "五年级", "六年级"],
  },
  {
    to: "/junior",
    cta: "去学习 →",
    icon: BookOpen,
    iconWrap: "bg-sky-100 text-sky-600",
    title: "初中英语",
    desc: "中考同步词汇语法，AI 错题讲解与听说训练",
    tags: ["七年级", "八年级", "九年级"],
  },
  {
    to: "/gaokao",
    cta: "去学习 →",
    icon: GraduationCap,
    iconWrap: "bg-indigo-100 text-indigo-600",
    title: "高中英语",
    desc: "高考阅读完形写作，真题训练与冲刺规划",
    tags: ["高一", "高二", "高三"],
  },
  {
    to: "/talk",
    cta: "去体验 →",
    icon: Cpu,
    iconWrap: "bg-amber-100 text-amber-600",
    title: "AI 智能练习",
    desc: "24 小时 AI 助教，智能诊断薄弱点并推送练习",
    tags: ["智能诊断", "个性推题"],
  },
  {
    to: "/levels",
    cta: "去学习 →",
    icon: Target,
    iconWrap: "bg-emerald-100 text-emerald-600",
    title: "成人英语",
    desc: "CEFR A1–C2 分级路径，职场与日常口语提升",
    tags: ["A1", "B1", "C1"],
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
  { icon: Zap, label: "智能推荐" },
  { icon: MessageSquare, label: "实时反馈" },
  { icon: Target, label: "错题强化" },
  { icon: BarChart3, label: "学情报告" },
];

const STATS = [
  { value: "350万+", label: "累计学习人次", icon: Users },
  { value: "10,000+", label: "AI 智能题库", icon: Sparkles },
  { value: "24/7", label: "AI 助教在线", icon: Zap },
  { value: "98.3%", label: "家长满意度", icon: Shield },
];

const TESTIMONIALS = [
  {
    quote: "孩子以前看到英语题就头疼，现在每天主动打卡 15 分钟，月考从 78 涨到 102。",
    name: "张妈妈",
    role: "初二学生家长 · 杭州",
    avatar: "张",
  },
  {
    quote: "语法实验室把虚拟语气讲明白了，老师讲三遍都懵，这里一次就懂，高考语法基本没丢分。",
    name: "王同学",
    role: "高三学生 · 北京",
    avatar: "王",
  },
  {
    quote: "AI 小月会针对错题反复出变式，学生不用我盯着也能查漏补缺，课后效率提升很明显。",
    name: "李老师",
    role: "公立中学英语老师 · 成都",
    avatar: "李",
  },
];

const FOOTER_GUARANTEES = [
  { icon: LineChart, label: "学习效果跟踪" },
  { icon: BookOpen, label: "定期学习报告" },
  { icon: Users, label: "专属学习顾问" },
  { icon: Shield, label: "不满退款保障" },
];

const HERO_FLOATS = [
  { label: "智能诊断", className: "left-[8%] top-[18%]" },
  { label: "个性化学习", className: "right-[12%] top-[28%]" },
  { label: "学情报告", className: "right-[18%] bottom-[22%]" },
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

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const prevTestimonial = () =>
    setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);

  return (
    <main className="min-h-dvh bg-[#f4f6f9] text-slate-900 antialiased">
      {/* ═══ Hero + Nav ═══ */}
      <section className="relative overflow-hidden bg-[#0a1628] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(229,181,103,0.25) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('/landing/hero-v2.webp')] bg-contain bg-center bg-no-repeat opacity-20" />

        <header className="relative z-20 border-b border-white/10">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 md:px-6 md:py-4">
            <Link to="/" className="shrink-0 text-base font-extrabold tracking-tight md:text-lg">
              <span className="text-white">Big Moon </span>
              <span className="text-[#e5b567]">English</span>
            </Link>

            <div className="hidden items-center gap-5 lg:flex lg:gap-7">
              {NAV_LINKS.map((n) => (
                <NavLink key={n.href} href={n.href} label={n.label} />
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
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
                <Link
                  to="/auth"
                  className="text-sm font-semibold"
                  onClick={() => setMobileOpen(false)}>
                  <T>登录</T>
                </Link>
              </div>
            </div>
          )}
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:gap-8 md:px-6 md:py-14 lg:py-16">
          <div className="text-center md:text-left">
            <p className="inline-block rounded-full border border-[#e5b567]/40 bg-[#e5b567]/10 px-3 py-1 text-[11px] font-bold text-[#e5b567] md:text-xs">
              <T>专为中国孩子打造的智能英语学习平台</T>
            </p>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl lg:text-[2.35rem] lg:leading-[1.15]">
              <T>让孩子自信开口说英语，</T>
              <br />
              <span className="text-[#e5b567]"><T>赢在未来每一步</T></span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:mx-0 md:text-[15px]">
              <T>
                AI 个性化学习路径 · 真题大数据分析 · 专业教研团队护航 — 帮中国孩子应试提分与真实能力同步成长。
              </T>
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-[#e5b567] px-6 py-3 text-sm font-extrabold text-[#0a1628] shadow-lg hover:bg-[#f0c97d]">
                <T>免费试用</T>
              </Link>
              <a
                href="#courses"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/35 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
                <T>了解学习方案</T>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <div className="flex -space-x-2">
                {["A", "B", "C"].map((c) => (
                  <span
                    key={c}
                    className="grid size-8 shrink-0 aspect-square place-items-center rounded-full border-2 border-[#0a1628] bg-[#e5b567] text-[10px] font-bold text-[#0a1628]">
                    {c}
                  </span>
                ))}
              </div>
              <div className="text-left text-xs text-white/80">
                <div className="font-extrabold text-white">1,087,452+</div>
                <div><T>家长的信赖之选</T></div>
                <div className="mt-1 font-bold text-[#e5b567]">&gt; 98.3% <T>家长满意度</T></div>
              </div>
            </div>
          </div>

          {/* 右侧配图占位 — 后续可替换为 /landing/hero-student.webp */}
          <div className="relative mx-auto w-full max-w-md shrink-0 md:max-w-none">
            <div className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700/80 to-slate-900/90 p-2 ring-1 ring-white/10">
              <img
                src="/landing/hero-student-placeholder.webp"
                alt=""
                width={376}
                height={368}
                className="block h-auto max-h-[min(420px,70vh)] w-full max-w-full object-contain object-center"
                loading="eager"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl bg-gradient-to-t from-[#0a1628]/50 to-transparent" />
              {HERO_FLOATS.map((f) => (
                <span
                  key={f.label}
                  className={`absolute ${f.className} rounded-full border border-[#e5b567]/50 bg-[#0a1628]/85 px-2.5 py-1 text-[10px] font-bold text-[#e5b567] shadow-lg backdrop-blur-sm md:text-xs`}>
                  <T>{f.label}</T>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5 课程卡片 ═══ */}
      <section id="courses" className="scroll-mt-20 bg-[#f4f6f9] py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-5">
          {COURSE_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
                <span
                  className={`inline-flex size-12 shrink-0 aspect-square items-center justify-center rounded-xl ${c.iconWrap}`}>
                  <Icon className="size-6 shrink-0" strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">
                  <T>{c.title}</T>
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">
                  <T>{c.desc}</T>
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#c9922e] group-hover:gap-2">
                  <T>{c.cta}</T>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ 为什么选择 ═══ */}
      <section id="why" className="scroll-mt-20 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-xl font-extrabold text-slate-900 md:text-2xl">
            <T>为什么选择 Big Moon English?</T>
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <span className="mx-auto inline-flex size-14 shrink-0 aspect-square items-center justify-center rounded-full bg-[#e5b567]/15 text-[#c9922e] ring-4 ring-[#e5b567]/10">
                    <Icon className="size-7 shrink-0" />
                  </span>
                  <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                    <T>{item.title}</T>
                  </h3>
                  {item.lines.map((line) => (
                    <p key={line} className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      <T>{line}</T>
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ AI Banner ═══ */}
      <section id="ai" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="overflow-hidden rounded-3xl bg-[#0a1628] text-white shadow-xl">
          <div className="grid items-center gap-8 p-6 md:grid-cols-[1fr,1.2fr] md:p-10 lg:grid-cols-2">
            <div className="flex items-center justify-center rounded-2xl bg-white/5 p-2 md:p-3">
              <img
                src="/landing/ai-banner-v2.webp"
                alt=""
                width={682}
                height={102}
                className="block h-auto w-full max-w-full object-contain object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <h2 className="text-xl font-extrabold leading-snug md:text-2xl lg:text-[1.65rem]">
                <T>AI 持续分析孩子薄弱点，</T>
                <span className="text-[#e5b567]"><T>动态生成专属练习</T></span>
                <T>，不再盲目刷题。</T>
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {AI_FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-center gap-2 text-sm text-white/85">
                      <Icon className="size-4 shrink-0 text-[#e5b567]" />
                      <T>{f.label}</T>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/talk"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e5b567] px-6 py-3 text-sm font-extrabold text-[#0a1628] hover:bg-[#f0c97d]">
                <T>体验 AI 学习</T> <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 数据统计 ═══ */}
      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <span className="mx-auto inline-flex size-12 shrink-0 aspect-square items-center justify-center rounded-full bg-[#e5b567]/10 text-[#c9922e]">
                  <Icon className="size-5 shrink-0" />
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

      {/* ═══ 家长反馈轮播 ═══ */}
      <section id="testimonials" className="scroll-mt-20 bg-[#f4f6f9] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-xl font-extrabold text-slate-900 md:text-2xl">
            <T>家长们的真实反馈</T>
          </h2>
          <div className="relative mt-10">
            <button
              type="button"
              aria-label="上一条"
              onClick={prevTestimonial}
              className="absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 shadow-md hover:bg-slate-50 md:flex lg:-left-5">
              <ChevronLeft className="size-5 text-slate-600" />
            </button>

            <div>
              <div className="grid gap-5 md:grid-cols-3">
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={t.name}
                    className={i === testimonialIdx ? "block" : "hidden md:block"}>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                      <Quote className="size-8 text-[#e5b567]/50" />
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        &ldquo;<T>{t.quote}</T>&rdquo;
                      </p>
                      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                        <span className="grid size-10 shrink-0 aspect-square place-items-center rounded-full bg-[#0a1628] text-sm font-bold text-[#e5b567]">
                          {t.avatar}
                        </span>
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-500">
                            <T>{t.role}</T>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="下一条"
              onClick={nextTestimonial}
              className="absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 shadow-md hover:bg-slate-50 md:flex lg:-right-5">
              <ChevronRight className="size-5 text-slate-600" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
              <button type="button" aria-label="上一条" onClick={prevTestimonial} className="rounded-full border border-slate-200 bg-white p-2">
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`第 ${i + 1} 条`}
                    onClick={() => setTestimonialIdx(i)}
                    className={`size-2 rounded-full transition ${
                      i === testimonialIdx ? "w-6 bg-[#e5b567]" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <button type="button" aria-label="下一条" onClick={nextTestimonial} className="rounded-full border border-slate-200 bg-white p-2">
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mt-4 hidden justify-center gap-2 md:flex">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`第 ${i + 1} 条`}
                  onClick={() => setTestimonialIdx(i)}
                  className={`size-2 rounded-full transition ${
                    i === testimonialIdx ? "w-6 bg-[#e5b567]" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 底部 CTA（无合作伙伴区块） ═══ */}
      <footer className="bg-[#0a1628] py-12 text-white md:py-14">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 md:grid-cols-2 md:px-6">
          <div className="flex gap-4">
            <span className="inline-flex size-14 shrink-0 aspect-square items-center justify-center rounded-2xl bg-[#e5b567]/15 text-[#e5b567]">
              <Shield className="size-8 shrink-0" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold md:text-xl">
                <T>效果看得见，家长更放心</T>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                <T>从诊断到练习到报告，全流程 AI 陪伴，学习轨迹清晰可查，进步一目了然。</T>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {FOOTER_GUARANTEES.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label} className="text-center">
                  <span className="mx-auto inline-flex size-12 shrink-0 aspect-square items-center justify-center rounded-xl bg-[#e5b567]/10 text-[#e5b567]">
                    <Icon className="size-6 shrink-0" />
                  </span>
                  <div className="mt-2 text-[11px] font-bold leading-snug text-white/85">
                    <T>{g.label}</T>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 pt-8 text-xs text-white/45 md:flex-row md:px-6">
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
