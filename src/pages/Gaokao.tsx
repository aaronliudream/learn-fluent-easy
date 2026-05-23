import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import { GaokaoHero } from "@/components/gaokao/GaokaoHero";
import { GaokaoModuleCard } from "@/components/gaokao/GaokaoModuleCard";
import {
  GAOKAO_GRADE_LABELS,
  GaokaoGradeFilter,
  gaokaoGradeParams,
  type GaokaoGradeKey,
} from "@/components/gaokao/GaokaoGradeFilter";
import { useMasteryOverview } from "@/hooks/useMasteryOverview";

const LS_KEY = "gaokao:gradeFilter";

const MODULES = [
  {
    id: "vocabulary",
    key: "vocab" as const,
    icon: "vocabulary" as const,
    title: "词汇",
    subtitle: "高考核心词汇 · 3500+",
    description: "词根词缀 / 语境记忆 / 高频考词 · 系统突破",
    path: (q: string) => `/gaokao/vocab${q}`,
  },
  {
    id: "grammar",
    key: "grammar" as const,
    icon: "grammar" as const,
    title: "语法",
    subtitle: "高考语法专项",
    description: "语法填空 · 短文改错 · 从句/非谓语/虚拟语气",
    path: (q: string) => `/gaokao/grammar${q}`,
  },
  {
    id: "reading",
    key: "reading" as const,
    icon: "reading" as const,
    title: "阅读",
    subtitle: "阅读理解训练",
    description: "四篇阅读 · 七选五 · 长难句分析 · 快速定位",
    path: (q: string) => `/gaokao/reading${q}`,
  },
  {
    id: "listening",
    key: null,
    icon: "listening" as const,
    title: "听力",
    subtitle: "高考听力专练",
    description: "对话理解 · 独白听力 · 高考真题模拟",
    path: (_q: string, pathGrade: string | null) =>
      pathGrade ? `/gaokao/g/${pathGrade}` : "/gaokao/g/1",
  },
  {
    id: "writing",
    key: null,
    icon: "writing" as const,
    title: "写作",
    subtitle: "高考写作训练",
    description: "应用文 · 读后续写 · AI批改 · 范文精析",
    path: (_q: string, pathGrade: string | null) =>
      pathGrade ? `/gaokao/g/${pathGrade}` : "/gaokao/g/1",
  },
  {
    id: "exam",
    key: "exam" as const,
    icon: "exam" as const,
    title: "高考真题",
    subtitle: "历年高考真题",
    description: "全国卷 · 新高考卷 · 地方卷 · 限时模考",
    path: () => "/gaokao/exam",
  },
];

function readSavedGrade(): GaokaoGradeKey {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "g1" || saved === "g2" || saved === "g3" || saved === "all") return saved;
  } catch {
    /* ignore */
  }
  return "all";
}

export default function Gaokao() {
  const [grade, setGrade] = useState<GaokaoGradeKey>(() => readSavedGrade());
  const overview = useMasteryOverview("gaokao");

  useEffect(() => {
    localStorage.setItem(LS_KEY, grade);
  }, [grade]);

  const { query, pathGrade } = gaokaoGradeParams(grade);

  const progressByKey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of overview.modules) {
      if (!m.comingSoon) map[m.key] = m.percent;
    }
    const reading = map.reading ?? 0;
    const cloze = map.cloze ?? 0;
    map.readingCombined =
      reading || cloze ? Math.round((reading + cloze) / (reading && cloze ? 2 : 1)) : 0;
    map.exam = Math.round(((map.readingCombined ?? 0) + (map.grammar ?? 0)) / 2);
    map.listening = 0;
    map.writing = 0;
    return map;
  }, [overview.modules]);

  const classroomPercent = useMemo(() => {
    const parts = [
      progressByKey.vocab ?? 0,
      progressByKey.grammar ?? 0,
      progressByKey.readingCombined ?? 0,
    ];
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  }, [progressByKey]);

  const classroomSubtitle =
    grade === "all"
      ? "教材配套学习 · 全部年级"
      : `教材配套学习 · ${GAOKAO_GRADE_LABELS[grade]}`;

  const classroomTo = pathGrade ? `/gaokao/g/${pathGrade}` : "/gaokao/g/1";

  return (
    <main className="min-h-screen bg-background">
      <GaokaoHero />

      <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
        <GaokaoGradeFilter value={grade} onChange={setGrade} className="mb-8" />

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {MODULES.map((module) => {
            let progress = 0;
            if (module.key === "vocab") progress = progressByKey.vocab ?? 0;
            else if (module.key === "grammar") progress = progressByKey.grammar ?? 0;
            else if (module.key === "reading") progress = progressByKey.readingCombined ?? 0;
            else if (module.id === "listening") progress = progressByKey.listening ?? 0;
            else if (module.id === "writing") progress = progressByKey.writing ?? 0;
            else if (module.id === "exam") progress = progressByKey.exam ?? 0;

            const to =
              module.id === "listening" || module.id === "writing"
                ? module.path(query, pathGrade)
                : module.path(query);

            return (
              <GaokaoModuleCard
                key={module.id}
                title={module.title}
                subtitle={module.subtitle}
                description={module.description}
                icon={module.icon}
                progress={progress}
                to={to}
              />
            );
          })}
        </div>

        <GaokaoModuleCard
          title="课堂同步"
          subtitle={classroomSubtitle}
          description="同步课本单元 · 知识点精讲 · 课后练习巩固"
          icon="classroom"
          progress={classroomPercent}
          to={classroomTo}
          className="mt-5 min-h-[192px]"
        />

        <footer className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm italic text-muted-foreground font-['Noto_Serif_SC',serif]">
            <T>更多省份高考真题陆续上线（全国卷 · 新高考 · 地方卷 ...）</T>
          </p>
        </footer>
      </div>
    </main>
  );
}
