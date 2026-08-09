/**
 * 四选一的选项区 —— **一处实现,四处生效**
 * (英汉选择 / 听音辨义 / 错题本闯关 / 今日学习)。
 *
 * ── 条件式 2×2(Aaron 2026-08-09)──────────────────────────────
 * 四个选项各占一行会把页面拉长,反馈层被顶到折线外。所以:
 *   · **四个选项都够短** → 排成 2×2 网格,每行两个,页面省掉约一半选项区高度;
 *   · **任一个偏长** → 退回单列一行一个。
 *
 * ⚠️ 判据**在渲染时按实际文本算,不写死** —— 托福释义长短差异极大
 *    (「防御」两字 vs 「提供生长和健康所需的营养」十几字),一刀切必然出事:
 *    真按两列排长选项,要么换行成三行高低不齐,要么被 truncate 吃掉半句话。
 *
 * ⚠️ 中英混排要一起算。VocabQuiz 有 `defMode: "en"`,那时选项是**英文释义**,
 *    按"汉字个数"判会把一句英文算成 30+ 字直接退回单列 —— 其实英文更窄。
 *    所以用**视觉宽度**近似:CJK 记 1,其余记 0.5,阈值仍是 8(= 8 个汉字)。
 *
 * ⚠️ 2×2 下每格**最小高度和触控区不变**(min-h-[58px] ≥ 44px 触控下限)。
 *    省空间不能拿可点性去换 —— 这条是 Aaron 明确写的,别为了再省几像素调低。
 */
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** 一个字符的视觉宽度:CJK / 全角标点记 1,其余(拉丁字母、空格、半角标点)记 0.5。 */
function visualWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    w += /[　-鿿＀-￯]/.test(ch) ? 1 : 0.5;
  }
  return w;
}

/** 阈值 = 8 个汉字宽。导出是为了单测能直接引用同一个常量,不在测试里再抄一遍。 */
export const COMPACT_MAX_WIDTH = 8;

/** 四个选项**全部**够短才走 2×2;任一超标就整组退回单列。 */
export function canUseTwoColumns(options: string[]): boolean {
  if (options.length !== 4) return false;      // 只对四选一生效;别的数量老实单列
  return options.every(o => visualWidth(o) <= COMPACT_MAX_WIDTH);
}

export function OptionGrid({ options, answerIndex, picked, onPick, disabled }: {
  options: string[];
  answerIndex: number;
  /** 已选下标;null = 还没选(此时不揭晓对错)。 */
  picked: number | null;
  onPick: (i: number) => void;
  disabled?: boolean;
}) {
  const reveal = picked !== null;
  const twoCol = canUseTwoColumns(options);

  return (
    <div className={cn("mt-3", twoCol ? "grid grid-cols-2 gap-2" : "space-y-2")}>
      {options.map((opt, i) => {
        const isAnswer = i === answerIndex;
        const isPicked = picked === i;
        return (
          <button key={i} type="button" onClick={() => onPick(i)} disabled={disabled || reveal}
            className={cn(
              /* 等高(min-h)避免长短不一时用排除法猜,也让一屏排布可预测。
                 2×2 时用 justify-center 让短选项居中,单列时保持左对齐 ——
                 两列里左对齐会因为两格文字长度不同显得歪。 */
              "flex min-h-[58px] w-full items-center gap-2 rounded-2xl border px-4 py-3 text-[17px] leading-snug transition",
              twoCol ? "justify-center text-center" : "text-left",
              !reveal && "border-black/[0.08] bg-white active:bg-slate-50",
              reveal && isAnswer && "border-emerald-300 bg-emerald-50 text-emerald-900",
              reveal && isPicked && !isAnswer && "border-rose-300 bg-rose-50 text-rose-900",
              reveal && !isAnswer && !isPicked && "border-black/[0.06] bg-white text-slate-400",
            )}>
            <span className={cn("min-w-0", twoCol ? "" : "flex-1")}>{opt}</span>
            {reveal && isAnswer && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
            {reveal && isPicked && !isAnswer && <X className="h-5 w-5 shrink-0 text-rose-500" />}
          </button>
        );
      })}
    </div>
  );
}
