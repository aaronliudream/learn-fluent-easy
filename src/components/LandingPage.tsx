import { Link } from "react-router-dom";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { useI18n } from "@/i18n/I18nProvider";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import AiDashboardMock from "@/components/landing/AiDashboardMock";
import DownloadsSection from "@/components/landing/DownloadsSection";
import LibraryLandingSection from "@/components/library/LibraryLandingSection";
import {
  ArrowRight,
  Award,
  Backpack,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  Clock,
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
import type { LucideIcon } from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  AMERICAN_COURSE_NAME,
  AMERICAN_COURSE_SUBTITLE,
  AMERICAN_COURSE_SCALE,
  AMERICAN_COURSE_COVERAGE,
  AMERICAN_COURSE_PATH,
} from "@/lib/american/brand";

/** 首页营销落地页（新版式）— 仅用于 `/`，旧学习中枢见 `/?hub=1` */

/** 全学段已开放(初中+高中三社内容齐活)。游客 20 题配额在答题入口处控制,不再锁学段入口。 */
const SOON_HREFS = new Set<string>([]);

const NAV_LINKS = [
  { href: "/kids", label: "小学" as const },
  { href: "/junior", label: "初中" as const },
  { href: "/gaokao", label: "高中" as const },
  { href: "#testimonials", label: "成功案例" as const },
  { href: "/about", label: "关于我们" as const },
] as const;

/** Hero 文案：同步中英切换，避免英文界面下 <T> 在翻译未返回前渲染空字符串 */
const HERO_BULLETS = [
  { zh: "AI 个性化学习路径", en: "AI-personalized learning paths" },
  { zh: "真题大数据分析", en: "Real-exam big-data insights" },
  { zh: "专业教研团队", en: "Expert curriculum team" },
] as const;

const HERO_COPY = {
  badge: {
    zh: "专为中国孩子打造的智能英语学习平台",
    en: "An intelligent English platform built for Chinese learners",
  },
  title1: { zh: "让孩子自信开口说英语，", en: "Help your child speak English with confidence," },
  title2: { zh: "赢在未来每一步", en: "winning every step of the future" },
  subtitle: {
    zh: "科学规划，高效提分，让英语学习更轻松",
    en: "Smart planning, faster progress, easier English learning",
  },
  ctaTrial: { zh: "免费试用", en: "Free trial" },
  ctaLearn: { zh: "了解学习方案", en: "See learning plans" },
  trustParents: { zh: "家长的信赖之选", en: "parents trust us" },
  trustSatisfaction: { zh: "家长满意度", en: "parent satisfaction" },
} as const;

function HeroCopy({ zh, en, className }: { zh: string; en: string; className?: string }) {
  const { lang } = useI18n();
  const isZh = lang === "zh" || lang === "zh-TW";
  return <span className={className}>{isZh ? zh : en}</span>;
}

type CourseCardData = {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  /** 标题/副标题下方的覆盖说明行(仅美语卡有;其余卡不填则不渲染) */
  coverage?: string;
  /** 有照片走 <img>;无照片走 gradient(美语卡即用此,避开真实校名/地标商标风险)。 */
  image?: string;
  gradient?: string;
  /** 右上角小标(其余三卡是校名;美语卡用中性文案,不用真实校名) */
  badge?: string;
};

const COURSE_CARDS: CourseCardData[] = [
  {
    to: "/kids",
    icon: Backpack,
    title: "小学英语",
    desc: "趣味启蒙 打好基础",
    tag: "三年级 - 六年级",
    image: "/landing/universities/stanford.jpg",
    badge: "斯坦福大学",
  },
  {
    to: "/junior",
    icon: BookOpen,
    title: "初中英语",
    desc: "中考同步 高效提分",
    tag: "七年级 - 九年级",
    image: "/landing/universities/harvard.jpg",
    badge: "哈佛大学",
  },
  {
    to: "/gaokao",
    icon: GraduationCap,
    title: "高中英语",
    desc: "高考冲刺 真题训练",
    tag: "高一 - 高三",
    image: "/landing/universities/oxford.jpg",
    badge: "牛津大学",
  },
  {
    // 成人英语卡已替换为美语课程(标题读自单一常量,定名后一处改全站)。
    to: AMERICAN_COURSE_PATH,
    icon: Sparkles,
    title: AMERICAN_COURSE_NAME,
    desc: AMERICAN_COURSE_SUBTITLE,
    coverage: AMERICAN_COURSE_COVERAGE,
    tag: AMERICAN_COURSE_SCALE,
    gradient: "linear-gradient(135deg, #0a1628 0%, #16375f 52%, #c9922e 150%)",
    badge: "美式课程",
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
];

const HERO_AVATARS = ["/landing/avatar1.png", "/landing/avatar2.png", "/landing/avatar3.png"] as const;

/** Hero 配图 — 覆盖 public/landing/hero.png 即可，无需改代码 */
const HERO_IMAGE_SRC = "/landing/hero.png";

function HeroVisual() {
  const [loaded, setLoaded] = useState(false);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const onHeroLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w < 200 || h < 200) return;
    setNatural({ w, h });
    setLoaded(true);
  };

  return (
    <div className="relative flex w-full min-w-0 justify-center md:justify-end">
      <div
        className="relative w-full max-w-full overflow-hidden rounded-2xl bg-[#0a1628] shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
        style={
          natural
            ? { aspectRatio: `${natural.w} / ${natural.h}` }
            : { aspectRatio: "16 / 9", maxHeight: "min(440px, 52vh)" }
        }>
        {!loaded && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2238] to-[#c9922e]/50"
            aria-hidden
          />
        )}
        <img
          src={HERO_IMAGE_SRC}
          alt=""
          className={`block size-full object-contain object-center transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="eager"
          decoding="async"
          onLoad={onHeroLoad}
          onError={() => {
            setLoaded(false);
            setNatural(null);
          }}
        />
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
  admin,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  admin?: boolean;
}) {
  const isHash = href.startsWith("#");
  const className = "text-[13px] font-medium text-white/90 transition hover:text-[#e5b567]";
  if (SOON_HREFS.has(href) && !admin) {
    return (
      <span className="cursor-not-allowed text-[13px] font-medium text-white/40" title="整理中">
        <T>{label}</T>
        <span className="ml-1 text-[9px] opacity-80">整理中</span>
      </span>
    );
  }
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

function CourseCard({ c, admin }: { c: (typeof COURSE_CARDS)[number]; admin?: boolean }) {
  const Icon = c.icon;
  const soon = SOON_HREFS.has(c.to) && !admin;
  const cls =
    "group relative flex min-h-[168px] flex-col overflow-hidden rounded-xl shadow-[0_2px_14px_rgba(15,23,42,0.08)] transition" +
    (soon
      ? " cursor-not-allowed"
      : " hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)]");
  const inner = (
    <>
      {c.image ? (
        <img
          src={c.image}
          alt={c.badge ?? c.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-105 saturate-110"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          style={{ background: c.gradient }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-900/20" />

      <div className="relative z-10 flex h-full flex-col p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="size-[18px] shrink-0" strokeWidth={2.2} aria-hidden />
          </span>
          {c.badge && (
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
              {c.badge}
            </span>
          )}
        </div>

        <div className="mt-auto space-y-1.5">
          <h3 className="text-[15px] font-bold leading-snug">
            <T>{c.title}</T>
          </h3>
          <p className="text-xs leading-relaxed text-white/85">
            <T>{c.desc}</T>
          </p>
          {c.coverage && (
            <p className="text-[11px] leading-relaxed text-white/70">
              <T>{c.coverage}</T>
            </p>
          )}
          <span className="inline-block w-fit rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90">
            {c.tag}
          </span>
          {soon ? (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-xs font-bold text-white/80">
              <T>整理中</T>
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#fcd98a] group-hover:gap-1.5">
              <T>去学习</T> <ArrowRight className="size-3.5 shrink-0" />
            </span>
          )}
        </div>
      </div>
    </>
  );
  return soon ? (
    <div aria-disabled="true" className={cls}>
      {inner}
    </div>
  ) : (
    <Link to={c.to} className={cls}>
      {inner}
    </Link>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // 初中开放;高中(/gaokao、/senior)整理中对普通用户不可点,管理员(aaron)可点进。
  const { isAdmin } = useIsAdmin();
  const navLinks = NAV_LINKS;
  const courseCards = COURSE_CARDS;

  return (
    <main className="landing-page min-h-dvh bg-[#f4f6f9] font-sans text-slate-900 antialiased">
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
          <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-3.5">
            <Link to="/" className="shrink-0 text-[15px] font-bold tracking-tight md:text-base">
              <span className="text-white">Big Moon </span>
              <span className="text-[#e5b567]">English</span>
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-5 lg:flex lg:gap-7">
              {navLinks.map((n) => (
                <NavLink key={n.href} href={n.href} label={n.label} admin={isAdmin} />
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              {/* 登录入口统一由 UserAvatarMenu 承担(未登录→「登录」胶囊、已登录→头像);
                  原先这里另有一个独立「登录」文字链接、且不随登录态隐藏 → 去掉,避免重复/矛盾。 */}
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
                {navLinks.map((n) => (
                  <NavLink
                    key={n.href}
                    href={n.href}
                    label={n.label}
                    admin={isAdmin}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
                {/* 登录入口统一在顶栏 UserAvatarMenu(未登录→胶囊/已登录→头像),此处不再重复放「登录」。 */}
              </div>
            </div>
          )}
        </header>

        <div className="relative z-10 mx-auto grid max-w-[1200px] items-stretch gap-8 px-4 py-8 md:grid-cols-2 md:gap-12 md:px-6 md:py-12 lg:py-14">
          <div className="order-1 flex flex-col justify-center text-center md:order-none md:text-left">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[#e5b567]/35 bg-[#e5b567]/10 px-3 py-1 text-[11px] font-semibold leading-none text-[#e5b567] md:text-xs">
              <Shield className="size-3.5 shrink-0" aria-hidden />
              <HeroCopy {...HERO_COPY.badge} />
            </p>
            <h1 className="mt-5 text-[1.65rem] font-bold leading-[1.22] tracking-tight text-white sm:text-[1.85rem] md:mt-4 md:text-[2.15rem] lg:text-[2.5rem] lg:leading-[1.18]">
              <HeroCopy {...HERO_COPY.title1} />
              <br />
              <span className="text-[#e5b567]">
                <HeroCopy {...HERO_COPY.title2} />
              </span>
            </h1>
            <ul className="mx-auto mt-4 max-w-md space-y-1.5 md:mx-0 md:mt-5">
              {HERO_BULLETS.map((line) => (
                <li
                  key={line.zh}
                  className="flex items-start justify-center gap-2 text-[13px] leading-snug text-white/92 md:justify-start md:text-sm">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#e5b567] md:size-4" strokeWidth={3} aria-hidden />
                  <HeroCopy {...line} />
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-white/72 md:mx-0 md:mt-4 md:text-sm">
              <HeroCopy {...HERO_COPY.subtitle} />
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <a
                href="#courses"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#e5b567]/70 bg-transparent px-6 py-2.5 text-[13px] font-semibold text-[#e5b567] hover:bg-[#e5b567]/10 md:text-sm">
                <HeroCopy {...HERO_COPY.ctaLearn} />
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:mt-7 md:justify-start">
              <div className="flex -space-x-2">
                {HERO_AVATARS.map((src, i) => (
                  <AvatarImg key={src} src={src} alt={`家长 ${i + 1}`} />
                ))}
              </div>
              <p className="text-left text-xs leading-relaxed text-white/80">
                <span className="font-extrabold text-white">1,087,452+</span>{" "}
                <HeroCopy {...HERO_COPY.trustParents} />
                <span className="mx-1.5 text-white/40">|</span>
                <span className="font-bold text-[#e5b567]">98.3%</span>{" "}
                <HeroCopy {...HERO_COPY.trustSatisfaction} />
              </p>
            </div>
          </div>

          <div className="order-2 flex min-h-0 w-full min-w-0 items-stretch overflow-hidden md:order-none md:justify-end">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ═══ 课程卡（左）+ 为什么选择（右） ═══ */}
      <section id="courses" className="scroll-mt-20 bg-[#f4f6f9] py-10 md:py-12">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 md:grid-cols-[1.2fr_0.85fr] md:gap-7 md:px-6 lg:gap-9">
          <div className="order-1 grid grid-cols-1 gap-3 sm:grid-cols-2 md:order-none md:col-start-1 md:row-start-1">
            {courseCards.map((c) => (
              <CourseCard key={c.to} c={c} admin={isAdmin} />
            ))}
          </div>

          {/* 手机端:图书馆紧跟课程卡(order-2)、排在"为什么选择"之前;桌面端跨两列落第 2 行(现状不变) */}
          <div className="order-2 md:order-none md:col-span-2 md:row-start-2">
            <LibraryLandingSection embedded />
          </div>

          <div id="why" className="order-3 scroll-mt-20 md:order-none md:col-start-2 md:row-start-1">
            <h2 className="text-base font-bold text-slate-900 md:text-lg">
              <T>为什么选择 Big Moon English?</T>
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {WHY_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title}>
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e5b567]/15 text-[#c9922e] ring-4 ring-[#e5b567]/10">
                      <Icon className="size-5 shrink-0" aria-hidden />
                    </span>
                    <h3 className="mt-2.5 text-sm font-bold text-slate-900">
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

      {/* 图书馆板块已移入上方 courses 网格(桌面全宽落第 2 行/手机紧跟课程卡),见上。 */}

      {/* ═══ 资料下载区(四学段卡之下·纯新增·DB 驱动,无数据自动隐藏) ═══ */}
      <DownloadsSection />

      {/* ═══ AI Banner（左）+ 家长反馈（右） ═══ */}
      <section className="bg-white py-10 md:py-12">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-9">
          <div className="overflow-hidden rounded-2xl bg-[#0a1628] p-5 text-white shadow-xl md:rounded-3xl md:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <AiDashboardMock />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold leading-snug md:text-lg">
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
              </div>
            </div>
          </div>

          <div id="testimonials" className="scroll-mt-20">
            <h2 className="text-base font-bold text-slate-900 md:text-lg">
              <T>家长们的真实反馈</T>
            </h2>
            <div className="mt-5 space-y-3.5">
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
      <section className="border-y border-slate-200/80 bg-white py-10 md:py-12">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 px-4 md:grid-cols-4 md:gap-8 md:px-6">
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
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex gap-4">
            <span className="inline-flex size-12 shrink-0 aspect-square items-center justify-center rounded-xl bg-[#e5b567]/15 text-[#e5b567]">
              <Shield className="size-7 shrink-0" aria-hidden />
            </span>
            <h3 className="text-lg font-extrabold md:text-xl">
              <T>效果看得见，家长更放心</T>
            </h3>
          </div>
          <div className="grid w-full grid-cols-3 gap-10 sm:grid-cols-3 md:w-auto md:gap-14">
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
        <div className="mx-auto mt-8 flex max-w-[1200px] flex-col items-center justify-between gap-3 border-t border-white/10 px-4 pt-6 text-xs text-white/45 md:flex-row md:px-6">
          <div>© {new Date().getFullYear()} Big Moon English</div>
        </div>
      </footer>
    </main>
  );
}
