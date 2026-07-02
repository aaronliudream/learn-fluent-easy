/**
 * 美语课程 · 课文点读行 —— TappableLine 的本地包装(只消费,不改动 TappableLine 本体)。
 * 铁律:TappableLine 是全站共享组件,美语关1 只复用其"点词查词 + 朗读"能力,
 *       任何美语专属逻辑(点读回调、样式)都收在这里,不回写 TappableLine。
 */
import { TappableLine } from "@/components/TappableLine";

export function AmericanTappableLine({ sentence, className }: { sentence: string; className?: string }) {
  return (
    <span className={className}>
      <TappableLine sentence={sentence} />
    </span>
  );
}
