import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { T } from "@/i18n/T";
import type { ExamQuestion } from "@/data/exams";
import {
  addExamFavorite,
  isExamFavorite,
  questionSnapshot,
  removeExamFavorite,
} from "@/lib/examFavorites";

type Props = {
  examId: string;
  examTitle?: string;
  question: ExamQuestion;
  className?: string;
};

export default function FavoriteButton({ examId, examTitle, question, className }: Props) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isExamFavorite(examId, question.id).then((v) => {
      if (!cancelled) setSaved(v);
    });
    return () => {
      cancelled = true;
    };
  }, [examId, question.id]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await removeExamFavorite(examId, question.id);
        setSaved(false);
        toast.message("已取消收藏");
      } else {
        await addExamFavorite({
          examId,
          questionId: question.id,
          section: question.section,
          snapshot: questionSnapshot(question, examTitle),
          sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
        });
        setSaved(true);
        toast.success("已加入收藏");
      }
    } catch (e) {
      const msg = e instanceof Error && e.message === "not_signed_in"
        ? "请先登录后再收藏"
        : "收藏失败，请稍后再试";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "取消收藏" : "收藏本题"}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition",
        saved
          ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
          : "text-muted-foreground hover:text-amber-600 hover:bg-amber-50/80",
        className,
      )}>
      <Star className={cn("size-3.5", saved && "fill-amber-500 text-amber-500")} />
      <T>{saved ? "已收藏" : "收藏"}</T>
    </button>
  );
}
