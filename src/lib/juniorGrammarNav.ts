/**
 * Junior grammar navigation — pick Lab (闯关) vs classic point flow.
 *
 * `content_depth >= 1` marks points with rich / Lab-ready content (see migration comment).
 */

export type JuniorPointNav = {
  id: string;
  title: string;
  content_depth?: number | null;
  grade?: number | null;
  sort_order?: number | null;
  category_id?: string | null;
};

export function hasLabContent(p: Pick<JuniorPointNav, "content_depth"> | null | undefined): boolean {
  return (p?.content_depth ?? 0) >= 1;
}

export function juniorGrammarPlayPath(
  pointId: string,
  p?: Pick<JuniorPointNav, "content_depth"> | null,
  opts?: { classic?: boolean },
): string {
  if (opts?.classic) return `/junior/grammar/${pointId}?classic=1`;
  if (p && hasLabContent(p)) return `/junior/grammar-lab/${pointId}`;
  return `/junior/grammar/${pointId}`;
}

type MasterySlice = { due_at?: string | null; mastery_level?: number };

/** Today's adventure: due review → smart recommend → weakest point. */
export function pickTodayAdventure<T extends JuniorPointNav>(
  pts: T[],
  mastery: Record<string, MasterySlice>,
  recommend?: { point: T } | null,
): T | null {
  if (pts.length === 0) return null;

  const due = pts
    .filter((p) => {
      const ms = mastery[p.id];
      return ms?.due_at && new Date(ms.due_at).getTime() <= Date.now();
    })
    .sort((a, b) => {
      const da = mastery[a.id]?.due_at ?? "";
      const db = mastery[b.id]?.due_at ?? "";
      return new Date(da).getTime() - new Date(db).getTime();
    });
  if (due.length > 0) return due[0];

  if (recommend?.point) return recommend.point;

  const sorted = [...pts].sort((a, b) => {
    const la = mastery[a.id]?.mastery_level ?? 0;
    const lb = mastery[b.id]?.mastery_level ?? 0;
    if (la !== lb) return la - lb;
    return (hasLabContent(b) ? 1 : 0) - (hasLabContent(a) ? 1 : 0);
  });
  return sorted[0] ?? null;
}

/** After Lab boss clear: next lab-ready point (due → weakest → sort_order). */
export function pickNextLabPoint<T extends JuniorPointNav>(
  currentId: string,
  allPoints: T[],
  mastery: Record<string, MasterySlice>,
  opts?: { grade?: number | null },
): T | null {
  let pool = allPoints.filter((p) => p.id !== currentId && hasLabContent(p));
  if (!pool.length) return null;

  if (opts?.grade != null) {
    const sameGrade = pool.filter((p) => p.grade === opts.grade);
    if (sameGrade.length) pool = sameGrade;
  }

  const now = Date.now();
  const due = pool
    .filter((p) => {
      const ms = mastery[p.id];
      return ms?.due_at && new Date(ms.due_at).getTime() <= now;
    })
    .sort((a, b) => {
      const da = mastery[a.id]?.due_at ?? "";
      const db = mastery[b.id]?.due_at ?? "";
      return new Date(da).getTime() - new Date(db).getTime();
    });
  if (due.length) return due[0];

  const sorted = [...pool].sort((a, b) => {
    const la = mastery[a.id]?.mastery_level ?? 0;
    const lb = mastery[b.id]?.mastery_level ?? 0;
    if (la !== lb) return la - lb;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  return sorted[0] ?? null;
}
