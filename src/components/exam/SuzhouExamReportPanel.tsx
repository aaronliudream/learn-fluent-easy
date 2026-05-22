import { T } from "@/i18n/T";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import {
  DiagnosisTable,
  MistakeBookCallout,
  NextStepCards,
} from "@/components/exam/DiagnosisExtras";
import type { SuzhouExamReport } from "@/lib/suzhouExamReports";
import { buildSuzhouNextSteps } from "@/lib/suzhouExamDiagnosis";

const MODE_LABEL: Record<string, string> = {
  exam: "考试模式",
  practice: "练习模式",
};

function scoreTone(pct: number) {
  if (pct >= 80) return "text-emerald-700 dark:text-emerald-300";
  if (pct >= 60) return "text-amber-700 dark:text-amber-300";
  return "text-rose-700 dark:text-rose-300";
}

function barTone(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export function SuzhouExamReportPanel({
  report,
  onAskAI,
  showArchiveHint = true,
}: {
  report: SuzhouExamReport;
  onAskAI: () => void;
  showArchiveHint?: boolean;
}) {
  const navigate = useNavigate();
  const submittedLabel = new Date(report.submittedAt).toLocaleString("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div id="suzhou-diagnosis-report" className="space-y-6">
      <div className="exam-card overflow-hidden p-0">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">
                <FileText className="size-3.5" />
                <T>诊断报告</T>
              </div>
              <h2 className="exam-display text-[22px] leading-tight sm:text-[26px]">{report.examTitle}</h2>
              <p className="mt-2 text-sm text-white/80">
                {MODE_LABEL[report.mode] ?? report.mode} · {submittedLabel}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70"><T>客观题得分</T></div>
              <div className={`exam-display text-4xl font-extrabold ${scoreTone(report.scorePct)}`} style={{ color: "inherit" }}>
                {report.earned}
                <span className="text-xl opacity-70">/{report.maxScore}</span>
              </div>
              <div className="mt-1 text-sm font-bold">{report.scorePct}% · {report.correctCount}/{report.totalGraded} <T>题正确</T></div>
            </div>
          </div>
        </div>

        {report.weakSections.length > 0 && (
          <div className="border-b exam-divider px-5 py-3 text-sm sm:px-6">
            <span className="exam-mute"><T>薄弱板块：</T></span>{" "}
            <span className="font-bold text-[hsl(var(--exam-accent))]">{report.weakSections.join("、")}</span>
          </div>
        )}

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          {report.sectionScores.map((s) => (
            <div key={s.section} className="rounded-xl border exam-divider bg-[hsl(var(--exam-paper-soft))] px-3 py-2.5">
              <div className="truncate text-[11px] exam-mute">{s.label}</div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <span className="exam-display text-lg font-bold">{s.earned}/{s.max}</span>
                <span className="text-xs font-bold tabular-nums">{s.pct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--exam-rule))]">
                <div className={`h-full ${barTone(s.pct)}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <DiagnosisTable
        rows={report.diagnosis}
        subtitle={`本次客观题 ${report.diagnosis.length} 个考点的对错与陷阱类型`}
      />

      <MistakeBookCallout mistakeCount={report.mistakeCount} onAskAI={onAskAI} />

      <NextStepCards
        heading="为你推荐的下一步"
        subhead="基于本次苏州真题表现生成的学习路径"
        cards={buildSuzhouNextSteps({
          examId: report.examId,
          examTitle: report.examTitle,
          weakestLabel: report.weakSections[0] ?? "重点板块",
          mistakeCount: report.mistakeCount,
          onAskAI,
          navigate: (path) => navigate(path),
        })}
      />

      {showArchiveHint && (
        <p className="text-center text-xs exam-mute">
          <T>报告已保存，可在</T>{" "}
          <button type="button" className="font-bold text-indigo-600 underline" onClick={() => navigate("/me")}>
            <T>我的</T>
          </button>{" "}
          <T>→ 最近测验报告 中随时回看</T>
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="exam-btn exam-btn-primary h-11 flex-1" onClick={onAskAI}>
          <Sparkles className="size-4" />
          <T>和小月复盘这次考试</T>
        </button>
        <button
          type="button"
          className="exam-btn exam-btn-ghost h-11 flex-1"
          onClick={() => navigate(`/junior/suzhou/report/${report.id}`)}
        >
          <FileText className="size-4" />
          <T>单独打开报告页</T>
        </button>
      </div>
    </div>
  );
}
