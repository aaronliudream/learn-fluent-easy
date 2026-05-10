# 小学路径"今日 XX"卡片盘点报告

目的：在动 PrimaryGrade 顶部"今日 4 件事"主卡（任务 B）之前，把孩子从 `/primary` → `/primary/grade/:g` → `/dashboard` 一路上能看到的所有"今日/继续"类入口列清楚，避免改完一处和别处打架。

---

## 一、当前"今日/继续"卡片散布全景

| 页面 | 卡片 | 数据源 | 跳转 | 备注 |
|---|---|---|---|---|
| `/primary` | "开始今日训练 · {年级名}" | 仅 `selectedGrade` (localStorage) | `/primary/grade/:g` | 纯 nav，无今日数据 |
| `/primary` | "错词本 · 待复习 N" | `user_mistakes` count `is_resolved=false` | `/mistakes` | 不限学段 |
| `/primary/grade/:g` | 🌟 **今天的冒险** | `primary_lessons` ∪ `primary_lesson_progress` → 第一个未完成 lesson | `/primary/lesson/:id` | 主 CTA |
| `/primary/grade/:g` | ⚡ **今日 10 词挑战** | `primary_vocab.total − primary_word_mastery.mastery_level≥3` = `weakCount` | `/primary/vocab/:g?focus=weak` | 副 CTA |
| `/dashboard` | 📍 **从这里继续** | `pickContinue(stage, ov)` 优先级 `due > resume > new` | `pick.to` 动态 | StageView 内 |
| `/dashboard` | ⏰ **今日复习** | `user_mistakes` count `is_resolved=false AND next_review_at ≤ now` | `/review/today` | 顶部 |

**核心冲突**：

1. PrimaryGrade 的"今天的冒险"用 `primary_lessons.sort_order` 第一个未完成 lesson，**不考虑 due / 错题**；Dashboard 的"从这里继续"用 `pickContinue` 把 due > resume > new 排序。同一孩子今天有 5 个 due 时：
   - PrimaryGrade 推："去做下一节新课"
   - Dashboard 推："先去复习 5 个词"
   - 孩子按哪边走？

2. PrimaryGrade 的 `weakCount` = total − mastered，把"未掌握"+"未学"混在一起；Dashboard 拆成 4 档（mastered / learned / untouched / due）。**同一份数据两套口径。**

---

## 二、`useMasteryOverview` + `pickContinue` 能否复用

**结论：能，且应作为任务 B "今日 4 件事 · 复习"格的唯一数据源。**

`pickContinue(stage, ov)` 当前返回：
- `module`: vocab/reading/lesson/...
- `kind`: "due" | "resume" | "new"
- `to`, `title`, `subtitle`：现成可用

复用方式：
- `kind === "due"` → 直接喂"复习"格
- `kind === "resume"` → 回填"读+看 / 听 / 说"3 格
- `kind === "new"` → 兜底"开始新内容"

**好处**：4 件事的"复习"格 = `pickContinue` 的 due 分支，**Dashboard ContinueCard 与 PrimaryGrade 复习格指向同一份数据**，不再打架。

**已知小坑**：
- `useMasteryOverview` 的 primary 分支只汇总 vocab + reading + lesson，**不含 listening / writing**（小学缺这两块）。所以 4 件事的"听 / 说"两格暂时无法走 `pickContinue`，要从 `primary_lessons.primary_skill='listening'/'speaking'` 直接抽。下一阶段补 PrimaryListening 模块时一并解决。
- `pickContinue` 内部 `live.find((m) => m.due > 0)` 只看是否有 due，不看 due 数量。如果 vocab 有 3 个 due、reading 有 50 个 due，仍推 vocab。**B 阶段需要在 hook 里加 `sort by due desc`。**

---

## 三、G1-G2 vs G3-G6 差异化空间

**当前代码：完全没有按 grade 差异化。** `PrimaryGrade.tsx` 用 `const g = Number(grade ?? "3")`，G1 与 G6 渲染完全一致：
- 同样的 6 个能力入口
- 同样的"今天的冒险"逻辑
- 同样的"今日 10 词挑战"
- 同样的学习地图、勋章

**新课标"预备级"要求**（义务教育英语课程标准 2022 版）：
- 1-2 年级：**以听说为主**，"看（viewing）"为辅，**不要求读写**
- 3-6 年级：听说读写综合

**任务 B 时建议的差异化**（不增加工作量，只是分支判断）：

| 4 件事格位 | G1-G2 预备级 | G3-G6 标准级 |
|---|---|---|
| ① | 🎧 听：跟读儿歌/字母 | 🎧 听：跟读对话 |
| ② | 🗣️ 说：跟 Spark 模仿 | 🗣️ 说：跟 Spark 介绍/描述 |
| ③ | 👀 看：看图认词/玩配对 | 📖 读+看：看图读句子 |
| ④ | 🎮 玩：单词游戏 | ⏰ 复习：`pickContinue` due |

落地：
```ts
const isPrep = g <= 2;
const tasks = isPrep ? PREP_TASKS : STANDARD_TASKS;
```

**收益**：1）卡到新课标合规；2）G1-G2 不做"复习"（预备级孩子还没积累足够错题），UX 更自然；3）家长面板可显式标注"预备级"vs"标准级"。

---

## 四、任务 B 动手前的前置清单

1. ✅ **任务 A 已完成**：MasteryBadge 4 个 emoji 已替换为月相 🌑🌘🌗🌕⭐。全产品自动跟随。
2. ✅ **本盘点已完成**（即本文档）。
3. ⏳ **任务 B 拆分**：
   - **B-1（30 min）**：`useMasteryOverview.pickContinue` 加 `sort by due desc`。**会同时影响 Dashboard 的 ContinueCard，需肉眼回归。**
   - **B-2（半天）**：`PrimaryGrade.tsx` 新增 `<TodayFourCard g={g} />`：
     - G1-G2 → PREP_TASKS（听/说/看/玩）
     - G3-G6 → STANDARD_TASKS（听/说/读+看/复习）
     - "复习"格调用 `pickContinue` 取 due
     - "听/说/读+看"格按 `primary_skill` 抽 `primary_lessons` 第一个未完成对应技能 lesson
     - 完成一格亮一颗 🌕
   - **B-3（30 min）**：把现有"今天的冒险" + "今日 10 词挑战"两张卡 **降级折叠到 4 件事下方**，保留入口不抢主位，避免 3 套 CTA 同屏。
   - **B-4（10 min）**：Primary.tsx "开始今日训练"按钮文案改为"进入 {年级}（看今日 4 件事）"，两层入口语义对齐。
4. 🔮 **任务 C（家长五技能阵列）**：依赖 `unified_mastery` 视图化（plan.md 阶段 1），阶段 1 完成前不动，否则数字与孩子端对不上。

---

## 五、不动的东西（红线）

- ❌ 不动 `useMasteryOverview` primary 分支汇总逻辑（只在 `pickContinue` 加排序）
- ❌ 不动 `primary_lessons` / `primary_word_mastery` / `primary_lesson_progress` 表结构
- ❌ 不动 MasteryBadge 已替换的月相（任务 A 一次定型）
- ❌ 不新增 PrimaryListening / Writing / Grammar 模块（留给下一阶段）
- ❌ 不动 Dashboard ContinueCard 视觉（让 PrimaryGrade 4 件事对齐它，不反过来）

---

_盘点日期：2026-05-10。下一步等确认任务 B 范围与差异化方案再动手。_
