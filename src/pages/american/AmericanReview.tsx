/**
 * 美语课程 · 今日复习(/american/review,Plan C #1 SRS)。
 * 拉跨全课程到期的错题(am_question,due_at<=now),用 QuizRunner 复做;
 * 答题走 recordMastery → SRS 阶梯推进(答对 1/3/7 天出池,答错打回下轮必出)。
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { T } from "@/i18n/T";
import { QuizRunner, questionsToItems, type QuizItem } from "@/components/american/QuizRunner";
import { fetchReviewDue, recordMastery } from "@/lib/american/data";

export default function AmericanReview() {
  const [items, setItems] = useState<QuizItem[] | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchReviewDue()
      .then((qs) => { if (alive) setItems(questionsToItems(qs)); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, []);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);
  const onComplete = useCallback(() => { setFinished(true); }, []);

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <Link to="/american" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>返回美语课程</T>
        </Link>

        <header className="mt-4 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-sm">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <RotateCcw className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold"><T>今日复习</T></h1>
            <p className="text-sm text-white/85"><T>做错的题按遗忘曲线重现,答对多次自动出池</T></p>
          </div>
        </header>

        <div className="mt-5">
          {items === null ? (
            <p className="py-16 text-center text-sm text-slate-400"><T>加载中…</T></p>
          ) : finished || items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-5xl">{items.length === 0 && !finished ? "🎉" : "✅"}</p>
              <h2 className="mt-3 text-xl font-bold text-slate-800">
                {items.length === 0 && !finished ? <T>复习池空啦,没有到期错题</T> : <T>本轮复习完成!</T>}
              </h2>
              <p className="mt-1 text-sm text-slate-500"><T>继续做题,做错的会自动进复习池</T></p>
              <Link to="/american" className="mt-5 inline-flex rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white">
                <T>返回美语课程</T>
              </Link>
            </div>
          ) : (
            <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete} speakStem />
          )}
        </div>
      </div>
    </main>
  );
}
