import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * 分段渐显阅读：按句切分，每句间隔 minSecPerSentence 秒后才解锁下一句。
 * 未解锁的句子模糊+遮蔽，防止"一次截屏拿全文"。
 * 完成时调用 onAllRevealed。
 */
export default function SegmentedReader({
  text,
  minSecPerSentence = 4,
  onAllRevealed,
}: {
  text: string;
  minSecPerSentence?: number;
  onAllRevealed?: () => void;
}) {
  // 按 . ? ! 或换行切分，保留分隔符
  const sentences = useMemo(() => {
    const arr: string[] = [];
    const re = /[^.!?\n]+[.!?]+|[^.!?\n]+$/g;
    const parts = text.split(/\n+/);
    for (const p of parts) {
      const m = p.match(re);
      if (m) arr.push(...m.map(s => s.trim()).filter(Boolean));
      else if (p.trim()) arr.push(p.trim());
      arr.push("\n");
    }
    return arr;
  }, [text]);

  const realCount = sentences.filter(s => s !== "\n").length;
  const [revealed, setRevealed] = useState(1);

  useEffect(() => {
    if (revealed >= realCount) {
      onAllRevealed?.();
      return;
    }
    const t = setTimeout(() => setRevealed(r => Math.min(realCount, r + 1)), minSecPerSentence * 1000);
    return () => clearTimeout(t);
  }, [revealed, realCount, minSecPerSentence, onAllRevealed]);

  let realIdx = 0;
  return (
    <div className="text-[15px] leading-8 font-serif">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
        <span>逐句解锁 {Math.min(revealed, realCount)}/{realCount}</span>
        <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(revealed/realCount)*100}%` }} />
        </div>
      </div>
      <p className="whitespace-pre-wrap">
        {sentences.map((s, i) => {
          if (s === "\n") return <br key={i} />;
          realIdx += 1;
          const shown = realIdx <= revealed;
          return (
            <span key={i} className={cn("transition-all", shown ? "" : "blur-md select-none text-muted-foreground/60")}>
              {s + " "}
            </span>
          );
        })}
      </p>
    </div>
  );
}