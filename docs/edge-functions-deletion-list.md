# Edge Function 删除清单(26 个)

裁决人:Aaron · 定案日期:2026-07-27 · 执行方式:Aaron 手动跑删除命令

> 复验方式:2026-07-27 在 `origin/main` 上重扫全仓,**不凭之前的记录**。
> 每个函数复核三件事:① 前端有无 `supabase.functions.invoke("名字")` ② 有无别的 edge function 内部调它
> ③ 全仓(含 json/md/sql/脚本)有无出现它的名字。

---

## 一、可直接删(21 个)—— 前端 0 调用、edge 内部 0 调用

这 21 个的判死依据是**三重零**:

1. **前端零调用** —— 全仓 `src/**` 没有任何 `invoke("名字")`
2. **零后台钩子** —— Aaron 2026-07-27 查证:`cron.job` 表不存在(pg_cron 未启用)、`supabase_functions.http_request` 触发器 **0 个**
3. **零 edge 互调** —— 没有别的函数调它们

| 函数 | 原属功能 | 备注 |
|---|---|---|
| `auth-email-hook` | 注册/登录邮件钩子 | 邮件流程从未接通(既无前端调用也无钩子) |
| `process-email-queue` | 邮件队列消费 | 同上 |
| `handle-email-suppression` | 退订处理 | 同上 |
| `preview-transactional-email` | 邮件模板预览 | 同上 |
| `weekly-report` | 周报生成 | 无定时任务触发 |
| `generate-daily-slang` | 每日俚语 | 仅见于旧盘点文档 |
| `slang-scenario` | 俚语情景 | 仅见于旧盘点文档 |
| `grade-slang-sentence` | 俚语造句批改 | 仅见于旧盘点文档 |
| `generate-lesson` | 课时生成 | 仅见于旧盘点文档 |
| `rewrite-line` | 句子改写 | 仅见于旧盘点文档 |
| `extract-key-phrases` | 关键词抽取 | 仅见于旧盘点文档 |
| `chat-vocab-quiz` | 词汇聊天测 | — |
| `explain-wrong-answer` | 错答讲解 | 与 `explain-mistake` 功能重叠 |
| `fc-strengthen-questions` | 终极挑战强化题 | 仅见于音频审计文档 |
| `tag-questions-batch` | 题目批量打标 | 后台工具,无入口 |
| `seed-grammar-corpus` | 语法语料播种 | 后台工具,无入口 |
| `tutor-chat` | 答疑对话 | — |
| `primary-chat` | 小学答疑 | Aaron 2026-07-27:小学 AI 声音不用管 |
| `primary-speaking-grade` | 小学口语评分 | 仅见于音频文档 |
| `pet-chat` | 宠物对话 | 宠物养成已全站下线 |
| `pet-diary` | 宠物日记 | 宠物养成已全站下线 |

> `docs/**.md` 里出现的名字都是**文档引用**,不是调用,不影响删除。

---

## 二、需要连页面一起处理(5 个)—— 路由零入口,但前端代码仍在调

⚠️ **这 5 个与上面 21 个性质不同,必须说清楚。**

它们的判死依据是**「调用页面不可达」**,不是「没有代码调用」。复验显示每个仍有 **1 处前端 invoke** —— 因为调用它们的页面组件还留在仓库里,只是**路由零入口、用户走不到**。

| 函数 | 调用文件 | 所在路由 | 入口 |
|---|---|---|---|
| `explain-mistake` | `MistakeExplainer` →(仅被 `GaokaoVocab` 引用) | `/gaokao/vocab-board-legacy` | **零** |
| `grade-dictation` | `GaokaoVocab` | 同上 | **零** |
| `vocab-meaning-en` | `GaokaoVocab` | 同上 | **零** |
| `vocab-synonyms` | `GaokaoVocab` | 同上 | **零** |
| `generate-grammar-content` | `AdminGrammarContent` | `/admin/grammar-content` | **零**(Aaron 裁定不再使用) |

`/gaokao/vocab-board-legacy` 路由名带 `legacy`,**全仓除 App.tsx 的路由声明外零引用**;`/mistakes` 页本身没有 AI 讲解功能(其「AI 出 5 题」入口也早已下线)。

**建议:删函数的同时把这两条死路由和对应页面一并删掉**,否则仓库里会留下「代码调用一个已不存在的函数」的悬空引用 —— 走不到,但会误导以后的人。涉及:

- 路由 `/gaokao/vocab-board-legacy` + `pages/GaokaoVocab.tsx` + `components/MistakeExplainer.tsx`
- 路由 `/admin/grammar-content` + `pages/AdminGrammarContent.tsx`

**这部分需要 Aaron 单独批**(本清单只负责函数)。

---

## 三、删除命令(26 条)

```bash
# —— 一、可直接删(21) ——
supabase functions delete auth-email-hook --project-ref <project-ref>
supabase functions delete chat-vocab-quiz --project-ref <project-ref>
supabase functions delete explain-wrong-answer --project-ref <project-ref>
supabase functions delete extract-key-phrases --project-ref <project-ref>
supabase functions delete fc-strengthen-questions --project-ref <project-ref>
supabase functions delete generate-daily-slang --project-ref <project-ref>
supabase functions delete generate-lesson --project-ref <project-ref>
supabase functions delete grade-slang-sentence --project-ref <project-ref>
supabase functions delete handle-email-suppression --project-ref <project-ref>
supabase functions delete pet-chat --project-ref <project-ref>
supabase functions delete pet-diary --project-ref <project-ref>
supabase functions delete preview-transactional-email --project-ref <project-ref>
supabase functions delete primary-chat --project-ref <project-ref>
supabase functions delete primary-speaking-grade --project-ref <project-ref>
supabase functions delete process-email-queue --project-ref <project-ref>
supabase functions delete rewrite-line --project-ref <project-ref>
supabase functions delete seed-grammar-corpus --project-ref <project-ref>
supabase functions delete slang-scenario --project-ref <project-ref>
supabase functions delete tag-questions-batch --project-ref <project-ref>
supabase functions delete tutor-chat --project-ref <project-ref>
supabase functions delete weekly-report --project-ref <project-ref>

# —— 二、路由零入口(5),建议连页面一起清 ——
supabase functions delete explain-mistake --project-ref <project-ref>
supabase functions delete grade-dictation --project-ref <project-ref>
supabase functions delete vocab-meaning-en --project-ref <project-ref>
supabase functions delete vocab-synonyms --project-ref <project-ref>
supabase functions delete generate-grammar-content --project-ref <project-ref>
```

---

## 四、可逆性

**删的只是线上部署,函数源码仍在 `supabase/functions/<name>/` 里、在 git 历史里。**
复活是一条命令:`supabase functions deploy <name> --project-ref <project-ref>`。

删完剩余函数数 = 当前总数 − 26。删除后建议跑一次 `npm run smoke` 确认前端无影响
(这 26 个都不在任何可达路径上,预期零影响)。
