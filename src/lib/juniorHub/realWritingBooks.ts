// fltrp 各册「写作关」走真 AI 批改(check-writing edge)的白名单——WritingStage 按 unit.book 判定 realWriting。
// ⚠️ 加新册(如 wy9A/wy9B)必须把其 book 值加进这里,否则该册写作关会**静默降级为「假关」**
//    (textarea 不接批改、点「完成」即过、不调 check-writing)。此类白名单漏项不报错,只能靠守卫测试兜。
// 守卫:realWritingBooks.test.ts 断言所有已发布(available)的 fltrp 册的 book 都在此集合里。
// 2026-07-27 人教各册加入(Aaron 裁决):7A/8A/8B/9 —— 7B 本来就在。
// 四屏脚手架挂在这条真写作分支里,有 cards+templates 的课自动走四屏,
// 只有 prompt 的课(人教 9,14 课)回退纯文本框 + 真批改 —— 这是预期,不是缺陷。
export const REAL_WRITING_BOOKS = new Set([
  "7A", "7B", "8A", "8B", "9",                      // 人教
  "wy7A", "wy7B", "wy8A", "wy8B", "wy9A",           // 外研社
]);
