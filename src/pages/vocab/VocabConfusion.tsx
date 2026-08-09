/**
 * 易混词辨析专项(/vocab/confusion)。
 *
 * 429 组 / 978 词。每题:从组内某个词的例句挖空,在**组内成员**里选。
 *
 * ⚠️ **不是固定四选一**(规格里那么写,但数据不支持):
 *    实测组大小 2 词 341 组 · 3 词 63 · 4 词 18 · 5 词 7 —— 79% 的组只有两个词。
 *    跨组补干扰项会毁掉这个练习:辨析的价值全在"区分一组容易混的词",
 *    从别组抓词进来学生一眼排除,题目就退化成普通词汇题。
 *    所以两词组就出二选一 —— 那本来就是"这两个到底填哪个"的真实任务。
 * ⚠️ 题干挖空用 blankOut(容忍屈折),挖不出就换词、整组挖不出就跳过,**不硬造**。
 *    真库实测 975/978 = 99.7% 能挖出空。
 */
import { useCallback, useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { bankColor, readSelectedBank } from "@/lib/vocab/theme";
import { startTracking } from "@/lib/vocab/timeTracker";
import DormantQuiz, { type QuizItem } from "@/components/vocab/DormantQuiz";
import { buildConfusionQuiz } from "@/lib/vocab/dormant";

export default function VocabConfusion() {
  const color = bankColor(readSelectedBank() || "toefl");
  const [items, setItems] = useState<QuizItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => startTracking(), []);

  const load = useCallback(() => {
    setFailed(false); setItems(null);
    buildConfusionQuiz(10)
      .then(qs => setItems(qs.map(q => ({
        tag: `同组:${q.groupTitle}`,
        stem: q.stem,
        options: q.options,
        answer: q.answer,
        hints: q.hints,
      }))))
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-24 pt-2">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">← 词汇</BackLink>
        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">易混词辨析</h1>
        <p className="mb-3 mt-0.5 text-[13px] text-slate-400">看句子,选出这里该用哪个词</p>

        {items === null && !failed && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">出题中…</div>
        )}
        {failed && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[15px] text-slate-600">出题失败</p>
            <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
          </div>
        )}
        {items !== null && (
          <DormantQuiz items={items} color={color} onExit={load} title="易混词辨析" />
        )}
      </div>
    </div>
  );
}
