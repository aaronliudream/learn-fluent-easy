/**
 * 关7 · 对话填空(抽题池,Plan C #4)。
 * 池 = 本课全部 stage7 题(既有 + 扩容)。每轮随机抽 6 空(池不足则全取);
 * 跨轮去重优先(localStorage 记已出空,新一轮先抽没出过的);池抽尽 → 去重集重置(可再抽,不报错不缩轮)。
 * 每空逐题作答,展示该空自带 context(既有空=对话原文;扩容空=单句),记 am_question(答对2次=掌握)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, ChevronRight, ChevronLeft, Volume2 } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio } from "@/lib/american/audio";
import { markStageComplete, recordMastery, type AmericanQuestion, type LessonBundle } from "@/lib/american/data";
import { recordAmericanMistake, americanLessonLabel } from "@/lib/american/americanMistake";

const PER_ROUND = 6;
const seenKey = (lessonId: string) => `am.cloze.seen.${lessonId}`;

function loadSeen(lessonId: string): Set<string> {
  try {
    const raw = localStorage.getItem(seenKey(lessonId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function saveSeen(lessonId: string, seen: Set<string>) {
  try {
    localStorage.setItem(seenKey(lessonId), JSON.stringify([...seen]));
  } catch {
    /* quota — ignore */
  }
}
/** Fisher-Yates 取样 n 个(不改原数组)。 */
function sample<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/** 抽一轮:跨轮去重优先,池抽尽重置。返回本轮题(按 blank_no 升序)+ 写回后的 seen 集。 */
function pickRound(pool: AmericanQuestion[], lessonId: string): { items: AmericanQuestion[]; nextSeen: Set<string> } {
  const take = Math.min(PER_ROUND, pool.length);
  let seen = loadSeen(lessonId);
  // 去重集若已覆盖全池(或更大),先重置,保证还能抽满
  if (seen.size >= pool.length) seen = new Set();
  const unseen = pool.filter((q) => !seen.has(q.id));
  let picked: AmericanQuestion[];
  if (unseen.length >= take) {
    picked = sample(unseen, take);
  } else {
    // 未出的不足 take → 全取未出的 + 重置去重集,从剩余池补足(排除本轮已选)
    picked = unseen.slice();
    seen = new Set();
    const pickedIds = new Set(picked.map((q) => q.id));
    const rest = pool.filter((q) => !pickedIds.has(q.id));
    picked = picked.concat(sample(rest, take - picked.length));
  }
  const nextSeen = new Set(seen);
  for (const q of picked) nextSeen.add(q.id);
  const items = picked.slice().sort((a, b) => (a.payload.blank_no ?? 0) - (b.payload.blank_no ?? 0));
  return { items, nextSeen };
}

export function AmericanClozeStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const pool = useMemo(
    () => bundle.questions.filter((q) => q.stage === 7).sort((a, b) => (a.payload.blank_no ?? 0) - (b.payload.blank_no ?? 0)),
    [bundle],
  );
  // 抽一轮(mount 时定,lazy init 纯计算);seen 写回放 effect,避开 StrictMode 双写。
  const [round] = useState(() => pickRound(pool, bundle.lesson.id));
  useEffect(() => {
    saveSeen(bundle.lesson.id, round.nextSeen);
  }, [bundle.lesson.id, round]);

  const items = round.items;
  const [idx, setIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(0);                       // 已到达前沿;idx<maxIdx=回看只读
  const [records, setRecords] = useState<Record<number, number>>({}); // idx → 所选项
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = items[idx];
  const opts = q?.payload.options ?? [];
  const ans = q?.payload.answer_index ?? 0;
  const context = q?.payload.context ?? "";
  const rec = records[idx];
  const answered = rec !== undefined;
  const reviewing = idx < maxIdx;                                // 回看模式:只读、不计分、不改掌握
  const picked = rec ?? null;

  const label = americanLessonLabel(bundle.lesson);
  const pick = useCallback((i: number) => {
    if (!q || answered || idx !== maxIdx) return;                // 已答或回看:禁止作答(防刷分/改答)
    setRecords((r) => ({ ...r, [idx]: i }));
    const ok = i === ans;
    if (ok) setCorrect((c) => c + 1);
    void recordMastery("am_question", q.id, ok);
    // 错题本(独立于 SRS):context→senior_cloze 自动路由。
    // 重做弹窗要能看出"第几空"(对话原文含多个空,一组选项 → 不标空号没法做)→
    // context 前缀「第 N 空」(仿高考完形 stem);blank_no 现成,新错题即生效。
    const clozeContext = q.payload.blank_no != null
      ? `【第 ${q.payload.blank_no} 空】\n${q.payload.context ?? ""}`.trim()
      : q.payload.context;
    recordAmericanMistake(
      { kind: "choice", id: q.id, stem: q.payload.stem, options: q.payload.options ?? [],
        answerIndex: q.payload.answer_index ?? 0, context: clozeContext, explanation: q.payload.explanation_cn },
      i, ok, label,
    );
  }, [q, answered, idx, maxIdx, ans, label]);

  const prev = useCallback(() => {
    if (idx === 0) return;
    unlockAmericanAudio();
    setIdx((i) => i - 1);
  }, [idx]);

  const next = useCallback(() => {
    unlockAmericanAudio();
    if (idx < maxIdx) { setIdx((i) => i + 1); return; }          // 回看前进:仅移动光标
    if (idx + 1 >= items.length) {
      void markStageComplete(bundle.lesson.id, 7);
      setDone(true);
      if (onDone) setTimeout(onDone, 1600);
    } else { setMaxIdx((m) => Math.max(m, idx + 1)); setIdx((i) => i + 1); }
  }, [idx, maxIdx, items.length, bundle.lesson.id, onDone]);

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">✏️</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>对话填空完成!</T></h2>
        <p className="mt-1 text-sm text-slate-500"><T>答对</T> {correct}/{items.length}</p>
      </div>
    );
  }
  if (!q) return <p className="py-16 text-center text-sm text-slate-400"><T>本课暂无填空</T></p>;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {/* 该空所在对话/句子原文 */}
      {context && (
        <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{context}</p>
        </div>
      )}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          {/* 进度按前沿 maxIdx 计:回看不倒退 */}
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(maxIdx / items.length) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {reviewing ? <span className="text-amber-500"><T>回看</T> {idx + 1}/{items.length}</span> : `${idx + 1}/${items.length}`}
        </span>
      </div>

      <p className="mb-3 text-base font-semibold text-slate-800"><T>第</T> {q.payload.blank_no} <T>空 · 还原课文原句,选择原文中的词</T></p>
      <div className="grid gap-2.5">
        {opts.map((opt, i) => {
          const isAns = i === ans;
          const isPicked = picked === i;
          let cls = "border-slate-200 bg-white text-slate-700 hover:border-sky-300";
          if (picked !== null) {
            if (isAns) cls = "border-emerald-400 bg-emerald-50 text-emerald-700";
            else if (isPicked) cls = "border-rose-300 bg-rose-50 text-rose-600";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button key={i} type="button" disabled={picked !== null} onClick={() => pick(i)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition ${cls}`}>
              <span>{opt}</span>
              <span className="flex items-center gap-2">
                {picked !== null && isAns && (
                  <button type="button" aria-label="朗读" onClick={(e) => { e.stopPropagation(); unlockAmericanAudio(); void speakUS(opt); }}>
                    <Volume2 className="size-4 text-emerald-500" />
                  </button>
                )}
                {picked !== null && isAns && <Check className="size-4 text-emerald-600" />}
                {picked !== null && isPicked && !isAns && <X className="size-4 text-rose-500" />}
              </span>
            </button>
          );
        })}
      </div>
      {picked !== null && q.payload.explanation_cn && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-bold text-amber-700">💡 <T>点评</T></p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-900">{q.payload.explanation_cn}</p>
        </div>
      )}
      {/* 底部导航:上一空(回看)/下一空。首空禁用上一空;当前空未作答时禁用下一空 */}
      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={prev} disabled={idx === 0}
          className={`inline-flex items-center justify-center gap-1 rounded-full border px-5 py-3 text-sm font-semibold transition ${
            idx === 0 ? "cursor-not-allowed border-slate-100 text-slate-300" : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}>
          <ChevronLeft className="size-4" /> <T>上一空</T>
        </button>
        <button type="button" onClick={next} disabled={!answered}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold transition ${
            answered ? "bg-sky-600 text-white" : "cursor-not-allowed bg-slate-100 text-slate-300"
          }`}>
          {idx + 1 >= items.length && !reviewing ? <T>完成本关</T> : <><T>下一空</T> <ChevronRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}
