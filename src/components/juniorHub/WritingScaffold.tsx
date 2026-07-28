import { useMemo, useState } from "react";
import type { WritingBlock } from "@/lib/juniorHub/types";

/**
 * 写作关「四屏脚手架」——屏1 填素材 → 屏2 选模板 → 屏3 看草稿 → 交给屏4 自由编辑+AI 批改。
 *
 * ★它不负责批改★ 屏4(编辑 + 提交 check-writing + 反馈)仍由 WritingStage 原有分支承担,
 * 本组件只产出一段草稿文本交出去。这样「真 AI 批改」这条链路一行都没动 ——
 * 当初不敢直接接线,就是因为 WritingStudio 会用四屏**换掉**真批改;现在是四屏**喂给**真批改。
 *
 * ★为什么不复用 WritingStudio.tsx★
 * 那个组件从没运行过(全仓零 import),UI 部分不继承未验证代码。
 * ⚠️ 但它的**逻辑**里有真东西:`subj` → He/She/His/Her 的人称派生。
 * 我第一版把它当成「7B 单课假设」丢掉了 —— **那个判断是错的**,人教 7A U4 这类
 * 「介绍一个朋友」的模板正依赖它(cards 只给 `subj`,模板写 `{Poss} name is {name}`)。
 * 丢掉的后果是那一课草稿永远留着 ____,由数据面实测抓出后已恢复(见 deriveValues)。
 * 它另一处 `values.name` 判开头句才是真的单课假设,没有继承。
 *
 * ★数据零新造★ cards / templates / opener / sampleWords / minWords 全部来自五册现成的 writing 块。
 */

/**
 * 人称派生:填了 `subj`(he/she)就自动得到 `{Subj}` `{subj}` `{Poss}` `{poss}`。
 *
 * ⚠️ 这**不是**某一课的特例 —— 人教 7A U4 这类"介绍一个朋友"的模板依赖它
 * (cards 里只有 `subj`,模板里写的是 `{Poss} name is {name}`)。
 * 我第一版把它当成 WritingStudio 的单课包袱丢掉了,结果那一课的草稿会留下永远填不上的 ____。
 * 数据面实测(writing-scaffold-check)把这个抓了出来。
 */
export function deriveValues(values: Record<string, string>): Record<string, string> {
  const out = { ...values };
  const raw = (values.subj ?? "").trim().toLowerCase();
  if (raw) {
    const she = raw === "she" || raw === "her";
    out.subj = she ? "she" : "he";
    out.Subj = she ? "She" : "He";
    out.poss = she ? "her" : "his";
    out.Poss = she ? "Her" : "His";
  }
  return out;
}

/** 模板里实际引用到的占位符(含派生出来的),用来决定屏1 显示哪些卡片。 */
export function usedKeys(templates: WritingBlock["templates"]): Set<string> {
  const out = new Set<string>();
  for (const lv of ["l1", "l2", "l3"] as const) {
    for (const line of templates?.[lv] ?? []) {
      for (const m of line.matchAll(/\{(\w+)\}/g)) out.add(m[1]);
    }
  }
  // 用到任一派生形,就等于用到了 subj 这张卡
  if (out.has("Subj") || out.has("Poss") || out.has("poss")) out.add("subj");
  return out;
}

/** 把 `{key}` 换成学生填的值;没填的显示成下划线占位,让人一眼看出还缺什么。 */
export function fillTemplate(line: string, values: Record<string, string>): string {
  const derived = deriveValues(values);
  return line.replace(/\{(\w+)\}/g, (_m, k: string) => {
    const v = (derived[k] ?? "").trim();
    return v || "____";
  });
}

export function buildDraft(lines: string[] | undefined, values: Record<string, string>): string {
  if (!lines?.length) return "";
  return lines.map((l) => fillTemplate(l, values)).join(" ");
}

/** 屏3 用:把草稿按「填进去的卡片值」切段,值的部分高亮。纯展示,不改文本。 */
function HighlightedDraft({ text, values }: { text: string; values: Record<string, string> }) {
  const filled = Object.values(values).map((v) => v.trim()).filter((v) => v.length > 1);
  if (!filled.length) return <>{text}</>;
  // 长的先匹配,避免短值把长值切碎
  const esc = filled.sort((a, b) => b.length - a.length).map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${esc.join("|")})`, "g"));
  return (
    <>
      {parts.map((p, i) =>
        filled.some((v) => v === p) ? (
          <mark key={i} className="rounded bg-[#FFE8D6] px-0.5 text-[#C2410C] dark:bg-orange-900/40 dark:text-orange-200">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

const LEVELS = [
  { key: "l1" as const, label: "基础档", desc: "句式最短,先把话说完整" },
  { key: "l2" as const, label: "进阶档", desc: "多一点细节和连接词" },
  { key: "l3" as const, label: "挑战档", desc: "长句为主,像范文一样" },
];

export default function WritingScaffold({
  w,
  onUseDraft,
  onSkip,
}: {
  w: WritingBlock;
  /** 学生带着草稿进屏4(自由编辑 + 提交批改) */
  onUseDraft: (draft: string) => void;
  /** 直接写:跳过脚手架,空白进屏4 */
  onSkip: () => void;
}) {
  const templates = w.templates;
  // ★只显示模板真正用到的卡片★ 有几课 cards 里定义了模板根本没引用的 key
  // (人教 8A U4 的 {feeling}、8B U3 的三个),显示出来就是白让学生填。
  const allCards = w.cards ?? [];
  const used = useMemo(() => usedKeys(templates), [templates]);
  const cards = allCards.filter((c) => used.has(c.key));
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(cards.map((c) => [c.key, ""])),
  );
  const [level, setLevel] = useState<"l1" | "l2" | "l3">("l1");

  // ★换模板不丢卡片★ values 独立于 level,切档只是重算草稿。
  const draft = useMemo(() => buildDraft(templates?.[level], values), [templates, level, values]);
  const filledCount = cards.filter((c) => (values[c.key] ?? "").trim()).length;

  const Dots = () => (
    <div className="mb-3 flex items-center justify-center gap-1.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[#FF6B35]" : "w-1.5 bg-[#EEEAE0] dark:bg-muted"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-card">
      <div className="mb-1 text-lg font-bold">✍️ {w.topic || "写作练习"}</div>
      <Dots />

      {step === 1 && (
        <>
          <p className="mb-1 text-sm">{w.promptCn}</p>
          <p className="mb-3 text-xs text-[#888780] dark:text-muted-foreground">{w.prompt}</p>
          <div className="mb-3 text-xs font-bold text-[#5C5751] dark:text-muted-foreground">
            先填几个素材({filledCount}/{cards.length})—— 后面会自动嵌进句子里
          </div>
          <div className="space-y-2.5">
            {cards.map((c) => (
              <label key={c.key} className="block">
                <div className="mb-1 text-xs font-semibold">{c.labelCn}</div>
                <input
                  value={values[c.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [c.key]: e.target.value }))}
                  placeholder={c.hint}
                  className="w-full rounded-xl border border-[#EEEAE0] px-3 py-2 text-sm dark:border-border dark:bg-background"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-bold text-white"
          >
            下一步:选一档模板 →
          </button>
          {/* ★脚手架不是牢笼★ 想直接写的学生一步就能出去 */}
          <button
            type="button"
            onClick={onSkip}
            className="mt-2 w-full rounded-xl border-2 border-[#EEEAE0] py-2.5 text-sm font-semibold text-[#888780] dark:border-border dark:text-muted-foreground"
          >
            跳过,直接写
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mb-3 text-xs font-bold text-[#5C5751] dark:text-muted-foreground">
            选一档句式 —— 随时可以换,已填的素材不会丢
          </div>
          <div className="space-y-2">
            {LEVELS.map((lv) => (
              <button
                key={lv.key}
                type="button"
                onClick={() => setLevel(lv.key)}
                className={`w-full rounded-xl border-2 p-3 text-left transition ${
                  level === lv.key ? "border-[#FF6B35] bg-[#FFF8F0] dark:bg-orange-950/20" : "border-[#EEEAE0] dark:border-border"
                }`}
              >
                <div className="text-sm font-bold">
                  {lv.label} {level === lv.key && <span className="text-[#FF6B35]">✓</span>}
                </div>
                <div className="mt-0.5 text-xs text-[#888780] dark:text-muted-foreground">{lv.desc}</div>
                <div className="mt-1.5 text-xs leading-relaxed text-[#5C5751] dark:text-muted-foreground">
                  {(templates?.[lv.key] ?? [])[0] ?? ""}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border-2 border-[#EEEAE0] py-2.5 text-sm font-semibold text-[#888780] dark:border-border"
            >
              ← 改素材
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-[2] rounded-xl bg-[#FF6B35] py-2.5 text-sm font-bold text-white"
            >
              看看我的草稿 →
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mb-2 text-xs font-bold text-[#5C5751] dark:text-muted-foreground">
            这是用你的素材拼出来的草稿 —— 高亮的是你填的词
          </div>
          <div className="rounded-xl bg-[#FFF8F0] p-3 text-sm leading-relaxed dark:bg-muted/40">
            <HighlightedDraft text={draft} values={values} />
          </div>
          {w.connectors?.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#888780] dark:text-muted-foreground">本单元语法点:</span>
              {w.connectors.map((c) => (
                <span key={c} className="rounded-full bg-[#EAF3FF] px-2 py-0.5 text-xs font-semibold text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-200">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          {draft.includes("____") && (
            <p className="mt-2 text-xs text-[#C2410C]">还有素材没填(显示为 ____),可以回第 1 步补上。</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl border-2 border-[#EEEAE0] py-2.5 text-sm font-semibold text-[#888780] dark:border-border"
            >
              ← 换一档
            </button>
            <button
              type="button"
              onClick={() => onUseDraft(draft)}
              className="flex-[2] rounded-xl bg-[#FF6B35] py-2.5 text-sm font-bold text-white"
            >
              用它开始写 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
