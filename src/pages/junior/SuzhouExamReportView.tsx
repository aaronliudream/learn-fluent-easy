import { T } from "@/i18n/T";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { getExam } from "@/data/exams";
import { SuzhouExamReportPanel } from "@/components/exam/SuzhouExamReportPanel";
import { ExamPaper as ExamPaperShell, ExamContainer } from "@/components/exam/ExamPaper";
import { getSuzhouReportById, type SuzhouExamReport } from "@/lib/suzhouExamReports";
import { findFirstWrongQuestion, formatSuzhouAnswer } from "@/lib/suzhouExamDiagnosis";
import { questionNum } from "@/lib/suzhouExamUtils";

export default function SuzhouExamReportView() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<SuzhouExamReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }
    getSuzhouReportById(reportId).then((r) => {
      setReport(r);
      setLoading(false);
    });
  }, [reportId]);

  const exam = report ? getExam(report.examId) : undefined;

  const handleAskAI = () => {
    if (!report) return;
    if (exam) {
      const wrong = findFirstWrongQuestion(exam, report.answers);
      if (wrong) {
        const num = questionNum(wrong.id);
        navigate(
          `/junior/suzhou/${report.examId}?mode=${report.mode}&q=${wrong.id}`,
        );
        return;
      }
    }
    navigate(`/junior/suzhou/${report.examId}?mode=${report.mode}`);
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground"><T>未找到该诊断报告，可能已过期或未同步到此设备。</T></p>
        <Link to="/me" className="mt-4 inline-block text-sm font-bold text-primary underline"><T>返回我的</T></Link>
      </main>
    );
  }

  const wrongRows = report.diagnosis.filter((d) => !d.isCorrect);

  return (
    <ExamPaperShell>
      <ExamContainer max="5xl" className="py-6 md:py-10">
        <Link
          to="/me"
          className="mb-5 inline-flex items-center gap-1 text-sm exam-soft hover:text-[hsl(var(--exam-ink))]"
        >
          <ArrowLeft className="size-4" /> <T>返回我的</T>
        </Link>

        <SuzhouExamReportPanel report={report} onAskAI={handleAskAI} showArchiveHint={false} />

        {wrongRows.length > 0 && exam && (
          <div className="mt-8 exam-card p-5 sm:p-6">
            <h3 className="exam-display text-[17px] mb-4"><T>错题摘要</T></h3>
            <div className="space-y-3">
              {wrongRows.map((row) => {
                const q = exam.questions.find((x) => questionNum(x.id) === row.index);
                if (!q) return null;
                return (
                  <div key={row.index} className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-3 text-sm dark:bg-rose-950/20">
                    <div className="mb-1 font-bold">
                      <T>第</T> {row.index} <T>题</T> · {row.point}
                    </div>
                    <div className="grid gap-1 text-xs sm:grid-cols-2">
                      <p>
                        <span className="exam-mute"><T>你的答案：</T></span>{" "}
                        <span className="font-bold text-rose-700">{formatSuzhouAnswer(q, report.answers[q.id])}</span>
                      </p>
                      <p>
                        <span className="exam-mute"><T>正确答案：</T></span>{" "}
                        <span className="font-bold text-emerald-700">{formatSuzhouAnswer(q, q.answer)}</span>
                      </p>
                    </div>
                    {q.explanation && (
                      <p className="mt-2 text-xs exam-mute">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="exam-btn exam-btn-primary" onClick={handleAskAI}>
            <Sparkles className="size-4" /> <T>AI 复盘</T>
          </button>
          <Link to={`/junior/suzhou/${report.examId}?mode=review`} className="exam-btn exam-btn-ghost">
            <T>查看试卷解析</T>
          </Link>
        </div>
      </ExamContainer>
    </ExamPaperShell>
  );
}
