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
import { useGaokaoClassroomSync } from "@/hooks/useGaokaoClassroomSync";
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
    key: "listening" as const,
    icon: "listening" as const,
    title: "听力",
    subtitle: "人教版课文听力",
    description: "课文脚本 · TTS 朗读 · 理解题（无原版录音）",
    path: (q: string) => `/gaokao/listening${q}`,
  },
  {
    id: "writing",
    key: "writing" as const,
    icon: "writing" as const,
    title: "写作",
    subtitle: "人教版主题写作",
    description: "课文主题作文 · AI 批改 · 范文精析",
    path: (q: string) => `/gaokao/writing${q}`,
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
  const classroom = useGaokaoClassroomSync(grade);

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
    return map;
  }, [overview.modules]);

  const classroomSubtitle =
    grade === "all"
      ? "人教版 7 册 · 按单元同步"
      : `人教版同步 · ${GAOKAO_GRADE_LABELS[grade]}`;

  const classroomTo =
    grade === "g1" ? "/gaokao/hub/1" : grade === "g2" ? "/gaokao/hub/2" : grade === "g3" ? "/gaokao/hub/3" : "/gaokao/hub/1";

  const classroomDescription =
    grade === "all"
      ? `课堂同步 · ${classroom.unitCount} 单元 · 每单元 8 关 · 已完成 ${classroom.mastered}/${classroom.total} 关`
      : `${GAOKAO_GRADE_LABELS[grade]} · ${classroom.unitCount} 单元 · 8 关/单元 · ${classroom.mastered}/${classroom.total} 关`;

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
            else if (module.key === "listening") progress = progressByKey.listening ?? 0;
            else if (module.key === "writing") progress = progressByKey.writing ?? 0;
            else if (module.id === "exam") progress = progressByKey.exam ?? 0;

            const to = module.path(query);

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
          description={classroomDescription}
          icon="classroom"
          progress={classroom.loading ? 0 : classroom.percent}
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
