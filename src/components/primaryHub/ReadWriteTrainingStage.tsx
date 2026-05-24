import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReadWriteConfig } from "@/lib/primaryHub/readWriteTypes";
import {
  checkKeywords,
  checkLookAndWrite,
  checkWordOrder,
  type LookWriteResult,
} from "@/lib/primaryHub/readWriteValidation";

type Props = {
  config: ReadWriteConfig;
  onFinish: () => void;
  onAwardPoints: (n: number) => void;
};

const PHASE_LABELS = ["看图写句", "读句填图", "连词成句", "综合书写"] as const;

const MONO =
  "w-full rounded-xl border-2 px-3 py-2 font-mono text-sm outline-none transition max-w-full";

function Feedback({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const cls =
    tone === "success"
      ? "bg-[#EAF3DE] text-[#3B6D11]"
      : tone === "warning"
        ? "bg-[#FFF4D6] text-[#854F0B]"
        : "bg-[#FFF0EB] text-[#A32D2D]";
  const icon = tone === "success" ? "✅" : tone === "warning" ? "💡" : "❌";
  return (
    <div className={`mt-2 flex items-start gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${cls}`}>
      <span aria-hidden>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function PhaseTabs({
  phase,
  unlocked,
  onSelect,
}: {
  phase: number;
  unlocked: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {PHASE_LABELS.map((label, i) => {
        const active = phase === i;
        const open = i <= unlocked;
        return (
          <button
            key={label}
            type="button"
            disabled={!open}
            onClick={() => open && onSelect(i)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              active
                ? "bg-[#FF6B35] text-white"
                : open
                  ? "bg-[#FFF8F0] text-[#FF6B35]"
                  : "bg-[#F4F0E6] text-[#888780] opacity-60"
            }`}
          >
            {i + 1}. {label}
          </button>
        );
      })}
    </div>
  );
}

function LookAndWritePhase({
  config,
  onComplete,
  onAward,
}: {
  config: ReadWriteConfig["stage_1"];
  onComplete: () => void;
  onAward: (n: number) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [value, setValue] = useState("");
  const [showStruct, setShowStruct] = useState(false);
  const [result, setResult] = useState<LookWriteResult | null>(null);
  const [doneQs, setDoneQs] = useState<Set<number>>(() => new Set());

  const q = config.questions[qIdx];
  const isLast = qIdx === config.questions.length - 1;

  const submit = () => {
    if (result === "correct" && doneQs.has(qIdx)) return;
    const r = checkLookAndWrite(value, q.answer);
    setResult(r);
    if (r === "correct" && !doneQs.has(qIdx)) {
      onAward(config.pointsPerQuestion);
      setDoneQs((prev) => new Set(prev).add(qIdx));
    }
  };

  const next = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setQIdx((i) => i + 1);
    setValue("");
    setResult(null);
    setShowStruct(false);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#FF6B35]">第 1 部分 · 看图写句</p>
      <p className="mb-3 text-xs text-[#888780]">
        第 {qIdx + 1} / {config.questions.length} 题 · 用提示词写完整句子
      </p>
      <div className="mb-3 overflow-hidden rounded-2xl border border-[#EEEAE0] bg-[#FFF8F0]">
        <img
          src={q.image}
          alt={q.imageAlt}
          className="mx-auto h-auto max-h-48 w-full object-contain p-2 sm:max-h-56"
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {q.hints.map((h) => (
          <span
            key={h}
            className="rounded-lg border border-[#FF6B35]/30 bg-[#FFF8F0] px-2.5 py-1 font-mono text-sm text-[#FF6B35]"
          >
            {h}
          </span>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResult(null);
        }}
        placeholder="Write a full sentence…"
        className={`${MONO} border-[#EEEAE0] bg-white focus:border-[#FF6B35]`}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowStruct((s) => !s)}
          className="rounded-lg border border-[#378ADD] bg-[#E6F1FB] px-3 py-1.5 text-xs font-semibold text-[#185FA5]"
        >
          提示
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-[#FF6B35] px-4 py-1.5 text-xs font-semibold text-white"
        >
          检查
        </button>
      </div>
      {showStruct && (
        <p className="mt-2 rounded-lg bg-[#E6F1FB] px-3 py-2 font-mono text-sm text-[#185FA5]">
          句型：{q.hint_text}
        </p>
      )}
      {result === "correct" && (
        <Feedback tone="success">完全正确！+{config.pointsPerQuestion} 分</Feedback>
      )}
      {result === "punctuation" && (
        <Feedback tone="warning">单词对了，注意大小写和标点（句号）再试试</Feedback>
      )}
      {result === "wrong" && <Feedback tone="error">再想想，用上面的提示词组成完整句子</Feedback>}
      {result === "correct" && (
        <button
          type="button"
          onClick={next}
          className="mt-4 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white"
        >
          {isLast ? "进入读句填图 →" : "下一题 →"}
        </button>
      )}
    </div>
  );
}

function ReadAndFillMapPhase({
  config,
  onComplete,
  onAward,
}: {
  config: ReadWriteConfig["stage_2"];
  onComplete: () => void;
  onAward: (n: number) => void;
}) {
  const fillable = useMemo(
    () =>
      config.rows.flatMap((row) =>
        row.filter((c) => !c.fixed).map((c) => ({ id: c.id, answer: c.answer ?? "" })),
      ),
    [config.rows],
  );

  const [fills, setFills] = useState<Record<string, string>>({});
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const usedLabels = new Set(Object.values(fills));

  const handleCell = (id: string, fixed: boolean) => {
    if (fixed || checked) return;
    if (!selectedLabel) return;
    setFills((prev) => {
      const next = { ...prev };
      const old = next[id];
      if (old === selectedLabel) {
        delete next[id];
      } else {
        next[id] = selectedLabel;
      }
      return next;
    });
  };

  const allFilled = fillable.every((s) => fills[s.id]);
  const allCorrect =
    allFilled && fillable.every((s) => fills[s.id] === s.answer);

  const check = () => {
    setChecked(true);
    if (allCorrect && !awarded) {
      onAward(config.pointsIfAllCorrect);
      setAwarded(true);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#FF6B35]">第 2 部分 · 读句填图</p>
      <ul className="mb-4 space-y-2">
        {config.sentences.map((s) => (
          <li key={s} className="rounded-lg border-l-4 border-[#378ADD] bg-[#E6F1FB] px-3 py-2 text-sm">
            {s}
          </li>
        ))}
      </ul>
      <p className="mb-2 text-xs text-[#888780]">先点下方房间名，再点地图上的 ? 格子</p>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {config.rows.flatMap((row, ri) =>
          row.map((cell) => {
            const filled = fills[cell.id];
            const isFillable = !cell.fixed;
            const showCorrect = checked && isFillable;
            const correct = filled === cell.answer;
            let cellCls =
              "min-h-[72px] rounded-xl border-2 p-2 text-center text-xs font-semibold leading-tight transition ";
            if (cell.fixed) {
              cellCls += "border-[#97C459] bg-[#EAF3DE] text-[#3B6D11]";
            } else if (showCorrect) {
              cellCls += correct
                ? "border-[#97C459] bg-[#EAF3DE]"
                : "border-[#E24B4A] bg-[#FFF0EB]";
            } else if (filled) {
              cellCls += "border-[#FF6B35] bg-[#FFF8F0] cursor-pointer";
            } else {
              cellCls += "border-dashed border-[#FF6B35]/50 bg-white cursor-pointer hover:bg-[#FFF8F0]";
            }
            return (
              <button
                key={`${ri}-${cell.id}`}
                type="button"
                disabled={cell.fixed || checked}
                onClick={() => handleCell(cell.id, cell.fixed)}
                className={cellCls}
              >
                {cell.fixed ? cell.label : filled ?? "?"}
              </button>
            );
          }),
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {config.pickerLabels.map((label) => {
          const picked = selectedLabel === label;
          const used = usedLabels.has(label);
          return (
            <button
              key={label}
              type="button"
              disabled={checked}
              onClick={() => setSelectedLabel(picked ? null : label)}
              className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold ${
                picked
                  ? "border-[#FF6B35] bg-[#FF6B35] text-white"
                  : used
                    ? "border-[#97C459] bg-[#EAF3DE] text-[#3B6D11] opacity-70"
                    : "border-[#EEEAE0] bg-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {!checked && (
        <button
          type="button"
          disabled={!allFilled}
          onClick={check}
          className="mt-4 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          检查答案
        </button>
      )}
      {checked && allCorrect && (
        <>
          <Feedback tone="success">全部填对！+{config.pointsIfAllCorrect} 分</Feedback>
          <button
            type="button"
            onClick={onComplete}
            className="mt-3 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white"
          >
            进入连词成句 →
          </button>
        </>
      )}
      {checked && !allCorrect && (
        <>
          <Feedback tone="error">还有格子不对，再试试</Feedback>
          <button
            type="button"
            onClick={() => {
              setChecked(false);
              setFills({});
            }}
            className="mt-3 w-full rounded-xl border-2 border-[#FF6B35] py-3 text-sm font-semibold text-[#FF6B35]"
          >
            重新填写
          </button>
        </>
      )}
    </div>
  );
}

function WordOrderPhase({
  config,
  onComplete,
  onAward,
}: {
  config: ReadWriteConfig["stage_3"];
  onComplete: () => void;
  onAward: (n: number) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [pool, setPool] = useState<string[]>(() => [...config.questions[0].words]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [doneQs, setDoneQs] = useState<Set<number>>(() => new Set());

  const q = config.questions[qIdx];
  const isLast = qIdx === config.questions.length - 1;

  useEffect(() => {
    setPool([...q.words]);
    setAnswer([]);
    setFeedback(null);
  }, [qIdx, q.words]);

  const addWord = (word: string, fromPool: number) => {
    setFeedback(null);
    setAnswer((a) => [...a, word]);
    setPool((p) => p.filter((_, i) => i !== fromPool));
  };

  const removeWord = (idx: number) => {
    setFeedback(null);
    const w = answer[idx];
    setAnswer((a) => a.filter((_, i) => i !== idx));
    setPool((p) => [...p, w]);
  };

  const check = () => {
    const userStr = answer.join(" ");
    const ok = checkWordOrder(userStr, q.answer);
    setFeedback(ok ? "ok" : "bad");
    if (ok && !doneQs.has(qIdx)) {
      onAward(config.pointsPerQuestion);
      setDoneQs((prev) => new Set(prev).add(qIdx));
    }
  };

  const next = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setQIdx((i) => i + 1);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#FF6B35]">第 3 部分 · 连词成句</p>
      <p className="mb-1 text-xs text-[#888780]">
        第 {qIdx + 1} / {config.questions.length} 题
        {q.label ? ` · ${q.label}` : ""}
      </p>
      <p className="mb-3 text-xs text-[#888780]">点击单词加入句子；点击上方可撤回</p>
      <div className="mb-3 min-h-[52px] rounded-xl border-2 border-dashed border-[#FF6B35]/40 bg-[#FFF8F0] p-3">
        {answer.length === 0 ? (
          <span className="font-mono text-sm text-[#888780]">你的句子…</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {answer.map((w, i) => (
              <button
                key={`${w}-${i}`}
                type="button"
                onClick={() => removeWord(i)}
                className="rounded-lg border border-[#FF6B35] bg-white px-2.5 py-1 font-mono text-sm"
              >
                {w} ×
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {pool.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            onClick={() => addWord(w, i)}
            className="rounded-lg border-2 border-[#EEEAE0] bg-white px-3 py-2 font-mono text-sm hover:border-[#FF6B35]"
          >
            {w}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={check}
        disabled={answer.length !== q.words.length}
        className="w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        检查
      </button>
      {feedback === "ok" && (
        <Feedback tone="success">答对了！+{config.pointsPerQuestion} 分</Feedback>
      )}
      {feedback === "bad" && (
        <Feedback tone="error">再试试，注意大小写、空格和标点</Feedback>
      )}
      {feedback === "ok" && (
        <button
          type="button"
          onClick={next}
          className="mt-3 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white"
        >
          {isLast ? "进入综合书写 →" : "下一题 →"}
        </button>
      )}
    </div>
  );
}

function FillDialogPhase({
  config,
  onComplete,
  onAward,
  onFinish,
}: {
  config: ReadWriteConfig["stage_4"];
  onComplete: () => void;
  onAward: (n: number) => void;
  onFinish: () => void;
}) {
  const blankMap = useMemo(
    () => Object.fromEntries(config.blanks.map((b) => [b.id, b])),
    [config.blanks],
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const results = config.blanks.map((b) => ({
    id: b.id,
    ok: checkKeywords((values[b.id] ?? "").trim(), b.keywords),
  }));
  const allOk = results.every((r) => r.ok);
  const allFilled = config.blanks.every((b) => (values[b.id] ?? "").trim().length > 0);

  const check = () => {
    if (!allFilled) return;
    setChecked(true);
    if (allOk && !awarded) {
      onAward(config.pointsIfAllCorrect);
      setAwarded(true);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#FF6B35]">第 4 部分 · 综合书写</p>
      <p className="mb-2 text-xs text-[#888780]">Mike 在学校问路 · 填写对话空白</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {config.patternTags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#FFE9AD] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#854F0B]"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-[#EEEAE0] bg-[#FFF8F0] p-4">
        {config.lines.map((line, li) => (
          <div key={li} className="text-sm">
            <span className="mb-1 block text-xs font-bold text-[#FF6B35]">{line.role}</span>
            <div className="flex flex-wrap items-center gap-1 leading-relaxed">
              {line.parts.map((part, pi) =>
                part.type === "text" ? (
                  <span key={pi}>{part.value}</span>
                ) : (
                  <input
                    key={part.blankId}
                    type="text"
                    value={values[part.blankId] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [part.blankId]: e.target.value }))
                    }
                    disabled={checked && results.find((r) => r.id === part.blankId)?.ok}
                    placeholder="…"
                    className={`${MONO} min-w-[140px] max-w-full flex-1 border-[#FF6B35]/40 bg-white sm:min-w-[200px]`}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      {!checked && (
        <button
          type="button"
          disabled={!allFilled}
          onClick={check}
          className="mt-4 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          检查
        </button>
      )}
      {checked && allOk && (
        <>
          <Feedback tone="success">对话写得好！+{config.pointsIfAllCorrect} 分</Feedback>
          <button
            type="button"
            onClick={() => {
              onComplete();
              onFinish();
            }}
            className="mt-3 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white"
          >
            完成读写训练 →
          </button>
        </>
      )}
      {checked && !allOk && (
        <>
          <Feedback tone="error">再想想，用上方的句型关键词（Where / next to / teachers&apos; office…）</Feedback>
          <ul className="mt-2 space-y-1 text-xs text-[#888780]">
            {config.blanks.map((b) => (
              <li key={b.id}>
                参考：{b.reference}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setChecked(false)}
            className="mt-3 w-full rounded-xl border-2 border-[#FF6B35] py-3 text-sm font-semibold text-[#FF6B35]"
          >
            再试试
          </button>
        </>
      )}
    </div>
  );
}

export default function ReadWriteTrainingStage({ config, onFinish, onAwardPoints }: Props) {
  const [phase, setPhase] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [score, setScore] = useState(0);
  const award = useCallback(
    (n: number) => {
      setScore((s) => s + n);
      for (let i = 0; i < n; i++) onAwardPoints(1);
    },
    [onAwardPoints],
  );

  const advancePhase = () => setUnlocked((u) => Math.max(u, phase + 1));

  const goPhase = (i: number) => {
    if (i <= unlocked) setPhase(i);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">📝 {config.title}</span>
        <span className="rounded-lg bg-[#FFF8F0] px-2 py-1 text-sm font-bold text-[#FF6B35]">
          {score}/{config.totalPoints} 分
        </span>
      </div>
      <PhaseTabs phase={phase} unlocked={unlocked} onSelect={goPhase} />
      {phase === 0 && (
        <LookAndWritePhase
          config={config.stage_1}
          onAward={award}
          onComplete={() => {
            advancePhase();
            setPhase(1);
          }}
        />
      )}
      {phase === 1 && (
        <ReadAndFillMapPhase
          config={config.stage_2}
          onAward={award}
          onComplete={() => {
            advancePhase();
            setPhase(2);
          }}
        />
      )}
      {phase === 2 && (
        <WordOrderPhase
          config={config.stage_3}
          onAward={award}
          onComplete={() => {
            advancePhase();
            setPhase(3);
          }}
        />
      )}
      {phase === 3 && (
        <FillDialogPhase
          config={config.stage_4}
          onAward={award}
          onComplete={advancePhase}
          onFinish={onFinish}
        />
      )}
    </div>
  );
}
