/**
 * 美语课程 · 单元页(/american/hub/:unit)—— 该单元 6 张课卡。
 * 每卡显示标题/语法目标/场景 + 完成环(已完成关卡数 / 10)。
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { T } from "@/i18n/T";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { fetchUnits, fetchCompletedCounts, type AmericanLesson } from "@/lib/american/data";

const STAGES_PER_LESSON = 10;

export default function AmericanUnit() {
  const { unit, bookNo: bookNoParam } = useParams<{ unit: string; bookNo: string }>();
  const unitNo = Number(unit) || 1;
  const bookNo = Number(bookNoParam) || 1; // 旧路由 /american/hub/:unit 无 bookNo → 默认第一册(零回归)
  const nav = useNavigate();
  const [lessons, setLessons] = useState<AmericanLesson[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const units = await fetchUnits(bookNo);
        const u = units.find((x) => x.unit_no === unitNo);
        const ls = u?.lessons ?? [];
        if (!alive) return;
        setLessons(ls);
        const c = await fetchCompletedCounts(ls.map((l) => l.id));
        if (alive) setCounts(c);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [unitNo, bookNo]);

  const title = useMemo(() => lessons[0]?.title_cn ?? "", [lessons]);

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <Link to={`/american/book/${bookNo}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>全部单元</T>
        </Link>

        <header className="mt-3 mb-5">
          <h1 className="text-xl font-bold text-slate-900"><T>单元</T> {unitNo}</h1>
          {title && <p className="mt-0.5 text-sm text-slate-400">{lessons.length} <T>课</T></p>}
        </header>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400"><T>加载中…</T></p>
        ) : lessons.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400"><T>本单元内容制作中</T></p>
        ) : (
          <div className="space-y-3">
            {lessons.map((l) => {
              const done = counts[l.id] ?? 0;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => nav(`/american/lesson/${l.id}`)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:shadow">
                  <MasteryRing value={done / STAGES_PER_LESSON} size={46} stroke={5} colorClass="stroke-emerald-500">
                    <span className="text-[11px] font-bold text-emerald-600">{done}/{STAGES_PER_LESSON}</span>
                  </MasteryRing>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-sky-600"><T>第</T> {l.lesson_no} <T>课</T></p>
                    <p className="mt-0.5 truncate text-[15px] font-semibold text-slate-800">{l.title_en}</p>
                    <p className="truncate text-xs text-slate-400">{l.title_cn}{l.grammar_focus ? ` · ${l.grammar_focus}` : ""}</p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-slate-300" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
