/**
 * 美语课程 · 课文点读行 —— TappableLine 的本地包装(只消费,不改动 TappableLine 本体)。
 * 铁律:TappableLine 是全站共享组件,美语关1 只复用其"点词查词 + 朗读"能力,
 *       任何美语专属逻辑(点读回调、样式、加粗)都收在这里,不回写 TappableLine。
 * 加粗(真机反馈③):命中本课词表词(按词干匹配屈折形)+ 语块(整串词干匹配)的部分加粗。
 *   做法=把句子切成"加粗/不加粗"的连续段,每段仍各自过 TappableLine(点词查词不受影响),
 *   加粗段外面套 <strong>。整词边界匹配,不会把 in 命中进 minutes。
 */
import { Fragment, useMemo } from "react";
import { TappableLine } from "@/components/TappableLine";

/** 词干:小写 + 去屈折后缀 + 去尾 e + 去尾部双写辅音,用于词表词/语块的屈折匹配(gather/gathered/gathering 同干)。 */
function stem(w: string): string {
  let s = w.toLowerCase().replace(/[^a-z]/g, "");
  s = s.replace(/ies$/, "y");
  s = s.replace(/(ing|ed|es|s)$/, "");
  s = s.replace(/e$/, "");
  s = s.replace(/([bcdfghjklmnpqrstvwxz])\1$/, "$1");
  return s;
}

type Seg = { text: string; bold: boolean };

/** 把句子切成加粗/非加粗连续段。整词 token 匹配,语块按连续词干序列匹配。 */
function buildSegments(sentence: string, boldWords: string[], boldChunks: string[]): Seg[] {
  const parts = sentence.split(/(\s+|[.,!?;:"'()\-—…])/g).filter((p) => p !== "");
  const isWord = (p: string) => /^[A-Za-z][A-Za-z'\-]*$/.test(p);
  const wordPos: number[] = [];
  parts.forEach((p, i) => { if (isWord(p)) wordPos.push(i); });
  const wordStem = wordPos.map((pi) => stem(parts[pi]));
  const bold = new Array(parts.length).fill(false);

  // 词表词:整词词干命中即加粗(词干长度≥2 防超短词误伤)
  const wset = new Set(boldWords.map(stem).filter((s) => s.length >= 2));
  wordPos.forEach((pi, k) => { if (wordStem[k].length >= 2 && wset.has(wordStem[k])) bold[pi] = true; });

  // 语块:按词干序列连续匹配(整串);单词语块退化为词表词处理
  for (const ch of boldChunks) {
    const cw = ch.split(/\s+/).map(stem).filter((s) => s.length >= 1);
    if (cw.length === 0) continue;
    if (cw.length === 1) {
      wordPos.forEach((pi, k) => { if (wordStem[k] === cw[0]) bold[pi] = true; });
      continue;
    }
    for (let k = 0; k + cw.length <= wordPos.length; k++) {
      let ok = true;
      for (let j = 0; j < cw.length; j++) if (wordStem[k + j] !== cw[j]) { ok = false; break; }
      if (ok) for (let pi = wordPos[k]; pi <= wordPos[k + cw.length - 1]; pi++) bold[pi] = true;
    }
  }

  const segs: Seg[] = [];
  for (let i = 0; i < parts.length; i++) {
    const b = bold[i];
    if (segs.length && segs[segs.length - 1].bold === b) segs[segs.length - 1].text += parts[i];
    else segs.push({ text: parts[i], bold: b });
  }
  return segs;
}

export function AmericanTappableLine({
  sentence,
  className,
  boldWords,
  boldChunks,
}: {
  sentence: string;
  className?: string;
  boldWords?: string[];
  boldChunks?: string[];
}) {
  const hasBold = (boldWords?.length ?? 0) + (boldChunks?.length ?? 0) > 0;
  const segments = useMemo(
    () => (hasBold ? buildSegments(sentence, boldWords ?? [], boldChunks ?? []) : null),
    [sentence, boldWords, boldChunks, hasBold],
  );
  return (
    <span className={className}>
      {segments
        ? segments.map((seg, i) => {
            // 把段首/段尾的空白抽成"字面文本节点"渲染在 TappableLine 之外——
            // 因为 TappableLine 会对每段各自 stripTags().trim(),会吃掉边界空格,
            // 造成加粗词与邻词粘连(Traffic+police→Trafficpolice)。词内空格不受影响。
            const [, lead, core, trail] = seg.text.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
            return (
              <Fragment key={i}>
                {lead}
                {core ? (
                  seg.bold ? (
                    <strong className="font-bold text-slate-900">
                      <TappableLine sentence={core} />
                    </strong>
                  ) : (
                    <TappableLine sentence={core} />
                  )
                ) : null}
                {trail}
              </Fragment>
            );
          })
        : <TappableLine sentence={sentence} />}
    </span>
  );
}
