/**
 * 美语课程 · 总入口(/american)—— 12 单元总览。
 * 已上线单元(american_lessons 有数据)可进;其余显示"敬请期待"。
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { T } from "@/i18n/T";
import { fetchUnits, type AmericanUnit } from "@/lib/american/data";
import { AMERICAN_COURSE_NAME, AMERICAN_COURSE_SUBTITLE, AMERICAN_COURSE_SCALE } from "@/lib/american/brand";

const TOTAL_UNITS = 12;

export default function AmericanHub() {
  const nav = useNavigate();
  const [units, setUnits] = useState<AmericanUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchUnits()
      .then((u) => { if (alive) setUnits(u); })
      .catch(() => { if (alive) setUnits([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const available = new Map(units.map((u) => [u.unit_no, u]));

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="size-4" /> <T>返回首页</T>
        </Link>

        <header className="mt-4 rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-600 p-6 text-white shadow-sm">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="size-6 text-amber-300" />
          </span>
          <h1 className="mt-3 text-2xl font-bold">{AMERICAN_COURSE_NAME}</h1>
          <p className="mt-1 text-sm text-white/85">{AMERICAN_COURSE_SUBTITLE}</p>
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{AMERICAN_COURSE_SCALE}</span>
        </header>

        <h2 className="mb-3 mt-6 text-sm font-bold text-slate-500"><T>选择单元</T></h2>
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400"><T>加载中…</T></p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: TOTAL_UNITS }, (_, k) => k + 1).map((n) => {
              const u = available.get(n);
              const open = !!u;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={!open}
                  onClick={() => open && nav(`/american/hub/${n}`)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    open ? "border-sky-200 bg-white shadow-sm hover:border-sky-400 hover:shadow" : "border-slate-100 bg-slate-100/60"
                  }`}>
                  <span className={`text-xs font-bold ${open ? "text-sky-600" : "text-slate-400"}`}>
                    <T>单元</T> {n}
                  </span>
                  {open ? (
                    <>
                      <span className="mt-1 text-sm font-semibold text-slate-800">{u!.lessons.length} <T>课</T></span>
                      <span className="mt-0.5 line-clamp-1 text-xs text-slate-400">{u!.lessons[0]?.title_cn ?? ""}</span>
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
