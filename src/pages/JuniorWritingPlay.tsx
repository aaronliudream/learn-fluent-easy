import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { withJuniorPublisher, type JuniorPublisher } from "@/lib/juniorHub/publisher";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { awardCoins } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";

type ErrorPair = {wrong: string;correct: string;note?: string;};
type P = {
  id: string;
  topic: string;
  grade?: number | null;
  prompt_cn: string;
  prompt_en: string;
  requirements: string[];
  min_words: number;
  max_words: number;
  sample_answer: string | null;
  scoring_rubric: string | null;
  title_en: string | null;
  high_sentences: string[] | null;
  error_pairs: ErrorPair[] | null;
  paragraph_template: string | null;
  publisher?: string;
};
type Drill = {id: string;difficulty_label: string | null;prompt: string;hint: string | null;sort_order: number | null;};
type Result = {score: number;overall: string;mistakes: {original: string;corrected: string;explanation: string;}[];suggestions: string[];improved: string;};

export default function JuniorWritingPlay() {
  const { id } = useParams<{id: string;}>();
  const [p, setP] = useState<P | null>(null);
  // 当前写作题所属出版社 → /junior 跳转带上,防外研社写作翻到人教。
  const pub: JuniorPublisher = p?.publisher === "junior_fltrp" ? "fltrp" : "pep";
  const [drills, setDrills] = useState<Drill[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Writing has no multiple-choice answer to leak. Assistant is always available
  // for vocabulary/grammar help while drafting; topic is the writing prompt.
  useRegisterAssistant(
    p ?
    {
      context: "junior_writing",
      ref: p.id,
      topic: `初中写作 · ${p.topic}`,
      mode: "free",
      unlocked: true,
      pageTitle: "💬 小月 · 写作答疑"
    } :
    null
  );

  useEffect(() => {
    if (!id) return;
    (supabase as any).from("junior_writing_prompts").
    select("id,topic,grade,prompt_cn,prompt_en,requirements,min_words,max_words,sample_answer,scoring_rubric,title_en,high_sentences,error_pairs,paragraph_template,publisher").
    eq("id", id).maybeSingle().then(({ data }: any) => setP(data as any));
    (supabase as any).from("junior_writing_drills").
    select("id,difficulty_label,prompt,hint,sort_order").
    eq("prompt_id", id).order("sort_order", { ascending: true }).
    then(({ data }: any) => setDrills(data as Drill[] || []));
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
        body: { prompt: p.prompt_en, promptCn: p.prompt_cn, sample: p.sample_answer ?? "", text, lessonTitle: p.topic, targetLanguage: "Chinese" }
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
          highlights: r.suggestions
        });
      }
      // Reward by score: 5 + bonus
      const reward = Math.max(5, Math.min(30, Math.round(r.score / 5)));
      await awardCoins(reward, "junior_writing");
      await bumpPetSkill("writer_pen", 1);
      recordUnifiedAttempt({
        stage: "junior", grade: 7, module: "writing",
        item_type: "essay", item_id: p.id, item_label: p.topic,
        is_correct: r.score >= 60,
        context: { score: Math.round(r.score), word_count: wordCount }
      }).catch(() => {});
      toast.success(`AI 已批改 · 得分 ${Math.round(r.score)} · +${reward} 星币`);
      celebrateScore(Math.round(r.score));
    } catch (e: any) {
      toast.error(e?.message || "批改失败，请稍后再试");
    } finally {setLoading(false);}
  };

  if (!p) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground"><T>加载中…</T></main>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to={withJuniorPublisher(p?.grade ? `/junior/writing?grade=${p.grade}` : "/junior/writing", pub)} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> <T>返回</T></BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">{p.topic}</h1>
      <div className="mt-3 rounded-2xl border bg-card p-4 text-sm">
        <div className="font-bold"><T>📌 题目</T></div>
        <div className="mt-1 whitespace-pre-wrap">{p.prompt_cn}</div>
        <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{p.prompt_en}</div>
        {p.requirements?.length > 0 &&
        <ul className="mt-3 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
            {p.requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        }
      </div>

      {p.sample_answer &&
      <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="text-sm font-extrabold"><T>✨ 高分范文</T></div>
          {p.title_en && <div className="mt-1 text-xs italic text-amber-700 dark:text-amber-400">{p.title_en}</div>}
          <div className="mt-2 whitespace-pre-line font-serif text-sm leading-relaxed text-amber-950 dark:text-amber-100">{p.sample_answer}</div>
        </section>
      }

      {Array.isArray(p.high_sentences) && p.high_sentences.length > 0 &&
      <section className="mt-4 rounded-2xl border bg-card p-4">
          <div className="text-sm font-extrabold"><T>🌟 高分句型库（共</T> {p.high_sentences.length} <T>句）</T></div>
          <ol className="mt-2 space-y-2 text-sm">
            {p.high_sentences.map((s, i) =>
          <li key={i} className="rounded-lg bg-muted/40 p-2 leading-relaxed">
                <span className="mr-1 font-bold text-fuchsia-600">{i + 1}.</span>{s}
              </li>
          )}
          </ol>
        </section>
      }

      {Array.isArray(p.error_pairs) && p.error_pairs.length > 0 &&
      <section className="mt-4 rounded-2xl border bg-card p-4">
          <div className="text-sm font-extrabold"><T>❌ 常见错误对比（共</T> {p.error_pairs.length} <T>组）</T></div>
          <ul className="mt-2 space-y-3 text-xs">
            {p.error_pairs.map((ep, i) =>
          <li key={i} className="overflow-hidden rounded-lg border">
                <div className="bg-rose-50 px-3 py-2 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"><span className="font-bold"><T>❌ 错误：</T></span>{ep.wrong}</div>
                <div className="bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><span className="font-bold"><T>✅ 正确：</T></span>{ep.correct}</div>
                {ep.note && <div className="bg-muted/50 px-3 py-2 text-muted-foreground"><span className="font-bold"><T>💡 说明：</T></span>{ep.note}</div>}
              </li>
          )}
          </ul>
        </section>
      }

      {p.paragraph_template &&
      <section className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="text-sm font-extrabold"><T>📐 段落结构模板</T></div>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-sky-950 dark:text-sky-100">{p.paragraph_template}</div>
        </section>
      }

      {drills.length > 0 &&
      <section className="mt-4 rounded-2xl border bg-card p-4">
          <div className="text-sm font-extrabold"><T>✏️ 仿写练习（共</T> {drills.length} <T>题）</T></div>
          <ul className="mt-3 space-y-3">
            {drills.map((d) =>
          <li key={d.id} className="rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  {d.difficulty_label &&
              <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[11px] font-bold text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300">{d.difficulty_label}</span>
              }
                  <button
                onClick={() => {setText("");setResult(null);document.getElementById("writing-area")?.scrollIntoView({ behavior: "smooth" });}}
                className="rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 px-3 py-1 text-xs font-extrabold text-white shadow-tile"><T>开始仿写</T>
              </button>
                </div>
                <div className="mt-2 whitespace-pre-line text-sm">{d.prompt}</div>
                {d.hint && <div className="mt-1 text-xs text-muted-foreground">💡 {d.hint}</div>}
              </li>
          )}
          </ul>
        </section>
      }

      {p.scoring_rubric &&
      <section className="mt-4 rounded-2xl border bg-card p-4">
          <div className="text-sm font-extrabold"><T>🎯 评分标准</T></div>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.scoring_rubric}</div>
        </section>
      }

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12}
      id="writing-area"
      placeholder={`请用英语写作（${p.min_words}-${p.max_words} 词）…`}
      className="mt-4 w-full rounded-2xl border-2 border-border bg-card p-4 text-sm leading-relaxed focus:border-pink-400 focus:outline-none" />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount} <T>词 · 目标</T> {p.min_words}-{p.max_words}</span>
        <button disabled={loading} onClick={submit} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-extrabold text-white shadow-tile disabled:opacity-60">
          {loading ? <><Loader2 className="size-4 animate-spin" /> <T>AI 批改中…</T></> : <><Sparkles className="size-4" /> <T>提交 AI 批改</T></>}
        </button>
      </div>

      {result &&
      <section className="mt-6 space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 p-5 text-white shadow-tile">
            <div className="text-xs uppercase tracking-wider opacity-80"><T>AI 综合评分</T></div>
            <div className="mt-1 text-4xl font-black">{Math.round(result.score)} <span className="text-base font-bold opacity-80">/ 100</span></div>
            <p className="mt-2 text-sm leading-relaxed">{result.overall}</p>
          </div>
          {result.mistakes?.length > 0 &&
        <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold"><T>✏️ 修改建议（</T>{result.mistakes.length}）</div>
              <ul className="mt-2 space-y-2 text-xs">
                {result.mistakes.map((m, i) =>
            <li key={i} className="rounded-lg bg-muted/50 p-2">
                    <div className="line-through text-rose-500">{m.original}</div>
                    <div className="font-bold text-emerald-600">{m.corrected}</div>
                    <div className="mt-1 text-muted-foreground">{m.explanation}</div>
                  </li>
            )}
              </ul>
            </div>
        }
          {result.suggestions?.length > 0 &&
        <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold"><T>💡 提升建议</T></div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
        }
          {result.improved &&
        <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold"><T>⭐ AI 改写范文</T></div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{result.improved}</div>
            </div>
        }
          {p.sample_answer &&
        <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-extrabold"><T>📖 参考范文</T></div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{p.sample_answer}</div>
            </div>
        }
        </section>
      }
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <BackLink to={withJuniorPublisher(p?.grade ? `/junior/writing?grade=${p.grade}` : "/junior/writing", pub)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"><ArrowLeft className="size-4" /> <T>返回写作题库</T></BackLink>
        <Link to={withJuniorPublisher("/junior", pub)} className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted"><T>🏫 初中首页</T></Link>
      </div>
    </main>);

}