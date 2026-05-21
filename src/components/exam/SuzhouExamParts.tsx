import { ReactNode } from "react";
import { T } from "@/i18n/T";
import { cn } from "@/lib/utils";

/** 文中空格：下划线 + 阿拉伯数字 + 答题控件（贴近纸质试卷） */
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
        "mx-0.5 inline-flex items-baseline gap-0.5 align-baseline",
        disabled && "opacity-75",
      )}>
      <span className="inline-block min-w-[1.75rem] border-b-2 border-amber-700/80 px-0.5 text-center align-baseline">
        <span
          className="text-[11px] font-extrabold tabular-nums text-amber-900"
          aria-label={`第 ${num} 空`}>
          {num}
        </span>
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

type ActivitySession = {
  activity: string;
  when: string;
  cost: string;
  who: string;
};

function ActivityTable({ session }: { session: ActivitySession }) {
  const rows: [string, string][] = [
    ["Activity", session.activity],
    ["When", session.when],
    ["Cost", session.cost],
    ["Who", session.who],
  ];
  return (
    <table className="w-full border-collapse border border-[hsl(var(--exam-rule))] text-sm">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td className="w-[5.5rem] border border-[hsl(var(--exam-rule))] bg-[hsl(var(--exam-paper-soft))] px-2 py-1.5 font-semibold align-top">
              {label}
            </td>
            <td className="border border-[hsl(var(--exam-rule))] px-2 py-1.5 align-top">
              {label === "When" ? <strong>{value}</strong> : value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 2019 阅读 A：图书馆假期活动海报（四格表格） */
export function LibraryHolidayPoster({ data }: { data: Record<string, unknown> }) {
  const sessions = (data.sessions as ActivitySession[]) ?? [];
  const footnote = String(data.footnote ?? "");
  return (
    <div className="exam-passage space-y-4">
      <div className="font-bold text-center text-base">{String(data.title ?? "")}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sessions.map((s, i) => (
          <ActivityTable key={i} session={s} />
        ))}
      </div>
      {footnote && <p className="text-sm exam-soft">{footnote}</p>}
    </div>
  );
}

type EggPart = { title: string; text: string };
type EggFreshRow = { observation: string; age: string };

/** 2019 阅读 B：鸡蛋科普 + The fresh test 表格 */
export function EggReadingArticle({ data }: { data: Record<string, unknown> }) {
  const intro = String(data.intro ?? "");
  const parts = (data.parts as EggPart[]) ?? [];
  const freshTitle = String(data.freshTitle ?? "The fresh test");
  const freshIntro = String(data.freshIntro ?? "");
  const freshRows = (data.freshRows as EggFreshRow[]) ?? [];
  const freshOutro = String(data.freshOutro ?? "");

  return (
    <div className="exam-passage space-y-4 text-sm leading-relaxed">
      {intro.split(/\n\n+/).map((p, i) => (
        <p key={`intro-${i}`}>{p}</p>
      ))}
      {parts.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold">Parts of an egg:</p>
          {parts.map((part) => (
            <p key={part.title}>
              <strong>{part.title}</strong> — {part.text}
            </p>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <p className="font-bold text-center">{freshTitle}</p>
        <p>{freshIntro}</p>
        {freshRows.length > 0 && (
          <table className="w-full border-collapse border border-[hsl(var(--exam-rule))] text-sm">
            <thead>
              <tr className="bg-[hsl(var(--exam-paper-soft))]">
                <th className="border border-[hsl(var(--exam-rule))] px-2 py-1.5 text-left font-semibold">
                  What happens to the egg
                </th>
                <th className="border border-[hsl(var(--exam-rule))] px-2 py-1.5 text-left font-semibold">
                  Age of the egg
                </th>
              </tr>
            </thead>
            <tbody>
              {freshRows.map((row, i) => (
                <tr key={i}>
                  <td className="border border-[hsl(var(--exam-rule))] px-2 py-1.5 align-top">{row.observation}</td>
                  <td className="border border-[hsl(var(--exam-rule))] px-2 py-1.5 align-top whitespace-nowrap">{row.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {freshOutro && <p>{freshOutro}</p>}
      </div>
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
