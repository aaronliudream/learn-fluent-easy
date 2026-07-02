/**
 * 美语课程 · 关卡分发(/american/lesson/:lessonId/stage/:stage)。
 * 关1 → AmericanTextStage(已实现);关2–10 → 占位(内容就绪,交互组件后续落地)。
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { T } from "@/i18n/T";
import { AmericanTextStage } from "./AmericanTextStage";
import { stageDef } from "@/lib/american/stages";
import { fetchLessonBundle, type LessonBundle } from "@/lib/american/data";

export default function AmericanStage() {
  const { lessonId = "", stage = "1" } = useParams<{ lessonId: string; stage: string }>();
  const stageNo = Number(stage) || 1;
  const nav = useNavigate();
  const [bundle, setBundle] = useState<LessonBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchLessonBundle(lessonId)
      .then((b) => { if (alive) setBundle(b); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [lessonId]);

  const backToLesson = () => nav(`/american/lesson/${lessonId}`);
  const def = stageDef(stageNo);

  if (loading) return <p className="py-16 text-center text-sm text-slate-400"><T>加载中…</T></p>;
  if (!bundle) return <p className="py-16 text-center text-sm text-slate-400"><T>本课内容制作中</T></p>;

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <button type="button" onClick={backToLesson} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>本课关卡</T>
        </button>
      </div>
      {stageNo === 1 ? (
        <AmericanTextStage bundle={bundle} onDone={backToLesson} />
      ) : (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-4xl">{def?.emoji ?? "🚧"}</p>
          <h1 className="mt-3 text-lg font-bold text-slate-800">
            <T>{`关${stageNo}`}</T> · <T>{def?.label ?? "关卡"}</T>
          </h1>
          <p className="mt-2 text-sm text-slate-500"><T>本关内容已就绪,交互组件制作中,敬请期待。</T></p>
          <Link to={`/american/lesson/${lessonId}`} className="mt-5 inline-block rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">
            <T>返回本课</T>
          </Link>
        </div>
      )}
    </main>
  );
}
