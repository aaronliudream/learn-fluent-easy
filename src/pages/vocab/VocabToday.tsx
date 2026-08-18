/**
 * 今日学习(/vocab/today)—— 一键继续,不让用户选模式。
 *
 * 序列由 `todayPlan.buildTodayPlan` 排好:复习 → 错题 → 新词。
 * 每一项用什么题型也由编排层定(复习=按该词进度轮换 / 错题=当初错的那种 / 新词=先看卡再考)。
 *
 * ⚠️ 本页**必须能真正出得了轮换表里的每一种题型**(todayPlan.MODE_ROTATION)。
 *    2026-08-17 之前这里只区分 spell / 非 spell,非 spell 一律"英文词干 + 中文义项选项",
 *    也就是只有 zh_choice 一种。那时若只在编排层打开轮换,界面出的还是英汉选择、
 *    写库却记成 listen/en_choice —— **等于替用户记上他没做过的题型**,
 *    掌握度会凭空达标。所以四个分支是连着渲染一起加的:
 *      zh_choice  英文词干 → 选中文义项
 *      en_choice  英文词干 → 选**英文**释义(与 VocabQuiz 的 en_choice 同义,别另立一套)
 *      listen     只给音频,不显示词干 → 选中文义项(显示词干就成了看词选义,白考)
 *      spell      中文义项 → 拼出英文
 *    往 MODE_ROTATION 里加题型前,先在这里加对应分支。
 *
 * ⚠️ **不新建作答/掌握度逻辑**:判分和写库一律走 `vocabMastery.recordAnswer`,
 *    反馈层一律用 `SessionParts.Feedback` —— 这个页面只负责"按顺序把题递出去"。
 *    另写一套的话,今日学习和其它模式会对同一个词给出不同的掌握度结果。
 * ⚠️ 未登录也让进(规格第五节):能试做,只是不写库(recordAnswer 内部处理)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Volume2 } from "lucide-react";
import { playUrl, stopAudio, unlockAudio } from "@/lib/vocab/audio";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import WordCard from "@/components/vocab/WordCard";
import { bankColor, CTA_SHADOW, FONT_SERIF, GRAD_CTA, readSelectedBank } from "@/lib/vocab/theme";
import { getBankByCode, listExamples, type VocabBank, type VocabExample, type VocabWord } from "@/lib/vocab/data";
import { dedupeTake, optionText } from "@/lib/vocab/quiz";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { startTracking } from "@/lib/vocab/timeTracker";
import { AnonNote, Feedback, LetterDiff, QuotaModal } from "@/components/vocab/SessionParts";
import { OptionGrid } from "@/components/vocab/OptionGrid";
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
  /** listen 题的音频被自动播放策略拦了 —— 要给用户一个可点的提示,不能静默。 */
  const [audioBlocked, setAudioBlocked] = useState(false);
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

  /* listen 题:进题自动播一次。
     ⚠️ 依赖只放 word.id,不放整个 cur —— 放 cur 的话每次 setPicked/setSubmitted
        触发重渲染都会重播一遍,答完题音频还在响。
     ⚠️ 离开本题/离开页面要 stopAudio:切到下一题时上一条还在播,
        用户听到的是上一个词的发音却在看这一题的选项。 */
  useEffect(() => {
    if (!cur || reading || cur.mode !== "listen" || !cur.word.audio_url) return;
    setAudioBlocked(false);
    /* ⚠️ 接住 blocked:听音辨义的题面**只有一个播放键、没有词干**,
       放不出声就等于这道题没法答。静默吞掉的话用户只看到一个不出声的圆钮,
       不知道是该点它、还是页面坏了。 */
    void playUrl(cur.word.audio_url, `w:${cur.word.id}`).then(r => setAudioBlocked(r === "blocked"));
    return () => stopAudio();
  }, [cur?.word.id, cur?.mode, reading]);   // eslint-disable-line react-hooks/exhaustive-deps

  /** 这道题的选项用中文义项还是英文释义 —— en_choice 选英文,其余选中文。 */
  const defMode: "zh" | "en" = cur?.mode === "en_choice" ? "en" : "zh";

  /** 选择题的四个选项:答案 + 同库干扰项。与其它模式同一套口径(optionText + dedupeTake)。 */
  const options = useMemo(() => {
    if (!cur || cur.mode === "spell") return [];
    const answer = optionText(cur.word, defMode);
    /* ⚠️ 干扰项必须**按文本**去重、并排除与答案同文的词,不能只按 word_id 排除自己。
     *    托福库里 559 组词的中文首义项完全相同(heritage/legacy、initially/originally…),
     *    只排除 id 的话会出现两个一模一样的选项 —— 学生选了"另一个对的"却被判错,
     *    而且这一错会经 recordAnswer 写进掌握度。实测 17 组词的下标相距 < 一个取词窗口,
     *    也就是**迟早必然同框**,不是理论风险。
     * ⚠️ 先 map 成文本再去重,不要先 slice(0,3):先切三个再去重会剩两个。 */
    const texts = shuffle(tasks.map(t => t.word).filter(w => w.id !== cur.word.id))
      .map(w => optionText(w, defMode));
    return shuffle([answer, ...dedupeTake(texts, answer, 3)]);
  }, [cur, tasks, defMode]);

  /* ⚠️ spell 的题面永远是**中文**义项(按中文拼出这个词),与 defMode 无关 ——
     en_choice 那一档换的是"选项",不是"拼写题的提示语"。 */
  const answer = cur ? optionText(cur.word, cur.mode === "spell" ? "zh" : defMode) : "";
  const correct = cur
    ? (cur.mode === "spell"
      ? typed.trim().toLowerCase() === cur.word.headword.trim().toLowerCase()
      : picked === answer)
    : false;

  async function submit(choice?: string) {
    if (!cur || submitted) return;
    /* ⚠️ 在**用户手势的调用栈里同步**解锁音频。放这里是因为它是最早、也最必然发生的手势:
       第一题不管什么题型,用户总要答。解锁一次之后,后面每一题的自动播放都放行 ——
       而且必须是同一个 <audio> 元素才算数(见 audio.ts 顶部注释)。
       ⚠️ 别挪进 setTimeout / await 之后:策略看的是调用栈是否源于手势,延迟调用一样被拒。 */
    unlockAudio();
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
          <button onClick={() => { unlockAudio(); setReading(false); }}
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
                {cur.mode === "listen" ? (
                  /* ⚠️ 听音辨义**不能显示词干** —— 显示了就变成看词选义,
                     考的还是 zh_choice 那件事,却往库里记 listen。
                     题面只有一个播放键;进题时自动播一次,可以重听。 */
                  <div className="mb-4 flex flex-col items-center gap-2">
                    <button type="button"
                      onClick={() => {
                        unlockAudio();
                        void playUrl(cur.word.audio_url!, `w:${cur.word.id}`).then(r => setAudioBlocked(r === "blocked"));
                      }}
                      aria-label="再听一遍"
                      className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: color }}>
                      <Volume2 className="h-7 w-7" />
                    </button>
                    {/* ⚠️ 浏览器不允许"完全没交互过就播有声音频",这是策略不是 bug,
                        代码绕不过去(unlockAudio 也要有一次手势才生效)。
                        这种时候必须**明说要点一下**:这道题只有播放键、没有词干,
                        不出声 = 没法答,而用户看不出是该点它还是页面坏了。 */}
                    <p className={cn("text-[13px]", audioBlocked ? "font-medium text-amber-700" : "text-slate-400")}>
                      {audioBlocked ? "点上面的按钮播放" : "听发音,选出词义"}
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 text-[32px] font-bold leading-tight text-slate-900" style={{ fontFamily: FONT_SERIF }}>
                    {cur.word.headword}
                  </div>
                )}
                {cur.mode === "en_choice" && (
                  <p className="mb-3 text-[13px] text-slate-400">选出英文释义</p>
                )}
                {/* 共用件,短选项自动 2×2。
                    ⚠️ 今日学习**不在 Aaron 那条清单里**(他列的是英汉选择/听音辨义/错题本闯关),
                       但它也是四选一、也有"页面被拉长"这个毛病,单独留一套会让主路径
                       和其余三处长得不一样。改了,他要否掉很容易(删这一处即可)。
                    ⚠️ 这里原本按**选项文本**索引(o === answer),共用件按下标 ——
                       所以在这层做一次 string↔index 转换,不去改共用件的接口。 */}
                <OptionGrid
                  options={options}
                  answerIndex={options.indexOf(answer)}
                  picked={submitted ? options.indexOf(picked ?? "") : null}
                  onPick={(i) => void submit(options[i])}
                />
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
