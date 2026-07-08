import { T } from "@/i18n/T";

// 整篇错题下钻面板(师生共用):阅读=全文+全部题;完形=正文+全部空。
// 每题/空三栏对照:选项(正确标绿✓ / 作答且错标红划掉)+ 正确答案 + 学生作答 + 解析。
// 纯展示组件,只吃传入的 rv(不发任何查询)。老师端(TeacherStudent)与学生端(Mistakes)复用同一份。
export type ReviewItem = {
  no: number | null;
  stem?: string | null;
  options?: Record<string, string | null> | null;
  correct_answer?: string | null;
  user_answer?: string | null;
  is_correct?: boolean | null;
  wrong?: boolean;
  explanation?: string | null;
};

export type PassageReview = {
  source: "reading" | "cloze";
  missing?: boolean;
  limited?: boolean;
  has_full_passage?: boolean;
  has_user_answers?: boolean;
  title?: string | null;
  body?: string | null;
  total?: number | null;
  wrong_count?: number;
  items?: ReviewItem[] | null;
};

export function PassageReviewPanel({ rv }: { rv: PassageReview }) {
  const unit = rv.source === "cloze" ? "空" : "题";
  const items = rv.items ?? [];
  return (
    <div className="space-y-3">
      {rv.limited && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ <T>完形仅记录做错的空,没有整篇原文与做对的空的快照(待后续改写入补全)。以下为该生做错的空:</T>
        </div>
      )}
      {rv.body && (
        <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
          {rv.body}
        </div>
      )}
      <ol className="space-y-2">
        {items.map((it, idx) => {
          const opts = it.options
            ? Object.entries(it.options).filter(([, v]) => v != null).sort(([a], [b]) => a.localeCompare(b))
            : [];
          return (
            <li key={idx} className="rounded-lg border border-border p-2 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <span><T>第</T> {it.no ?? idx + 1} <T>{unit}</T></span>
                {it.wrong
                  ? <span className="text-rose-600 dark:text-rose-400">🔴 <T>错</T></span>
                  : it.is_correct ? <span className="text-emerald-600 dark:text-emerald-400">✅</span> : null}
              </div>
              {it.stem && <div className="mt-1">{it.stem}</div>}
              {opts.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {opts.map(([L, txt]) => {
                    const isCorrect = it.correct_answer === L;
                    const isPicked = it.user_answer === L;
                    const cls = isCorrect
                      ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                      : (isPicked && it.wrong) ? "text-rose-600 dark:text-rose-400 line-through"
                      : "text-muted-foreground";
                    return (
                      <li key={L} className={cls}>
                        {L}. {txt}
                        {isCorrect && <span className="ml-1">✓</span>}
                        {isPicked && !isCorrect && <span className="ml-1"><T>(学生选)</T></span>}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400"><T>正确</T>:{it.correct_answer ?? "—"}</span>
                <span className="text-muted-foreground">
                  <T>学生作答</T>:{it.user_answer ?? <span className="italic"><T>未记录</T></span>}
                </span>
              </div>
              {it.explanation && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-primary"><T>解析</T></summary>
                  <div className="mt-1 text-muted-foreground">{it.explanation}</div>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
