# 任务 6 实施汇报：ReadWrite Visual 扩展机制

> 状态：**已验收**（2026-05-24，浏览器 5 题全对）  
> 前置：任务 5 已提交  
> 目标：`picture_choice` 支持外部 `image` URL，与 u1 内置 `visual` SVG 并存

---

## 1. 决策与理由

| 决策点 | 最终选择 | 理由 |
|--------|----------|------|
| **A Schema** | `visual?` + `image?` 并存；**`image` 优先**；至少一个必须存在（DEV warn） | 与任务 2「主路径 + escape hatch」一致；u1 JSON 零改动 |
| **A 类型** | 可选字段 + `resolvePictureChoiceDisplay()` 运行时校验 | 参考任务 4，不用 branded type |
| **B 路径** | 推荐 `public/primary/hub/{unitId}/`；`defaultReadWriteImagePath()`；支持绝对 URL | 与 `defaultPhonicsAudioBase` 同模式 |
| **C 失败降级** | 灰色虚线框 + `imageAlt` + 🖼️；`onError` DEV warn | 用户不感到「坏了」 |
| **D 组件** | 保留 5 个内置 SVG + switch；新增 `ExternalImageVisual` | 最小 diff；u1 视觉零变化 |
| **E 文档** | `docs/add-readwrite-question.md` | 供 u2+ 内容作者参考 |
| **命名债** | `unit1_read_write_simplified.json` → `g4v2_u1_read_write.json` | 符合任务 1 registry 规范 |

---

## 2. 改动文件

| 文件 | 变更 |
|------|------|
| `src/lib/primaryHub/readWriteTypes.ts` | `visual?` / `image?`；helper + DEV 校验 |
| `src/components/primaryHub/ReadWritePictureVisual.tsx` | 双模式 + 加载失败降级 |
| `src/components/primaryHub/ReadWriteTrainingStage.tsx` | 传递 `image` prop |
| `src/lib/primaryHub/readWriteRegistry.ts` | 加载时 `picture_choice` DEV 校验 |
| `src/data/primaryHub/readWrite/g4v2_u1_read_write.json` | 重命名（内容不变） |
| `src/lib/primaryHub/readWritePictureChoice.test.ts` | 新建 |
| `src/components/primaryHub/ReadWritePictureVisual.test.tsx` | 新建 |
| `src/lib/primaryHub/registry.test.ts` | 新文件名解析 |
| `docs/add-readwrite-question.md` | 新建 |
| `docs/primary-hub-tech-debt.md` | 移除已解决命名债 |

---

## 3. 测试结果

| 命令 | 结果 |
|------|------|
| `npm run build` | ✅ |
| Primary Hub 测试 | ✅ **47/47**（+16 新增） |
| 全量测试 | 57 通过 / 10 失败（slang，已知债） |

---

## 4. 浏览器验收

- [x] u1 读写 5 题视觉与改前一致
- [x] `visual` + `image` 双模式按设计工作
- [x] 图片正常加载（降级路径未触发）

---

## 相关文档

- [add-readwrite-question.md](./add-readwrite-question.md) — 题目配置指南
- [primary-hub-tech-debt.md](./primary-hub-tech-debt.md)
