import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { awardCoins } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { toast } from "sonner";

type P = { id: string; topic: string; prompt_cn: string; prompt_en: string; requirements: string[]; min_words: number; max_words: number; sample_answer: string | null; scoring_rubric: string | null };
type Result = { score: number; overall: string; mistakes: { original: string; corrected: string; explanation: string }[]; suggestions: string[]; improved: string };

export default function JuniorWritingPlay() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<P | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!id) return;
    (supabase as any).from("junior_writing_prompts")
      .select("id,topic,prompt_cn,prompt_en,requirements,min_words,max_words,sample_answer,scoring_rubric")
      .eq("id", id).maybeSingle().then(({ data }: any) => setP(data as any));
  }, [id]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const submit = async () => {
    if (!p || loading) return;
    if (wordCount < Math.max(20, p.min_words - 20)) {
      toast.error(`再写一些吧，至少 ${p.min_words} 词`);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-writing", {
        body: { prompt: p.prompt_en, promptCn: p.prompt_cn, sample: p.sample_answer ?? "", text, lessonTitle: p.topic, targetLanguage: "Chinese" },
      });
      if (error) throw error;
      const r = data as Result;
      setResult(r);
      // Persist attempt + reward
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await (supabase as any).from("junior_writing_attempts").insert({
          user_id: u.user.id, prompt_id: p.id, text, word_count: wordCount,
          overall_score: Math.round(r.score),
          feedback_cn: r.overall,
          corrections: r.mistakes,
          highlights: r.suggestions,
        });
      }
      // Reward by score: 5 + bonus
      const reward = Math.max(5, Math.min(30, Math.round(r.score / 5)));
      await awardCoins(reward, "junior_writing");
      await bumpPetSkill("writer_pen", 1);
      toast.success(`AI 已批改 · 得分 ${Math.round(r.score)} · +${reward} 星币`);
    } catch (e: any) {
      toast.error(e?.message || "批改失败，请稍后再试");
    } finally { setLoading(false); }
  };

  if (!p) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/junior/writing" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">{p.topic}</h1>
      <div className="mt-3 rounded-2xl border bg-card p-4 text-sm">
        <div className="font-bold">📌 题目</div>
        <div className="mt-1 whitespace-pre-wrap">{p.prompt_cn}</div>
        <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{p.prompt_en}</div>
        {p.requirements?.length > 0 && (
          <ul className="mt-3 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
            {p.requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        )}
      </div>

      <textarea value={text} onChange={e => setText(e.target.value)} rows={12}
        placeholder={`请用英语写作（${p.min_words}-${p.max_words} 词）…`}
        className="mt-4 w-full rounded-2xl border-2 border-border bg-card p-4 text-sm leading-relaxed focus:border-pink-400 focus:outline-none" />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount} 词 · 目标 {p.min_words}-{p.max_words}</span>
        <button disabled={loading} onClick={submit} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-extrabold text-white shadow-tile disabled:opacity-60">
          {loading ? <><Loader2 className="size-4 animate-spin" /> AI 批改中…</> : <><Sparkles className="size-4" /> 提交 AI 批改</>}
        </button>
      </div>

      {result && (
        <section className="mt-6 space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 p-5 text-white shadow-tile">
            <div className="text-xs uppercase tracking-wider opacity-80">AI 综合评分</div>
            <div className="mt-1 text-4xl font-black">{Math.round(result.score)} <span className="text-base font-bold opacity-80">/ 100</span></div>
            <p className="mt-2 text-sm leading-relaxed">{result.overall}</p>
          </div>
          {result.mistakes?.length > 0 && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold">✏️ 修改建议（{result.mistakes.length}）</div>
              <ul className="mt-2 space-y-2 text-xs">
                {result.mistakes.map((m, i) => (
                  <li key={i} className="rounded-lg bg-muted/50 p-2">
                    <div className="line-through text-rose-500">{m.original}</div>
                    <div className="font-bold text-emerald-600">{m.corrected}</div>
                    <div className="mt-1 text-muted-foreground">{m.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestions?.length > 0 && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold">💡 提升建议</div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {result.improved && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold">⭐ AI 改写范文</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{result.improved}</div>
            </div>
          )}
          {p.sample_answer && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold">📖 参考范文</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{p.sample_answer}</div>
            </div>
          )}
        </section>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <BackLink to="/junior/writing" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"><ArrowLeft className="size-4" /> 返回写作题库</BackLink>
        <Link to="/junior" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">🏫 初中首页</Link>
        <Link to="/pets" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">🐾 宠物</Link>
      </div>
    </main>
  );
}