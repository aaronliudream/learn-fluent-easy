/**
 * 词汇作答会话的共用部件 —— 英汉选择 / 词汇配对 / 听音辨义 / 听写挑战 四个模式共用。
 *
 * ⚠️ 为什么抽出来:反馈弹层要展示"三条例句全展开 + 自动朗读前 N 句",
 *    结果页要展示"本轮 N/M + 复习间隔说明",配额弹层要挡住 200 条 RLS 上限。
 *    这三件事在四个模式里**一模一样**,各写一份必然漂移 ——
 *    改了英汉选择的反馈文案、忘了改听写的,同一个产品出现两种说法。
 *
 * ⚠️ 这些部件一律**不碰计数**。掌握判定 / 复习档 / 错题本 / 成长图
 *    全在 vocabMastery.recordAnswer() 里,页面只负责问和显示。
 */
import { useEffect, useRef, useState } from "react";
import { Check, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_SHADOW, FONT_SERIF, FONT_STAT, GRAD_CTA } from "@/lib/vocab/theme";
import { playChain, playUrl } from "@/lib/vocab/audio";
import { readAutoplay, readAutoplayCount, writeAutoplay, writeAutoplayCount, type AutoplayCount } from "@/lib/vocab/quiz";
import { listExamples, type VocabExample, type VocabWord } from "@/lib/vocab/data";

/**
 * 词卡卡体 —— **反馈层的唯一实现**,由英汉选择/听音辨义/听写挑战/错题本闯关四处共用。
 * ⚠️ 词汇配对(VocabMatch)**没有**用它:那个模式是翻牌配对,答完直接进结算页,
 *    整个模式不存在逐词反馈层。别再按"四模式都有反馈层"去推断。
 *
 * 规格(Aaron 2026-08-06 封版):做题的反馈时刻是记忆黏合的黄金三秒,
 * 每一题的反馈都是一次**完整的微型词卡复习**,不是过场。
 * 所以这里必须给全:大字 + 音标 + 词性 + 中英释义 + **三条例句全展开** + 中译 + 逐句朗读。
 *
 * ⚠️ 各模式**不许**再把单词大字/音标塞进自己的 subtitle 里 ——
 *    之前 Listen 和 Spell 各拼了一份,同一个信息三种写法,
 *    正是"只许有一个实现"要防的东西。
 * ⚠️ 没有音频的词(198 之外)**只隐藏朗读键**,文字反馈一字不少。
 */
/**
 * @param allowAutoplay 允许自动朗读吗。默认 true = 沿用全局「自动朗读例句」设置。
 *   ⚠️ **列表场景必须传 false**。这个组件一挂载就自动朗读,答题反馈层里同屏只有
 *      一张卡所以没问题;但配对结算页的「逐词回顾」一次挂 6 张 —— 6 条朗读链
 *      同时启动互相抢占,落地就是一串卡顿噪音。
 *      而且语义上也不对:进一个回顾列表不该有任何声音自己响起来。
 */
export function WordCardBody({ word, allowAutoplay = true }: { word: VocabWord; allowAutoplay?: boolean }) {
  const [rows, setRows] = useState<VocabExample[] | null>(null);
  /* ⚠️ 这里存的是**全局设置的真值**,不掺 allowAutoplay ——
     勾选框要如实反映用户的全局设置,不能因为"这一屏不自动播"就显示成关。
     场景差异只作用在"要不要自动触发"和"要不要显示这组控件"上。 */
  const [autoplay, setAutoplay] = useState(readAutoplay());
  const [count, setCount] = useState<AutoplayCount>(readAutoplayCount());
  const played = useRef(false);

  useEffect(() => {
    let alive = true;
    listExamples(word.id).then(r => {
      if (!alive) return;
      setRows(r);
      /* 自动朗读**前 count 条**。
       * ⚠️ 复用 audio.ts 的 playChain(磨耳朵那条链)——**不要**在这里再写一个
       *    setTimeout 串播:两套串播逻辑必然漂移,而且 playChain 已经处理好了
       *    "中途点别的就中断"(它和 playUrl 共用同一个全局单曲不变量)。
       * ⚠️ played 防重放:切换朗读条数/勾选框引发的重渲染不该再响一遍。 */
      /* 顺序:**先读单词 → 停 0.6s → 再按句数设置读例句**(Aaron 2026-08-09 定)。
       * ⚠️ 踩过:这里原先只由例句构造链条,`word.audio_url` **从头到尾没进过这个数组** ——
       *    表现就是"答对后直接读例句、单词没读"。不是被例句覆盖,是压根没加进去。
       * ⚠️ 0.6s 停顿交给 playChain(它带 gapAfterMs),别在这里套 setTimeout:
       *    链外的定时器不受 chainToken 管辖,用户若在停顿期间点了别的,
       *    这条链会在停顿结束后诈尸再读一句。 */
      const clips: { url: string | null | undefined; key: string; gapAfterMs?: number }[] = [];
      if (word.audio_url) clips.push({ url: word.audio_url, key: `w:${word.id}`, gapAfterMs: 600 });
      clips.push(...r.slice(0, count).filter(e => e.audio_url).map(e => ({ url: e.audio_url, key: `e:${e.id}` })));
      if (autoplay && allowAutoplay && !played.current && clips.length) {
        played.current = true;
        void playChain(clips);
      }
    }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, [word.id, autoplay, count, allowAutoplay]);

  /* 换词就允许再自动读一次 —— 否则第二题起永远不响 */
  useEffect(() => { played.current = false; }, [word.id]);

  const list = rows ?? [];

  return (
    <>
      {/* 大字 + 音标 + 词性:三者同屏,这是"微型词卡"的骨架 */}
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span className="text-[24px] font-semibold leading-tight text-slate-900" style={{ fontFamily: FONT_SERIF }}>
          {word.headword}
        </span>
        {word.ipa && <span className="text-[14px] text-slate-500">{word.ipa}</span>}
        {word.pos && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-500">{word.pos}</span>}
        {word.audio_url && (
          <button type="button" onClick={() => playUrl(word.audio_url, `w:${word.id}`)} aria-label="朗读单词"
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-slate-400">
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-1 text-[15px] font-medium text-slate-800">{word.def_zh}</div>
      {word.def_en && <div className="mb-2 text-[13px] leading-snug text-slate-500">{word.def_en}</div>}

      {/* ⚠️ 三条例句**全部展开**,不再折叠(Aaron 2026-08-09)。
             原来只显示第 1 句 + 「查看全部 3 句」—— 反馈是记忆黏合的黄金三秒,
             把另外两句藏在一次点击后面,等于绝大多数人永远看不到。 */}
      {list.map(ex => (
        <div key={ex.id} className="border-t border-black/[0.06] py-2.5">
          {ex.collocation && <div className="mb-1 text-[12px] font-medium tracking-[0.02em] text-slate-400">{ex.collocation}</div>}
          <button type="button" onClick={() => playUrl(ex.audio_url, `e:${ex.id}`)} disabled={!ex.audio_url}
            className="flex w-full items-start gap-2 text-left">
            {/* 无音频只隐藏喇叭,句子照常显示 */}
            {ex.audio_url ? <Volume2 className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : <span className="mt-1 h-4 w-4 shrink-0" />}
            <span className="text-[16px] leading-relaxed text-slate-800">{ex.sentence}</span>
          </button>
          <p className="mt-1 pl-6 text-[13px] leading-relaxed text-slate-500">{ex.translation_zh}</p>
        </div>
      ))}

      {/* 自动朗读:总开关 + 读几条。两者并存 —— 开关管"要不要读",数量管"读几条"。
          ⚠️ allowAutoplay=false 的列表场景整组不渲染:这两个是**全局**设置,
             在同屏 6 张卡的回顾列表里会变成 6 份一模一样的开关,既冗余又
             让人以为是"这张卡的设置"。那一屏本来也不自动播,控件没有意义。 */}
      {allowAutoplay && (
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-2 text-[12px] text-slate-400">
          <input type="checkbox" checked={autoplay}
            onChange={e => { setAutoplay(e.target.checked); writeAutoplay(e.target.checked); }} />
          自动朗读例句
        </label>
        {autoplay && list.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-slate-400">读</span>
            {([1, 2, 3] as AutoplayCount[]).filter(n => n <= list.length).map(n => (
              <button key={n} type="button"
                onClick={() => { setCount(n); writeAutoplayCount(n); }}
                aria-pressed={count === n}
                className={cn("h-6 w-6 rounded-full border text-[12px]",
                  count === n ? "border-transparent bg-slate-900 text-white" : "border-black/[0.08] text-slate-500")}>
                {n}
              </button>
            ))}
            <span className="text-[12px] text-slate-400">句</span>
          </div>
        )}
      </div>
      )}
    </>
  );
}

/**
 * 听写专用:用户拼写与正确拼写**逐字母对照**,错的标红。
 * ⚠️ 用等长逐位比对而不是 diff 算法 —— 学生要看的是"第几个字母写错了",
 *    不是"最小编辑路径"。长度不一致时,多写的字母同样标红、少写的补下划线位。
 */
export function LetterDiff({ input, answer }: { input: string; answer: string }) {
  const a = input.trim(), b = answer.trim();
  const n = Math.max(a.length, b.length);
  return (
    <div className="mb-2 flex flex-wrap gap-0.5 text-[18px] tracking-[0.08em]" style={{ fontFamily: FONT_SERIF }}>
      {Array.from({ length: n }, (_, i) => {
        const ch = a[i];
        const ok = ch !== undefined && b[i] !== undefined && ch.toLowerCase() === b[i].toLowerCase();
        return (
          <span key={i} className={cn(ok ? "text-emerald-700" : "text-rose-600 line-through")}>
            {ch ?? "_"}
          </span>
        );
      })}
    </div>
  );
}

/**
 * 反馈弹层 —— 四个模式统一引用,禁止各写一套。
 *
 * @param correctAnswer 答错时要标红显示的正确答案(选择题传选项文本,听写传拼写)
 * @param spelled       听写模式传用户输入,触发逐字母对照
 */
export function Feedback({ word, correct, onNext, lastOne, correctAnswer, spelled }: {
  word: VocabWord; correct: boolean; onNext: () => void; lastOne: boolean;
  correctAnswer?: string; spelled?: string;
}) {
  /* 挂载即滚进视野 —— 放在这里而不是各模式里,三个模式一次到位。
   * ⚠️ 手机上反馈层在选项下方,不自动滚的话用户每题都要手动下滑找它,
   *    而反馈是记忆黏合的黄金三秒,不该让用户先花两秒找它。
   * block:"start" 让反馈层顶部对齐视口顶部,大字/音标/释义/例句一屏内可见。 */
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { el.scrollIntoView(); }
    }, 60);                                   // 等反馈层布局稳定再滚,否则滚到半截
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div ref={ref} className="mt-3 scroll-mt-3 rounded-2xl border border-black/[0.06] bg-white p-4">
      <div className={cn("mb-3 flex items-center gap-2 text-[16px] font-semibold",
        correct ? "text-emerald-700" : "text-rose-700")}>
        {correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        {correct ? "答对了" : "答错了"}
        {!correct && <span className="ml-1 text-[14px] font-normal text-slate-500">已加入错题本</span>}
      </div>

      {/* 听写:逐字母对照。拼对时整词绿色,由 LetterDiff 自然给出 */}
      {typeof spelled === "string" && spelled.length > 0 && (
        <LetterDiff input={spelled} answer={word.headword} />
      )}

      {/* 答错时把正确答案标红顶在最前 —— 不能只在选项区标,反馈层里也要有 */}
      {!correct && correctAnswer && (
        <div className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-[14px] text-rose-900">
          正确答案:<b className="font-semibold">{correctAnswer}</b>
        </div>
      )}

      <WordCardBody word={word} />

      <button type="button" onClick={onNext}
        className="mt-3 w-full rounded-2xl px-5 py-3 text-center text-[16px] font-semibold text-white"
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
