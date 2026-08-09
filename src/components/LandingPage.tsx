import { Link } from "react-router-dom";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import { LangToggleEnZh } from "@/i18n/LangToggleEnZh";
import { T } from "@/i18n/T";
import { ArrowRight, Backpack, BookOpen, GraduationCap, Library, Sparkles, SpellCheck } from "lucide-react";
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
  /** true = 电脑端(sm+)跨两列占整行(图书馆卡),手机端仍单列。 */
  spanFull?: boolean;
  /** true = 标题/副文案/去学习整体提一档。全宽卡文字相对卡宽偏小,放大后更好读。 */
  emphasis?: boolean;
  /**
   * true = **整卡居中版式**:图标 → 大标题 → 副标题 → 说明 → 标签 → 去学习,全部水平居中。
   *
   * ⚠️ 目前**只有词汇卡开**(Aaron 2026-08-09:先看这一张的效果,好再统一)。
   *    别顺手给别的卡打开 —— 首页四张卡现在是左对齐的一套版式,
   *    一次只改一张才看得出是不是变好了。
   * ⚠️ 居中卡**不画左上角那个小图标**:图标下移到标题正上方、与标题同一垂直轴,
   *    两处都画就成了一张卡两个图标。右上角 badge 保留(它是角标不是内容)。
   */
  centered?: boolean;
};

/** 入口卡:前 4 张学段卡(桌面 2×2,行优先自然排 → 左列 小学/高中,右列 初中/美语),
 *  第 5 张图书馆卡 spanFull → 桌面跨两列成全宽横条。手机端全部单列竖排。 */
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
  {
    // 图书馆入口(原独立富板块精简为并列入口卡)。整卡 → /library,复用真实大厅图。
    // spanFull:电脑端跨两列成全宽横条,排在 2×2 网格之下。
    to: "/library",
    icon: Library,
    title: "英文图书馆",
    desc: "读英文原著 · 点词即懂",
    tag: "全学段",
    image: "/library-hall.jpg",
    badge: "图书馆",
    spanFull: true,
    // 两张全宽卡统一放大：它们并排在网格下方，字号不一致会很明显。
    emphasis: true,
  },
  {
    // 词汇入口(/vocab)。按考试分的词库,与图书馆的"收藏生词"不是一回事。
    // ⚠️ 文案里不写词数/库数 —— 那些数字只活在 DB 里,写死必然长歪(见 qa:cards 的铁律)。
    // ⚠️ 标题 2026-08-09 由「考试词汇」改为「词汇学习」(Aaron):
    //    这一版把托福/中考/高考都收进来了,"考试"限定得太窄;
    //    而且板块里已经有磨耳朵、词块、场景串记这些不为考试服务的练法。
    //    全仓当时只有这一处写着「考试词汇」(导航/面包屑/meta/sitemap 都没有),已扫过。
    to: "/vocab",
    icon: SpellCheck,
    title: "词汇学习",
    desc: "中考到托福 · 例句带发音",
    tag: "全学段",
    gradient: "linear-gradient(135deg, #1b2a4a 0%, #2f4d7a 55%, #e2600f 150%)",
    badge: "词汇",
    spanFull: true,
    emphasis: true,
    centered: true,     // 只此一张,见 CourseCardData.centered 注释
  },
];

function CourseCard({
  c,
  admin,
  className = "",
  heightClass = "min-h-[200px]",
}: {
  c: CourseCardData;
  admin?: boolean;
  className?: string;
  heightClass?: string;
}) {
  const Icon = c.icon;
  const soon = SOON_HREFS.has(c.to) && !admin;
  const cls =
    `group relative flex ${heightClass} flex-col overflow-hidden rounded-xl shadow-[0_2px_14px_rgba(15,23,42,0.08)] transition` +
    (soon
      ? " cursor-not-allowed"
      : " hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)]") +
    (className ? ` ${className}` : "");
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
        {/* 顶行。居中卡这里**只留右上角 badge** —— 图标下移到标题正上方,
            两处都画会变成一张卡两个图标(见 CourseCardData.centered)。
            用 justify-end 而不是删掉整行:badge 的位置在两种版式下必须一致。 */}
        <div className={`flex items-start gap-2 ${c.centered ? "justify-end" : "justify-between"}`}>
          {!c.centered && (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon className="size-[18px] shrink-0" strokeWidth={2.2} aria-hidden />
            </span>
          )}
          {c.badge && (
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
              {c.badge}
            </span>
          )}
        </div>

        {/* 左对齐版:mt-auto 把内容压到卡底(原样保留)。
            居中版:my-auto 让整块在上下留白里居中 —— 只居中标题、正文仍靠底
            会出现"标题居中、正文左对齐"那种割裂感,Aaron 明确要整卡一致。 */}
        <div className={
          c.centered
            ? "my-auto flex flex-col items-center space-y-2 text-center"
            : "mt-auto space-y-1.5"
        }>
          {/* 居中卡的图标:与标题同一垂直轴,尺寸提一档撑住那片留白(要求 5)。 */}
          {c.centered && (
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="size-6 shrink-0" strokeWidth={2.2} aria-hidden />
            </span>
          )}
          {/* 标题字号:居中卡放大到左对齐版(19px)的 2~2.5 倍。
              ⚠️ 手机 38px / 电脑 46px,**不做 5 倍** —— 那会占掉大半张卡、
                 把说明文字挤没,也和其余三张卡完全脱节(Aaron 2026-08-09 定)。
              ⚠️ 手机最窄 375px 时卡内可用宽约 311px,「词汇学习」4 字 ×38px ≈ 152px,装得下。
                 换更长的标题前先重新量,别想当然。 */}
          <h3 className={
            c.centered
              ? "text-[38px] font-bold leading-tight tracking-tight sm:text-[46px]"
              : `font-bold leading-snug ${c.emphasis ? "text-[19px]" : "text-[15px]"}`
          }>
            <T>{c.title}</T>
          </h3>
          <p className={`leading-relaxed text-white/85 ${c.emphasis ? "text-sm" : "text-xs"}`}>
            <T>{c.desc}</T>
          </p>
          {c.coverage && (
            <p className={`leading-relaxed text-white/70 ${c.emphasis ? "text-xs" : "text-[11px]"}`}>
              <T>{c.coverage}</T>
            </p>
          )}
          {/* w-fit 在居中容器里靠 items-center 自然居中,不用改成 mx-auto */}
          <span className={`inline-block w-fit rounded-md bg-white/15 px-2 py-0.5 font-semibold text-white/90 ${c.emphasis ? "text-[11px]" : "text-[10px]"}`}>
            {c.tag}
          </span>
          {soon ? (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-xs font-bold text-white/80">
              <T>整理中</T>
            </span>
          ) : (
            <span className={`mt-1 inline-flex items-center gap-1 font-bold text-[#fcd98a] group-hover:gap-1.5 ${c.emphasis ? "text-sm" : "text-xs"}`}>
              <T>去学习</T> <ArrowRight className={c.emphasis ? "size-4 shrink-0" : "size-3.5 shrink-0"} />
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
          {/* 手机竖排单列(grid-cols-1)/ 电脑 2 列(sm:grid-cols-2);
              图书馆卡 sm:col-span-2 → 电脑端跨两列成全宽横条,与上方 2×2 总宽对齐。 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COURSE_CARDS.map((c) => (
              <CourseCard
                key={c.to}
                c={c}
                admin={isAdmin}
                className={c.spanFull ? "sm:col-span-2" : ""}
                /* ⚠️ 居中卡要更高:38-46px 的标题 + 上方图标塞不进 160px,
                   硬塞会把「去学习」挤出卡外。只加高**这一张**,其余三张原样。 */
                heightClass={
                  c.centered ? "min-h-[248px] sm:min-h-[268px]"
                    : c.spanFull ? "min-h-[160px]" : "min-h-[200px]"
                }
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
