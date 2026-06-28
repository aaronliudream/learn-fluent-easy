import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, RotateCw } from "lucide-react";
import { T } from "@/i18n/T";
import { loadUnitGrammar, type GUnit } from "@/lib/juniorGrammarUnits";
import {
  loadGrammarQuestionMastery,
  computeGrammarProgress,
} from "@/lib/juniorGrammarQuestionMastery";
import { getGradeCourse } from "@/lib/juniorHub/courseData";
import type { JuniorHubGrade } from "@/lib/juniorHub/types";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import GaokaoBookPicker, { GAOKAO_BOOKS } from "@/components/gaokaoHub/GaokaoBookPicker";
import { readPublisherParam } from "@/lib/gaokaoHub/publisher";

/** 册 → junior grade(必修=10/选必一二=11/选必三四=12)。物理沿用 year1/2/3.json。 */
const VOL_GRADE: Record<string, JuniorHubGrade> = {
  required1: 10, required2: 10, required3: 10,
  elective1: 11, elective2: 11, elective3: 12, elective4: 12,
};

/**
 * 高考·语法专项板块(7册分册)。
 * - 无 ?book → 选册骨架(只有有 junior_grammar_points 的 volume 可点)。
 * - ?book=required1 → 聚合该册各单元的语法点(junior_grammar_points WHERE volume),
 *   每个单元 → /gaokao/lesson/unit-grammar/:grade/:unitId 综合测试(GaokaoUnitGrammarTest 孪生,returnTo 回本板块)。
 * ★互通★:综合测试每答一题写 recordGrammarQuestionMastery → junior_user_mastery(题级 UUID),
 *   与课本同步 9 关语法关**同表同口径** → 进度天然互通,绝不碰 gaokao_user_mastery。
 *   见 docs/高中专区架构方案.md §②③。
 */
export default function GaokaoGrammarBoard() {
  const [sp] = useSearchParams();
  const book = sp.get("book");
  const pub = readPublisherParam(sp);
  const [units, setUnits] = useState<GUnit[]>([]);
  const [prog, setProg] = useState<Record<string, { mastered: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all = await loadUnitGrammar(pub);
      if (cancelled) return;
      setUnits(all);
      const target = book ? all.filter((u) => u.volume === book) : [];
      const allQids = target.flatMap((u) => u.questionIds);
      if (allQids.length) {
        const mastery = await loadGrammarQuestionMastery(allQids);
        if (cancelled) return;
        const map: Record<string, { mastered: number; total: number }> = {};
        for (const u of target) {
          const pr = computeGrammarProgress(u.questionIds, mastery);
          map[`${u.volume}|${u.unit}`] = { mastered: pr.mastered, total: pr.total };
        }
        setProg(map);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [book, pub]);

  const available = useMemo(() => new Set(units.map((u) => u.volume)), [units]);
  const bookUnits = useMemo(
    () => (book ? units.filter((u) => u.volume === book) : []),
    [units, book],
  );
  const bookCn = GAOKAO_BOOKS.find((b) => b.volume === book)?.cn ?? book;

  // (volume,unit) → 高考单元 id(找 junior grade 课程里 unitKey 匹配的单元)。
  const unitIdByKey = useMemo(() => {
    const m = new Map<string, string>();
    if (!book) return m;
    const grade = VOL_GRADE[book];
    if (!grade) return m;
    try {
      const course = getGradeCourse(grade);
      // ⚠️ 同一 grade 含多本书(year1 = gk_required1 + gk_required2),unitKey(U1/U2…)跨册重名。
      // 必须按所选册(u.book === book)过滤,否则后一本会覆盖前一本 → 链到错册无 grammarCodes 的单元 → "未配置"。
      for (const sem of Object.values(course.semesters))
        for (const u of sem.units) if (u.book === book) m.set(u.unitKey, u.id);
    } catch {
      /* no-op */
    }
    return m;
  }, [book]);

  if (loading && !book) return <CenterSpin />;

  if (!book) {
    return (
      <GaokaoBookPicker
        boardTitle="语法专项"
        boardEmoji="📐"
        basePath="/gaokao/grammar"
        available={available}
        subtitle="按课本分册 · 真题题库 · 与课本同步进度互通"
      />
    );
  }

  const grade = VOL_GRADE[book] ?? 10;
  const returnTo = encodeURIComponent("/gaokao/grammar?book=" + book);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <Link to="/gaokao/grammar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回选册</T>
      </Link>
      <header className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:from-indigo-950/30 dark:to-violet-950/20">
        <h1 className="text-2xl font-extrabold tracking-tight">📐 {bookCn} · 语法</h1>
        <p className="mt-1 text-sm text-muted-foreground">真题题库综合测试,进度与课本同步单元互通。</p>
      </header>

      {loading ? (
        <CenterSpin />
      ) : bookUnits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          本册语法内容整理中。
        </p>
      ) : (
        <div className="space-y-3">
          {bookUnits.map((u) => {
            const key = `${u.volume}|${u.unit}`;
            const pr = prog[key] ?? { mastered: 0, total: u.questionIds.length };
            const pct = pr.total ? Math.round((pr.mastered / pr.total) * 100) : 0;
            const uid = unitIdByKey.get(u.unit);
            const pointTitles = u.points.map((p) => p.title.replace(/^[①②③④⑤]/, "")).join(" · ");
            const card = (
              <div className="flex items-center gap-3">
                <MasteryRing value={pct} size={44} colorClass="stroke-amber-400">
                  <span className="text-[10px] font-bold tabular-nums">{pct}%</span>
                </MasteryRing>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-foreground">{u.unit} · 语法综合</p>
                  <p className="truncate text-xs text-muted-foreground">{pointTitles || "—"}</p>
                  <p className="text-xs text-muted-foreground">已掌握 {pr.mastered}/{pr.total} 题</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            );
            return uid ? (
              <Link
                key={key}
                to={`/gaokao/lesson/unit-grammar/${grade}/${uid}?returnTo=${returnTo}`}
                className="block rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:bg-card"
              >
                {card}
              </Link>
            ) : (
              <div key={key} className="block rounded-2xl border border-dashed border-border bg-muted/30 p-3 opacity-70">
                {card}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function CenterSpin() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <RotateCw className="size-8 animate-spin text-indigo-400" />
    </div>
  );
}
