/**
 * 词汇作答会话的共用部件 —— 英汉选择 / 词汇配对 / 听音辨义 / 听写挑战 四个模式共用。
 *
 * ⚠️ 为什么抽出来:反馈弹层要展示"例句 1 + 自动朗读 + 查看全部 3 句",
 *    结果页要展示"本轮 N/M + 复习间隔说明",配额弹层要挡住 200 条 RLS 上限。
 *    这三件事在四个模式里**一模一样**,各写一份必然漂移 ——
 *    改了英汉选择的反馈文案、忘了改听写的,同一个产品出现两种说法。
 *
 * ⚠️ 这些部件一律**不碰计数**。掌握判定 / 复习档 / 错题本 / 成长图
 *    全在 vocabMastery.recordAnswer() 里,页面只负责问和显示。
 */
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_SHADOW, FONT_STAT, GRAD_CTA } from "@/lib/vocab/theme";
import { playUrl } from "@/lib/vocab/audio";
import { readAutoplay, writeAutoplay } from "@/lib/vocab/quiz";
import { listExamples, type VocabExample, type VocabWord } from "@/lib/vocab/data";

/**
 * 反馈弹层:对错 + 释义 + 例句 1 + 自动朗读 + "查看全部 3 句"折叠。
 * 例句 1 是 sort_order=1,即**最高频搭配**那句 —— 只给一句时必须给最有代表性的。
 *
 * @param subtitle 模式自己补的一行(如听写把正确拼写回显出来)
 */
export function Feedback({ word, correct, onNext, lastOne, subtitle }: {
  word: VocabWord; correct: boolean; onNext: () => void; lastOne: boolean; subtitle?: React.ReactNode;
}) {
  const [rows, setRows] = useState<VocabExample[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [autoplay, setAutoplay] = useState(readAutoplay());
  const played = useRef(false);

  useEffect(() => {
    let alive = true;
    listExamples(word.id).then(r => {
      if (!alive) return;
      setRows(r);
      // played 防重放:折叠展开触发的重渲染不该再响一次
      if (autoplay && !played.current && r[0]?.audio_url) { played.current = true; playUrl(r[0].audio_url, `e:${r[0].id}`); }
    }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, [word.id, autoplay]);

  const list = rows ?? [];
  const shown = showAll ? list : list.slice(0, 1);

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className={cn("mb-3 flex items-center gap-2 text-[16px] font-semibold",
        correct ? "text-emerald-700" : "text-rose-700")}>
        {correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        {correct ? "答对了" : "答错了"}
        {!correct && <span className="ml-1 text-[14px] font-normal text-slate-500">已加入错题本</span>}
      </div>

      {subtitle}
      <div className="mb-3 text-[15px] font-medium text-slate-800">{word.def_zh}</div>

      {shown.map(ex => (
        <div key={ex.id} className="border-t border-black/[0.06] py-3">
          {ex.collocation && <div className="mb-1 text-[12px] font-medium tracking-[0.02em] text-slate-400">{ex.collocation}</div>}
          <button type="button" onClick={() => playUrl(ex.audio_url, `e:${ex.id}`)} disabled={!ex.audio_url}
            className="flex w-full items-start gap-2 text-left">
            <Volume2 className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-[16px] leading-relaxed text-slate-800">{ex.sentence}</span>
          </button>
          <p className="mt-1 pl-6 text-[13px] leading-relaxed text-slate-500">{ex.translation_zh}</p>
        </div>
      ))}

      {list.length > 1 && (
        <button type="button" onClick={() => setShowAll(v => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[13px] text-slate-500">
          {showAll ? "收起" : `查看全部 ${list.length} 句`}
          <ChevronDown className={cn("h-3.5 w-3.5", showAll && "rotate-180")} />
        </button>
      )}

      <label className="mt-3 flex items-center gap-2 text-[12px] text-slate-400">
        <input type="checkbox" checked={autoplay}
          onChange={e => { setAutoplay(e.target.checked); writeAutoplay(e.target.checked); }} />
        自动朗读例句
      </label>

      <button type="button" onClick={onNext}
        className="mt-4 w-full rounded-2xl px-5 py-3.5 text-center text-[16px] font-semibold text-white"
        style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
        {lastOne ? "看结果" : "下一题"}
      </button>
    </div>
  );
}

export function Result({ total, correct, color, onAgain, onBack, note }: {
  total: number; correct: number; color: string; onAgain: () => void; onBack: () => void; note?: string;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
      <div className="text-[15px] text-slate-500">本轮结果</div>
      <div className="mt-2 flex items-baseline justify-center gap-1.5">
        <span className="text-slate-900" style={{ fontFamily: FONT_STAT, fontSize: "clamp(44px, 13vw, 56px)", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{correct}</span>
        <span className="text-[16px] text-slate-400">/ {total}</span>
      </div>
      <div className="mt-1 text-[14px]" style={{ color }}>正确率 {pct}%</div>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
        {note ?? "答对的词按 1 / 2 / 4 / 7 / 15 / 30 天的间隔回来复习;答错的进错题本,连对 3 天自动移出。"}
      </p>
      <button onClick={onAgain} className="mt-5 w-full rounded-2xl px-5 py-3.5 text-[16px] font-semibold text-white"
        style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>再来一轮</button>
      <button onClick={onBack} className="mt-2.5 w-full rounded-2xl border border-black/[0.08] px-5 py-3 text-[15px] text-slate-700">返回</button>
    </div>
  );
}

/** 配额到顶:占位提示,不是报错。核销逻辑在支付线 PR。 */
export function QuotaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-center">
        <p className="text-[17px] font-semibold text-slate-900">免费额度已用完</p>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          免费可学 200 个词。解锁功能即将上线,你已有的学习记录不会丢。
        </p>
        <button onClick={onClose}
          className="mt-5 w-full rounded-xl border border-black/[0.08] px-4 py-2.5 text-[15px] text-slate-700">
          知道了
        </button>
      </div>
    </div>
  );
}

/** 顶部进度条(条 + N/M),四个模式统一。 */
export function Progress({ done, total, color }: { done: number; total: number; color: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${total ? (done / total) * 100 : 0}%`, background: color }} />
      </div>
      <span className="shrink-0 text-[13px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
        {Math.min(done + 1, total)} / {total}
      </span>
    </div>
  );
}

/** 未登录提示条。 */
export function AnonNote() {
  return (
    <p className="mt-5 rounded-xl bg-slate-100 px-3.5 py-3 text-[13px] leading-relaxed text-slate-500">
      未登录状态下答题不会保存进度。登录后掌握度、错题本才会开始记录。
    </p>
  );
}
