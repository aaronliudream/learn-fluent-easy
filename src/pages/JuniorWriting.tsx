import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";
import { dbPublisherFor, readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";

type P = {id: string;topic: string;prompt_cn: string;grade: number;min_words: number;max_words: number;difficulty: number;};

export default function JuniorWriting() {
  const [params] = useSearchParams();
  const grade = params.get("grade");
  const pub = readJuniorPublisherParam(params);
  const dbPub = dbPublisherFor(pub); // 出版社过滤:人教='junior'(结果等价),外研社='junior_fltrp'
  const backTo = withJuniorPublisher("/junior", pub); // 返回专区保留出版社
  const [items, setItems] = useState<P[]>([]);
  useEffect(() => {
    let q: any = (supabase as any).from("junior_writing_prompts").
    select("id,topic,prompt_cn,grade,min_words,max_words,difficulty").
    eq("publisher", dbPub).
    order("grade");
    if (grade) q = q.eq("grade", Number(grade));
    q.then(({ data }: any) => setItems((data ?? []) as P[]));
  }, [grade, dbPub]);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回初中专区</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold"><T>✍️ 初中写作训练</T></h1>
      <p className="mt-1 text-sm text-muted-foreground"><T>命题作文 · AI 评分 · 范文对比 · 提交奖星币</T></p>
      {grade &&
      <ModuleStageTests
        segment="junior"
        grade={Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)}
        module="writing"
        className="mt-4" />

      }
      <div className="mt-5 grid gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground"><T>暂无题目，敬请期待</T></p>}
        {items.map((p) =>
        <Link key={p.id} to={withJuniorPublisher(`/junior/writing/${p.id}`, pub)} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-pink-400">
            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white"><PenLine className="size-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-extrabold">{p.topic}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-1">{p.prompt_cn}</div>
              <div className="text-[11px] text-muted-foreground">G{p.grade} · {p.min_words}-{p.max_words} <T>词 · 难度</T> {p.difficulty}</div>
            </div>
          </Link>
        )}
      </div>
    </main>);

}