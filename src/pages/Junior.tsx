import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { ArrowLeft } from "lucide-react";
import { JuniorModuleCard } from "@/components/junior/JuniorModuleCard";
import {
  GRADE_LABELS,
  JuniorGradeFilter,
  juniorGradeParams,
  type JuniorGradeKey,
} from "@/components/junior/JuniorGradeFilter";
import { useMasteryOverview } from "@/hooks/useMasteryOverview";
import { listExams } from "@/data/exams";
import { isReviewUnlocked } from "@/lib/suzhouExamProgress";

const LS_KEY = "junior:gradeFilter";

const MODULES = [
  {
    id: "vocabulary",
    key: "vocab" as const,
    title: "词汇",
    subtitle: "核心词汇 · 5种游戏",
    description: "单词闯关 / 任务 / 对决 / 听写 · 边玩边背",
    icon: "vocabulary" as const,
    path: (q: string) => `/junior/vocab${q}`,
  },
  {
    id: "grammar",
    key: "grammar" as const,
    title: "语法",
    subtitle: "中考语法专项",
    description: "时态 · 从句 · 非谓语 · 中考考点直击",
    icon: "grammar" as const,
    path: (q: string) => `/junior/grammar${q}`,
  },
  {
    id: "reading",
    key: "reading" as const,
    title: "阅读",
    subtitle: "阅读理解训练",
    description: "主题阅读 · 答题解析 · 综合理解能力提升",
    icon: "reading" as const,
    path: (q: string) => `/junior/reading${q}`,
  },
  {
    id: "listening",
    key: "listening" as const,
    title: "听力",
    subtitle: "听力短文训练",
    description: "对话短文 · 听音答题 · 中考听力题型",
    icon: "listening" as const,
    path: (q: string) => `/junior/listening${q}`,
  },
  {
    id: "writing",
    key: "writing" as const,
    title: "写作",
    subtitle: "中考写作训练",
    description: "命题作文 · AI批改 · 高分范文对比",
    icon: "writing" as const,
    path: (q: string) => `/junior/writing${q}`,
  },
  {
    id: "exam",
    key: null,
    title: "中考真题",
    subtitle: "历年真题模考",
    description: "限时测试 · 自动判分 · 错题进复习",
    icon: "exam" as const,
    path: () => "/junior/suzhou",
  },
];

function readSavedGrade(): JuniorGradeKey {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "g7" || saved === "g8" || saved === "g9" || saved === "all") return saved;
    if (saved === "7") return "g7";
    if (saved === "8") return "g8";
    if (saved === "9") return "g9";
  } catch {
    /* ignore */
  }
  return "all";
}

function examProgressPercent(): number {
  const exams = listExams();
  if (!exams.length) return 0;
  const done = exams.filter((e) => isReviewUnlocked(e.id)).length;
  return Math.round((done / exams.length) * 100);
}

export default function Junior() {
  const [grade, setGrade] = useState<JuniorGradeKey>(() => readSavedGrade());
  const overview = useMasteryOverview("junior");

  useEffect(() => {
    localStorage.setItem(LS_KEY, grade);
  }, [grade]);

  const { query, pathGrade } = juniorGradeParams(grade);

  const progressByKey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of overview.modules) {
      if (!m.comingSoon) map[m.key] = m.percent;
    }
    map.exam = examProgressPercent();
    const skillKeys = ["vocab", "grammar", "reading", "listening", "writing"] as const;
    const values = skillKeys.map((k) => map[k] ?? 0);
    map.classroom = values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
    return map;
  }, [overview.modules]);

  const classroomSubtitle =
    grade === "all"
      ? "教材配套学习 · 全部年级"
      : `教材配套学习 · ${GRADE_LABELS[grade]}`;

  const classroomTo = pathGrade ? `/junior/g/${pathGrade}` : "/junior/g/2";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <BackLink
          to="/#courses"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary font-['Noto_Serif_SC',serif]"
        >
          <ArrowLeft className="size-4" />
          <T>返回学习阶段</T>
        </BackLink>

        <header className="mb-10">
          <p className="font-display mb-3 text-sm italic tracking-[0.2em] text-primary">
            Junior High English
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl font-['Noto_Serif_SC',serif]">
            <T>初中英语专区</T>
          </h1>
          <p className="mt-4 text-base text-muted-foreground font-['Noto_Serif_SC',serif]">
            <T>用世界名画开启你的英语学习之旅</T>
          </p>
        </header>

        <JuniorGradeFilter value={grade} onChange={setGrade} className="mb-8" />

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {MODULES.map((module) => (
            <JuniorModuleCard
              key={module.id}
              title={module.title}
              subtitle={module.subtitle}
              description={module.description}
              icon={module.icon}
              progress={module.key ? progressByKey[module.key] ?? 0 : progressByKey.exam}
              to={module.path(query)}
            />
          ))}
        </div>

        <JuniorModuleCard
          title="课堂同步"
          subtitle={classroomSubtitle}
          description="同步课本单元 · 知识点精讲 · 课后练习巩固"
          icon="classroom"
          progress={progressByKey.classroom}
          to={classroomTo}
          className="mt-5 min-h-[192px]"
        />

        <footer className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm italic text-muted-foreground font-['Noto_Serif_SC',serif]">
            <T>更多城市真题陆续上线（上海 · 北京 · 广州 ...）</T>
          </p>
        </footer>
      </div>
    </main>
  );
}
