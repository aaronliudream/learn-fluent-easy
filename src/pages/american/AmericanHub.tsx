/**
 * 美语课程 · 某册单元总览(/american/book/:bookNo)—— 单元数据驱动。
 * 单元格子按该册实际存在的 distinct unit_no 渲染(渲染到最大 unit_no):
 * 第二册96课=12单元、第三册60课=12单元、第四册48课=8单元,各按自己真实单元数,不硬编。
 * 已上线单元(american_lessons 有数据)可进;内部空缺单元显示"敬请期待"。
 * bookNo 缺省 1(第一册),渲染与改版前 /american 一致(回归点)。
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, RotateCcw, ChevronRight, BookOpen, Download } from "lucide-react";
import { T } from "@/i18n/T";
import { fetchUnits, fetchReviewCount, fetchUnitCompletion, type AmericanUnit } from "@/lib/american/data";
import { AMERICAN_COURSE_NAME, AMERICAN_COURSE_SUBTITLE, AMERICAN_COURSE_SCALE, AMERICAN_COURSE_COVERAGE } from "@/lib/american/brand";

const BOOK_LABEL: Record<number, string> = { 1: "第一册", 2: "第二册", 3: "第三册", 4: "第四册" };

// 课本 PDF 公开直链(Supabase 公开桶 textbooks,anon 可读;?download 强制附件下载)。
// 文件名带版本号,更新出 v2 不覆盖旧缓存。册名与书封面一致(brand 去 1-4册 后缀)。
// lessons/mb 与本地全本一致(book1=72课/book2=96/book3=60/book4=48;MB 为实测文件大小)。
const BOOK_TITLE_BASE = AMERICAN_COURSE_NAME.replace(/1-4册$/, "");
const BOOK_PDF: Record<number, { file: string; lessons: number; mb: string }> = {
  1: { file: "american-book1-v1.pdf", lessons: 72, mb: "11" },
  2: { file: "american-book2-v1.pdf", lessons: 96, mb: "12.8" },
  3: { file: "american-book3-v1.pdf", lessons: 60, mb: "10.7" },
  4: { file: "american-book4-v1.pdf", lessons: 48, mb: "9.1" },
};
const pdfUrl = (file: string) =>
  `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/textbooks/${file}?download`;

export default function AmericanHub() {
  const nav = useNavigate();
  const { bookNo: bookNoParam } = useParams<{ bookNo: string }>();
  const bookNo = Number(bookNoParam) || 1;
  const [units, setUnits] = useState<AmericanUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [prog, setProg] = useState<{ loggedIn: boolean; pct: Record<number, number> }>({ loggedIn: false, pct: {} });

  useEffect(() => {
    let alive = true;
    fetchUnits(bookNo)
      .then((u) => {
        if (!alive) return;
        setUnits(u);
        fetchUnitCompletion(u).then((p) => { if (alive) setProg(p); }).catch(() => {});
      })
      .catch(() => { if (alive) setUnits([]); })
      .finally(() => { if (alive) setLoading(false); });
    fetchReviewCount().then((n) => { if (alive) setReviewCount(n); }).catch(() => {});
    return () => { alive = false; };
  }, [bookNo]);

  const available = new Map(units.map((u) => [u.unit_no, u]));
  // 单元格子数 = 该册实际存在的最大 unit_no(数据驱动,不硬编 12)。
  // 单元号连续时即等于真实单元数(第四册=8、第二/三册=12);内部若有空缺则该格显示"敬请期待"。
  const totalUnits = units.length ? Math.max(...units.map((u) => u.unit_no)) : 0;

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <Link to="/american" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>全部分册</T>
        </Link>

        <header className="mt-4 rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-600 p-6 text-center text-white shadow-sm">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="size-6 text-amber-300" />
          </span>
          <h1 className="mt-3 text-2xl font-bold">{AMERICAN_COURSE_NAME}</h1>
          <p className="mt-1 text-sm text-white/85">{AMERICAN_COURSE_SUBTITLE}</p>
          <p className="mt-1 text-xs text-white/70"><T>{AMERICAN_COURSE_COVERAGE}</T></p>
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3.5 py-1.5"><span className="text-base font-extrabold"><T>{BOOK_LABEL[bookNo] ?? `第${bookNo}册`}</T></span> <span className="text-xs font-semibold text-white/85">· {AMERICAN_COURSE_SCALE}</span></span>
        </header>

        {reviewCount > 0 && (
          <Link to="/american/review"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-300 hover:shadow-sm">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <RotateCcw className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800"><T>今日复习</T> · {reviewCount} <T>题</T></p>
              <p className="text-xs text-slate-500"><T>做错的题到期了,复习一遍更牢</T></p>
            </div>
            <ChevronRight className="size-5 text-amber-400" />
          </Link>
        )}

        {BOOK_PDF[bookNo] && (
          <a
            href={pdfUrl(BOOK_PDF[bookNo].file)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm transition hover:border-sky-400 hover:shadow">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <BookOpen className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">📖 {BOOK_TITLE_BASE} · {BOOK_LABEL[bookNo]}</p>
              <p className="text-xs text-slate-500">{BOOK_PDF[bookNo].lessons}<T>课完整课本 · 免费下载</T> · <T>约</T> {BOOK_PDF[bookNo].mb} MB</p>
            </div>
            <Download className="size-5 text-sky-400" />
          </a>
        )}

        <h2 className="mb-3 mt-6 text-sm font-bold text-slate-500"><T>选择单元</T></h2>
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400"><T>加载中…</T></p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: totalUnits }, (_, k) => k + 1).map((n) => {
              const u = available.get(n);
              const open = !!u;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={!open}
                  onClick={() => open && nav(`/american/book/${bookNo}/hub/${n}`)}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                    open ? "border-sky-200 bg-white shadow-sm hover:border-sky-400 hover:shadow" : "border-slate-100 bg-slate-100/60"
                  }`}>
                  <span className={`text-xs font-bold ${open ? "text-sky-600" : "text-slate-400"}`}>
                    <T>单元</T> {n}{open ? <> · {u!.lessons.length} <T>课</T></> : null}
                  </span>
                  {open ? (
                    <>
                      <span className="mt-1 line-clamp-1 text-xs text-slate-400">{u!.lessons[0]?.title_cn ?? ""}</span>
                      {prog.loggedIn &&
                        ((prog.pct[n] ?? 0) > 0 ? (
                          // 有进度:显示百分比 + 进度条
                          <div className="mt-2 w-full">
                            <div className="text-[11px] font-semibold text-sky-600">{prog.pct[n]}%</div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${prog.pct[n]}%` }} />
                            </div>
                          </div>
                        ) : (
                          // 0% 未开始:不显示空进度条,给个淡标签(避免满屏 0% 观感差)
                          <span className="mt-2 text-[11px] font-medium text-slate-300"><T>未开始</T></span>
                        ))}
                    </>
                  ) : (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                      <Lock className="size-3" /> <T>敬请期待</T>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
