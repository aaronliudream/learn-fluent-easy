import { useMemo, useState } from "react";
import type { UnitDef } from "@/lib/juniorHub/types";

/**
 * 写作练习「四屏闭环」组件（单元常驻关，type:'writing'）。
 * 屏1 题目+开头 → 屏2 填核心词卡片 → 屏3 三级范文(L1/L2/L3,纯前端模板拼接,不调LLM) → 屏4 清单+自己写。
 *
 * 数据来自 unit.writing(WritingBlock)。当 writing 含 cards+templates 时走四屏；
 * 否则(旧数据/仅 prompt)自动回退到简易文本框,保证未升级的单元不白屏。
 * 本组件不依赖任何红线路由文件,仅由 JuniorHubStagePlay 的 case 'writing' 挂载。
 */

const ORANGE = "#FF6B35";

function Btn({
  children,
  disabled,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base =
    "w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const style =
    variant === "primary"
      ? "bg-[#FF6B35] text-white hover:bg-[#E55A28]"
      : "bg-[#F5F1E8] text-[#5b5750] hover:bg-[#ECE6D8]";
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${style} ${className}`}>
      {children}
    </button>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-1.5 flex-1 rounded-full transition"
          style={{ background: i <= step ? ORANGE : "#EEEAE0" }}
        />
      ))}
    </div>
  );
}

/** 用卡片取值替换模板里的 {key};若存在 subj 卡(He/She),额外提供 {Subj}{subj}{Poss}。 */
function fillTemplate(line: string, values: Record<string, string>) {
  const subjRaw = (values.subj || "").trim();
  const derived: Record<string, string> = { ...values };
  if (subjRaw) {
    const isShe = subjRaw.toLowerCase() === "she";
    derived.Subj = isShe ? "She" : "He";
    derived.subj = isShe ? "she" : "he";
    derived.Poss = isShe ? "Her" : "His";
  }
  return line.replace(/\{(\w+)\}/g, (_m, k: string) => (derived[k] != null && derived[k] !== "" ? derived[k] : `____`));
}

function buildParagraph(lines: string[] | undefined, values: Record<string, string>) {
  if (!lines?.length) return "";
  return lines.map((l) => fillTemplate(l, values)).join(" ");
}

const DEFAULT_CONNECTORS = ["because", "and", "so", "but", "if", "when", "then", "also"];

export default function WritingStudio({ unit, onFinish }: { unit: UnitDef; onFinish: () => void }) {
  const w = unit.writing;
  const rich = !!(w && w.cards && w.cards.length && w.templates);

  // ---- 简易回退（旧数据/无模板的单元）----
  if (!rich) {
    return <SimpleWriting unit={unit} onFinish={onFinish} />;
  }

  return <RichWriting unit={unit} onFinish={onFinish} />;
}

function SimpleWriting({ unit, onFinish }: { unit: UnitDef; onFinish: () => void }) {
  const w = unit.writing;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-bold">✍️ 写作练习</div>
      <p className="mb-2 text-sm">{w?.promptCn || "用本单元学到的词汇和句型写几句话。"}</p>
      {w?.prompt ? <p className="mb-3 text-xs text-[#888780]">{w.prompt}</p> : null}
      {w?.sampleWords?.length ? <p className="mb-3 text-xs">建议用词：{w.sampleWords.join(", ")}</p> : null}
      <textarea
        className="mb-3 min-h-[120px] w-full rounded-xl border border-[#EEEAE0] p-3 text-sm"
        placeholder="在这里写下你的英文句子…"
      />
      <Btn onClick={onFinish}>完成写作关 →</Btn>
    </div>
  );
}

function RichWriting({ unit, onFinish }: { unit: UnitDef; onFinish: () => void }) {
  const w = unit.writing!;
  const cards = w.cards!;
  const templates = w.templates!;
  const minWords = w.minWords ?? 40;
  const connectors = w.connectors?.length ? w.connectors : DEFAULT_CONNECTORS;

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(cards.map((c) => [c.key, c.default ?? ""])),
  );
  const [draft, setDraft] = useState("");

  const allFilled = cards.every((c) => (values[c.key] || "").trim().length > 0);

  const samples = useMemo(
    () => ({
      l1: buildParagraph(templates.l1, values),
      l2: buildParagraph(templates.l2, values),
      l3: buildParagraph(templates.l3, values),
    }),
    [templates, values],
  );

  // ---- 屏4 清单 ----
  const draftWords = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const hasOpener = !!values.name && draft.toLowerCase().includes((values.name || "").toLowerCase());
  const usedConnector = connectors.find((c) => new RegExp(`\\b${c}\\b`, "i").test(draft));
  const checks = [
    { ok: draftWords >= minWords, label: `字数达标（≥${minWords} 词，当前 ${draftWords}）` },
    { ok: !!usedConnector, label: `用到连接词${usedConnector ? `（${usedConnector}）` : "（如 because / and / if）"}` },
    { ok: hasOpener, label: "包含规定开头中的人名" },
  ];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <StepDots step={step} />

      {/* 屏1 题目 */}
      {step === 0 && (
        <div>
          <div className="mb-1 text-lg font-bold">✍️ {w.topic || "写作练习"}</div>
          <p className="mb-2 text-sm leading-relaxed">{w.promptCn}</p>
          <p className="mb-3 text-xs leading-relaxed text-[#888780]">{w.prompt}</p>
          {w.opener && (
            <div className="mb-3 rounded-xl border-l-4 border-[#FFB627] bg-[#FFF4D6] p-3 text-sm">
              <span className="text-xs text-[#9a8f73]">规定开头（已给）：</span>
              <div className="mt-0.5 font-medium">{w.opener}</div>
            </div>
          )}
          <Btn onClick={() => setStep(1)}>开始填写 →</Btn>
        </div>
      )}

      {/* 屏2 核心词卡片 */}
      {step === 1 && (
        <div>
          <div className="mb-1 text-lg font-bold">📝 填核心词</div>
          <p className="mb-3 text-xs text-[#888780]">只填关键信息，不用写句子。下一步自动帮你拼成范文。</p>
          <div className="space-y-3">
            {cards.map((c) => (
              <div key={c.key}>
                <label className="mb-1 block text-sm font-medium">{c.labelCn}</label>
                {c.options?.length ? (
                  <div className="flex gap-2">
                    {c.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setValues((v) => ({ ...v, [c.key]: opt }))}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                          values[c.key] === opt
                            ? "border-[#FF6B35] bg-[#FFF1EB] font-semibold text-[#E55A28]"
                            : "border-[#EEEAE0] text-[#5b5750]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    value={values[c.key] || ""}
                    onChange={(e) => setValues((v) => ({ ...v, [c.key]: e.target.value }))}
                    placeholder={c.hint || ""}
                    className="w-full rounded-xl border border-[#EEEAE0] p-2.5 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Btn variant="ghost" onClick={() => setStep(0)} className="flex-1">
              ← 返回
            </Btn>
            <Btn disabled={!allFilled} onClick={() => setStep(2)} className="flex-[2]">
              生成范文 →
            </Btn>
          </div>
        </div>
      )}

      {/* 屏3 三级范文 */}
      {step === 2 && (
        <div>
          <div className="mb-1 text-lg font-bold">🚀 三级范文</div>
          <p className="mb-3 text-xs text-[#888780]">同样的信息，三种写法。看看从「普通」到「高分」差在哪。</p>
          <div className="space-y-3">
            <LevelCard tag="Level 1 · 普通" tone="#9aa0a6" bg="#F5F5F4" text={samples.l1} />
            <LevelCard tag="Level 2 · 中考" tone="#378ADD" bg="#E6F1FB" text={samples.l2} />
            <LevelCard tag="Level 3 · 高分" tone="#E55A28" bg="#FFF1EB" text={samples.l3} />
          </div>
          <div className="mt-4 flex gap-2">
            <Btn variant="ghost" onClick={() => setStep(1)} className="flex-1">
              ← 改信息
            </Btn>
            <Btn onClick={() => setStep(3)} className="flex-[2]">
              去写我的 →
            </Btn>
          </div>
        </div>
      )}

      {/* 屏4 自己写 + 通关清单 */}
      {step === 3 && (
        <div>
          <div className="mb-1 text-lg font-bold">✅ 写出你自己的版本</div>
          <p className="mb-3 text-xs text-[#888780]">参考上一步的范文，自己写一段。下面清单会实时检查。</p>
          {w.opener && <p className="mb-2 text-sm font-medium">{w.opener}</p>}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mb-3 min-h-[140px] w-full rounded-xl border border-[#EEEAE0] p-3 text-sm"
            placeholder="在这里写下你的英文短文…"
          />
          <div className="mb-3 space-y-1.5 rounded-xl bg-[#FAF8F3] p-3">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                  style={{ background: c.ok ? "#639922" : "#D8D3C8" }}
                >
                  {c.ok ? "✓" : "·"}
                </span>
                <span className={c.ok ? "text-[#3f3b34]" : "text-[#888780]"}>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => setStep(2)} className="flex-1">
              ← 看范文
            </Btn>
            <Btn onClick={onFinish} className="flex-[2]">
              完成写作关 →
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function LevelCard({ tag, tone, bg, text }: { tag: string; tone: string; bg: string; text: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: bg }}>
      <div className="mb-1 text-xs font-bold" style={{ color: tone }}>
        {tag}
      </div>
      <p className="text-sm leading-relaxed text-[#3f3b34]">{text}</p>
    </div>
  );
}
