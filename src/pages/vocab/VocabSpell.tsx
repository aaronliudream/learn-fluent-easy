/**
 * 听写挑战(/vocab/:bankCode/spell)—— 听发音,把词拼出来。
 *
 * ⚠️ 题池同样按 audio_url 过滤(理由见 VocabListen 顶部注释)。
 * ⚠️ 判对口径:**忽略大小写与首尾空白**,其余逐字母相等。
 *    不做"差一个字母也算对"的宽容 —— 听写考的就是拼写,放宽等于取消这道题。
 * ⚠️ 提示分两级,都不直接给答案:
 *    ① 一开始就给"首字母 + 字母数"的下划线骨架(否则纯听音拼长词接近于猜)
 *    ② 点"提示"再多亮一个字母,且**用过提示不影响判分** ——
 *       判分记的是拼写结果,提示只是降低挫败感;要真区分难度得另设指标,
 *       现在悄悄扣分反而让掌握度变得不可解释。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lightbulb, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, CTA_SHADOW, FONT_SERIF, GRAD_CTA } from "@/lib/vocab/theme";
import { playUrl, stopAudio } from "@/lib/vocab/audio";
import { optionText } from "@/lib/vocab/quiz";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { AnonNote, Feedback, Progress, QuotaModal, Result } from "@/components/vocab/SessionParts";
import {
  getBankByCode, listBankWords, getWordStatusMap, currentUserId,
  type VocabBank, type VocabWord, type WordStatus,
} from "@/lib/vocab/data";

const ROUND = 10;

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const norm = (s: string) => s.trim().toLowerCase();

export default function VocabSpell() {
  const { bankCode = "toefl" } = useParams();
  const navigate = useNavigate();
  const color = bankColor(bankCode);

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [reveal, setReveal] = useState<null | boolean>(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [quotaHit, setQuotaHit] = useState(false);
  const [anon, setAnon] = useState(false);
  const [done, setDone] = useState(false);
  const [seed, setSeed] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const b = await getBankByCode(bankCode);
      if (!b) { setState("error"); return; }
      setBank(b);
      const [pool, uid] = await Promise.all([listBankWords(b.id), currentUserId()]);
      setAnon(!uid);
      const audible = pool.filter(w => w.audio_url && optionText(w, "zh"));
      if (!audible.length) { setState("empty"); return; }
      const statuses = await getWordStatusMap(audible.map(w => w.id)).catch(() => ({} as Record<string, WordStatus>));
      const fresh = audible.filter(w => (statuses[w.id] ?? "new") === "new");
      const rest = audible.filter(w => (statuses[w.id] ?? "new") !== "new");
      setWords(shuffle([...fresh, ...rest].slice(0, ROUND * 3), seed).slice(0, ROUND));
      setIdx(0); setInput(""); setReveal(null); setHintLevel(1); setCorrectCount(0); setDone(false);
      setState("ok");
    } catch {
      setState("error");
    }
  }, [bankCode, seed]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => stopAudio(), []);

  const w = words[idx];
  useEffect(() => { if (w && reveal === null) void playUrl(w.audio_url, `w:${w.id}`); }, [w?.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    if (reveal !== null || !w || !input.trim()) return;
    const ok = norm(input) === norm(w.headword);
    setReveal(ok);
    if (ok) setCorrectCount(c => c + 1);
    const r = await recordAnswer(w.id, ok, "spell");
    if (r.quotaBlocked) setQuotaHit(true);
  }

  function next() {
    stopAudio();
    if (idx + 1 >= words.length) { setDone(true); return; }
    setIdx(idx + 1); setInput(""); setReveal(null); setHintLevel(1);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  /** 骨架:前 hintLevel 个字母亮出来,其余下划线;连字符/空格原样保留(它们是词形的一部分)。 */
  const skeleton = w ? [...w.headword].map((ch, i) =>
    (/[a-zA-Z]/.test(ch) ? (i < hintLevel ? ch : "_") : ch)).join(" ") : "";

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BackLink to={`/vocab/${bankCode}`} className="inline-flex items-center gap-1 text-[14px] text-slate-500">
            ← {bank?.name_zh ?? "词库"}
          </BackLink>
          <span className="text-[13px] text-slate-400">听写挑战</span>
        </div>

        {state === "loading" && <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">出题中…</div>}

        {state === "empty" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[16px] font-medium text-slate-800">这一批词还没有音频</p>
            <p className="mt-1 text-[14px] leading-relaxed text-slate-500">
              听写需要发音文件。音频正在分批生成,生成到哪里这里就能考到哪里。
            </p>
            <BackLink to={`/vocab/${bankCode}`} className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">返回</BackLink>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[15px] text-slate-600">加载失败</p>
            <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
          </div>
        )}

        {state === "ok" && !done && w && (
          <>
            <Progress done={idx} total={words.length} color={color} />

            <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-9 text-center">
              <button type="button" onClick={() => playUrl(w.audio_url, `w:${w.id}`)} aria-label="再听一遍"
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white" style={{ background: color }}>
                <Volume2 className="h-9 w-9" />
              </button>
              <p className="mt-4 tracking-[0.28em] text-slate-400" style={{ fontFamily: FONT_SERIF, fontSize: 20 }}>
                {skeleton}
              </p>
              <p className="mt-2 text-[13px] text-slate-400">{w.def_zh}</p>
            </div>

            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") void submit(); }}
              disabled={reveal !== null} autoCapitalize="none" autoCorrect="off" spellCheck={false}
              placeholder="拼出你听到的词"
              className={cn("mt-4 w-full rounded-2xl border px-4 py-4 text-center text-[20px] tracking-[0.06em] outline-none",
                reveal === null && "border-black/[0.08] bg-white text-slate-900",
                reveal === true && "border-emerald-300 bg-emerald-50 text-emerald-900",
                reveal === false && "border-rose-300 bg-rose-50 text-rose-900")} />

            {reveal === null && (
              <div className="mt-3 flex gap-2.5">
                <button type="button" onClick={() => setHintLevel(h => Math.min(h + 1, w.headword.length - 1))}
                  className="flex items-center gap-1.5 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-[14px] text-slate-600">
                  <Lightbulb className="h-4 w-4" />提示
                </button>
                <button type="button" onClick={() => void submit()} disabled={!input.trim()}
                  className="flex-1 rounded-2xl px-5 py-3 text-[16px] font-semibold text-white disabled:opacity-40"
                  style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
                  提交
                </button>
              </div>
            )}

            {reveal !== null && (
              /* 逐字母对照 + 正确拼写标红,全部由 Feedback 统一渲染,
                 不再在这里自拼 subtitle(同一信息三种写法正是要防的)。 */
              <Feedback word={w} correct={reveal} onNext={next} lastOne={idx + 1 >= words.length}
                spelled={input} correctAnswer={reveal ? undefined : w.headword} />
            )}
          </>
        )}

        {done && (
          <Result total={words.length} correct={correctCount} color={color}
            onAgain={() => setSeed(s => s + 1)} onBack={() => navigate(`/vocab/${bankCode}`)} />
        )}

        {anon && state === "ok" && <AnonNote />}
      </div>

      {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
    </div>
  );
}
