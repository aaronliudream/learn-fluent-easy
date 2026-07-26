// fltrp 各册「写作关」走真 AI 批改(check-writing edge)的白名单——WritingStage 按 unit.book 判定 realWriting。
// ⚠️ 加新册(如 wy9A/wy9B)必须把其 book 值加进这里,否则该册写作关会**静默降级为「假关」**
//    (textarea 不接批改、点「完成」即过、不调 check-writing)。此类白名单漏项不报错,只能靠守卫测试兜。
// 守卫:realWritingBooks.test.ts 断言所有已发布(available)的 fltrp 册的 book 都在此集合里。
export const REAL_WRITING_BOOKS = new Set(["7B", "wy7A", "wy7B", "wy8A", "wy8B", "wy9A"]);
