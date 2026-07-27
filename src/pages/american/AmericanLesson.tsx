/**
 * 美语课程 · 本课关卡列表(/american/lesson/:lessonId)—— 10 关双环。
 * 每关:完成环(emerald)+ 掌握环(amber),照搬 8 年级双环口径。
 * 未实现交互的关卡显示"制作中",内容已就绪。
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { T } from "@/i18n/T";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { AMERICAN_STAGES } from "@/lib/american/stages";
import { bookOf, fetchLessonBundle, fetchLessonMastery, type LessonBundle, type StageProgress } from "@/lib/american/data";

export default function AmericanLesson() {
  const { lessonId = "" } = useParams<{ lessonId: string }>();
  const nav = useNavigate();
  const [bundle, setBundle] = useState<LessonBundle | null>(null);
  const [prog, setProg] = useState<Record<number, StageProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const b = await fetchLessonBundle(lessonId);
        if (!alive) return;
        setBundle(b);
        if (b) {
          const p = await fetchLessonMastery(b);
          if (alive) setProg(p);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [lessonId]);

  if (loading) return <p className="py-16 text-center text-sm text-slate-400"><T>加载中…</T></p>;
  if (!bundle) return <p className="py-16 text-center text-sm text-slate-400"><T>本课内容制作中</T></p>;

  const { lesson } = bundle;

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <Link to={`/american/book/${bookOf(lesson.id)}/hub/${lesson.unit_no}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>单元</T> {lesson.unit_no}
        </Link>

        <header className="mt-3 mb-5">
          <h1 className="text-xl font-bold text-slate-900">{lesson.title_en}</h1>
          <p className="mt-0.5 text-sm text-slate-400">{lesson.title_cn}{lesson.grammar_focus ? ` · ${lesson.grammar_focus}` : ""}</p>
          {/* 课时级汇总:完成度与掌握度并列。只有完成度时,走完所有关就是 100%,
              但那只代表「走过」——每关的琥珀环才是掌握,这里把它们汇总到一处对照。 */}
          {(() => {
            const stages = AMERICAN_STAGES.filter((s) => s.ready);
            if (!stages.length) return null;
            const doneCount = stages.filter((s) => prog[s.stage]?.done).length;
            const fracSum = stages.reduce((a, s) => a + (prog[s.stage]?.masteredFrac ?? 0), 0);
            const masteredPct = Math.round((fracSum / stages.length) * 100);
            return (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="font-semibold text-emerald-600">
                  <T>完成度</T> {Math.round((doneCount / stages.length) * 100)}%
                  <span className="ml-1 text-slate-400">({doneCount}/{stages.length})</span>
                </span>
                <span className="font-semibold text-amber-600">
                  <T>掌握度</T> {masteredPct}%
                </span>
              </div>
            );
          })()}
        </header>

        <div className="space-y-2.5">
          {AMERICAN_STAGES.map((st) => {
            const p = prog[st.stage] ?? { done: false, masteredFrac: 0 };
            return (
              <button
                key={st.stage}
                type="button"
                disabled={!st.ready}
                onClick={() => st.ready && nav(`/american/lesson/${lessonId}/stage/${st.stage}`)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-3.5 text-left transition ${
                  st.ready ? "border-slate-100 bg-white shadow-sm hover:border-sky-300 hover:shadow" : "border-slate-100 bg-slate-100/60"
                }`}>
                {/* 双环:完成 + 掌握 */}
                <div className="relative shrink-0" style={{ width: 46, height: 46 }}>
                  <MasteryRing value={p.done ? 1 : 0} size={46} stroke={4} colorClass="stroke-emerald-500">
                    <MasteryRing value={p.masteredFrac} size={32} stroke={4} colorClass="stroke-amber-500">
                      <span className="text-base leading-none">{st.emoji}</span>
                    </MasteryRing>
                  </MasteryRing>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${st.ready ? "text-slate-800" : "text-slate-400"}`}>
                    <T>{`关${st.stage}`}</T> · <T>{st.label}</T>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {p.done ? <T>已完成</T> : st.ready ? <T>去学习</T> : <span className="inline-flex items-center gap-1"><Lock className="size-3" /><T>制作中</T></span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
