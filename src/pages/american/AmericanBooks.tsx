/**
 * 美语课程 · 四册总入口(/american)—— 第一/二/三/四册版面。
 * 有课的册(american_lessons 有 amN_ 前缀数据)可进 → /american/book/:bookNo;
 * 无课的册渲染灰卡「制作中」,不可进入。数据驱动:am2 落库后第二册自动点亮,无需改前端。
 * 各册内部(单元→本课10关→关卡)沿用现有 /american/hub/... /american/lesson/... 路由,零改。
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, ChevronRight } from "lucide-react";
import { T } from "@/i18n/T";
import { fetchBooks, type AmericanBook } from "@/lib/american/data";
import { AMERICAN_COURSE_NAME, AMERICAN_COURSE_SUBTITLE, AMERICAN_COURSE_SCALE, AMERICAN_COURSE_COVERAGE } from "@/lib/american/brand";

const BOOK_LABEL: Record<number, string> = { 1: "第一册", 2: "第二册", 3: "第三册", 4: "第四册" };
const BOOK_SUB: Record<number, string> = {
  1: "New Concept · Book 1",
  2: "New Concept · Book 2",
  3: "New Concept · Book 3",
  4: "New Concept · Book 4",
};

export default function AmericanBooks() {
  const [books, setBooks] = useState<AmericanBook[]>([1, 2, 3, 4].map((bookNo) => ({ bookNo, launched: false, lessonCount: 0 })));
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false); // 加载失败 → 显示重试按钮(弱网防"打不开")
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true); setFailed(false);
    fetchBooks()
      .then((b) => { if (alive) setBooks(b); })
      .catch(() => { if (alive) setFailed(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [reloadKey]);

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>返回首页</T>
        </Link>

        <header className="mt-4 rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-600 p-6 text-center text-white shadow-sm">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="size-6 text-amber-300" />
          </span>
          <h1 className="mt-3 text-2xl font-bold">{AMERICAN_COURSE_NAME}</h1>
          <p className="mt-1 text-sm text-white/85">{AMERICAN_COURSE_SUBTITLE}</p>
          <p className="mt-1 text-xs text-white/70"><T>{AMERICAN_COURSE_COVERAGE}</T></p>
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{AMERICAN_COURSE_SCALE}</span>
        </header>

        <h2 className="mb-3 mt-6 text-sm font-bold text-slate-500"><T>选择分册</T></h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {books.map(({ bookNo, launched, lessonCount }) => {
            const label = BOOK_LABEL[bookNo];
            if (launched) {
              return (
                <Link
                  key={bookNo}
                  to={`/american/book/${bookNo}`}
                  className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm transition hover:border-sky-400 hover:shadow">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-bold text-white">
                    {bookNo}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800"><T>{label}</T></p>
                    <p className="text-xs text-slate-500">{BOOK_SUB[bookNo]} · {lessonCount} <T>课</T></p>
                  </div>
                  <ChevronRight className="size-5 text-sky-400" />
                </Link>
              );
            }
            return (
              <div
                key={bookNo}
                aria-disabled
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-100/60 p-4">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-slate-200 text-lg font-bold text-slate-400">
                  {bookNo}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-400"><T>{label}</T></p>
                  <p className="text-xs text-slate-400">{BOOK_SUB[bookNo]}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Lock className="size-3" /> <T>制作中</T>
                </span>
              </div>
            );
          })}
        </div>
        {loading && <p className="mt-4 text-center text-xs text-slate-400"><T>加载中…</T></p>}
        {failed && !loading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500"><T>加载失败,请检查网络</T></p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">
              <T>点此重试</T>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
