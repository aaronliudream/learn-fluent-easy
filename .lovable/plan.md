## 现在为什么"卡在新音"

打开 `/primary/phonics`，CTA 永远是 **「继续学新音 X」**：因为它只看「本组还有没有 level=0 的音」。学完一个音回来，下一个新音照常排第一位。孩子被锁在「学音 → 学音 → 学音」的循环里，到不了「用音 → 读绘本」的奖赏环节。整个 1–4 年级，从单音到绘本中间没有引导桥。

按教学论与遗忘曲线，正确的微循环应该是：

```text
学新音 → 立刻"用一次"(含此音的小词) → 听一句"含此音的真实英语"
       → 进入今天的小绘本(把今天的音当主角) → 给 Spark 演一段
       → 晚些时候(1d/3d/7d) 再被推送一次该音的快速复习
```

每个音学完应该感到「我闯过一关、看到了下一站」，而不是「立刻又要学新东西」。

## 设计目标 (1–4 年级共用)

1. **"音 → 词 → 句 → 绘本"四级阶梯**：单音学完不是终点，是阶梯的第一格。
2. **遗忘曲线内嵌**：FSRS-lite (1d / 3d / 7d / 14d) 自动安排"老朋友复习"，而不是依赖孩子主动点。
3. **每日有终章**：今天的冒险一定以一本"含今天主音"的绘本读完作为收尾，孩子带着完成感离开。
4. **趣味而不喧宾夺主**：Spark 的一句话、3 颗星、一个小印章；动画 < 1 秒，不打断节奏。
5. **G3/G4 的桥**：把现有 G1/G2 引擎平滑过渡到段落朗读、复述、看图说话(用现有 storybook + roleplay 数据)。

## 总体路径(一次微循环 ≈ 8–10 分钟)

```text
①学新音(已存在)
   ↓ 直接进入(不弹回 phonics 主页)
②"用一下" — Sound-in-Action 卡 (新)
   • 给一个含此音的 sight word: 听 → 读 → 选图
   • 给一句含此音的例句(从绘本/对话池中按字母子串挑)
   ↓
③ 今天的 Mini-Story — 小绘本 1 本 (新调度,复用 PrimaryStoryBookRead)
   • 系统按"今日主音 + 难度 + 未读"挑一本绘本
   • Spark 朗读 → 找出本页含主音的词 (高亮/拍一下)
   • 读完做 1 道 quiz
   ↓
④ 演一段 (可选,跳过不扣星)
   • 从 roleplay 池中找一段含主音的台词
   ↓
⑤ 收尾 — Spark 给印章 + 预告"明天可能还会考 X"
   • 把本次音以 due_at = +1d 写进复习队列
```

复习日:不开新音。当天 CTA = **「老朋友找你啦」** → 跑 phonics quiz/review，再衔接一本"老主音"的绘本回顾。

## 三条 CTA 优先级(替换 PrimaryPhonics 当前逻辑)

旧: 学新音 > 复习 > 整组挑战 (永远偏向学新音)

新: 
1. **到期复习数 ≥ 3** → 先复习 (遗忘曲线优先)
2. **本组只剩 1 个未学** → 学完它 + 立刻整组挑战
3. **昨天学了新音但今天没用过** → 进 Sound-in-Action(②)
4. **今天还没读绘本** → 进 Mini-Story(③)
5. 否则才 → 学下一个新音

不再让孩子连续 3 次以上点到「学新音」。每学 2 个新音强制插入一次「用 + 读」环节。

## 1–4 年级差异化

| 年级 | 主音节奏 | 绘本难度 | 演角色 | 复述/写 |
|---|---|---|---|---|
| G1 | 1 个/天，单字母短音 | 5–8 句，每页 1 行 | 1 句重复 | 否 |
| G2 | 1–2 个/天，digraph/blend | 8–12 句 | 2–3 轮 | 否 |
| G3 | 复习 + 拼读规则(magic e/r-controlled) | 段落型(已有 G2 books 复用 + 新加) | 3–4 轮 | 1 句"我学到了…"的语音/文字 |
| G4 | 多音节、词根词缀 | 3 段以上小故事 | 4–6 轮 | 3 句小复述 |

G3/G4 现在数据缺失 → 第一阶段先复用 G2 内容并加难度档位标记，先把"引导路径"跑通；后续再补内容。

## 技术改造清单

A. **数据层(零迁移)**
   - 新增 `src/lib/phonicsJourney.ts`：纯函数
     - `pickTodaysFocusSound(grade, mastery)`：每日主音(优先 due，其次本组下一个新音)
     - `findSightWordsContaining(letter, n)`、`findStoryBookForSound(letter, grade, doneSet)`、`findRoleplayLineForSound(...)`：按字母子串匹配
     - `nextActionAfterPhonicsLearn(item, mastery, sessionCounters)`：返回 `"useIt" | "readBook" | "challenge" | "newSound"` —— 用上面 5 条优先级
   - 新增 `src/lib/phonicsReviewQueue.ts`：FSRS-lite (基于已有 `bumpPhonicsLevel/Mastery`)，把答对/错写入 due_at；getDueToday() 给主页用

B. **页面层**
   1. `PrimaryPhonicsLearn.tsx` — Mini-Quiz 通过后，**不再 1.6s 跳回 /primary/phonics**，而是渲染一张 **"下一步"卡**：
      - 本组未完 + 已学 ≥2 → "用一下 X" 按钮 → 跳到新页 `/primary/phonics/use/:letter`
      - 全组完成 → "开始整组挑战"
      - 否则 → "和 Spark 读今天的绘本" → 跳 `/primary/storybook/:autoPickedId?focus=:letter`
   2. **新页** `PrimaryPhonicsUse.tsx`(Sound-in-Action)：3 个小卡片
      - 听音选词 (sight word)
      - 跟读一句例句(从绘本第一页中挑)
      - "去读今天的绘本 →" 主 CTA
   3. `PrimaryStoryBookRead.tsx` — 接收 `?focus=letter`：
      - 朗读时把含此音的词加金色下划线
      - 读完页面新增"找一找"小环节(1 道：本书出现了几次主音?)
      - 读完写 `phonicsReviewQueue.bumpUsage(letter)` → 影响明天的 due
   4. `PrimaryPhonics.tsx` — CTA 区改用 `nextActionAfterPhonicsLearn`，顶部 Spark 文案改为今日主音叙述
   5. `PrimaryAdventure.tsx` (`dailyAdventure.ts`) — Step 1/Step 3 互绑：phonics 步完成后，listening/reading 步自动带 `?focus={今日主音}`

C. **设计 token (复用现有 fox/spark 主题)**
   - 新增 `--phonics-journey-band: linear-gradient(...)`，Sound-in-Action 卡用米色+琥珀；StoryBook 高亮用 `--accent-warm`
   - 不引入新色板，沿用 rose/amber/violet 体系

## 不在本期的事

- G3/G4 的真实新内容(只搭路径，先复用 G2 池)
- 语音识别评分(目前仍以"我跟读了"按钮记录)
- 家长后台新报表(现有进度页够用)
- Word Quest/Rush 重排(独立游戏，不接入 sound focus)

## 验收标准

1. 学完一个音后，**默认下一步不是另一个新音**(连续 3 个新音的链路在新版本中不存在)
2. 每天进入 PrimaryPhonics，CTA 文案至少有 3 种自然变化(复习/用/读/挑战/学)
3. 每天最终都能走到一本绘本读完(若已读完，则给"再读一本老朋友")
4. 1d/3d/7d 后，已学的音会在主页 CTA 中以"老朋友找你啦"形式自动出现
5. 1–4 年级路由全部能进入；G3/G4 走 G2 内容时显示"先用 G2 内容陪你"提示
