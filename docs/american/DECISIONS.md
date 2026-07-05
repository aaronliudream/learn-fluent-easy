# 美语课程 · 自主决策留痕(DECISIONS)

> 全自动生产授权(Aaron 2026-07-04)下的自决记录。格式:日期 · 课/事项 · 选项 · 依据 · 决定。Aaron 异步翻阅,有异议回溯。

## 2026-07-04

- **性能③ 元数据缓存范围** · 选项:全站统一缓存层 vs 美语本地缓存 · 依据:范围声明只碰美语;全站层会波及其他板块 · **决定**:缓存收在 `src/lib/american/data.ts`(`cachedBooks/cachedUnits` + fetch 成功写 `localStorage am.meta.v1.*`),仅美语页消费;其他板块同类优化各自做,不共用一层。

- **性能② 路由分割** · 依据:App.tsx 已对四板块 `React.lazy`,`/american` 实测只下美语 chunk · **决定**:判定"已完成",不重做,不动 App.tsx 路由结构(避免碰禁区/共用)。

- **性能①「无法加载」修法** · 选项:每查询手动超时 vs 客户端全局 fetch 超时 · 依据:根因是客户端零超时导致弱网请求永久挂起,逐查询改动面太大易漏 · **决定**:在 `supabase/client.ts` 加 `global.fetch` 10s AbortController 超时(全站生效,Aaron 明确要全站受益);该文件标注"自动生成勿改",已加注释说明例外并请保留。

- **性能④⑤ 美语现状** · 依据:`fetchLessonBundle` 已 `Promise.all` 六查询并行;`fetchUnits` 已列裁剪(不取 grammar_card/课文/词表)· **决定**:美语侧④⑤基本已满足,判"已达标";全站"今日复习角标延后"属别板块落地页,不在美语范围,不碰。

- **真机修正③ 加粗 vs 共用 TappableLine** · 硬停②候选(改共用组件波及全站)· 依据:TappableLine 是全站共享,直接加高亮 prop 会波及 · **决定**:不改 TappableLine;在美语本地 `AmericanTappableLine` 把句子切成加粗/非加粗段、各段仍过 TappableLine,`<strong>` 包加粗段。零跨板块波及,不触发硬停。

- **校验第10项 stem_cn 判定范围** · 选项:所有带空题 vs 仅"完整英文句"填空题 · 依据:中文讲解式题干(如"在晚上说 ___")译中文无意义,只有完整英文句填空才需"填答案后整句中译" · **决定**:`isPatternQ` = 带 `___` + ≥3 英文词 + 中文字符≤3;据此第10项只卡纯英文句填空题。
