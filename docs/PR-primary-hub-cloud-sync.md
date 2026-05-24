# PR: Primary Hub 进度云端同步 + 脏数据修复

**Branch:** `cursor/progress-cloud-sync` → `main`

## Summary

- 新增 `primary_hub_progress` 表（additive migration + RLS），实现 G3–G6 Primary Hub 登录态云端同步
- 登录时 pull / debounced push；Guest 本地进度合并（**Step 2 将改为弹框确认**）
- 修复 vocab `viewed` 刷新归零
- **Hotfix：** 清理 production 测试脏数据；修复 `getUnitState` render 副作用与过宽的上传条件

## 包含内容

### 基础设施
- `supabase/migrations/20260524180000_primary_hub_progress.sql`
- `hubCloudMerge.ts` / `hubCloudSync.ts` / `PrimaryHubProvider` auth 集成
- `PrimaryHubStagePlay.tsx` vocab viewed 持久化

### 脏数据 / 次因修复（618ae77e, 68c3e9e3）
- Production 已 DELETE 自测账号进度行（smoke test + guest 5151 等）
- `readUnitState()` 只读进度计算，避免学期页 render 写入 12 个空 unit 壳
- `stripEmptyUnits()` + `hasUnitActivity()` 守门 cloud upsert
- hydrate 换用户时 reset 内存态

## 已知未做（Step 2 跟进）

- Guest 合并改为**弹框让用户选择**（不再自动 merge + upload）
- `profiles.guest_merge_decision` 决策持久化

## 不在范围

- Junior / Gaokao Hub 云同步
- Streak RPC 400（tech debt）
- www vs 裸域 localStorage 分裂

## Test plan

- [ ] 无痕 + **全新邮箱** → 四下册 **0%**（无弹框，Step 2 前仍可能自动合并 localStorage）
- [ ] 登录后 Unit 2 vocab 查看 → 退出再进 → viewed 计数恢复
- [ ] 换浏览器同账号 → 进度同步
- [ ] `npm test -- src/lib/primaryHub/`
- [ ] Production migration 已 applied（`20260524180000`）

## Production notes

- Migration 已通过 `supabase db query --linked` 应用 + `migration repair`
- 合 main 后 Vercel 自动部署，**无需再跑 migration**
