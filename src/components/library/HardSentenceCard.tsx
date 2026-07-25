/**
 * 难句/短语讲解 marker(句级)。挂在阅读器逐句块尾:一个 💡 小标,默认折叠不打断阅读;
 * 点开弹出该句的「难点清单」(难短语为主)。数据来自 library_hard_sentences(预生成入库)。
 * 与文化笔记 💡(词卡内)区分:此 marker 在正文句尾,点开是整句难点列表,不是整句翻译。
 */
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { T } from "@/i18n/T";
import type { LibraryHardPoint } from "@/lib/library/data";

export default function HardSentenceCard({ points }: { points: LibraryHardPoint[] }) {
  if (!points?.length) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()} // 别触发所在句的点句显中文
          aria-label="难句讲解"
          className="ml-0.5 inline-flex translate-y-[-1px] items-center rounded-full px-1 text-[13px] leading-none opacity-70 transition hover:opacity-100"
        >
          💡
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onClick={(e) => e.stopPropagation()}
        className="w-[300px] max-w-[86vw] rounded-2xl border-amber-200/70 bg-amber-50/95 p-3.5 text-slate-700 shadow-lg"
      >
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-amber-700">
          <span>💡</span>
          <T>这句的难点</T>
        </div>
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={i} className="text-[13.5px] leading-relaxed">
              <span
                className={`mr-1.5 rounded px-1 py-0.5 text-[10px] align-middle ${
                  p.kind === "phrase" ? "bg-amber-200/70 text-amber-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {p.kind === "phrase" ? "短语" : "词"}
              </span>
              <span className="font-semibold text-slate-800">{p.term}</span>
              <span className="text-slate-400"> — </span>
              <span>{p.gloss}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
