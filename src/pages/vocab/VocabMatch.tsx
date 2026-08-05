/**
 * 词汇配对(/vocab/:bankCode/match)—— 英文卡与释义卡两两连起来。
 *
 * 一轮 6 个词 = 12 张卡,手机端 2 列。翻牌框架照搬"单词便当"的交互模型
 * (点一张亮起、再点一张判定、配对成功即消),但**没有复用小学那套组件**:
 *   ① 小学版是 emoji + 橙色渐变的儿童视觉,与 /vocab 的设计规范冲突;
 *   ② 更要命的是它 onFinish 时把整轮词**统一记成答对**,
 *      而这里每个词的对错要分别写进掌握度和错题本,记法根本不一样。
 *
 * ⚠️ 判对错的口径:**第一次尝试**。同一个词配错一次后再配对成功,仍记错 ——
 *    否则乱点到最后总能全配上,掌握度就没有意义了。
 * ⚠️ 一个词只写一次库,在它被配掉的那一刻写,用 written 集合防重复。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF } from "@/lib/vocab/theme";
import { optionText } from "@/lib/vocab/quiz";
import { recordAnswer } from "@/lib/vocab/vocabMastery";
import { AnonNote, QuotaModal, Result } from "@/components/vocab/SessionParts";
import {
  getBankByCode, listBankWords, getWordStatusMap, currentUserId,
  type VocabBank, type VocabWord, type WordStatus,
} from "@/lib/vocab/data";

const ROUND = 6;

type Tile = { key: string; wordId: string; text: string; side: "en" | "zh" };

/** 确定性洗牌,seed 固定则同序,便于复现问题。 */
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabMatch() {
  const { bankCode = "toefl" } = useParams();
  const navigate = useNavigate();
  const color = bankColor(bankCode);

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [sel, setSel] = useState<Tile | null>(null);
  const [wrongPair, setWrongPair] = useState<string[]>([]);   // 短暂标红的两张
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());  // 配错过的词(仍记错)
  const [written, setWritten] = useState<Set<string>>(new Set());
  const [quotaHit, setQuotaHit] = useState(false);
  const [anon, setAnon] = useState(false);
  const [seed, setSeed] = useState(1);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const b = await getBankByCode(bankCode);
      if (!b) { setState("error"); return; }
      setBank(b);
      const [pool, uid] = await Promise.all([listBankWords(b.id), currentUserId()]);
      setAnon(!uid);
      const statuses = await getWordStatusMap(pool.map(w => w.id)).catch(() => ({} as Record<string, WordStatus>));
      // 优先没学过的,和英汉选择同一套挑词口径
      const usable = pool.filter(w => optionText(w, "zh"));
      const fresh = usable.filter(w => (statuses[w.id] ?? "new") === "new");
      const rest = usable.filter(w => (statuses[w.id] ?? "new") !== "new");
      const picked = shuffle([...fresh, ...rest].slice(0, ROUND * 4), seed).slice(0, ROUND);
      if (picked.length < 2) { setState("empty"); return; }
      setWords(picked);
      setTiles(shuffle(picked.flatMap(w => ([
        { key: `en:${w.id}`, wordId: w.id, text: w.headword, side: "en" as const },
        { key: `zh:${w.id}`, wordId: w.id, text: optionText(w, "zh"), side: "zh" as const },
      ])), seed * 31 + 7));
      setSel(null); setCleared(new Set()); setMissed(new Set()); setWritten(new Set());
      setState("ok");
    } catch {
      setState("error");
    }
  }, [bankCode, seed]);

  useEffect(() => { load(); }, [load]);

  const done = state === "ok" && words.length > 0 && cleared.size === words.length;

  async function write(wordId: string, ok: boolean) {
    if (written.has(wordId)) return;
    setWritten(prev => new Set(prev).add(wordId));
    const r = await recordAnswer(wordId, ok, "match");
    if (r.quotaBlocked) setQuotaHit(true);
  }

  function tap(t: Tile) {
    if (cleared.has(t.wordId) || wrongPair.length) return;
    if (!sel) { setSel(t); return; }
    if (sel.key === t.key) { setSel(null); return; }
    if (sel.side === t.side) { setSel(t); return; }        // 同侧改选,不算错

    if (sel.wordId === t.wordId) {
      setCleared(prev => new Set(prev).add(t.wordId));
      setSel(null);
      // 之前配错过就记错 —— 判据是"第一次尝试对不对",不是"最后有没有配上"
      void write(t.wordId, !missed.has(t.wordId));
    } else {
      setWrongPair([sel.key, t.key]);
      setMissed(prev => new Set(prev).add(sel.wordId).add(t.wordId));
      window.setTimeout(() => { setWrongPair([]); setSel(null); }, 620);
    }
  }

  const correctCount = useMemo(() => words.filter(w => !missed.has(w.id)).length, [words, missed]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BackLink to={`/vocab/${bankCode}`} className="inline-flex items-center gap-1 text-[14px] text-slate-500">
            ← {bank?.name_zh ?? "词库"}
          </BackLink>
          <span className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
            已配对 {cleared.size} / {words.length || ROUND}
          </span>
        </div>

        {state === "loading" && <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">发牌中…</div>}
        {state === "empty" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[16px] font-medium text-slate-800">这个词库还没有可配对的内容</p>
            <BackLink to={`/vocab/${bankCode}`} className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">返回</BackLink>
          </div>
        )}
        {state === "error" && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[15px] text-slate-600">加载失败</p>
            <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
          </div>
        )}

        {state === "ok" && !done && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              {tiles.map(t => {
                const gone = cleared.has(t.wordId);
                const on = sel?.key === t.key;
                const bad = wrongPair.includes(t.key);
                return (
                  <button key={t.key} type="button" onClick={() => tap(t)} disabled={gone}
                    className={cn(
                      "flex min-h-[76px] items-center justify-center rounded-2xl border px-3 py-3 text-center transition",
                      gone && "border-transparent bg-transparent opacity-0",
                      !gone && !on && !bad && "border-black/[0.08] bg-white active:bg-slate-50",
                      !gone && bad && "border-rose-300 bg-rose-50",
                    )}
                    style={!gone && on ? { borderColor: color, background: "#fff", boxShadow: `0 0 0 2px ${color}22` } : undefined}>
                    <span className={cn("text-[16px] leading-snug", t.side === "en" ? "text-slate-900" : "text-slate-600")}
                      style={t.side === "en" ? { fontFamily: FONT_SERIF, fontSize: 19, fontWeight: 600 } : undefined}>
                      {t.text}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-[13px] text-slate-400">点一张英文,再点它的释义</p>
          </>
        )}

        {done && (
          <Result total={words.length} correct={correctCount} color={color}
            onAgain={() => setSeed(s => s + 1)} onBack={() => navigate(`/vocab/${bankCode}`)}
            note="一次配对成功才算答对;配错过的词已进错题本,连对 3 天自动移出。" />
        )}

        {anon && state === "ok" && <AnonNote />}
      </div>

      {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
    </div>
  );
}
