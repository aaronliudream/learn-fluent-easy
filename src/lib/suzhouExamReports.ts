import { supabase } from "@/integrations/supabase/client";
import type { DiagnosisRow } from "@/components/exam/DiagnosisExtras";
import type { SectionScoreRow } from "@/lib/suzhouExamDiagnosis";

const STORAGE_KEY = "suzhou_exam_reports_v1";
const MAX_LOCAL = 30;

export type SuzhouExamReport = {
  id: string;
  examId: string;
  examTitle: string;
  mode: "exam" | "practice";
  submittedAt: string;
  scorePct: number;
  earned: number;
  maxScore: number;
  correctCount: number;
  totalGraded: number;
  mistakeCount: number;
  sectionScores: SectionScoreRow[];
  diagnosis: DiagnosisRow[];
  weakSections: string[];
  answers: Record<string, string>;
  /** synced to cloud when logged in */
  remote?: boolean;
};

function readLocal(): SuzhouExamReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SuzhouExamReport[];
  } catch {
    return [];
  }
}

function writeLocal(reports: SuzhouExamReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_LOCAL)));
  } catch {
    /* ignore */
  }
}

function newId(): string {
  return crypto.randomUUID?.() ?? `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildSuzhouReport(
  payload: Omit<SuzhouExamReport, "id" | "remote">,
): SuzhouExamReport {
  return { ...payload, id: newId(), remote: false };
}

export async function persistSuzhouReport(report: SuzhouExamReport): Promise<SuzhouExamReport> {
  const local = readLocal().filter((r) => r.id !== report.id);
  local.unshift(report);
  writeLocal(local);

  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return report;

    const { data, error } = await supabase
      .from("suzhou_exam_reports" as any)
      .insert({
        id: report.id,
        user_id: u.user.id,
        exam_id: report.examId,
        exam_title: report.examTitle,
        mode: report.mode,
        score_pct: report.scorePct,
        earned: report.earned,
        max_score: report.maxScore,
        correct_count: report.correctCount,
        total_graded: report.totalGraded,
        mistake_count: report.mistakeCount,
        section_scores: report.sectionScores,
        diagnosis: report.diagnosis,
        weak_sections: report.weakSections,
        answers: report.answers,
        created_at: report.submittedAt,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.warn("suzhou_exam_reports insert failed", error);
      return report;
    }
    if (data?.id) return { ...report, id: data.id, remote: true };
  } catch {
    /* non-blocking */
  }
  return report;
}

function mapRemoteRow(row: any): SuzhouExamReport {
  return {
    id: row.id,
    examId: row.exam_id,
    examTitle: row.exam_title,
    mode: row.mode,
    submittedAt: row.created_at,
    scorePct: row.score_pct ?? 0,
    earned: row.earned ?? 0,
    maxScore: row.max_score ?? 0,
    correctCount: row.correct_count ?? 0,
    totalGraded: row.total_graded ?? 0,
    mistakeCount: row.mistake_count ?? 0,
    sectionScores: (row.section_scores ?? []) as SectionScoreRow[],
    diagnosis: (row.diagnosis ?? []) as DiagnosisRow[],
    weakSections: (row.weak_sections ?? []) as string[],
    answers: (row.answers ?? {}) as Record<string, string>,
    remote: true,
  };
}

export async function listRecentSuzhouReports(limit = 8): Promise<SuzhouExamReport[]> {
  const local = readLocal();
  let remote: SuzhouExamReport[] = [];

  try {
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      const { data } = await supabase
        .from("suzhou_exam_reports" as any)
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      remote = (data ?? []).map(mapRemoteRow);
    }
  } catch {
    /* use local only */
  }

  const byId = new Map<string, SuzhouExamReport>();
  for (const r of [...remote, ...local]) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }
  return [...byId.values()]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, limit);
}

export async function getSuzhouReportById(id: string): Promise<SuzhouExamReport | null> {
  const local = readLocal().find((r) => r.id === id);
  if (local) return local;

  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return null;
    const { data } = await supabase
      .from("suzhou_exam_reports" as any)
      .select("*")
      .eq("id", id)
      .eq("user_id", u.user.id)
      .maybeSingle();
    return data ? mapRemoteRow(data) : null;
  } catch {
    return null;
  }
}

export function getLatestLocalReport(examId: string, mode: "exam" | "practice"): SuzhouExamReport | null {
  const matches = readLocal().filter((r) => r.examId === examId && r.mode === mode);
  if (matches.length === 0) return null;
  return matches.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )[0];
}
