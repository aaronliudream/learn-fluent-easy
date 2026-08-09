/**
 * 沉睡数据三页共用的选择题引擎。
 *
 * ⚠️ 三个页面(词块 / 习语 / 中文表达 / 辨析)各写一套必然漂移 ——
 *    对错配色、答完能不能改、结算文案会长出四种说法。这里只许有一个实现。
 * ⚠️ **选项数不固定**:辨析组只有两个词时就是二选一(见 dormant.ts 的说明),
 *    所以这里不许假设四个选项、也不许用 A/B/C/D 这种写死的标号。
 * ⚠️ 答完立刻显示对错与解释,**不做"全部答完再对答案"** ——
 *    这批内容的价值在解释(直译陷阱、区分要点),延后显示等于没有。
 */
import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_SERIF } from "@/lib/vocab/theme";

export type QuizItem = {
  /** 题干。可含 ______ 挖空 */
  stem: string;
  /** 题干上方的小字(如「同组:显著的程度」) */
  tag?: string;
  options: string[];
  answer: string;
  /** 答完显示的每个选项的解释 */
  hints?: Record<string, string>;
};

export default function DormantQuiz({ items, color, onExit, title }: {
  items: QuizItem[]; color: string; onExit: () => void; title: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);

  useEffect(() => { setIdx(0); setPicked(null); setRight(0); }, [items]);

  const cur = items[idx];
  const done = idx >= items.length;
  const total = items.length;

  const stemParts = useMemo(() => (cur?.stem ?? "").split("______"), [cur]);

  if (!total) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
        <p className="text-[15px] text-slate-600">这一批还出不了题</p>
        <button onClick={onExit} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">返回</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
        <div className="text-[13px] text-slate-400">{title}</div>
        <div className="mt-1 text-[40px] font-bold leading-none" style={{ color, fontVariantNumeric: "tabular-nums" }}>
          {right} / {total}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={() => { setIdx(0); setPicked(null); setRight(0); }}
            className="flex-1 rounded-xl py-2.5 text-[14px] font-medium text-white" style={{ backgroundColor: color }}>
            再来一轮
          </button>
          <button onClick={onExit}
            className="flex-1 rounded-xl border border-black/[0.08] py-2.5 text-[14px] text-slate-700">返回</button>
        </div>
      </div>
    );
  }

  const correct = picked === cur.answer;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] text-slate-400">{title}</span>
        <span className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {idx + 1} / {total}
        </span>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
        {cur.tag && <p className="mb-2 text-[12px] text-slate-400">{cur.tag}</p>}
        <p className="text-[17px] leading-relaxed text-slate-900">
          {stemParts.map((p, i) => (
            <span key={i}>
              {p}
              {i < stemParts.length - 1 && (
                <span className="mx-0.5 inline-block min-w-[64px] border-b-2 text-center align-baseline"
                  style={{ borderColor: picked ? (correct ? "#059669" : "#E11D48") : color }}>
                  {picked ? <b style={{ fontFamily: FONT_SERIF }}>{cur.answer}</b> : " "}
                </span>
              )}
            </span>
          ))}
        </p>

        <div className="mt-4 space-y-2">
          {cur.options.map(o => {
            const isAnswer = o === cur.answer;
            const isPicked = o === picked;
            return (
              <button key={o} type="button" disabled={!!picked}
                onClick={() => {
                  if (picked) return;
                  setPicked(o);
                  if (o === cur.answer) setRight(n => n + 1);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl border px-3.5 py-2.5 text-left",
                  !picked && "border-black/[0.08] bg-white active:bg-slate-50",
                  picked && isAnswer && "border-emerald-300 bg-emerald-50",
                  picked && isPicked && !isAnswer && "border-rose-300 bg-rose-50",
                  picked && !isAnswer && !isPicked && "border-black/[0.06] bg-white opacity-50",
                )}>
                {picked && isAnswer && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
                {picked && isPicked && !isAnswer && <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
                <span className="min-w-0">
                  <span className="text-[15px] text-slate-900" style={{ fontFamily: FONT_SERIF }}>{o}</span>
                  {/* 答完才给解释 —— 这批内容的价值就在这一行 */}
                  {picked && cur.hints?.[o] && (
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-slate-500">{cur.hints[o]}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {picked && (
          <button type="button"
            onClick={() => { setIdx(i => i + 1); setPicked(null); }}
            className="mt-4 w-full rounded-xl py-3 text-[15px] font-medium text-white" style={{ backgroundColor: color }}>
            {idx + 1 >= total ? "看结果" : "下一题"}
          </button>
        )}
      </div>
    </div>
  );
}
