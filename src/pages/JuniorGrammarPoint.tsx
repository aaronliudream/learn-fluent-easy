import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import TutorChat from "@/components/tutor/TutorChat";
import PaywallDialog from "@/components/PaywallDialog";
import { consumeQuestionQuota } from "@/lib/quota";
import { fireEmojiConfetti } from "@/lib/feedback";
import { Trophy, RotateCw } from "lucide-react";

type Pt = { id: string; title: string; cefr: string; explanation_md: string };
type Q = {
  id: string; stem: string;
  option_a: string | null; option_b: string | null; option_c: string | null; option_d: string | null;
  correct_answer: string | null; explanation: string;
  question_type: "mcq" | "fill" | "transform" | "translation" | "correction" | string | null;
  accepted_answers: string[] | null;
};

const TYPE_LABEL: Record<string, string> = {
  mcq: "选择", fill: "填空", transform: "句型转换", translation: "翻译", correction: "改错",
};

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[.．。!?！？,，;；:：]+$/g, "").trim();
}
function checkOpenAnswer(input: string, q: Q): boolean {
  const acc = (q.accepted_answers && q.accepted_answers.length ? q.accepted_answers : [q.correct_answer || ""])
    .filter(Boolean) as string[];
  const norm = normalize(input);
  return acc.some(a => normalize(a) === norm);
}

export default function JuniorGrammarPoint() {
  const { id } = useParams<{ id: string }>();
  const [pt, setPt] = useState<Pt | null>(null);
  const [qs, setQs] = useState<Q[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [tutorFor, setTutorFor] = useState<Q | null>(null);
  const [paywall, setPaywall] = useState<{ open: boolean; used: number; limit: number }>({ open: false, used: 5, limit: 5 });
  const shownAt = useRef<Record<string, number>>({});

  // Are all questions answered? (MCQ → picked; open → revealed)
  const answeredCount = qs.filter(q =>
    (q.question_type || "mcq") === "mcq" ? !!picks[q.id] : !!reveal[q.id]
  ).length;
  const allDone = qs.length > 0 && answeredCount === qs.length;
  const pct = qs.length ? Math.round((correctCount / qs.length) * 100) : 0;
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (allDone && !celebratedRef.current) {
      celebratedRef.current = true;
      if (pct >= 70) {
        fireEmojiConfetti({ vibrate: pct === 100, count: pct === 100 ? 60 : 36 });
      }
    }
  }, [allDone, pct]);

  const resetAll = () => {
    setPicks({}); setInputs({}); setReveal({});
    setStreak(0); setCorrectCount(0);
    celebratedRef.current = false;
    const now = Date.now();
    qs.forEach(q => { shownAt.current[q.id] = now; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("junior_grammar_points").select("id,title,cefr,explanation_md").eq("id", id).maybeSingle(),
        supabase.from("junior_grammar_questions").select("*").eq("point_id", id).order("sort_order"),
      ]);
      setPt(a.data as Pt);
      const list = (b.data ?? []) as Q[];
      setQs(list);
      const now = Date.now();
      list.forEach(q => { shownAt.current[q.id] = now; });
    })();
  }, [id]);

  const pick = async (q: Q, letter: string) => {
    if (picks[q.id]) return;
    const quota = await consumeQuestionQuota();
    if (!quota.allowed) {
      setPaywall({ open: true, used: quota.used, limit: quota.limit });
      return;
    }
    setPicks(p => ({ ...p, [q.id]: letter }));
    const ok = letter === q.correct_answer;
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      const ms = Date.now() - (shownAt.current[q.id] ?? Date.now());
      await awardForCorrect(next, "junior_grammar", q.id, "junior_grammar", ms);
      const cc = correctCount + 1;
      setCorrectCount(cc);
      if (cc % 5 === 0) await awardForBlock("junior_grammar");
    } else { setStreak(0); notifyWrong(); }
  };

  const submitOpen = async (q: Q) => {
    if (reveal[q.id]) return;
    const ans = (inputs[q.id] || "").trim();
    if (!ans) return;
    const quota = await consumeQuestionQuota();
    if (!quota.allowed) {
      setPaywall({ open: true, used: quota.used, limit: quota.limit });
      return;
    }
    setReveal(r => ({ ...r, [q.id]: true }));
    const ok = checkOpenAnswer(ans, q);
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      const ms = Date.now() - (shownAt.current[q.id] ?? Date.now());
      await awardForCorrect(next, "junior_grammar", q.id, "junior_grammar", ms);
      const cc = correctCount + 1;
      setCorrectCount(cc);
      if (cc % 5 === 0) await awardForBlock("junior_grammar");
    } else { setStreak(0); notifyWrong(); }
  };

  if (!pt) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/junior/grammar" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回考点列表
      </BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">{pt.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">CEFR {pt.cefr}</p>
      <article className="prose prose-sm mt-4 max-w-none rounded-2xl border bg-card p-5 dark:prose-invert">
        <ReactMarkdown>{pt.explanation_md}</ReactMarkdown>
      </article>
      <h2 className="mt-6 mb-3 text-base font-extrabold">📝 练一练 ({correctCount}/{qs.length})</h2>
      <div className="space-y-4">
        {qs.map((q, i) => {
          const qType = (q.question_type || "mcq") as string;
          const isMCQ = qType === "mcq";
          const picked = picks[q.id];
          const revealed = reveal[q.id];
          const userInput = inputs[q.id] || "";
          const openOk = revealed && checkOpenAnswer(userInput, q);
          return (
            <section key={q.id} className="rounded-2xl border bg-card p-4">
              <div className="mb-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {TYPE_LABEL[qType] || qType}
              </div>
              <div className="text-sm font-bold whitespace-pre-wrap">{i + 1}. {q.stem}</div>
              {isMCQ ? (
              <div className="mt-3 grid gap-2">
                {(["A","B","C","D"] as const).map(L => {
                  const txt = (q as any)["option_" + L.toLowerCase()];
                  if (txt == null) return null;
                  const isPicked = picked === L;
                  const isAns = picked && L === q.correct_answer;
                  const isWrong = picked && isPicked && L !== q.correct_answer;
                  return (
                    <button key={L} disabled={!!picked} onClick={() => pick(q, L)}
                      className={cn("rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                        !picked && "border-border hover:border-indigo-400",
                        isAns && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                        isWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                        picked && !isAns && !isWrong && "opacity-60",
                      )}>
                      <span className="mr-2 font-extrabold">{L}.</span>{txt}
                    </button>
                  );
                })}
              </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={userInput}
                    onChange={e => setInputs(s => ({ ...s, [q.id]: e.target.value }))}
                    disabled={revealed}
                    rows={qType === "translation" || qType === "transform" || qType === "correction" ? 2 : 1}
                    placeholder={qType === "translation" ? "请输入英文翻译…" : qType === "correction" ? "请输入改正后的句子…" : qType === "transform" ? "请输入转换后的句子…" : "请填入答案…"}
                    className={cn("w-full rounded-xl border-2 bg-background px-3 py-2 text-sm transition outline-none focus:border-indigo-400",
                      revealed && openOk && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                      revealed && !openOk && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                      !revealed && "border-border",
                    )}
                  />
                  {!revealed ? (
                    <button onClick={() => submitOpen(q)} disabled={!userInput.trim()}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-primary-foreground disabled:opacity-40">
                      提交答案
                    </button>
                  ) : (
                    <div className="rounded-lg bg-muted/60 p-2.5 text-xs">
                      <div className={cn("font-bold", openOk ? "text-emerald-600" : "text-rose-600")}>
                        {openOk ? "✓ 正确" : "✗ 参考答案"}
                      </div>
                      <div className="mt-1 font-mono text-[13px]">{q.correct_answer}</div>
                    </div>
                  )}
                </div>
              )}
              {(isMCQ ? picked : revealed) && q.explanation && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">💡 {q.explanation}</div>
              )}
              {(isMCQ ? picked : revealed) && (
                <div className="mt-3">
                  <button
                    onClick={() => setTutorFor(q)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    <MessageCircleQuestion className="size-3.5" />
                    问小月 / Ask Luna
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {allDone && (
        <section className="mt-6 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 p-6 text-center shadow-tile dark:from-amber-950/30 dark:to-rose-950/30">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">
            {pct === 100 ? "🌟 满分通关！" : pct >= 90 ? "🌟 太厉害啦！" : pct >= 70 ? "👍 不错哦！" : "💪 再来一次会更好！"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            答对 {correctCount} / {qs.length} · 正确率 <span className="font-extrabold text-amber-600">{pct}%</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow"
            >
              <RotateCw className="size-4" /> 再做一遍
            </button>
            <Link
              to="/junior/grammar"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-300 bg-card px-5 py-2 text-sm font-extrabold text-indigo-600 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              📚 下一个考点
            </Link>
            <Link
              to="/junior"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-card px-5 py-2 text-sm font-extrabold text-amber-700 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              🏠 初中首页
            </Link>
          </div>
        </section>
      )}

      {tutorFor && (
        <TutorChat
          context="junior_grammar"
          questionRef={tutorFor.id}
          questionSnapshot={{
            point: pt.title,
            cefr: pt.cefr,
            stem: tutorFor.stem,
            question_type: tutorFor.question_type,
            options: tutorFor.question_type === "mcq"
              ? { A: tutorFor.option_a, B: tutorFor.option_b, C: tutorFor.option_c, D: tutorFor.option_d }
              : undefined,
            correct_answer: tutorFor.correct_answer,
            accepted_answers: tutorFor.accepted_answers,
            user_answer: tutorFor.question_type === "mcq" ? picks[tutorFor.id] : inputs[tutorFor.id],
            is_correct: tutorFor.question_type === "mcq"
              ? picks[tutorFor.id] === tutorFor.correct_answer
              : checkOpenAnswer(inputs[tutorFor.id] || "", tutorFor),
            explanation: tutorFor.explanation,
          }}
          open={!!tutorFor}
          onClose={() => setTutorFor(null)}
        />
      )}

      <PaywallDialog
        open={paywall.open}
        onClose={() => setPaywall((p) => ({ ...p, open: false }))}
        trigger="daily_quota_exhausted"
        used={paywall.used}
        limit={paywall.limit}
      />
    </main>
  );
}