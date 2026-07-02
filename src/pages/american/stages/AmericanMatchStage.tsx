/**
 * 关4 · 词义配对。左英文右中文,点一英点一中配对;对→绿,错→红。
 * 记 american_word_mastery(game=match;与关2/3 共享词掌握)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio } from "@/lib/american/audio";
import { markStageComplete, recordWordMastery, type AmericanWord, type LessonBundle } from "@/lib/american/data";

const PER_ROUND = 5;

function shuffle<X>(a: X[]): X[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export function AmericanMatchStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const unit = bundle.lesson.unit_no;
  const rounds = useMemo(() => {
    const ws = shuffle(bundle.words.filter((w) => w.meaning_cn));
    const out: AmericanWord[][] = [];
    for (let i = 0; i < ws.length; i += PER_ROUND) out.push(ws.slice(i, i + PER_ROUND));
    return out;
  }, [bundle.words]);

  const [ri, setRi] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const roundWords = useMemo(() => rounds[ri] ?? [], [rounds, ri]);
  const left = roundWords;
  const right = useMemo(() => shuffle(roundWords), [roundWords]);

  const finishRound = useCallback(() => {
    if (ri + 1 >= rounds.length) {
      void markStageComplete(bundle.lesson.id, 4);
      setDone(true);
      if (onDone) setTimeout(onDone, 1600);
    } else {
      setRi((i) => i + 1); setMatched(new Set()); setSelL(null); setSelR(null);
    }
  }, [ri, rounds.length, bundle.lesson.id, onDone]);

  // 本轮全部配对完成 → 进入下一轮
  useEffect(() => {
    if (roundWords.length && matched.size === roundWords.length) {
      const t = setTimeout(finishRound, 500);
      return () => clearTimeout(t);
    }
  }, [matched, roundWords.length, finishRound]);

  const tryMatch = useCallback((l: string, r: string) => {
    const ok = l === r; // 左右都用 word.id 作键
    const w = roundWords.find((x) => x.id === l);
    if (w) void recordWordMastery(w.id, unit, "match", ok);
    if (ok) {
      setMatched((m) => new Set(m).add(l));
      setSelL(null); setSelR(null);
    } else {
      setWrong(l + "|" + r);
      setTimeout(() => { setWrong(null); setSelL(null); setSelR(null); }, 600);
    }
  }, [roundWords, unit]);

  const pickL = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelL(id);
    if (selR) tryMatch(id, selR);
  }, [matched, selR, tryMatch]);
  const pickR = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelR(id);
    if (selL) tryMatch(selL, id);
  }, [matched, selL, tryMatch]);

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">🃏</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>词义配对完成!</T></h2>
      </div>
    );
  }
  if (!roundWords.length) return <p className="py-16 text-center text-sm text-slate-400"><T>本课暂无生词</T></p>;

  const cellCls = (id: string, side: "L" | "R", sel: string | null) => {
    if (matched.has(id)) return "border-emerald-300 bg-emerald-50 text-emerald-400 opacity-60";
    if (wrong && wrong.includes(id)) return "border-rose-300 bg-rose-50 text-rose-600 animate-pulse";
    if (sel === id) return "border-sky-400 bg-sky-50 text-sky-700";
    return "border-slate-200 bg-white text-slate-700 hover:border-sky-300";
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      <header className="mb-4">
        <h1 className="text-lg font-bold text-slate-800">🃏 <T>词义配对</T></h1>
        <p className="mt-0.5 text-sm text-slate-500"><T>点一个英文,再点它的中文意思</T> · {ri + 1}/{rounds.length}</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          {left.map((w) => (
            <button key={w.id} type="button" disabled={matched.has(w.id)}
              onClick={() => { unlockAmericanAudio(); pickL(w.id); if (!matched.has(w.id)) void speakUS(w.word); }}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-[15px] font-medium transition ${cellCls(w.id, "L", selL)}`}>
              <span>{w.word}</span>
              <Volume2 className="size-3.5 shrink-0 opacity-40" />
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {right.map((w) => (
            <button key={w.id} type="button" disabled={matched.has(w.id)} onClick={() => pickR(w.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left text-[15px] transition ${cellCls(w.id, "R", selR)}`}>
              {w.meaning_cn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
