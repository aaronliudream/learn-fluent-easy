import { T } from "@/i18n/T";
import { useMemo, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { LabMistake } from "@/lib/juniorGrammarRevenge";

export type RevengeItem = LabMistake & {
  pointId?: string;
  pointTitle?: string;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(input: string, target: string): boolean {
  const n = normalize(input);
  if (!n) return false;
  if (n === normalize(target)) return true;
  const tw = normalize(target).split(" ");
  const iw = n.split(" ");
  if (Math.abs(tw.length - iw.length) > 1) return false;
  let diff = 0;
  for (let k = 0; k < Math.max(tw.length, iw.length); k++) {
    if ((tw[k] || "") !== (iw[k] || "")) diff++;
  }
  return diff <= 1;
}

type Props = {
  items: RevengeItem[];
  onDone: (correct: number, total: number) => void;
  onCorrect?: () => void;
  emptyHint?: string;
};

export function GrammarRevengeRunner({ items, onDone, onCorrect, emptyHint }: Props) {
  const queue = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((m) => {
      const key = `${m.pointId ?? ""}|${m.phase}|${m.stem}|${m.correct}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [result, setResult] = useState<null | "ok" | "ng">(null);
  const [correct, setCorrect] = useState(0);

  if (!queue.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="text-5xl">✨</div>
        <p className="text-sm text-muted-foreground">{emptyHint ?? <T>暂无待复仇错题，先去闯一关吧！</T>}</p>
      </div>
    );
  }

  const m = queue[i];
  const submit = () => {
    if (!val.trim() || result !== null) return;
    const ok = fuzzyMatch(val, m.correct);
    setResult(ok ? "ok" : "ng");
    if (ok) {
      setCorrect((c) => c + 1);
      onCorrect?.();
    }
  };
  const next = () => {
    if (i + 1 >= queue.length) onDone(correct, queue.length);
    else {
      setI(i + 1);
      setVal("");
      setResult(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="text-5xl">⚔️</div>
        <h2 className="text-2xl font-extrabold"><T>复仇模式</T></h2>
        <p className="text-sm text-muted-foreground">
          <T>只刷错题 · 全部改对解锁成就</T>
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-rose-500/15 text-rose-600 px-2 py-0.5 font-bold">{m.phase}</span>
          {m.pointTitle &&
          <span className="rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 px-2 py-0.5 font-bold truncate max-w-[180px]">
            {m.pointTitle}
          </span>
          }
        </div>
        <span className="tabular-nums font-bold">
          {i + 1} / {queue.length}
        </span>
      </div>
      <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="text-lg font-bold leading-relaxed">{m.stem}</div>
        <div className="text-xs text-muted-foreground">
          <T>上次：</T> <span className="text-rose-600 line-through">{m.picked}</span>
        </div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={result !== null}
          placeholder="这次写对…"
          className="w-full min-h-[88px] rounded-xl border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (result === null) submit();
              else next();
            }
          }}
        />
        {result === "ok" &&
        <div className="rounded-xl bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-sm font-semibold">
          <Check size={16} /> <T>复仇成功！</T>
        </div>
        }
        {result === "ng" &&
        <div className="rounded-xl bg-rose-500/10 p-4 space-y-2 text-sm">
          <div className="font-semibold text-rose-600"><T>参考：</T></div>
          <div className="font-mono text-emerald-700 dark:text-emerald-300">{m.correct}</div>
          {m.why && (
          <div className="text-xs text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{m.why}</ReactMarkdown>
          </div>
          )}
        </div>
        }
        <div className="flex justify-end">
          {result === null ?
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow">
            <T>提交复仇</T>
          </button> :
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow inline-flex items-center gap-1">
            {i + 1 >= queue.length ? <T>完成</T> : <T>下一题</T>}
            <ArrowRight size={14} />
          </button>
          }
        </div>
      </div>
    </div>
  );
}
