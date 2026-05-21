import { ReactNode } from "react";
import { T } from "@/i18n/T";
import { cn } from "@/lib/utils";

/** 文中空格：左侧阿拉伯数字 + 答题控件（贴近纸质试卷体验） */
function BlankSlot({
  num,
  qid,
  disabled,
  children,
}: {
  num: number;
  qid: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      data-qid={qid}
      className={cn(
        "mx-0.5 inline-flex items-baseline gap-1 align-baseline",
        "rounded-md border border-amber-300/70 bg-amber-50/90 px-1 py-0.5",
        "shadow-[0_1px_0_rgba(180,83,9,0.12)]",
        disabled && "opacity-75",
      )}>
      <span
        className="inline-flex min-w-[1.1rem] shrink-0 items-center justify-center text-[11px] font-extrabold tabular-nums text-amber-800"
        aria-label={`第 ${num} 空`}>
        {num}
      </span>
      {children}
    </span>
  );
}

/** 将 passage 中的 __N__ 占位符替换成 inline 控件 */
export function PassageWithBlanks({
  text,
  blankIds,
  answers,
  onChange,
  disabled,
  inputType = "text",
  selectOptions,
  getSelectOptions,
}: {
  text: string;
  /** 题号 → question id，如 { 1: "q1", 26: "q26" } */
  blankIds: Record<number, string>;
  answers: Record<string, string>;
  onChange: (qid: string, val: string) => void;
  disabled?: boolean;
  inputType?: "text" | "select";
  selectOptions?: Record<string, string>;
  /** 按题号返回选项（完形 A-D 每空不同） */
  getSelectOptions?: (qid: string) => Record<string, string>;
}) {
  const parts: ReactNode[] = [];
  const re = /__(\d+)__/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    const qid = blankIds[num];
    if (match.index > last) {
      parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    }
    if (qid) {
      const val = answers[qid] ?? "";
      const opts = getSelectOptions?.(qid) ?? selectOptions;
      if (inputType === "select" && opts) {
        parts.push(
          <BlankSlot key={key++} num={num} qid={qid} disabled={disabled}>
            <select
              value={val}
              disabled={disabled}
              onChange={(e) => onChange(qid, e.target.value)}
              aria-label={`第 ${num} 空`}
              className="inline-block min-w-[2.75rem] max-w-[4rem] rounded border-0 bg-transparent py-0.5 text-sm font-bold text-amber-900 align-baseline focus:outline-none focus:ring-1 focus:ring-amber-400">
              <option value="">{val ? "—" : "选择"}</option>
              {Object.keys(opts).sort().map((letter) => (
                <option key={letter} value={letter}>{letter}</option>
              ))}
            </select>
          </BlankSlot>,
        );
      } else {
        parts.push(
          <BlankSlot key={key++} num={num} qid={qid} disabled={disabled}>
            <input
              type="text"
              value={val}
              disabled={disabled}
              onChange={(e) => onChange(qid, e.target.value)}
              aria-label={`第 ${num} 空`}
              placeholder="填写"
              className="inline-block w-[5.5rem] border-0 bg-transparent px-0.5 py-0.5 text-sm font-semibold text-amber-900 align-baseline placeholder:font-normal placeholder:text-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-sm"
            />
          </BlankSlot>,
        );
      }
    } else {
      parts.push(<span key={key++}>{match[0]}</span>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);

  return <div className="exam-passage whitespace-pre-wrap leading-relaxed">{parts}</div>;
}

export function MusicFestivalPoster({ data }: { data: Record<string, unknown> }) {
  const cards = (data.cards as Array<Record<string, string>>) ?? [];
  return (
    <div className="exam-passage space-y-3">
      <div className="font-bold text-center text-lg">{String(data.title ?? "MUSIC FESTIVAL")}</div>
      <div className="text-center text-sm exam-soft">{String(data.date ?? "")}</div>
      {cards.map((c, i) => (
        <div key={i} className="rounded-lg border exam-divider p-3 text-sm">
          <div className="font-semibold">{c.genre} <span className="text-xs exam-mute">({c.tag})</span></div>
          <div><T>Time:</T> {c.time}</div>
          <div><T>Place:</T> {c.place}</div>
          <div>{c.price}</div>
        </div>
      ))}
      <div className="text-xs exam-mute">{String(data.contact ?? "")}</div>
    </div>
  );
}

export function AnswerSheet({
  groups,
  answers,
  submitted,
  mode,
  onJump,
  className,
}: {
  groups: { section: string; label: string; questions: { id: string; num: number }[] }[];
  answers: Record<string, string>;
  submitted: boolean;
  mode: string;
  onJump: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("exam-card p-4", className)}>
      <div className="exam-eyebrow mb-3"><T>答题卡</T></div>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {groups.map((g) => (
          <div key={g.section}>
            <div className="text-xs font-bold exam-soft mb-2">{g.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.questions.map((q) => {
                const answered = !!answers[q.id]?.trim();
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJump(q.id)}
                    className={cn(
                      "size-8 rounded-lg text-xs font-bold transition",
                      answered
                        ? "bg-amber-500 text-white"
                        : "bg-[hsl(var(--exam-paper-soft))] exam-soft hover:bg-amber-100",
                      mode === "review" && "ring-1 ring-emerald-400/50",
                    )}>
                    {q.num}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {submitted && (
        <p className="mt-3 text-[11px] exam-mute"><T>点击题号快速跳转</T></p>
      )}
    </div>
  );
}
