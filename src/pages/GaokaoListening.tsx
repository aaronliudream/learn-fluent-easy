import { T } from "@/i18n/T";
import { useMemo } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import { listListeningExercises } from "@/lib/gaokaoContent";
import ModuleStageTests from "@/components/ModuleStageTests";

const GRADE_LABEL: Record<number, string> = { 1: "高一", 2: "高二", 3: "高三" };

export default function GaokaoListening() {
  const [params] = useSearchParams();
  const yearBandParam = params.get("year_band") || params.get("grade");
  const yearBand = yearBandParam ? Number(yearBandParam) : null;
  const backTo = yearBand ? `/gaokao/g/${yearBand}` : "/gaokao";

  const items = useMemo(
    () => listListeningExercises(yearBand ? { yearBand } : undefined),
    [yearBand],
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink
        to={backTo}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {yearBand ? `返回${GRADE_LABEL[yearBand]}` : "返回高中专区"}
      </BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">
        <T>🎧 高中听力训练</T>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        <T>人教版课文脚本 · 浏览器 TTS 朗读（无原版录音）</T>
      </p>
      {yearBand && (
        <ModuleStageTests segment="gaokao" grade={yearBand} module="listening" className="mt-4" />
      )}
      <div className="mt-5 grid gap-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <T>暂无练习，请先运行 pep:refresh</T>
          </p>
        )}
        {items.map((e) => (
          <Link
            key={e.id}
            to={`/gaokao/listening/${e.id}`}
            className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-pink-400"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <Headphones className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{e.title}</div>
              <div className="text-[11px] text-muted-foreground">
                {GRADE_LABEL[e.year_band] ?? e.year_band} · {e.questions.length}{" "}
                <T>题 · 约</T> {Math.round((e.duration_sec ?? 120) / 60)} <T>分钟</T>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
