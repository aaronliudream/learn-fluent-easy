/**
 * 图书馆文化笔记 ③ 章末合集(读后)· 复用 library_culture_notes,按本章聚合。
 * 默认折叠:章尾一行「📖 本章文化笔记 (N)」,点开才展;每条再点开看全文(标题+摘要→全文,复用 ②)。
 * 场景区分:② 读中词卡=读的时候顺手点;③ 章末合集=读完回顾。折叠既留回顾入口又不挡"读完翻页"。
 * 纯读取,数据由 LibraryReader 从全书 cultureNotes 里按 (book_id 已隐含) + chapter_idx 过滤后传入。
 */
import { useState } from "react";
import { BookMarked, Lightbulb, ChevronRight } from "lucide-react";
import type { LibraryCultureNote } from "@/lib/library/data";

/** 取 body_zh 首句(到句末标点)作摘要,过长截断。 */
function summarize(body: string): string {
  const first = body.split(/(?<=[。!?！?])/)[0] || body;
  return first.length > 42 ? first.slice(0, 42) + "…" : first;
}

function CollectionItem({ note }: { note: LibraryCultureNote }) {
  const [open, setOpen] = useState(false);
  const [en, setEn] = useState(false);
  const body = en && note.body_en ? note.body_en : note.body_zh;
  return (
    <div className="border-t border-amber-100 py-2.5 first:border-t-0 first:pt-0 dark:border-amber-500/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 text-left"
      >
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-amber-800 dark:text-amber-300">{note.title}</span>
          {!open && (
            <span className="mt-0.5 block truncate text-xs text-slate-400">{summarize(note.body_zh)}</span>
          )}
        </span>
        <ChevronRight className={`mt-0.5 size-4 shrink-0 text-amber-400 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 pl-6">
          <div className="whitespace-pre-line text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{body}</div>
          {note.body_en && (
            <button
              type="button"
              onClick={() => setEn((v) => !v)}
              className="mt-2 text-[11px] font-semibold text-amber-600 transition hover:text-amber-700 dark:text-amber-400"
            >
              {en ? "看中文" : "EN"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChapterNotesCollection({ notes }: { notes: LibraryCultureNote[] }) {
  const [open, setOpen] = useState(false);
  if (!notes.length) return null; // 本章没笔记 → 整块不出现
  return (
    <div className="mx-auto mt-8 max-w-[680px] rounded-2xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 dark:border-amber-500/25 dark:bg-amber-500/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
      >
        <BookMarked className="size-5 shrink-0 text-amber-600" />
        <span className="flex-1 text-sm font-bold text-amber-800 dark:text-amber-300">
          本章文化笔记 <span className="tabular-nums">({notes.length})</span>
        </span>
        <ChevronRight className={`size-4 shrink-0 text-amber-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-3">
          {notes.map((n) => (
            <CollectionItem key={n.term} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
