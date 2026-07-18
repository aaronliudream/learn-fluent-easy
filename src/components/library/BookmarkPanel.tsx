/**
 * 图书馆书签面板(右侧抽屉)。列出本书全部书签:章节 + 该处英文预览 + 时间;点跳转、可删。
 * 纯展示组件:数据、跳转、删除都由 LibraryReader 传入,不自持状态、不查库。
 */
import { X, Bookmark, Trash2 } from "lucide-react";
import type { LibraryBookmark } from "@/lib/library/bookmarks";

type Props = {
  open: boolean;
  onClose: () => void;
  bookmarks: LibraryBookmark[];
  chapterLabel: (chapterIdx: number) => string;
  onJump: (bm: LibraryBookmark) => void;
  onDelete: (bm: LibraryBookmark) => void;
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "刚刚";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

export default function BookmarkPanel({ open, onClose, bookmarks, chapterLabel, onJump, onDelete }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="书签">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Bookmark className="size-4 text-sky-600" /> 我的书签
            <span className="font-normal text-slate-400">({bookmarks.length})</span>
          </h3>
          <button type="button" onClick={onClose} aria-label="关闭" className="text-slate-400 transition hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>

        {bookmarks.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm leading-relaxed text-slate-400">
            还没有书签。
            <br />
            阅读时点段落旁的书签图标即可标记。
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-slate-50 overflow-y-auto">
            {bookmarks.map((bm) => (
              <li key={bm.id} className="group flex items-start gap-2 px-4 py-3 transition hover:bg-slate-50">
                <button type="button" onClick={() => onJump(bm)} className="min-w-0 flex-1 text-left">
                  <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-sky-600">
                    <span>{chapterLabel(bm.chapter_idx)}</span>
                    <span className="font-normal text-slate-300">· {timeAgo(bm.created_at)}</span>
                  </div>
                  <p className="line-clamp-2 text-[13px] leading-snug text-slate-600">{bm.preview || "(无预览)"}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(bm)}
                  aria-label="删除书签"
                  className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
