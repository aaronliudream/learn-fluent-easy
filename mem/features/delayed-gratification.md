---
name: Delayed Gratification Economy
description: 学习奖励不即时到账、不即时消费。三货币 + 24h 消化 + 48h 心愿单。
type: feature
---
**核心原则**：所有学习产出走"延迟满足"路径，不立即满足购买冲动。

**三种货币**：
- 🌱 seeds（种子）：学习产出，进入 24h `pending_seeds` 队列后才到 `user_currencies.seeds`，仅可商店心愿单兑换
- ⭐ starlight（星光）：连续学习/连击奖励，未来解锁场景
- 💎 crystals（结晶）：长期里程碑奖励，购买稀有道具

**关键机制**：
- 任何 `awardCoins` / `awardForCorrect` / `awardAction` 调用都会自动 `addPendingSeed()` 进 24h 消化队列
- 商店购买必须先 `wishlistAdd("food", id)` → 等满 48h `cooldown_until` → 才能 `buy_pet_food`
- `XPBurst` 默认显示 "能力 +0.x% 📈" 而不是 "+N XP"，强化能力成长而非货币累积
- `<DigestionAnimation />` 全局监听 `seed:digest` 事件，做"宠物消化中…明天到账"动画

**RPC**：`add_pending_seed`, `settle_matured_seeds`, `wishlist_add`
**前端入口**：`src/lib/currencies.ts` 的 `useCurrencies()` / `addPendingSeed()` / `wishlistAdd()`

**禁止**：不要再加"立即金币 → 立即购买"路径，违背延迟满足设计。

## v2 增量（2026-05-03）
- **每日种子上限**：默认 50/日，超出 → "明日储蓄罐"（mature_at 推到次日）
- **心灵假日**：`no_reward_days` 表，每周确定性随机选一天，当天获得的种子全部进储蓄罐
- **家长延迟系数**：`parent_delay_settings.delay_hours ∈ {1,24,72}`，影响 `add_pending_seed` 的成熟时长；UI 在 `<DelaySettings />` 家长后台
- **耐心分**：`profiles.patience_score`，心愿单搁置 ≥7 天才购买 +1；走 `confirm_wishlist_purchase` RPC
- **宠物成长信**：周日全屏弹窗 `<GrowthLetter />`，数据来自 `weekly_growth_letter` RPC，全文不提金币
- **疲劳态**：`src/lib/fatigue.ts` 同模块连续 ≥20 题或 ≥30 分钟 → 奖励减半 + toast 休息提示；切换模块 / 闲置 10 分钟自动重置
- **排行榜模糊化**：Leaderboard "我的排名"改显示"超过同学 X%"，不显示绝对名次
