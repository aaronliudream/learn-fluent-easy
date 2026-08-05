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
import { Check, ChevronDown, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, CTA_SHADOW, FONT_SERIF, FONT_STAT, GRAD_CTA } from "@/lib/vocab/theme";
import { playUrl, stopAudio } from "@/lib/vocab/audio";
import { buildQuestions, optionText, pickTargets, readAutoplay, writeAutoplay, type QuizQuestion } from "@/lib/vocab/quiz";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { dueQueue } from "@/lib/vocab/vocabMastery";
import {
  getBankByCode, listBankWords, listExamples, getWordStatusMap, currentUserId,
  type VocabBank, type VocabWord, type VocabExample, type WordStatus,
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

  const q = questions[idx];

  async function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answerIndex;
    if (ok) setCorrectCount(c => c + 1);
    const r = await recordAnswer(q.word.id, ok, defMode === "zh" ? "zh_choice" : "en_choice");
    if (r.quotaBlocked) setQuotaHit(true);
  }

  function next() {
    stopAudio();
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx(idx + 1); setPicked(null);
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
            {/* 进度 */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${((idx) / questions.length) * 100}%`, background: color }} />
              </div>
              <span className="shrink-0 text-[13px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                {idx + 1} / {questions.length}
              </span>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-9 text-center">
              <h1 className="text-slate-900" style={{ fontFamily: FONT_SERIF, fontSize: "clamp(34px, 11vw, 48px)", fontWeight: 600, lineHeight: 1.15 }}>
                {q.word.headword}
              </h1>
              <button type="button" onClick={() => playUrl(q.word.audio_url, `w:${q.word.id}`)}
                disabled={!q.word.audio_url} aria-label="朗读"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] text-slate-500">
                <Volume2 className="h-4 w-4" />{q.word.ipa}
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answerIndex;
                const isPicked = picked === i;
                const reveal = picked !== null;
                return (
                  <button key={i} type="button" onClick={() => choose(i)} disabled={reveal}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-[16px] transition",
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
              <Feedback word={q.word} correct={picked === q.answerIndex} color={color} onNext={next}
                lastOne={idx + 1 >= questions.length} />
            )}
          </>
        )}

        {done && (
          <Result total={questions.length} correct={correctCount} color={color}
            onAgain={() => load(defMode)} onBack={() => navigate(mode === "review" ? "/vocab" : `/vocab/${bankCode}`)} />
        )}

        {anon && state === "ok" && (
          <p className="mt-5 rounded-xl bg-slate-100 px-3.5 py-3 text-[13px] leading-relaxed text-slate-500">
            未登录状态下答题不会保存进度。登录后掌握度、错题本才会开始记录。
          </p>
        )}
      </div>

      {/* 配额到顶:占位提示,不是报错。核销逻辑在支付线 PR。 */}
      {quotaHit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-center">
            <p className="text-[17px] font-semibold text-slate-900">免费额度已用完</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
              免费可学 200 个词。解锁功能即将上线,你已有的学习记录不会丢。
            </p>
            <button onClick={() => setQuotaHit(false)}
              className="mt-5 w-full rounded-xl border border-black/[0.08] px-4 py-2.5 text-[15px] text-slate-700">
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 反馈弹层:对错 + 例句 1 + 自动朗读 + "查看全部 3 句"折叠。
 * 例句 1 是 sort_order=1,即**最高频搭配**那句 —— 反馈只给一句时必须给最有代表性的。
 */
function Feedback({ word, correct, color, onNext, lastOne }: {
  word: VocabWord; correct: boolean; color: string; onNext: () => void; lastOne: boolean;
}) {
  const [rows, setRows] = useState<VocabExample[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [autoplay, setAutoplay] = useState(readAutoplay());
  const played = useRef(false);

  useEffect(() => {
    let alive = true;
    listExamples(word.id).then(r => {
      if (!alive) return;
      setRows(r);
      // 自动朗读例句 1(设置可关)。played 防重放:折叠展开触发的重渲染不该再响一次。
      if (autoplay && !played.current && r[0]?.audio_url) { played.current = true; playUrl(r[0].audio_url, `e:${r[0].id}`); }
    }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, [word.id, autoplay]);

  const list = rows ?? [];
  const shown = showAll ? list : list.slice(0, 1);

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className={cn("mb-3 flex items-center gap-2 text-[16px] font-semibold",
        correct ? "text-emerald-700" : "text-rose-700")}>
        {correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        {correct ? "答对了" : "答错了"}
        {!correct && <span className="ml-1 text-[14px] font-normal text-slate-500">已加入错题本</span>}
      </div>

      <div className="mb-3 text-[15px] font-medium text-slate-800">{word.def_zh}</div>

      {shown.map(ex => (
        <div key={ex.id} className="border-t border-black/[0.06] py-3">
          {ex.collocation && <div className="mb-1 text-[12px] font-medium tracking-[0.02em] text-slate-400">{ex.collocation}</div>}
          <button type="button" onClick={() => playUrl(ex.audio_url, `e:${ex.id}`)} disabled={!ex.audio_url}
            className="flex w-full items-start gap-2 text-left">
            <Volume2 className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-[16px] leading-relaxed text-slate-800">{ex.sentence}</span>
          </button>
          <p className="mt-1 pl-6 text-[13px] leading-relaxed text-slate-500">{ex.translation_zh}</p>
        </div>
      ))}

      {list.length > 1 && (
        <button type="button" onClick={() => setShowAll(v => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[13px] text-slate-500">
          {showAll ? "收起" : `查看全部 ${list.length} 句`}
          <ChevronDown className={cn("h-3.5 w-3.5", showAll && "rotate-180")} />
        </button>
      )}

      <label className="mt-3 flex items-center gap-2 text-[12px] text-slate-400">
        <input type="checkbox" checked={autoplay}
          onChange={e => { setAutoplay(e.target.checked); writeAutoplay(e.target.checked); }} />
        自动朗读例句
      </label>

      <button type="button" onClick={onNext}
        className="mt-4 w-full rounded-2xl px-5 py-3.5 text-center text-[16px] font-semibold text-white"
        style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
        {lastOne ? "看结果" : "下一题"}
      </button>
    </div>
  );
}

function Result({ total, correct, color, onAgain, onBack }: {
  total: number; correct: number; color: string; onAgain: () => void; onBack: () => void;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
      <div className="text-[15px] text-slate-500">本轮结果</div>
      <div className="mt-2 flex items-baseline justify-center gap-1.5">
        <span className="text-slate-900" style={{ fontFamily: FONT_STAT, fontSize: "clamp(44px, 13vw, 56px)", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{correct}</span>
        <span className="text-[16px] text-slate-400">/ {total}</span>
      </div>
      <div className="mt-1 text-[14px]" style={{ color }}>正确率 {pct}%</div>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
        答对的词按 1 / 2 / 4 / 7 / 15 / 30 天的间隔回来复习;答错的进错题本,连对 3 天自动移出。
      </p>
      <button onClick={onAgain} className="mt-5 w-full rounded-2xl px-5 py-3.5 text-[16px] font-semibold text-white"
        style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>再来一轮</button>
      <button onClick={onBack} className="mt-2.5 w-full rounded-2xl border border-black/[0.08] px-5 py-3 text-[15px] text-slate-700">返回</button>
    </div>
  );
}
