/**
 * 听音辨义(/vocab/:bankCode/listen)—— 只给声音,不给词形,选中文释义。
 *
 * 两种题干,右上角胶囊切换:
 *   · 单词:播 vocab_words.audio_url,四个 def_zh 选项
 *   · 短语:播例句音频,四个例句译文选项(考的是在句子里听懂它)
 *
 * ⚠️ 题池必须按**有没有音频**过滤 —— 没有 audio_url 的词进来就是一道放不出声的题。
 *    当前只有最早那 198 个词有音频(例句 594 条),放量的 4471 词等 E 段攒批回填,
 *    回填后这里**零改动自动吃到全库**,因为过滤条件就是 audio_url 本身。
 * ⚠️ 短语模式的题干原规格写的是"播 collocation 片段",但音频是**整句**粒度的,
 *    没有单独的搭配音频。硬切句子会切出半截音,所以这里播整句、
 *    把搭配文本显示在题干上,考点不变(在真实句子里听出这个词的意思)。
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor } from "@/lib/vocab/theme";
import { playUrl, stopAudio } from "@/lib/vocab/audio";
import { startTracking } from "@/lib/vocab/timeTracker";
import { fallback } from "@/lib/vocab/report";
import { dedupeTake, optionText } from "@/lib/vocab/quiz";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { AnonNote, Feedback, Progress, QuotaModal, Result } from "@/components/vocab/SessionParts";
import {
  getBankByCode, listBankWords, listExamples, getWordStatusMap, currentUserId,
  type VocabBank, type VocabExample, type VocabWord, type WordStatus,
} from "@/lib/vocab/data";

const ROUND = 10;
type Kind = "word" | "phrase";
type Q = { word: VocabWord; audio: string; audioKey: string; hint: string | null; options: string[]; answerIndex: number };

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function VocabListen() {
  const { bankCode = "toefl" } = useParams();
  const navigate = useNavigate();
  const color = bankColor(bankCode);

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [kind, setKind] = useState<Kind>("word");
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [quotaHit, setQuotaHit] = useState(false);
  const [anon, setAnon] = useState(false);
  const [done, setDone] = useState(false);
  const [seed, setSeed] = useState(1);

  const load = useCallback(async (k: Kind) => {
    setState("loading");
    try {
      const b = await getBankByCode(bankCode);
      if (!b) { setState("error"); return; }
      setBank(b);
      const [pool, uid] = await Promise.all([listBankWords(b.id), currentUserId()]);
      setAnon(!uid);

      // 有音频的词才可能出题 —— 单词模式看词音频,短语模式看例句音频(下面再筛)
      const audible = pool.filter(w => w.audio_url && optionText(w, "zh"));
      if (audible.length < 4) { setState("empty"); return; }
      /* 与 VocabQuiz/VocabSpell/VocabMatch 同一处病因:退化成"未学优先失效",用户无感 → 补日志 */
      const statuses = await getWordStatusMap(audible.map(w => w.id))
        .catch(fallback("VocabListen/getWordStatusMap", {} as Record<string, WordStatus>));
      const fresh = audible.filter(w => (statuses[w.id] ?? "new") === "new");
      const rest = audible.filter(w => (statuses[w.id] ?? "new") !== "new");
      const targets = shuffle([...fresh, ...rest].slice(0, ROUND * 3), seed).slice(0, ROUND);

      let built: Q[] = [];
      if (k === "word") {
        built = targets.map((w, i) => {
          const correct = optionText(w, "zh");
          const distractors = shuffle(audible.filter(x => x.id !== w.id && optionText(x, "zh") !== correct), seed + i)
            .map(x => optionText(x, "zh"));
          const picked3 = dedupeTake(distractors, correct, 3);
          if (picked3.length < 3) return null;
          const options = shuffle([correct, ...picked3], i * 7919 + 13);
          return { word: w, audio: w.audio_url!, audioKey: `w:${w.id}`, hint: null, options, answerIndex: options.indexOf(correct) };
        }).filter(Boolean) as Q[];
      } else {
        // 短语模式要例句音频:逐词取例句,只留有音频的那条
        const rows = await Promise.all(targets.map(w =>
        listExamples(w.id).catch(fallback("VocabListen/listExamples", [] as VocabExample[]))));
        const pairs = targets.map((w, i) => ({ w, ex: rows[i].find(e => e.audio_url) })).filter(p => p.ex);
        const allTr = pairs.map(p => p.ex!.translation_zh);
        built = pairs.map(({ w, ex }, i) => {
          const correct = ex!.translation_zh;
          const picked3 = dedupeTake(shuffle(allTr.filter(t => t !== correct), seed + i), correct, 3);
          if (picked3.length < 3) return null;
          const options = shuffle([correct, ...picked3], i * 7919 + 13);
          return { word: w, audio: ex!.audio_url!, audioKey: `e:${ex!.id}`, hint: ex!.collocation, options, answerIndex: options.indexOf(correct) };
        }).filter(Boolean) as Q[];
      }

      if (!built.length) { setState("empty"); return; }
      setQs(built); setIdx(0); setPicked(null); setCorrectCount(0); setDone(false);
      setState("ok");
    } catch {
      setState("error");
    }
  }, [bankCode, seed]);

  useEffect(() => { load(kind); }, [load, kind]);
  useEffect(() => () => stopAudio(), []);
  /* 学习时长:做题期间累计活跃时长,切后台/失焦/久不操作自动暂停。
   * 挂在页面级而不是每道题 —— 时长是这一段时间在学,不是答了几题。 */
  useEffect(() => startTracking(), []);

  const q = qs[idx];
  // 进新题自动播一次 —— 听力题不自动响,用户每题都得多点一下
  useEffect(() => { if (q && picked === null) void playUrl(q.audio, q.audioKey); }, [q?.audioKey]);   // eslint-disable-line react-hooks/exhaustive-deps

  async function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answerIndex;
    if (ok) setCorrectCount(c => c + 1);
    const r = await recordAnswer(q.word.id, ok, "listen");
    if (r.quotaBlocked) setQuotaHit(true);
  }

  function next() {
    stopAudio();
    if (idx + 1 >= qs.length) { setDone(true); return; }
    setIdx(idx + 1); setPicked(null);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BackLink to={`/vocab/${bankCode}`} className="inline-flex items-center gap-1 text-[14px] text-slate-500">
            ← {bank?.name_zh ?? "词库"}
          </BackLink>
          <div className="flex rounded-full border border-black/[0.08] bg-white p-0.5">
            {(["word", "phrase"] as const).map(m => (
              <button key={m} onClick={() => setKind(m)}
                className={cn("rounded-full px-3 py-1 text-[12px] font-medium",
                  kind === m ? "bg-slate-900 text-white" : "text-slate-500")}>
                {m === "word" ? "单词" : "短语"}
              </button>
            ))}
          </div>
        </div>

        {state === "loading" && <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">出题中…</div>}

        {state === "empty" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[16px] font-medium text-slate-800">这一批词还没有音频</p>
            <p className="mt-1 text-[14px] leading-relaxed text-slate-500">
              听力题需要发音文件。音频正在分批生成,生成到哪里这里就能考到哪里。
            </p>
            <BackLink to={`/vocab/${bankCode}`} className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">返回</BackLink>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[15px] text-slate-600">加载失败</p>
            <button onClick={() => load(kind)} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
          </div>
        )}

        {state === "ok" && !done && q && (
          <>
            <Progress done={idx} total={qs.length} color={color} />

            <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-10 text-center">
              <button type="button" onClick={() => playUrl(q.audio, q.audioKey)} aria-label="再听一遍"
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white"
                style={{ background: color }}>
                <Volume2 className="h-9 w-9" />
              </button>
              <p className="mt-3 text-[13px] text-slate-400">点喇叭再听一遍</p>
              {/* ⚠️ 作答前**绝不显示** q.hint(搭配文字)——
                  考听力却把搭配印在题面上,等于直接给答案。
                  文字一律留到反馈层。原则:考察通道之外的信息才允许出现在题面。 */}
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
              /* 单词大字/音标/词性由 Feedback 统一给,这里不再自拼 subtitle。
                 答错时把正确选项标红顶上去;短语模式的搭配文字此刻才出现。 */
              <Feedback word={q.word} correct={picked === q.answerIndex} onNext={next} lastOne={idx + 1 >= qs.length}
                correctAnswer={picked === q.answerIndex ? undefined : q.options[q.answerIndex]} />
            )}
          </>
        )}

        {done && (
          <Result total={qs.length} correct={correctCount} color={color}
            onAgain={() => setSeed(s => s + 1)} onBack={() => navigate(`/vocab/${bankCode}`)} />
        )}

        {anon && state === "ok" && <AnonNote />}
      </div>

      {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
    </div>
  );
}
