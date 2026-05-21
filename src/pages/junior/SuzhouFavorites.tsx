import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Star, Trash2, FileText, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { T } from "@/i18n/T";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listExamFavorites, removeExamFavorite, type ExamFavorite } from "@/lib/examFavorites";
import { getExam, listExams } from "@/data/exams";
import { isReviewUnlocked } from "@/lib/suzhouExamProgress";
import { SECTION_META, questionNum } from "@/lib/suzhouExamUtils";

export default function SuzhouFavorites() {
  const [items, setItems] = useState<ExamFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const examTitles = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of listExams()) map[e.id] = e.title;
    return map;
  }, []);

  const refresh = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const isIn = !!u?.user;
    setSignedIn(isIn);
    if (!isIn) {
      setItems([]);
      setLoading(false);
      return;
    }
    setItems(await listExamFavorites());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRemove = async (item: ExamFavorite) => {
    try {
      await removeExamFavorite(item.exam_id, item.question_id);
      setItems((prev) => prev.filter((p) => p.id !== item.id));
      toast.message("已移除收藏");
    } catch {
      toast.error("操作失败");
    }
  };

  const labelFor = (item: ExamFavorite) => {
    const snap = item.snapshot as Record<string, unknown>;
    const stem = String(snap.stem || "").trim();
    if (stem) return stem.slice(0, 120);
    const exam = getExam(item.exam_id);
    const q = exam?.questions.find((qq) => qq.id === item.question_id);
    return q?.stem?.slice(0, 120) || q?.knowledge_point || item.question_id;
  };

  const grouped = useMemo(() => {
    const map = new Map<string, ExamFavorite[]>();
    for (const item of items) {
      const arr = map.get(item.exam_id) ?? [];
      arr.push(item);
      map.set(item.exam_id, arr);
    }
    return [...map.entries()].sort((a, b) => {
      const ya = getExam(a[0])?.year ?? 0;
      const yb = getExam(b[0])?.year ?? 0;
      return yb - ya;
    });
  }, [items]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8 pb-24">
      <PageHeader
        title="⭐ 苏州真题收藏"
        subtitle="收藏的题目随时复习，可跳转原卷查看解析"
        back="/junior/suzhou"
      />

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {!loading && signedIn === false && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mb-3 text-4xl">🔐</div>
          <p className="mb-4 text-sm text-muted-foreground"><T>登录后可收藏题目并在此复习</T></p>
          <Link to="/auth" className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <T>去登录</T>
          </Link>
        </div>
      )}

      {!loading && signedIn && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Star className="mx-auto mb-3 size-10 text-amber-400" />
          <p className="font-bold"><T>还没有收藏的题目</T></p>
          <p className="mt-1 text-sm text-muted-foreground"><T>在做题时点击「收藏」即可加入本页</T></p>
          <Link to="/junior/suzhou" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
            <T>去做真题</T> <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {!loading && signedIn && grouped.length > 0 && (
        <div className="mt-6 space-y-8">
          {grouped.map(([examId, favs]) => (
            <section key={examId}>
              <div className="mb-3 flex items-center gap-2">
                <FileText className="size-4 text-amber-600" />
                <h2 className="text-sm font-extrabold">{examTitles[examId] ?? examId}</h2>
                <span className="text-xs text-muted-foreground">{favs.length} 题</span>
              </div>
              <ul className="space-y-2">
                {favs.map((item) => {
                  const num = questionNum(item.question_id);
                  const sectionLabel =
                    item.section && item.section in SECTION_META
                      ? SECTION_META[item.section as keyof typeof SECTION_META].title.split("·")[0]?.trim()
                      : item.section;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-sm font-extrabold text-amber-700">
                        {num}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          {sectionLabel && <span className="rounded bg-muted px-1.5 py-0.5">{sectionLabel}</span>}
                          <span>{String((item.snapshot as Record<string, unknown>).knowledge_point ?? "")}</span>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-2">{labelFor(item)}</p>
                        <Link
                          to={
                            isReviewUnlocked(item.exam_id)
                              ? `/junior/suzhou/${item.exam_id}?mode=review&q=${item.question_id}`
                              : `/junior/suzhou/${item.exam_id}?mode=practice&q=${item.question_id}`
                          }
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                          <T>查看原题</T> <ArrowRight className="size-3" />
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                        aria-label="移除收藏">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
