/**
 * 词卡 —— 词汇板块的核心复用资产。PR-2/3/4 的所有测试模式、错题本都复用它。
 *
 * 版式严格照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md 第 4 节:
 *   · headword 衬线体 48px 居中(全屏唯一衬线元素,天然成为视觉锚点,不再加色块强调)
 *   · 例句区每条之间一条 1px 细分割线 —— 不用卡中卡、不用底色分区
 *   · 三条例句按 sort_order 升序 = 搭配频率降序,第一条永远是最高频用法
 *   · 朗读中的那条左侧显示 2px 竖条,**不换底色**
 *
 * ⚠️ 这里没有任何渐变。渐变是主 CTA 的专属位(spec 第 1 节),词卡里出现渐变就违规。
 */
import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_SERIF } from "@/lib/vocab/theme";
import { playUrl, subscribePlaying } from "@/lib/vocab/audio";
import { highlightSegments, HILITE } from "@/lib/vocab/highlight";
import type { VocabWord, VocabExample } from "@/lib/vocab/data";
import WordExtras from "@/components/vocab/WordExtras";

type Props = {
  word: VocabWord;
  examples?: VocabExample[];
  /** 只看词头不看例句(测试模式里用)。 */
  hideExamples?: boolean;
  /** 释义language:zh = 中文释义在上;en = 只给英文释义(PR-2 的 EN only 胶囊)。 */
  defMode?: "zh" | "en";
  /**
   * full   = 独立词卡(测试模式 / 详情用),含 48px 衬线词头。
   * inline = 嵌在词表行下面用:**不重复渲染词头**(上面那行已经有了),
   *          只出释义 + 例句。这样例句版式只有一处实现,不会两边长歪。
   */
  variant?: "full" | "inline";
  className?: string;
};

export default function WordCard({ word, examples, hideExamples, defMode = "zh", variant = "full", className }: Props) {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => subscribePlaying(setPlaying), []);

  const sorted = (examples || []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const inline = variant === "inline";

  return (
    <article
      className={cn(
        inline ? "bg-transparent" : "rounded-2xl border border-black/[0.08] bg-white",
        className,
      )}
    >
      {/* ── 词头区(inline 变体不渲染:词表行上面已经有词头了) ── */}
      {!inline && (
      <header className="px-5 pt-7 pb-5 text-center">
        <h1
          className="leading-tight text-slate-900"
          style={{ fontFamily: FONT_SERIF, fontSize: "clamp(34px, 11vw, 48px)", fontWeight: 600 }}
        >
          {word.headword}
        </h1>

        {(word.ipa || word.audio_url) && (
          <button
            type="button"
            onClick={() => playUrl(word.audio_url, `w:${word.id}`)}
            disabled={!word.audio_url}
            aria-label={`朗读 ${word.headword}`}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] text-slate-500",
              word.audio_url ? "hover:bg-slate-100 active:bg-slate-200" : "cursor-default opacity-60",
            )}
          >
            <Volume2 className={cn("h-3.5 w-3.5", playing === `w:${word.id}` && "text-slate-900")} />
            {word.ipa && <span className="tracking-wide">{word.ipa}</span>}
          </button>
        )}

        {word.pos && (
          <div className="mt-1.5 text-[12px] font-medium tracking-[0.02em] text-slate-400">{word.pos}</div>
        )}

        <div className="mt-4 space-y-1">
          {defMode === "zh" ? (
            <>
              {word.def_zh && <p className="text-[15px] font-medium text-slate-800">{word.def_zh}</p>}
              {word.def_en && <p className="text-[13px] text-slate-500">{word.def_en}</p>}
            </>
          ) : (
            word.def_en && <p className="text-[15px] font-medium text-slate-800">{word.def_en}</p>
          )}
        </div>
      </header>
      )}

      {/* ── 例句区:细分割线分隔,不做卡中卡 ── */}
      {!hideExamples && sorted.length > 0 && (
        <div className={inline ? "px-4 pb-4" : "px-5 pb-5"}>
          {sorted.map((ex, i) => {
            const key = `e:${ex.id}`;
            const isPlaying = playing === key;
            return (
              <div
                key={ex.id}
                className={cn("relative py-4", i > 0 && "border-t border-black/[0.06]")}
              >
                {/* 朗读中:左侧 2px 竖条,不换底色 */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[-20px] top-4 bottom-4 w-[2px] rounded-full bg-slate-900",
                    isPlaying ? "opacity-100" : "opacity-0",
                  )}
                />
                {ex.collocation && (
                  <div className="mb-1 text-[12px] font-medium tracking-[0.02em] text-slate-400">
                    {ex.collocation}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => playUrl(ex.audio_url, key)}
                  disabled={!ex.audio_url}
                  className="flex w-full items-start gap-2 text-left"
                  aria-label={`朗读例句 ${i + 1}`}
                >
                  <Volume2
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0",
                      ex.audio_url ? (isPlaying ? "text-slate-900" : "text-slate-400") : "text-slate-200",
                    )}
                  />
                  <span className="text-[17px] leading-relaxed text-slate-800">
                    {highlightSegments(ex.sentence, word.headword).map((s, si) =>
                      s.hit
                        ? <b key={si} style={{ color: HILITE, fontWeight: 700 }}>{s.text}</b>
                        : <span key={si}>{s.text}</span>,
                    )}
                  </span>
                </button>
                <p className="mt-1 pl-6 text-[14px] leading-relaxed text-slate-500">{ex.translation_zh}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* 词卡增区 —— 与答题反馈层**同一个组件**(见 WordExtras 文件头)。
          ⚠️ hideExamples 的测试模式下不出:那一屏刻意只给词头,增区会泄题。 */}
      {!hideExamples && <WordExtras wordId={word.id} />}
    </article>
  );
}
