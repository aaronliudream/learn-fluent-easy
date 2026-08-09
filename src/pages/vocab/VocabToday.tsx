/**
 * 今日学习(/vocab/today)—— 一键继续,不让用户选模式。
 *
 * 序列由 `todayPlan.buildTodayPlan` 排好:复习 → 错题 → 新词。
 * 每一项用什么题型也由编排层定(复习=英汉选择 / 错题=当初错的那种 / 新词=先看卡再考)。
 *
 * ⚠️ **不新建作答/掌握度逻辑**:判分和写库一律走 `vocabMastery.recordAnswer`,
 *    反馈层一律用 `SessionParts.Feedback` —— 这个页面只负责"按顺序把题递出去"。
 *    另写一套的话,今日学习和其它模式会对同一个词给出不同的掌握度结果。
 * ⚠️ 未登录也让进(规格第五节):能试做,只是不写库(recordAnswer 内部处理)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import WordCard from "@/components/vocab/WordCard";
import { bankColor, CTA_SHADOW, FONT_SERIF, GRAD_CTA, readSelectedBank } from "@/lib/vocab/theme";
import { getBankByCode, listExamples, type VocabBank, type VocabExample, type VocabWord } from "@/lib/vocab/data";
import { optionText } from "@/lib/vocab/quiz";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { startTracking } from "@/lib/vocab/timeTracker";
import { AnonNote, Feedback, LetterDiff, QuotaModal } from "@/components/vocab/SessionParts";
import { buildTodayPlan, countDueTomorrow, EMPTY_PLAN, type TodayPlan, type TodayTask } from "@/lib/vocab/todayPlan";
import { getStats } from "@/lib/vocab/stats";
import { fallback, logFail } from "@/lib/vocab/report";

const KIND_LABEL: Record<TodayTask["kind"], string> = {
  review: "复习", mistake: "错题", new: "新词",
};

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}

export default function VocabToday() {
  const navigate = useNavigate();
  const bankCode = readSelectedBank() || "toefl";
  const color = bankColor(bankCode);

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [plan, setPlan] = useState<TodayPlan | null>(null);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  /** 新词的"先看一遍"阶段。看完点继续才出题。 */
  const [reading, setReading] = useState(false);
  const [examples, setExamples] = useState<VocabExample[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [right, setRight] = useState(0);
  const [quotaHit, setQuotaHit] = useState(false);
  /** 结算页的两个数。**字段 null = 那一项没取到**(渲染成「—」),不是 0。 */
  const [doneInfo, setDoneInfo] = useState<{ dueTomorrow: number | null; streak: number | null } | null>(null);
  const wrote = useRef<Set<number>>(new Set());

  useEffect(() => startTracking(), []);

  const load = useCallback(async () => {
    setFailed(false); setPlan(null);
    try {
      const b = await getBankByCode(bankCode);
      setBank(b);
      if (!b) { setFailed(true); return; }
      const p = await buildTodayPlan(b.id);
      setPlan(p);
      setIdx(0); setRight(0); setDoneInfo(null); wrote.current = new Set();
      setReading(p.tasks[0]?.showCardFirst ?? false);
    } catch (e) {
      logFail("VocabToday/buildTodayPlan", e);
      setFailed(true);
    }
  }, [bankCode]);
  useEffect(() => { load(); }, [load]);

  const tasks = plan?.tasks ?? [];
  const cur = tasks[idx] ?? null;
  const total = tasks.length;

  /* 新词的看卡阶段要例句;出题阶段不需要(反馈层自己会拉) */
  useEffect(() => {
    if (!cur || !reading) { setExamples([]); return; }
    let alive = true;
    /* 没例句照样能看卡 —— 正确降级,不做失败态 UI,但要留日志 */
    listExamples(cur.word.id)
      .then(r => { if (alive) setExamples(r); })
      .catch(fallback("VocabToday/listExamples", [] as VocabExample[]));
    return () => { alive = false; };
  }, [cur, reading]);

  /** 选择题的四个选项:答案 + 同库干扰项。与其它模式同一套口径(optionText)。 */
  const options = useMemo(() => {
    if (!cur || cur.mode === "spell") return [];
    const answer = optionText(cur.word, "zh");
    const pool = tasks.map(t => t.word).filter(w => w.id !== cur.word.id && optionText(w, "zh"));
    const distractors = shuffle(pool).slice(0, 3).map(w => optionText(w, "zh"));
    return shuffle([answer, ...distractors]);
  }, [cur, tasks]);

  const answer = cur ? optionText(cur.word, "zh") : "";
  const correct = cur
    ? (cur.mode === "spell"
      ? typed.trim().toLowerCase() === cur.word.headword.trim().toLowerCase()
      : picked === answer)
    : false;

  async function submit(choice?: string) {
    if (!cur || submitted) return;
    if (cur.mode !== "spell") setPicked(choice ?? null);
    setSubmitted(true);
    const ok = cur.mode === "spell"
      ? typed.trim().toLowerCase() === cur.word.headword.trim().toLowerCase()
      : (choice ?? picked) === answer;
    if (ok) setRight(n => n + 1);
    /* ⚠️ 一题只写一次库:反馈层里点两下"下一题"不该记两次 */
    if (!wrote.current.has(idx)) {
      wrote.current.add(idx);
      const r = await recordAnswer(cur.word.id, ok, cur.mode);
      if (r.quotaBlocked) setQuotaHit(true);
    }
  }

  async function next() {
    const n = idx + 1;
    setPicked(null); setTyped(""); setSubmitted(false);
    if (n >= total) {
      /* 结算:明天待复习 + 连续打卡。取不到**不拦结算页**,但也不许给 0 ——
       * 「明日待复习 0」和「连续打卡 0 天」都是具体的数字断言,写错了比不写更糟
       * (用户会以为自己断签了)。所以取不到就给 null,渲染成「—」。 */
      const [dt, st] = await Promise.allSettled([
        bank ? countDueTomorrow(bank.id) : Promise.resolve(0),
        getStats(),
      ]);
      if (dt.status === "rejected") logFail("VocabToday/countDueTomorrow", dt.reason);
      if (st.status === "rejected") logFail("VocabToday/getStats", st.reason);
      setDoneInfo({
        dueTomorrow: dt.status === "fulfilled" ? dt.value : null,
        streak: st.status === "fulfilled" ? (st.value?.current_streak ?? 0) : null,
      });
      return;
    }
    setIdx(n);
    setReading(tasks[n]?.showCardFirst ?? false);
  }

  /* ── 结算页 ── */
  if (doneInfo) return (
    <Shell color={color}>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
        <p className="text-[13px] text-slate-400">今日学习完成</p>
        <div className="mt-1 text-[44px] font-bold leading-none" style={{ color, fontVariantNumeric: "tabular-nums" }}>
          {total}<span className="ml-1 text-[18px] font-medium text-slate-400">词</span>
        </div>
        <p className="mt-1.5 text-[14px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
          答对 {right} / {total}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-xl bg-slate-50 px-3.5 py-3">
            <div className="text-[12px] text-slate-400">明日待复习</div>
            <div className="mt-0.5 text-[20px] font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
              {doneInfo.dueTomorrow ?? <span className="text-slate-300">—</span>}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3.5 py-3">
            <div className="text-[12px] text-slate-400">连续打卡</div>
            <div className="mt-0.5 text-[20px] font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
              {doneInfo.streak === null ? <span className="text-slate-300">—</span> : `${doneInfo.streak} 天`}
            </div>
          </div>
        </div>
        {/* 「—」自己说不清是"没取到"还是"没有" —— 补一句。
            两个数都拿到时这行不出,不给正常路径添噪音。 */}
        {(doneInfo.dueTomorrow === null || doneInfo.streak === null) && (
          <p className="mt-2 text-[12px] text-slate-400">「—」是这次没取到,不是 0;你刚才的作答已经记上了</p>
        )}
        <div className="mt-5 flex gap-2">
          <button onClick={load} className="flex-1 rounded-xl border border-black/[0.08] py-2.5 text-[14px] text-slate-700">
            再来一组
          </button>
          <button onClick={() => navigate("/vocab")}
            className="flex-1 rounded-xl py-2.5 text-[14px] font-medium text-white" style={{ backgroundColor: color }}>
            回词汇中心
          </button>
        </div>
      </div>
    </Shell>
  );

  if (!plan && !failed) return <Shell color={color}><Loading /></Shell>;
  if (failed) return (
    <Shell color={color}>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
        <p className="text-[15px] text-slate-600">加载失败</p>
        <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
      </div>
    </Shell>
  );

  if (!total) return (
    <Shell color={color}>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
        <p className="text-[16px] font-medium text-slate-800">今天没有待办</p>
        <p className="mt-1 text-[14px] text-slate-500">复习都清完了,新词也学到了目标量。</p>
        <button onClick={() => navigate(`/vocab/${bankCode}`)}
          className="mt-4 rounded-xl px-5 py-2.5 text-[14px] font-medium text-white" style={{ backgroundColor: color }}>
          自己挑着学
        </button>
      </div>
    </Shell>
  );

  return (
    <Shell color={color}>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full px-2.5 py-1 text-[12px] font-medium"
          style={{ backgroundColor: `${color}1F`, color }}>
          {cur ? KIND_LABEL[cur.kind] : ""}
        </span>
        <span className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {idx + 1} / {total}
        </span>
      </div>
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div className="h-full rounded-full transition-all" style={{ width: `${(idx / total) * 100}%`, background: color }} />
      </div>

      {cur && reading ? (
        /* 新词:先看一遍完整词卡,再出题 —— 没见过的词直接考等于纯猜 */
        <>
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <WordCard word={cur.word} examples={examples} />
          </div>
          <button onClick={() => setReading(false)}
            className="mt-4 w-full rounded-2xl px-5 py-4 text-[17px] font-semibold text-white"
            style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
            记住了,考我
          </button>
        </>
      ) : cur ? (
        <>
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
            {cur.mode === "spell" ? (
              <>
                <p className="mb-2 text-[13px] text-slate-400">按中文拼出这个词</p>
                <p className="mb-3 text-[18px] font-medium text-slate-900">{answer}</p>
                {submitted && <LetterDiff input={typed} answer={cur.word.headword} />}
                <input
                  value={typed} onChange={e => setTyped(e.target.value)} disabled={submitted}
                  onKeyDown={e => { if (e.key === "Enter" && typed.trim() && !submitted) void submit(); }}
                  placeholder="输入英文" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  className="w-full rounded-xl border border-black/[0.08] px-3.5 py-3 text-[17px] outline-none"
                  style={{ fontFamily: FONT_SERIF }}
                />
                {!submitted && (
                  <button onClick={() => void submit()} disabled={!typed.trim()}
                    className={cn("mt-3 w-full rounded-xl py-3 text-[15px] font-medium text-white", !typed.trim() && "opacity-40")}
                    style={{ backgroundColor: color }}>
                    提交
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="mb-3 text-[32px] font-bold leading-tight text-slate-900" style={{ fontFamily: FONT_SERIF }}>
                  {cur.word.headword}
                </div>
                <div className="space-y-2">
                  {options.map(o => (
                    <button key={o} type="button" disabled={submitted} onClick={() => void submit(o)}
                      className={cn("w-full rounded-xl border px-3.5 py-3 text-left text-[15px]",
                        !submitted && "border-black/[0.08] bg-white active:bg-slate-50",
                        submitted && o === answer && "border-emerald-300 bg-emerald-50",
                        submitted && o === picked && o !== answer && "border-rose-300 bg-rose-50",
                        submitted && o !== answer && o !== picked && "opacity-50",
                      )}>
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {submitted && (
            <Feedback word={cur.word} correct={correct} onNext={() => void next()}
              lastOne={idx + 1 >= total}
              correctAnswer={cur.mode === "spell" ? cur.word.headword : answer}
              spelled={cur.mode === "spell" ? typed : undefined} />
          )}
        </>
      ) : null}

      <AnonNote />
      {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
    </Shell>
  );
}

function Shell({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-24 pt-2">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">← 词汇</BackLink>
        {children}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">
      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />正在排今天的任务…
    </div>
  );
}

export { EMPTY_PLAN };
