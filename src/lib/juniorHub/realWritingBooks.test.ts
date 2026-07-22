// 守卫:REAL_WRITING_BOOKS 白名单漏项会让写作关静默变「假关」(不批改)。这类漏项不报错,
// 只能靠测试兜——同 useMasteryOverview 的 publisher 守卫。见 memory: junior-fltrp-wy8-kickoff-status。
// 断言:所有已发布(available:true)的 fltrp 册的 book 都在 REAL_WRITING_BOOKS 里;
// 将来加册(flip available)漏加白名单 → 本测试红。
import { describe, it, expect } from "vitest";
import { REAL_WRITING_BOOKS } from "./realWritingBooks";
import fltrpGrade7 from "@/data/juniorHub/fltrp-grade7.json";
import fltrpGrade8 from "@/data/juniorHub/fltrp-grade8.json";
import fltrpGrade9 from "@/data/juniorHub/fltrp-grade9.json";

type UnitLike = { book?: string; available?: boolean };
type GradeLike = { semesters?: Record<string, { units?: UnitLike[] }> };

function firstGrade(json: unknown): GradeLike {
  return Object.values(json as Record<string, GradeLike>)[0] ?? {};
}

/** 收集所有 fltrp 册里「有已发布单元」的 book 值。 */
function publishedFltrpBooks(): string[] {
  const books = new Set<string>();
  for (const json of [fltrpGrade7, fltrpGrade8, fltrpGrade9]) {
    const grade = firstGrade(json);
    for (const sem of Object.values(grade.semesters ?? {})) {
      for (const u of sem.units ?? []) {
        if (u.available && typeof u.book === "string") books.add(u.book);
      }
    }
  }
  return [...books];
}

describe("REAL_WRITING_BOOKS 守卫", () => {
  it("每个已发布(available)的 fltrp 册的 book 都在白名单里(否则写作关静默变假关)", () => {
    const missing = publishedFltrpBooks().filter((b) => !REAL_WRITING_BOOKS.has(b));
    expect(missing).toEqual([]);
  });

  it("已完成的 fltrp 册基线 wy7A/wy7B/wy8A/wy8B 都在白名单", () => {
    for (const b of ["wy7A", "wy7B", "wy8A", "wy8B"]) {
      expect(REAL_WRITING_BOOKS.has(b)).toBe(true);
    }
  });
});
