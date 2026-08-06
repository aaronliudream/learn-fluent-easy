/**
 * 英汉选择(/vocab/:bankCode/quiz)与 今日复习(/vocab/review)。
 *
 * 两条路由同一个组件:复习模式只是把"本轮要考的词"换成 next_review_at 到期队列,
 * 题型、反馈、写入逻辑完全一致 —— 复用而不是复制。
 *
 * ⚠️ 所有作答一律走 vocabMastery.recordAnswer(),**不在本文件里碰任何计数**。
 *    掌握判定/复习档/错题本/成长图四件事都在那个内核里,页面只负责问和显示。
 * ⚠️ 配额:免费用户 200 条掌握记录是 RLS 硬限制。这里做**预检 + 兜底**两层,
 *    任何路径都不允许把 42501 之类的原始错误丢给用户看。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF } from "@/lib/vocab/theme";
import { playUrl, stopAudio } from "@/lib/vocab/audio";
import { startTracking } from "@/lib/vocab/timeTracker";
import { buildQuestions, pickTargets, type QuizQuestion } from "@/lib/vocab/quiz";
import { AnonNote, Feedback, Progress, QuotaModal, Result } from "@/components/vocab/SessionParts";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { dueQueue } from "@/lib/vocab/vocabMastery";
import {
  getBankByCode, listBankWords, listExamples, getWordStatusMap, currentUserId,
  type VocabBank, type VocabWord, type WordStatus,
} from "@/lib/vocab/data";

const ROUND = 10;

export default function VocabQuiz({ mode = "bank" }: { mode?: "bank" | "review" }) {
  const { bankCode = "toefl" } = useParams();
  const navigate = useNavigate();

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [defMode, setDefMode] = useState<"zh" | "en">("zh");
  const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [quotaHit, setQuotaHit] = useState(false);
  const [anon, setAnon] = useState(false);
  const [done, setDone] = useState(false);

  const color = bankColor(bankCode);

  const load = useCallback(async (dm: "zh" | "en") => {
    setState("loading");
    try {
      const b = await getBankByCode(bankCode);
      if (!b) { setState("error"); return; }
      setBank(b);
      const [pool, uid] = await Promise.all([listBankWords(b.id), currentUserId()]);
      setAnon(!uid);
      const statuses = await getWordStatusMap(pool.map(w => w.id)).catch(() => ({} as Record<string, WordStatus>));

      let targets: VocabWord[];
      if (mode === "review") {
        const due = await dueQueue(ROUND);
        const byId = new Map(pool.map(w => [w.id, w]));
        targets = due.map(id => byId.get(id)).filter(Boolean) as VocabWord[];
      } else {
        targets = pickTargets(pool, ROUND, statuses);
      }
      if (!targets.length) { setState("empty"); return; }

      const qs = buildQuestions(pool, targets, dm);
      if (!qs.length) { setState("empty"); return; }
      setQuestions(qs); setIdx(0); setPicked(null); setCorrectCount(0); setDone(false);
      setState("ok");
    } catch {
      setState("error");
    }
  }, [bankCode, mode]);

  useEffect(() => { load(defMode); }, [load, defMode]);
  useEffect(() => () => stopAudio(), []);
  /* 学习时长:做题期间累计活跃时长,切后台/失焦/久不操作自动暂停。
   * 挂在页面级而不是每道题 —— 时长是这一段时间在学,不是答了几题。 */
  useEffect(() => startTracking(), []);

  const q = questions[idx];

  async function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answerIndex;
    if (ok) setCorrectCount(c => c + 1);
    const r = await recordAnswer(q.word.id, ok, defMode === "zh" ? "zh_choice" : "en_choice");
    if (r.quotaBlocked) setQuotaHit(true);
  }

  const topRef = useRef<HTMLDivElement | null>(null);
  function next() {
    stopAudio();
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx(idx + 1); setPicked(null);
    // 回到题面顶部 —— 上一题的反馈层把页面滚下去了,不滚回来下一题会从半截开始
    try { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* 老 webview 忽略 */ }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BackLink to={mode === "review" ? "/vocab" : `/vocab/${bankCode}`} className="inline-flex items-center gap-1 text-[14px] text-slate-500">
            ← {mode === "review" ? "词汇中心" : bank?.name_zh ?? "词库"}
          </BackLink>
          {/* 中文 / EN only 切换胶囊:换的是选项用哪种释义,题目本身不变 */}
          <div className="flex rounded-full border border-black/[0.08] bg-white p-0.5">
            {(["zh", "en"] as const).map(m => (
              <button key={m} onClick={() => setDefMode(m)}
                className={cn("rounded-full px-3 py-1 text-[12px] font-medium",
                  defMode === m ? "bg-slate-900 text-white" : "text-slate-500")}>
                {m === "zh" ? "中文" : "EN only"}
              </button>
            ))}
          </div>
        </div>

        {state === "loading" && <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">出题中…</div>}

        {state === "empty" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[16px] font-medium text-slate-800">
              {mode === "review" ? "今天没有到期的词" : "这个词库还没有可出题的内容"}
            </p>
            <p className="mt-1 text-[14px] text-slate-500">
              {mode === "review" ? "答对的词会按 1/2/4/7/15/30 天的间隔回来找你。" : "先去词表看看。"}
            </p>
            <BackLink to={`/vocab/${bankCode}`} className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
              返回
            </BackLink>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[15px] text-slate-600">加载失败</p>
            <button onClick={() => load(defMode)} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
          </div>
        )}

        {state === "ok" && !done && q && (
          <>
            <div ref={topRef} className="scroll-mt-3" />
            <Progress done={idx} total={questions.length} color={color} />

            {/* 手机端一屏性:大字卡 + 四个选项必须在 375×667 内放下。
                内边距 py-9→py-5、字号上限 48→40、音标行并进大字卡下方。 */}
            <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-5 text-center">
              <h1 className="text-slate-900" style={{ fontFamily: FONT_SERIF, fontSize: "clamp(32px, 10vw, 40px)", fontWeight: 600, lineHeight: 1.1 }}>
                {q.word.headword}
              </h1>
              <button type="button" onClick={() => playUrl(q.word.audio_url, `w:${q.word.id}`)}
                disabled={!q.word.audio_url} aria-label="朗读"
                className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] text-slate-500">
                <Volume2 className="h-4 w-4" />{q.word.ipa}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answerIndex;
                const isPicked = picked === i;
                const reveal = picked !== null;
                return (
                  <button key={i} type="button" onClick={() => choose(i)} disabled={reveal}
                    className={cn(
                      /* 选项:汉字提到 17px,四项等高(min-h)——
                         等高避免长短不一时用排除法猜,也让一屏排布可预测。 */
                      "flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[17px] leading-snug transition",
                      !reveal && "border-black/[0.08] bg-white active:bg-slate-50",
                      reveal && isAnswer && "border-emerald-300 bg-emerald-50 text-emerald-900",
                      reveal && isPicked && !isAnswer && "border-rose-300 bg-rose-50 text-rose-900",
                      reveal && !isAnswer && !isPicked && "border-black/[0.06] bg-white text-slate-400",
                    )}>
                    <span className="min-w-0 flex-1">{opt}</span>
                    {reveal && isAnswer && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
                    {reveal && isPicked && !isAnswer && <X className="h-5 w-5 shrink-0 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <Feedback word={q.word} correct={picked === q.answerIndex} onNext={next}
                lastOne={idx + 1 >= questions.length}
                correctAnswer={picked === q.answerIndex ? undefined : q.options[q.answerIndex]} />
            )}
          </>
        )}

        {done && (
          <Result total={questions.length} correct={correctCount} color={color}
            onAgain={() => load(defMode)} onBack={() => navigate(mode === "review" ? "/vocab" : `/vocab/${bankCode}`)} />
        )}

        {anon && state === "ok" && <AnonNote />}
      </div>

      {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
    </div>
  );
}
