/**
 * 例句块 —— 英文一行 + 中译紧贴其下,**一处实现,五处生效**
 * (反馈层/词卡、词块页、中文这样说页、场景短文都走它)。
 *
 * ── 先说清楚现状,免得下次又"修一个不存在的问题" ──────────────
 * 改造前这五处**并不是**"英文和中译分两块渲染" —— 它们本来就在同一个块里、
 * 中译就跟在英文下面。真正的问题是另外两件:
 *   ① **不紧凑**:英中两行都挂 `leading-relaxed`(1.625),外加块级 `py-2.5`,
 *      三条例句白白吃掉几十像素,把首屏顶掉;
 *   ② **不一致**:中译字号五处各写各的(13 / 14 / 12px),灰度也不统一。
 * 所以这个组件干的是**压紧 + 统一**,不是"把两块合成一块"。
 *
 * ── 压紧的做法(别再调松)──────────────────────────────────
 *   · 英文 `leading-snug`(1.375)而不是 relaxed —— 英文本来就短,relaxed 是浪费;
 *   · 中译 `leading-snug` + 比英文小两档 + `mt-0.5` 贴上去,读起来是"同一条"的两行;
 *   · 块级上下内边距 `py-2` 而不是 2.5。
 * ⚠️ 中译**不能再小于 12px**:实测再小在 SE 上已经影响可读性,
 *    压页面长度不该拿"看不清"去换。
 *
 * ⚠️ 中译缺失时**整行不渲染**(不是渲染一个空 <p>)—— 空标签照样吃 mt + 行高。
 */
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playUrl } from "@/lib/vocab/audio";

/** 中译的字号档:反馈层/词卡用 default,列表页(词块/中文这样说)用 small。 */
export type ExampleSize = "default" | "small";

const EN_CLS: Record<ExampleSize, string> = {
  default: "text-[16px] leading-snug",
  small: "text-[14px] leading-snug",
};
const ZH_CLS: Record<ExampleSize, string> = {
  default: "text-[13px] leading-snug",
  small: "text-[12px] leading-snug",
};

export function ExampleBlock({
  en, zh, audioUrl, audioKey, label, size = "default", className, enContent, playing = false,
}: {
  en: string;
  zh?: string | null;
  audioUrl?: string | null;
  /** 播放去重用的稳定键(与 audio.ts 的单曲不变量同一套)。 */
  audioKey?: string;
  /** 例句上方的小标(词块页的搭配名等),没有则不渲染。 */
  label?: string | null;
  size?: ExampleSize;
  className?: string;
  /**
   * 英文那一行的自定义渲染(词卡要把命中词高亮成粗体)。
   * 给了就用它替换纯文本,**其余版式完全一致** —— 高亮是内容差异,不该顺带
   * 把行距/字号也各写一套(那正是改造前五处漂开的原因)。
   */
  enContent?: React.ReactNode;
  /** 这一条正在朗读 —— 喇叭加深(词卡在用)。其余调用点不传即可。 */
  playing?: boolean;
}) {
  const hasAudio = !!audioUrl;
  return (
    <div className={cn("py-2", className)}>
      {label && <div className="mb-0.5 text-[12px] font-medium tracking-[0.02em] text-slate-400">{label}</div>}
      {/* 有音频才是按钮;没音频渲染成 div,避免一个点了没反应的按钮 */}
      {hasAudio ? (
        <button type="button" onClick={() => playUrl(audioUrl, audioKey)}
          className="flex w-full items-start gap-2 text-left">
          <Volume2 className={cn("mt-0.5 h-4 w-4 shrink-0", playing ? "text-slate-900" : "text-slate-400")} />
          <span className={cn("min-w-0 flex-1 text-slate-800", EN_CLS[size])}>{enContent ?? en}</span>
        </button>
      ) : (
        <div className="flex w-full items-start gap-2 text-left">
          {/* 占位保持左边距一致,否则有音频/无音频两条例句会左右错开一格 */}
          <span className="mt-0.5 h-4 w-4 shrink-0" />
          <span className={cn("min-w-0 flex-1 text-slate-800", EN_CLS[size])}>{enContent ?? en}</span>
        </div>
      )}
      {zh && <p className={cn("mt-0.5 pl-6 text-slate-500", ZH_CLS[size])}>{zh}</p>}
    </div>
  );
}
