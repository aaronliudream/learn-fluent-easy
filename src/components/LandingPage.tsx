import { Link } from "react-router-dom";
import LiveStatsTicker from "@/components/LiveStatsTicker";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import {
  ArrowRight,
  Backpack,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Cpu,
  GraduationCap,
  LineChart,
  MessageSquare,
  Quote,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/kids", label: "小学" as const },
  { to: "/junior", label: "初中" as const },
  { to: "/gaokao", label: "高中" as const },
  { to: "/talk", label: "AI个性化学习" as const },
  { to: "#testimonials", label: "成功案例" as const },
  { to: "/about", label: "关于我们" as const },
];

const COURSE_CARDS = [
  {
    to: "/kids",
    icon: Backpack,
    iconBg: "bg-rose-100 text-rose-500",
    title: "小学英语",
    desc: "G1-G6 启蒙与教材同步，自然拼读与趣味阅读",
    tag: "Primary 3-6",
    tagColor: "bg-rose-50 text-rose-600",
  },
  {
    to: "/junior",
    icon: BookOpen,
    iconBg: "bg-sky-100 text-sky-600",
    title: "初中英语",
    desc: "中考同步词汇语法，AI 错题讲解与听说训练",
    tag: "Junior 7-9",
    tagColor: "bg-sky-50 text-sky-700",
  },
  {
    to: "/gaokao",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 text-indigo-600",
    title: "高中英语",
    desc: "高考阅读完形写作，真题训练与冲刺规划",
    tag: "Senior 10-12",
    tagColor: "bg-indigo-50 text-indigo-700",
  },
  {
    to: "/talk",
    icon: Cpu,
    iconBg: "bg-orange-100 text-orange-500",
    title: "AI 个性化学习",
    desc: "24 小时 AI 助教，智能诊断薄弱点并推送练习",
    tag: "AI Powered",
    tagColor: "bg-orange-50 text-orange-600",
  },
  {
    to: "#testimonials",
    icon: Target,
    iconBg: "bg-emerald-100 text-emerald-600",
    title: "成功案例",
    desc: "真实学员提分故事，家长与老师口碑见证",
    tag: "Success Stories",
    tagColor: "bg-emerald-50 text-emerald-700",
  },
];

const WHY_ITEMS = [
  {
    icon: Brain,
    title: "AI 智能诊断",
    desc: "精准定位语法、词汇、阅读薄弱项，告别盲目刷题",
  },
  {
    icon: Sparkles,
    title: "个性化学习路径",
    desc: "根据年级与水平动态生成专属练习，越学越省力",
  },
  {
    icon: LineChart,
    title: "大数据分析",
    desc: "学情可视化追踪，进步曲线一目了然",
  },
  {
    icon: Users,
    title: "专业教研团队",
    desc: "对标新课标与中考高考要求，内容持续更新",
  },
];

const AI_POINTS = [
  { icon: Zap, text: "智能推荐每日任务" },
  { icon: MessageSquare, text: "错题即时讲解反馈" },
  { icon: LineChart, text: "学情报告周周更新" },
  { icon: Target, text: "目标分数阶段追踪" },
];

const STATS = [
  { n: "350万+", label: "累计学习人次", icon: Users },
  { n: "10,000+", label: "AI 智能练习题", icon: Sparkles },
  { n: "24/7", label: "AI 助教在线", icon: Zap },
  { n: "98.3%", label: "家长满意度", icon: Shield },
];

const TESTIMONIALS = [
  {
    quote: "孩子以前看到英语题就头疼，现在每天主动打卡 15 分钟，月考从 78 涨到 102。",
    name: "李妈妈",
    role: "初二学生家长 · 杭州",
    avatar: "李",
  },
  {
    quote: "语法实验室把虚拟语气讲明白了，老师讲三遍都懵，这里一次就懂，高考语法基本没丢分。",
    name: "王同学",
    role: "高三学生 · 北京",
    avatar: "王",
  },
  {
    quote: "AI 小月会针对错题反复出变式，学生不用我盯着也能查漏补缺，课后效率提升很明显。",
    name: "张老师",
    role: "公立中学英语老师 · 成都",
    avatar: "张",
  },
];

const PARTNER_LOGOS = [
  "/landing/partner-1.webp",
  "/landing/partner-2.webp",
  "/landing/partner-3.webp",
  "/landing/partner-4.webp",
  "/landing/partner-5.webp",
  "/landing/partner-6.webp",
];

const FOOTER_GUARANTEES = [
  { icon: LineChart, label: "学习效果跟踪" },
  { icon: BookOpen, label: "定期学习报告" },
  { icon: Users, label: "专属学习顾问" },
  { icon: Shield, label: "不满退款保障" },
];

export default function LandingPage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  return (
    <main className="min-h-dvh bg-white text-slate-900 antialiased">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#0B1F3D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url(/landing/hero.webp)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3D]/95 via-[#0B1F3D]/75 to-[#0B1F3D]/40" />

        <header className="relative z-10 border-b border-white/10">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
            <Link to="/" className="text-lg font-extrabold tracking-tight">
              <span className="text-white">Big Moon </span>
              <span className="text-amber-400">English</span>
            </Link>
            <div className="hidden items-center gap-6 lg:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="text-sm font-semibold text-white/85 transition hover:text-white">
                  <T>{n.label}</T>
                </Link>
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
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-[#0B1F3D] shadow-lg shadow-amber-400/30 hover:bg-amber-300">
                <T>免费试用</T>
              </Link>
              <LangToggleEnZh />
              <UserAvatarMenu variant="inline" />
            </div>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16 lg:py-20">
          <div>
            <p className="text-sm font-bold tracking-wide text-amber-400">
              <T>AI 驱动 · 个性化英语学习平台</T>
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              <T>让每个孩子拥有</T>
              <br />
              <span className="text-amber-400"><T>专属 AI 学习路径</T></span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
              <T>智能诊断薄弱点 · 动态推送练习 · 实时学情分析 — 帮中国孩子应试提分与真实能力同步成长。</T>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-[#0B1F3D] shadow-lg hover:bg-amber-300">
                <T>免费试用</T>
              </Link>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
                <T>了解学习方案</T>
              </a>
            </div>
            <div className="mt-8">
              <LiveStatsTicker />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Course cards ─── */}
      <section id="courses" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COURSE_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-xl ${c.iconBg}`}>
                  <Icon className="size-6" strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">
                  <T>{c.title}</T>
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">
                  <T>{c.desc}</T>
                </p>
                <span className={`mt-3 inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.tagColor}`}>
                  {c.tag}
                </span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:gap-2">
                  <T>进入学习</T> <ArrowRight className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Why choose ─── */}
      <section id="why" className="bg-slate-50 py-14 md:py-18">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 md:text-3xl">
            <T>为什么选择 Big Moon English?</T>
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                    <T>{item.title}</T>
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    <T>{item.desc}</T>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── AI highlight ─── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="overflow-hidden rounded-3xl bg-[#0B1F3D] text-white shadow-xl">
          <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
            <div className="overflow-hidden rounded-2xl bg-white/5">
              <img
                src="/landing/ai-tablet.webp"
                alt=""
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold leading-snug md:text-3xl">
                <T>AI 持续分析孩子薄弱点，</T>
                <span className="text-amber-400"><T>动态生成专属练习</T></span>
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {AI_POINTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.text} className="flex items-center gap-2 text-sm text-white/85">
                      <Icon className="size-4 shrink-0 text-amber-400" />
                      <T>{p.text}</T>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/auth"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-[#0B1F3D] hover:bg-amber-300">
                <T>体验 AI 学习</T> <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Icon className="size-5" />
                </span>
                <div className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">{s.n}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  <T>{s.label}</T>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="bg-slate-50 py-14 scroll-mt-20 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 md:text-3xl">
            <T>家长们的真实反馈</T>
          </h2>
          <div className="relative mt-10">
            <button
              type="button"
              aria-label="上一条"
              onClick={() => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow md:-left-4 md:flex">
              <ChevronLeft className="size-5" />
            </button>
            <div className="grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition ${
                    i === testimonialIdx ? "ring-2 ring-amber-400/60 md:ring-0" : "hidden md:block"
                  } ${i !== testimonialIdx ? "md:block" : "block"}`}>
                  <Quote className="size-8 text-amber-400/40" />
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    "<T>{t.quote}</T>"
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <span className="grid size-10 place-items-center rounded-full bg-[#0B1F3D] text-sm font-bold text-white">
                      {t.avatar}
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500"><T>{t.role}</T></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label="下一条"
              onClick={() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length)}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow md:-right-4 md:flex">
              <ChevronRight className="size-5" />
            </button>
            <div className="mt-6 flex justify-center gap-2 md:hidden">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`第 ${i + 1} 条`}
                  onClick={() => setTestimonialIdx(i)}
                  className={`size-2 rounded-full ${i === testimonialIdx ? "bg-amber-500" : "bg-slate-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partners (logos only, no text) ─── */}
      <section className="border-y border-slate-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 md:gap-12 md:px-6">
          {PARTNER_LOGOS.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="h-10 w-auto object-contain opacity-80 grayscale transition hover:opacity-100 md:h-12"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      {/* ─── Footer CTA band ─── */}
      <footer className="bg-[#0B1F3D] py-12 text-white">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 md:grid-cols-2 md:px-6">
          <div className="flex gap-4">
            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400">
              <Shield className="size-8" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold">
                <T>学习效果看得见，进步轨迹跟得住</T>
              </h3>
              <p className="mt-2 text-sm text-white/70">
                <T>从诊断到练习到报告，全流程 AI 陪伴，家长放心、孩子省力。</T>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FOOTER_GUARANTEES.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label} className="text-center">
                  <Icon className="mx-auto size-6 text-amber-400" />
                  <div className="mt-2 text-[11px] font-bold text-white/85">
                    <T>{g.label}</T>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 pt-8 text-xs text-white/50 md:flex-row md:px-6">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/auth" className="hover:text-white"><T>登录 / 注册</T></Link>
            <Link to="/about" className="hover:text-white"><T>关于我们</T></Link>
            <Link to="/privacy" className="hover:text-white"><T>隐私</T></Link>
            <Link to="/terms" className="hover:text-white"><T>条款</T></Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
