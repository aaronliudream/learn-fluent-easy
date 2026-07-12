/**
 * 图书馆精读(/library/vocab)· 我的词库。
 * 收藏的词/语块两栏切换;每项:词 + 音标 + 🔊 + 中文释义 + 出处句(词高亮) + 来自哪本书 + 删除。
 * 暂不做复习测试(留下一轮);先能收藏、能看、能删。用户私有(未登录 → 提示登录)。
 */
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, Trash2, BookMarked } from "lucide-react";
import { T } from "@/i18n/T";
import { speak, unlockAudioSync } from "@/lib/speak";
import { currentUserId } from "@/lib/library/data";
import { listBooks } from "@/lib/library/data";
import {
  listLibraryFavorites,
  removeLibraryFavorite,
  type LibraryFavorite,
  type LibraryFavoriteKind,
} from "@/lib/library/favorites";

const TABS: { key: LibraryFavoriteKind; label: string }[] = [
  { key: "word", label: "单词" },
  { key: "chunk", label: "语块" },
];

/** 把出处句里的 term(整词、忽略大小写)高亮。 */
function highlight(sentence: string, term: string) {
  if (!sentence || !term) return sentence;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${esc})`, "ig");
  const parts = sentence.split(re);
  return parts.map((p, i) =>
    p.toLowerCase() === term.toLowerCase() ? (
      <strong key={i} className="font-bold text-sky-700">
        {p}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

export default function LibraryVocab() {
  const [tab, setTab] = useState<LibraryFavoriteKind>("word");
  const [favs, setFavs] = useState<LibraryFavorite[]>([]);
  const [bookTitles, setBookTitles] = useState<Map<string, string>>(new Map());
  const [signedIn, setSignedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const uid = await currentUserId();
      if (!alive) return;
      setSignedIn(!!uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const [rows, books] = await Promise.all([listLibraryFavorites(), listBooks()]);
      if (!alive) return;
      setFavs(rows);
      setBookTitles(new Map(books.map((b) => [b.id, b.zh_title || b.title || b.book_key])));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const byKind = useMemo(() => favs.filter((f) => f.kind === tab), [favs, tab]);
  const counts = useMemo(
    () => ({
      word: favs.filter((f) => f.kind === "word").length,
      chunk: favs.filter((f) => f.kind === "chunk").length,
    }),
    [favs],
  );

  const play = (term: string) => {
    unlockAudioSync();
    speak(term, { accent: "US" });
  };

  const onDelete = async (f: LibraryFavorite) => {
    setFavs((prev) => prev.filter((x) => x.id !== f.id)); // 乐观删除
    try {
      await removeLibraryFavorite(f.term, f.kind);
    } catch {
      // 失败则回滚(重新拉取)
      const rows = await listLibraryFavorites();
      setFavs(rows);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Link
        to="/library"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft className="size-4" /> <T>返回书架</T>
      </Link>

      <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <BookMarked className="size-5 text-sky-600" /> <T>我的词库</T>
      </h1>

      {/* 单词 / 语块 切换 */}
      <div className="mt-4 flex rounded-full bg-slate-100 p-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              tab === t.key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <T>{t.label}</T>
            <span className="ml-1 tabular-nums text-xs text-slate-400">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">
          <T>加载中…</T>
        </p>
      ) : !signedIn ? (
        <p className="py-16 text-center text-sm text-slate-500">
          <T>登录后才能收藏和查看词库。</T>
        </p>
      ) : byKind.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">
          {tab === "word" ? <T>还没有收藏单词。精读时点词,在释义卡上点「＋收藏」。</T> : <T>还没有收藏语块。</T>}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {byKind.map((f) => (
            <li key={f.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-bold text-slate-900">{f.term}</span>
                    {f.ipa && <span className="text-sm text-slate-400">{f.ipa}</span>}
                    {f.pos && <span className="text-xs text-slate-400">{f.pos}</span>}
                  </div>
                  {f.zh && <div className="mt-0.5 text-sm text-slate-700">{f.zh}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => play(f.term)}
                    aria-label="朗读"
                    className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Volume2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(f)}
                    aria-label="删除"
                    className="grid size-8 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {f.src_sentence && (
                <div className="mt-2 rounded-lg bg-slate-50 p-2">
                  <div className="text-[13px] leading-relaxed text-slate-600">
                    {highlight(f.src_sentence, f.term)}
                  </div>
                  {f.src_zh && <div className="mt-0.5 text-xs text-slate-400">{f.src_zh}</div>}
                </div>
              )}

              {f.book_id && bookTitles.get(f.book_id) && (
                <div className="mt-1.5 text-[11px] text-slate-400">
                  <T>来自</T> 《{bookTitles.get(f.book_id)}》
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
