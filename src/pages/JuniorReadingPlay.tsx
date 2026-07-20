import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, Clock, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import NoCopyGuard from "@/components/NoCopyGuard";
import StarRating from "@/components/StarRating";
import { recordMastery, loadMastery, MasteryRow, PASS_PCT } from "@/lib/masteryProgress";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { bumpMistakeCorrect } from "@/lib/mistakeStreak";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { ExamPaper, ExamContainer, ExamCard, ExamOption, ExamProgress } from "@/components/exam/ExamPaper";

type Q = {q: string;options: string[];answer: string;explanation?: string;};
type R = {id: string;title: string;body: string;word_count: number | null;grade: number;questions: Q[];vocab_notes: {word: string;cn: string;}[];};
type ListItem = {id: string;title: string;};

export default function JuniorReadingPlay() {
  const { id } = useParams<{id: string;}>();
  const nav = useNavigate();
  // 来源:从单元Hub阅读关进入时带 ?returnTo=<hub关URL>;有则所有返回出口回 Hub关(而非阅读专区列表)。
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [r, setR] = useState<R | null>(null);
  const [list, setList] = useState<ListItem[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState(0);
  const [email, setEmail] = useState<string>("user");
  const [userId, setUserId] = useState<string | null>(null);
  const [allRevealed, setAllRevealed] = useState(false);
  const startRef = useRef<number>(Date.now());
  const qStartRef = useRef<Record<number, number>>({});
  const [now, setNow] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);
  // Hub 第5关入口(returnTo):做完显示极简"✅完成"中转卡,看到反馈后再回单元关;板块入口不用。
  const [done, setDone] = useState(false);

  // Full-test lock: AI may only discuss the reading after submission.
  useRegisterAssistant(
    r ?
    {
      context: "junior_reading",
      ref: r.id,
      topic: `初中阅读 · ${r.title}`,
      mode: "full-test",
      unlocked: submitted,
      lockedHint: "请先把所有阅读题做完并点「提交」之后再来找我答疑哦 ✨",
      pageTitle: "💬 小月 · 阅读复盘",
      snapshot: submitted ?
      {
        title: r.title,
        passage_excerpt: r.body.slice(0, 1200),
        vocab_notes: r.vocab_notes?.slice(0, 12),
        questions: r.questions.map((q, i) => ({
          index: i + 1,
          stem: q.q,
          options: q.options,
          correct_answer: q.answer,
          user_answer: picks[i],
          is_correct: picks[i] === q.answer,
          explanation: q.explanation
        }))
      } :
      undefined
    } :
    null
  );

  // 推荐阅读时长（秒）：单词数 / 1.8 词每秒（约100词/分钟），最少 30 秒
  const minSec = useMemo(() => Math.max(30, Math.round((r?.word_count ?? 150) / 1.8)), [r?.word_count]);

  useEffect(() => {
    if (!id) return;
    // 切换到新文章(含「下一篇」):重置答题/完成态,避免带入上一篇的选择或完成卡。
    setDone(false);
    setSubmitted(false);
    setPicks({});
    setStreak(0);
    setAttempt(1);
    (async () => {
      const { data } = await supabase.from("junior_reading").select("id,title,body,word_count,grade,questions,vocab_notes,publisher").eq("id", id).maybeSingle();
      setR(data as any);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        setUserId(u.user.id);
        setEmail(u.user.email ?? u.user.id.slice(0, 8));
        setMastery(await loadMastery("junior_reading"));
      }
      const grade = (data as any)?.grade;
      const publisher = (data as any)?.publisher;
      if (grade) {
        // 上一篇/下一篇兄弟篇:按当前文章自身的出版社过滤,防跨社串篇(外研社文章翻到人教文章)。
        let q = supabase.from("junior_reading").select("id,title").eq("grade", grade);
        if (publisher) q = q.eq("publisher", publisher);
        const { data: items } = await q.order("created_at", { ascending: true });
        setList((items ?? []) as ListItem[]);
      }
      startRef.current = Date.now();
      setNow(Date.now());
    })();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 板块入口完成后:停留 10 秒自动返回列表(期间用户可手动点「返回列表/下一篇」)。Hub入口不自动返回。
  useEffect(() => {
    if (!done || returnTo) return;
    const t = setTimeout(() => {
      nav(r?.grade ? `/junior/reading?grade=${r.grade}` : "/junior/reading");
    }, 10000);
    return () => clearTimeout(t);
  }, [done, returnTo, r, nav]);

  const elapsed = Math.floor((now - startRef.current) / 1000);
  const timeOk = elapsed >= minSec;
  const allAnswered = r ? r.questions.every((_, i) => picks[i]) : false;
  const allCorrect = r ? r.questions.every((q, i) => picks[i] === q.answer) : false;
  const correctCount = r ? r.questions.filter((q, i) => picks[i] === q.answer).length : 0;

  const nextItem = useMemo(() => {
    if (!r || !list.length) return null;
    const idx = list.findIndex((x) => x.id === r.id);
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  }, [r, list]);

  const pick = async (qi: number, letter: string) => {
    if (!r || picks[qi]) return;
    const ms = Date.now() - (qStartRef.current[qi] ?? Date.now());
    qStartRef.current[qi] = Date.now();
    setPicks((p) => ({ ...p, [qi]: letter }));
    const ok = letter === r.questions[qi].answer;
    if (userId) {
      await supabase.from("junior_reading_attempts").insert({
        user_id: userId, reading_id: r.id, question_idx: qi,
        user_answer: letter, is_correct: ok
      });
    }
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "junior_reading", `${r.id}:${qi}`, "junior_reading", ms);
      await bumpPetSkill("reading_owl", 1);
    } else {
      setStreak(0);notifyWrong();
    }
    recordUnifiedAttempt({
      stage: "junior",
      grade: r.grade ?? 7,
      module: "reading",
      item_type: "reading_question",
      item_id: `${r.id}:${qi}`,
      item_label: r.title,
      is_correct: ok,
      user_answer: letter,
      correct_answer: r.questions[qi].answer,
      context: { reading_id: r.id, question_idx: qi, explanation: r.questions[qi].explanation }
    }).catch(() => {});
  };

  const handleSubmit = async () => {
    if (!r) return;
    if (!allAnswered) {toast.error("请先回答所有题目");return;}
    if (!timeOk) {toast.warning(`还需阅读 ${minSec - elapsed} 秒`);return;} // 时长不足:不提交、不跳转
    setSubmitted(true);
    const pct = Math.round(correctCount / r.questions.length * 100);
    // 结算页(③诊断/④对话)已去掉,但写库照常:完成+掌握度+复习排程经 recordMastery/completions 写入,
    // 逐题错题在 pick() 已写(junior_reading_attempts + recordUnifiedAttempt)。板块靠这些统计进度/排序。
    if (userId) {
      await supabase.from("junior_reading_completions").
      upsert({ user_id: userId, reading_id: r.id, perfect: pct === 100, time_spent_sec: elapsed }, { onConflict: "user_id,reading_id" });
      const updated = await recordMastery({ module: "junior_reading", itemId: r.id, pct });
      if (updated) setMastery((m) => ({ ...m, [r.id]: updated }));

      // 错题完整快照(自包含,不依赖题库表):整篇原文 + 所有题(题干/选项) + 每题正确答案
      // + 学生每题实际作答 + 对错。提交这一刻 r+picks 全在手边(与 AI 复盘 snapshot 同源)。
      // 一篇一条(onConflict 覆盖),wrong_count=错题数(按题不按次)。题库重灌换 id 不影响此快照。
      // 不动判分/掌握度/junior_reading_attempts/recordUnifiedAttempt,失败仅告警不阻断做题。
      const wrongCount = r.questions.filter((q, i) => picks[i] !== q.answer).length;
      if (wrongCount > 0) {
        const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const snapshot = {
          source: "reading",
          title: r.title,
          body: r.body,
          grade: r.grade,
          questions: r.questions.map((q, i) => ({
            no: i + 1,
            stem: q.q,
            options: Object.fromEntries(q.options.map((opt, oi) => [LETTERS[oi] ?? String(oi), opt])),
            correct_answer: q.answer,
            user_answer: picks[i] ?? null,
            is_correct: picks[i] === q.answer,
            explanation: q.explanation ?? null,
          })),
          wrong_count: wrongCount,
        };
        const { error: snapErr } = await supabase.from("user_mistakes").upsert({
          user_id: userId,
          module: "reading",
          source_key: `junior_reading_passage_${r.id}`,
          source_label: r.title,
          question: r.title ?? "",
          snapshot,
          wrong_count: wrongCount,
          is_resolved: false,
          correct_streak: 0,
          last_correct_date: null,
          last_wrong_at: new Date().toISOString(),
        }, { onConflict: "user_id,module,source_key" });
        if (snapErr) console.warn("[reading mistake snapshot] upsert failed", snapErr);
      } else {
        // 本次全对 → 跨3天连对累计(唯一移出途径),若之前有该篇错题快照
        await bumpMistakeCorrect("reading", `junior_reading_passage_${r.id}`);
      }
    }
    if (pct === 100) {
      await awardForBlock("junior_reading");
    } else if (pct >= PASS_PCT) {
      toast(`✅ 通过 ${pct}% · 100% 才算完美掌握`);
    } else {
      toast.error(`本篇 ${pct}% · 可重做提升`);
    }
    celebrateScore(pct);
    // 写库已完成。两种入口都先停在完成卡,不立即跳转:
    // 板块入口=完成卡含「返回列表/下一篇」+10秒自动返回;Hub第5关入口=极简卡含「返回单元」。
    setDone(true);
  };

  const retry = () => {
    setPicks({});
    setSubmitted(false);
    setStreak(0);
    setAttempt((a) => a + 1);
    startRef.current = Date.now();
  };

  // 完成卡「下一篇」:就地重置答题/完成态再跳到下一篇,避免闪现上一篇完成卡。
  const goNextArticle = () => {
    if (!nextItem) return;
    setDone(false);
    setSubmitted(false);
    setPicks({});
    setStreak(0);
    setAttempt(1);
    startRef.current = Date.now();
    nav(`/junior/reading/${nextItem.id}`);
  };

  // 阅读板块 = 本年级总览,任意篇自由进入,不再套用"上一篇 80% 才解锁"。
  // 掌握度/best_pct 照常记录(pick/handleSubmit),跨入口(第5关)共享不变。

  if (!r) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground"><T>加载中…</T></main>;

  // 结算页(③诊断表/推荐路径/对话)已去掉。做完都先停在完成卡,不立即跳转(写库已在 handleSubmit 完成)。
  if (done) {
    const pct = Math.round((correctCount / r.questions.length) * 100);
    // Hub第5关入口:极简"✅完成"卡 → 返回单元(不自动返回,等用户点)。
    if (returnTo) {
      return (
        <main className="grid min-h-screen place-items-center px-6 text-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-card">
            <div className="text-4xl">{pct === 100 ? "🌟" : "✅"}</div>
            <p className="mt-3 text-lg font-extrabold text-foreground">
              <T>完成！答对</T> {correctCount} / {r.questions.length} <T>题</T>
            </p>
            <Link
              to={returnTo}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-white"
            >
              <T>返回单元</T> →
            </Link>
          </div>
        </main>
      );
    }
    // 阅读板块入口:完成卡含「下一篇/返回列表」,10 秒后自动返回列表。
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-card">
          <div className="text-4xl">{pct === 100 ? "🌟" : "✅"}</div>
          <p className="mt-3 text-lg font-extrabold text-foreground">
            <T>完成！答对</T> {correctCount} / {r.questions.length} <T>题</T>
          </p>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            {pct}%{pct === 100 ? <T> · 完美掌握 ⭐</T> : null}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {nextItem && (
              <button
                onClick={goNextArticle}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 py-3 text-sm font-semibold text-white"
              >
                <T>下一篇</T> →
              </button>
            )}
            <Link
              to={r.grade ? `/junior/reading?grade=${r.grade}` : "/junior/reading"}
              className="inline-flex w-full items-center justify-center rounded-xl border border-border py-3 text-sm font-semibold text-foreground"
            >
              <T>返回阅读列表</T>
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground"><T>10 秒后自动返回列表</T></p>
        </div>
      </main>
    );
  }

  const currentRow = mastery[r.id];
  const passed = (currentRow?.best_pct ?? 0) >= PASS_PCT;
  const perfect = currentRow?.stars && currentRow.stars >= 1;
  const goNext = () => {
    if (returnTo) {nav(returnTo);return;} // 从 Hub 来:做完回单元关,不跨篇
    if (!nextItem) return;
    nav(`/junior/reading/${nextItem.id}`); // 自由进入,不再要求本篇 ≥80%
  };

  const passage = (
    <div className="relative">
      <article className="exam-card p-6 sm:p-8 relative">
        <div className="exam-eyebrow mb-2"><T>Passage 阅读材料</T></div>
        <div className="exam-passage whitespace-pre-wrap">{r.body}</div>
      </article>
      {r.vocab_notes?.length > 0 && (
        <div className="mt-4 exam-card p-4">
          <div className="exam-eyebrow mb-2"><T>Vocabulary 词汇</T></div>
          <div className="flex flex-wrap gap-2">
            {r.vocab_notes.map((v, i) => (
              <span key={i} className="exam-vocab-chip">
                <strong className="exam-display-italic" style={{ color: "hsl(var(--exam-ink))" }}>{v.word}</strong>
                <span className="exam-mute">·</span>
                <span>{v.cn}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const qBlock = (
    <div className="space-y-5">
      {r.questions.map((q, i) => {
        const picked = picks[i];
        const isCorrect = picked === q.answer;
        return (
          <ExamCard key={i}>
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="exam-q-num">No. {String(i + 1).padStart(2, "0")}</span>
              <span className="exam-skill-tag"><T>阅读理解</T></span>
            </div>
            <p className="exam-stem mb-4">{q.q}</p>
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, oi) => {
                const L = ["A", "B", "C", "D"][oi] as "A" | "B" | "C" | "D";
                let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
                if (picked) {
                  if (L === q.answer) state = "correct";
                  else if (picked === L) state = "wrong";
                  else state = "dim";
                }
                return (
                  <ExamOption
                    key={L}
                    letter={L}
                    text={opt}
                    state={state}
                    disabled={!!picked}
                    onClick={() => pick(i, L)}
                  />
                );
              })}
            </div>
            {picked && (
              <div className={cn("exam-feedback", isCorrect ? "exam-feedback-correct" : "exam-feedback-wrong")}>
                <span className="exam-fb-label">{isCorrect ? "✓ Correct" : `✗ Answer: ${q.answer}`}</span>
                {q.explanation && <div className="text-[13.5px] leading-relaxed exam-soft">{q.explanation}</div>}
              </div>
            )}
          </ExamCard>
        );
      })}
    </div>
  );

  const unlocked = true; // 阅读板块自由模式:下一篇始终可进入(掌握度照常记录)

  const progressStates = r.questions.map((q, i) => {
    const p = picks[i];
    if (!p) return "todo" as const;
    return p === q.answer ? ("correct" as const) : ("wrong" as const);
  });

  return (
    <ExamPaper className="pb-32">
      <NoCopyGuard />
      <ExamContainer max="7xl">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b exam-divider">
          <BackLink to={returnTo ?? (r?.grade ? `/junior/reading?grade=${r.grade}` : "/junior/reading")} className="inline-flex items-center gap-1.5 text-[13px] exam-soft hover:exam-ink transition">
            <ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回"}</T>
          </BackLink>
          <div className="flex items-center gap-3">
            <ExamProgress
              states={progressStates}
              label={`${progressStates.filter((s) => s !== "todo").length} / ${r.questions.length}`}
            />
            <span className={cn("exam-timer flex items-center gap-1", !timeOk && "text-[hsl(var(--exam-accent))]")}>
              <Clock className="size-4" /> {Math.min(elapsed, minSec)}/{minSec}s
            </span>
            {currentRow && <StarRating stars={currentRow.stars} size={14} />}
            {attempt > 1 && <span className="exam-skill-tag" style={{ background: "hsl(var(--exam-accent-soft))", color: "hsl(var(--exam-accent))" }}><T>第</T> {attempt} <T>次</T></span>}
          </div>
        </div>

        {/* Title */}
        <header className="mb-8">
          <div className="exam-eyebrow mb-2"><T>初中英语 · 阅读理解</T></div>
          <h1 className="exam-display text-[clamp(26px,3.6vw,40px)] leading-[1.1]">{r.title}</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10 items-start">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto exam-passage-scroll">
            {passage}
          </div>
          <div>
            {qBlock}

            {/* 提交 / 重做 / 下一篇 */}
            <div className="mt-6 exam-card p-5">
            {!submitted ?
            <button onClick={handleSubmit} disabled={!allAnswered}
            className="exam-btn exam-btn-primary w-full">
                <T>提交并判定解锁 (</T>{correctCount}/{r.questions.length})
              </button> :

            <div className="space-y-3">
                <div className="exam-display text-[18px]">
                  <T>得分：</T>{correctCount}/{r.questions.length} <T>· 用时</T> {elapsed}s
                </div>
                {!timeOk ?
              <div className="exam-feedback" style={{ borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" }}>
                    <T>⏳ 阅读时长不足，请再认真读</T> {minSec - elapsed} <T>秒后再提交</T>
                  </div> :
              allCorrect ?
              <div className="exam-feedback exam-feedback-correct">
                    <T>🌟 完美掌握！星级 +1 · 已解锁下一篇</T>
                  </div> :
              passed ?
              <div className="exam-feedback" style={{ borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" }}>
                    <T>✅ 通过 (</T>{correctCount}/{r.questions.length}<T>)！已解锁下一篇 · 重做到 100% 可获得⭐</T>
                  </div> :

              <div className="exam-feedback exam-feedback-wrong">
                    <T>❌ 仅</T> {correctCount}/{r.questions.length}<T>，答对 ≥</T>{Math.ceil(r.questions.length * PASS_PCT / 100)} <T>题算通过 · 可重做提升</T>
                  </div>
              }
                <div className="flex gap-2">
                  {!allCorrect &&
                <button onClick={retry} className="exam-btn exam-btn-ghost flex-1">
                      <RotateCcw className="size-4" /> <T>重做本篇</T>
                    </button>
                }
                  {returnTo ?
                <button onClick={() => nav(returnTo)} className="exam-btn exam-btn-primary flex-1">
                      <T>返回单元</T> <ChevronRight className="size-4" />
                    </button> :
                  nextItem &&
                <button onClick={goNext} disabled={!unlocked} className="exam-btn exam-btn-primary flex-1">
                      {unlocked ? <><T>下一篇</T> <ChevronRight className="size-4" /></> : <><Lock className="size-4" /> <T>解锁后进入下一篇</T></>}
                    </button>
                }
                </div>
              </div>
            }
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t exam-divider flex flex-wrap items-center justify-center gap-2">
          <Link to={returnTo ?? (r?.grade ? `/junior/reading?grade=${r.grade}` : "/junior/reading")} className="exam-btn exam-btn-primary"><ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回阅读列表"}</T></Link>
          <Link to="/junior" className="exam-btn exam-btn-ghost"><T>初中首页</T></Link>
        </div>
      </ExamContainer>
    </ExamPaper>);

}