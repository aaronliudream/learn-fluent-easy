import { Link } from "react-router-dom";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import { ArrowRight, Backpack, BookOpen, GraduationCap, Library, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  AMERICAN_COURSE_NAME,
  AMERICAN_COURSE_SUBTITLE,
  AMERICAN_COURSE_SCALE,
  AMERICAN_COURSE_COVERAGE,
  AMERICAN_COURSE_PATH,
} from "@/lib/american/brand";

/** 首页落地页（精简版）— 仅用于 `/`，旧学习中枢见 `/?hub=1`。
 *  只保留两样：登录顶栏（logo + EN/中文 + 登录/头像）+ 5 个入口卡。 */

/** 全学段已开放，留空 = 无「整理中」锁（保留机制，未来要锁某入口时往里加 href）。 */
const SOON_HREFS = new Set<string>([]);

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

/** 4 张学段卡 — 桌面 2×2 网格(按此顺序自然排 2 列:左列 小学/高中,右列 初中/美语)。 */
const STAGE_CARDS: CourseCardData[] = [
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

/** 图书馆卡 — 单独一行全宽横条,排在 2×2 网格之下。原独立富板块精简为并列入口卡,整卡 → /library,复用真实大厅图。 */
const LIBRARY_CARD: CourseCardData = {
  to: "/library",
  icon: Library,
  title: "英文图书馆",
  desc: "读英文原著 · 点词即懂",
  tag: "全学段",
  image: "/library-hall.jpg",
  badge: "图书馆",
};

function CourseCard({
  c,
  admin,
  heightClass = "min-h-[200px]",
}: {
  c: CourseCardData;
  admin?: boolean;
  heightClass?: string;
}) {
  const Icon = c.icon;
  const soon = SOON_HREFS.has(c.to) && !admin;
  const cls =
    `group relative flex ${heightClass} flex-col overflow-hidden rounded-xl shadow-[0_2px_14px_rgba(15,23,42,0.08)] transition` +
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
  // 高中(/gaokao、/senior)整理中对普通用户的锁由 SOON_HREFS 控制;管理员(aaron)可点进。
  const { isAdmin } = useIsAdmin();

  return (
    <main className="landing-page min-h-dvh bg-[#f4f6f9] font-sans text-slate-900 antialiased">
      {/* ═══ 深色顶栏:logo + EN/中文切换 + 登录/头像(导航项已全删) ═══ */}
      <header className="relative z-20 border-b border-white/10 bg-[#0a1628] text-white">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-3.5">
          <Link to="/" className="shrink-0 text-[15px] font-bold tracking-tight md:text-base">
            <span className="text-white">Big Moon </span>
            <span className="text-[#e5b567]">English</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <LangToggleEnZh />
            <UserAvatarMenu variant="inline" />
          </div>
        </nav>
      </header>

      {/* ═══ 入口卡 · id="courses" 供 /#courses 深链跳转 ═══ */}
      <section id="courses" className="scroll-mt-20 bg-[#f4f6f9] py-10 md:py-12">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          {/* 4 张学段卡:手机竖排单列 / 桌面 2×2(左列 小学·高中,右列 初中·美语) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {STAGE_CARDS.map((c) => (
              <CourseCard key={c.to} c={c} admin={isAdmin} />
            ))}
          </div>
          {/* 图书馆:单独一行,全宽横条,与上方 2×2 网格总宽对齐 */}
          <div className="mt-4">
            <CourseCard c={LIBRARY_CARD} admin={isAdmin} heightClass="min-h-[160px]" />
          </div>
        </div>
      </section>
    </main>
  );
}
