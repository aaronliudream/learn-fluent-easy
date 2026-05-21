import { T } from "@/i18n/T";
import { cn } from "@/lib/utils";

type EmailReplyPrompt = {
  format: "email_reply";
  scenario: string;
  email: {
    to: string;
    from: string;
    subject: string;
    greeting: string;
    paragraphs?: string[];
    bullets?: string[];
    closing?: string[];
  };
  notes: string[];
  template: {
    opening: string[];
    closing: string[];
    bodyLines?: number;
  };
};

type StandardPrompt = {
  format?: "standard";
  title?: string;
  requirements?: string[];
  notes?: string;
  opening?: string;
};

type LegacyBodyPrompt = {
  body: string;
};

export type WritingPromptData = EmailReplyPrompt | StandardPrompt | LegacyBodyPrompt;

function isEmailReply(data: WritingPromptData): data is EmailReplyPrompt {
  return "format" in data && data.format === "email_reply";
}

function isStandard(data: WritingPromptData): data is StandardPrompt {
  if ("body" in data) return false;
  return "requirements" in data || "title" in data;
}

function EmailBox({ email }: { email: EmailReplyPrompt["email"] }) {
  return (
    <div className="rounded-lg border-2 border-[hsl(var(--exam-ink))]/20 bg-white/50 dark:bg-black/10 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-[hsl(var(--exam-rule))] px-4 py-3 text-sm exam-soft">
        <span className="font-semibold exam-display">To:</span>
        <span className="exam-passage">{email.to}</span>
        <span className="font-semibold exam-display">From:</span>
        <span className="exam-passage">{email.from}</span>
        <span className="font-semibold exam-display">Subject:</span>
        <span className="exam-passage font-medium">{email.subject}</span>
      </div>
      <div className="px-4 py-4 exam-passage text-[15px] leading-relaxed space-y-3">
        <p>{email.greeting}</p>
        {(email.paragraphs ?? []).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {(email.bullets ?? []).length > 0 && (
          <ul className="space-y-1.5 pl-1">
            {email.bullets!.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 font-bold">●</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {(email.closing ?? []).map((line, i) => {
          const isLast = i === email.closing!.length - 1;
          if (isLast) {
            return (
              <div key={i} className="mt-2 inline-block rounded border border-[hsl(var(--exam-rule))] px-6 py-1.5 font-medium">
                {line}
              </div>
            );
          }
          return <p key={i}>{line}</p>;
        })}
      </div>
    </div>
  );
}

/** 书面表达 · 题目材料（邮件回复 / 标准命题 / 旧版 body 兜底） */
export function WritingTaskPanel({ data }: { data: WritingPromptData }) {
  if (isEmailReply(data)) {
    return (
      <div className="space-y-5">
        <p className="text-[15px] leading-relaxed exam-stem">{data.scenario}</p>
        <EmailBox email={data.email} />
        <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 text-sm exam-soft">
          <p className="font-semibold exam-display mb-2"><T>注意</T></p>
          <ol className="list-decimal list-inside space-y-1">
            {data.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  if (isStandard(data)) {
    return (
      <div className="space-y-3 text-sm exam-soft">
        {data.title && <div className="font-bold text-base exam-display">{data.title}</div>}
        {data.requirements && data.requirements.length > 0 && (
          <ol className="list-decimal list-inside space-y-1">
            {data.requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        )}
        {data.notes && <p className="text-xs exam-mute">{data.notes}</p>}
        {data.opening && <p className="italic exam-passage text-[15px]">{data.opening}</p>}
      </div>
    );
  }

  if ("body" in data) {
    return (
      <div className="exam-passage whitespace-pre-wrap text-[15px] leading-relaxed exam-soft">
        {data.body}
      </div>
    );
  }

  return null;
}

type EssayTemplate = EmailReplyPrompt["template"] | { opening?: string; closing?: string[] };

export function EssayWritingArea({
  value,
  onChange,
  disabled,
  template,
  placeholder = "Practice makes perfect…",
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  template?: EssayTemplate;
  placeholder?: string;
}) {
  const opening = template && "opening" in template
    ? (Array.isArray(template.opening) ? template.opening : template.opening ? [template.opening] : [])
    : [];
  const closing = template && "closing" in template ? (template.closing ?? []) : [];
  const bodyLines = template && "bodyLines" in template ? (template.bodyLines ?? 8) : 8;

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-lg border border-[hsl(var(--exam-rule))] bg-[hsl(var(--exam-paper))] px-4 py-4 sm:px-6">
      {opening.length > 0 && (
        <div className="exam-passage text-[15px] leading-8 space-y-0 pb-1">
          {opening.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-0 flex flex-col"
          aria-hidden>
          {Array.from({ length: bodyLines }).map((_, i) => (
            <div
              key={i}
              className="h-8 border-b border-[hsl(var(--exam-ink))]/15"
            />
          ))}
        </div>
        <textarea
          value={value}
          disabled={disabled}
          rows={bodyLines}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "relative z-10 w-full resize-y border-0 bg-transparent px-0 py-0",
            "text-[15px] leading-8 exam-passage exam-stem",
            "focus:outline-none focus:ring-0",
            "placeholder:text-[hsl(var(--exam-mute))]/50",
          )}
          placeholder={placeholder}
          spellCheck
        />
      </div>

      {closing.length > 0 && (
        <div className="exam-passage text-[15px] leading-8 pt-1 space-y-0">
          {closing.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs exam-mute border-t border-[hsl(var(--exam-rule))]/50 pt-2">
        <T>词数：</T>{wordCount}
      </p>
    </div>
  );
}

/** 从 resources.writing_prompt 提取作文模板（供答题区使用） */
export function getWritingTemplate(data: unknown): EssayTemplate | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (d.format === "email_reply" && d.template && typeof d.template === "object") {
    return d.template as EssayTemplate;
  }
  if (typeof d.opening === "string" && d.opening.trim()) {
    return { opening: [d.opening], closing: [], bodyLines: 10 };
  }
  return undefined;
}
