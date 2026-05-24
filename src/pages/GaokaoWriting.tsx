import { T } from "@/i18n/T";
import { useMemo } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { listWritingPrompts } from "@/lib/gaokaoContent";
import ModuleStageTests from "@/components/ModuleStageTests";

const GRADE_LABEL: Record<number, string> = { 1: "高一", 2: "高二", 3: "高三" };

export default function GaokaoWriting() {
  const [params] = useSearchParams();
  const yearBandParam = params.get("year_band") || params.get("grade");
  const yearBand = yearBandParam ? Number(yearBandParam) : null;
  const backTo = yearBand ? `/gaokao/g/${yearBand}` : "/gaokao";

  const items = useMemo(
    () => listWritingPrompts(yearBand ? { yearBand } : undefined),
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
        <T>✍️ 高中写作训练</T>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        <T>人教版课文主题 · AI 评分 · 范文对比 · 提交奖星币</T>
      </p>
      {yearBand && (
        <ModuleStageTests segment="gaokao" grade={yearBand} module="writing" className="mt-4" />
      )}
      <div className="mt-5 grid gap-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <T>暂无题目，请先运行 pep:refresh 生成教材内容</T>
          </p>
        )}
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/gaokao/writing/${p.id}`}
            className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-pink-400"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white">
              <PenLine className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{p.topic}</div>
              <div className="line-clamp-1 text-[11px] text-muted-foreground">{p.prompt_cn}</div>
              <div className="text-[11px] text-muted-foreground">
                {GRADE_LABEL[p.year_band] ?? p.year_band} · {p.min_words}-{p.max_words}{" "}
                <T>词 · 难度</T> {p.difficulty}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
