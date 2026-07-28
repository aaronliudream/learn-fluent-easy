import { T } from "@/i18n/T";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GaokaoHero } from "@/components/gaokao/GaokaoHero";
import { GaokaoModuleCard, type GaokaoModuleIcon } from "@/components/gaokao/GaokaoModuleCard";
import { GROUP_META, type BookGroupKey } from "@/lib/gaokaoHub/books";
import { useMasteryOverview } from "@/hooks/useMasteryOverview";
import {
  readPublisherParam,
  withPublisher,
  PUBLISHER_META,
  PUBLISHER_ORDER,
} from "@/lib/gaokaoHub/publisher";
import { useExamWhitelisted } from "@/lib/gaokaoHub/examGate";
import { cn } from "@/lib/utils";

const NAVY = "#0E2746";

/* ---------------- 6 张高考专项卡(次级·compact 配角·本轮不改内容) ---------------- */
const MODULES = [
  { id: "vocabulary", key: "vocab" as const, icon: "vocabulary" as const, title: "词汇", subtitle: "高考核心词汇 · 3500+", description: "词根词缀 / 语境记忆 / 高频考词", path: "/gaokao/vocab" },
  { id: "grammar", key: "grammar" as const, icon: "grammar" as const, title: "语法", subtitle: "高考语法专项", description: "语法填空 · 短文改错 · 从句/非谓语", path: "/gaokao/grammar" },
  { id: "reading", key: "reading" as const, icon: "reading" as const, title: "阅读", subtitle: "阅读理解训练", description: "四篇阅读 · 七选五 · 长难句", path: "/gaokao/reading" },
  { id: "listening", key: "listening" as const, icon: "listening" as const, title: "听力", subtitle: "课文听力", description: "课文脚本 · TTS 朗读 · 理解题", path: "/gaokao/listening" },
  { id: "writing", key: "writing" as const, icon: "writing" as const, title: "写作", subtitle: "主题写作", description: "课文主题作文 · AI 批改 · 范文", path: "/gaokao/writing" },
  { id: "exam", key: "exam" as const, icon: "exam" as const, title: "高考真题", subtitle: "历年高考真题", description: "全国卷 · 新高考卷 · 地方卷", path: "/gaokao/exam" },
];

/* ============ 第一层:出版社选择页(裸进 /gaokao,无 publisher 参数时) ============ */
function PublisherChooser() {
  return (
    <main className="min-h-screen bg-background">
      <GaokaoHero />
      <div className="relative z-10 mx-auto -mt-8 max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-2">
          <h2 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}>
            <T>选择出版社</T>
          </h2>
          <p className="mt-1 text-xs" style={{ color: NAVY, opacity: 0.55 }}>
            <T>不同教材的分册与单元不同。选定后进入该版本的课本同步与专项练习。</T>
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PUBLISHER_ORDER.map((code) => {
            const meta = PUBLISHER_META[code];
            return (
              <Link
                key={code}
                to={`/gaokao?publisher=${code}`}
                className={cn(
                  "flex flex-col items-center rounded-2xl border-2 border-border bg-white p-6 text-center shadow-sm transition",
                  "hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg",
                )}
              >
                <span className="text-5xl">{meta.emoji}</span>
                <span className="mt-3 text-lg font-extrabold" style={{ color: NAVY }}>{meta.name}</span>
                <span className="mt-1 text-xs text-muted-foreground">{meta.sub}</span>
                {/* 版本年份是学生选版的唯一判据,字号刻意大于出版社全名(sub),与初中选版页同规格 */}
                <span className="mt-3 text-[15px] font-semibold leading-snug" style={{ color: NAVY, opacity: 0.85 }}>
                  {meta.tagline}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

/* ============ 第二层:某出版社的课本同步 + 专项(带 ?publisher=xxx) ============ */
function PublisherContent({ pub }: { pub: ReturnType<typeof readPublisherParam> }) {
  const examOk = useExamWhitelisted();
  const overview = useMasteryOverview("gaokao");
  const groups = useMemo(() => Object.entries(GROUP_META) as [BookGroupKey, typeof GROUP_META[BookGroupKey]][], []);

  // 高考真题:仅人教 + email 白名单(纯前端藏入口);上外/外研社一律无真题。
  const modules = useMemo(
    () => MODULES.filter((m) => m.id !== "exam" || (pub === "pep" && examOk)),
    [pub, examOk],
  );

  const progressByKey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of overview.modules) if (!m.comingSoon) map[m.key] = m.percent;
    const reading = map.reading ?? 0, cloze = map.cloze ?? 0;
    map.readingCombined = reading || cloze ? Math.round((reading + cloze) / (reading && cloze ? 2 : 1)) : 0;
    map.exam = Math.round(((map.readingCombined ?? 0) + (map.grammar ?? 0)) / 2);
    return map;
  }, [overview.modules]);

  return (
    <main className="min-h-screen bg-background">
      <GaokaoHero />

      <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* 顶部:当前出版社 + 换版本 */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-2.5 shadow-sm">
          <span className="text-sm font-bold" style={{ color: NAVY }}>
            {PUBLISHER_META[pub].emoji} 当前:{PUBLISHER_META[pub].name}
          </span>
          <Link to="/gaokao" className="text-xs font-semibold text-indigo-600 hover:underline">换出版社 →</Link>
        </div>

        {/* 一级:课本两组(主角,名画大卡) */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}>
            <T>课本同步</T>
          </h2>
          <p className="mt-1 text-xs" style={{ color: NAVY, opacity: 0.55 }}>
            <T>{PUBLISHER_META[pub].name}教材 · 选分类进入 → 选册 → 单元 → 9 关闯关。年级提示仅供参考。</T>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groups.map(([key, m]) => (
            <GaokaoModuleCard
              key={key}
              icon={m.icon as GaokaoModuleIcon}
              title={m.title}
              subtitle={m.sub}
              description={m.hint}
              progress={0}
              to={withPublisher(`/gaokao/books/${key}`, pub)}
              badge={key === "required" ? "从这里开始" : undefined}
              centered
            />
          ))}
        </div>

        {/* 次级:高考专项(配角,compact) */}
        <div className="mb-3 mt-10 flex items-baseline gap-2 border-t border-border pt-8">
          <h2 className="text-lg font-bold" style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}>
            <T>高考专项</T>
          </h2>
          <span className="text-xs" style={{ color: NAVY, opacity: 0.5 }}>
            <T>按题型专练 · 跨册聚合</T>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {modules.map((module) => {
            let progress = 0;
            if (module.key === "vocab") progress = progressByKey.vocab ?? 0;
            else if (module.key === "grammar") progress = progressByKey.grammar ?? 0;
            else if (module.key === "reading") progress = progressByKey.readingCombined ?? 0;
            else if (module.key === "listening") progress = progressByKey.listening ?? 0;
            else if (module.key === "writing") progress = progressByKey.writing ?? 0;
            else if (module.id === "exam") progress = progressByKey.exam ?? 0;
            return (
              <GaokaoModuleCard
                key={module.id}
                title={module.title}
                subtitle={module.subtitle}
                description={module.description}
                icon={module.icon}
                progress={progress}
                to={withPublisher(module.path, pub)}
                compact
              />
            );
          })}
        </div>

        <footer className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm italic text-muted-foreground font-['Noto_Serif_SC',serif]">
            <T>更多省份高考真题陆续上线（全国卷 · 新高考 · 地方卷 ...）</T>
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function Gaokao() {
  const [sp] = useSearchParams();
  // 两层:裸进 /gaokao(无 publisher 参数)→ 选择页;带 ?publisher=xxx → 该社内容。
  // ★深链兜底★:子路由(/gaokao/lesson?book=…、/gaokao/vocab 等)不经此页,直达人教内容,不弹选择页。
  if (!sp.has("publisher")) return <PublisherChooser />;
  return <PublisherContent pub={readPublisherParam(sp)} />;
}
