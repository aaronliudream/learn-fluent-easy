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
