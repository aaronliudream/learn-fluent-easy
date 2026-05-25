# readWrite fill_choice 验收包 · commit `39c19269`

## Preview URL（请你用已登录 Vercel 账号打开实拍）

| 项 | 值 |
|----|-----|
| 分支 | `cursor/g4v1-u2-content` |
| Commit | `39c19269` |
| Preview alias | https://learn-fluent-easy-git-cursor-g4v-da0711-aaronliudreams-projects.vercel.app |
| 部署直链 | https://learn-fluent-easy-imw7c78l2-aaronliudreams-projects.vercel.app |

**说明**：Cursor 内置浏览器访问上述 URL 会跳到 Vercel SSO 登录页，**无法在无你 cookie 的环境完成 Preview 实拍**。  
本包「修复后」截图在 **localhost:8081 @ `39c19269` HEAD** 拍摄（与 Preview 同 commit 源码）。

### 深链

- g4v1_u2 Q6: `/primary/hub/4/semester/grade4_volume1/unit/g4v1_u2/stage/6`（连点 5 次正确答案到 6/6）
- g4v1_u1 Q1: `/primary/hub/4/semester/grade4_volume1/unit/g4v1_u1/stage/6`
- g4v2_u2 Q1: `/primary/hub/4/semester/grade4_volume2/unit/g4v2_u2/stage/6`

---

## 1. g4v1_u2 · stage/6 · 第 6/6 题（ghost 下划线）

| | 截图 | 判定依据 |
|---|------|----------|
| **修复前** | `before-g4v1_u2-q6.png` | 父 commit `eeac7b08` 的 `split("____")` 逻辑；本地实拍；a11y 句末为 `___ it is! ____` |
| **修复后** | `after-g4v1_u2-q6-at-39c19269-localhost.png` | `39c19269`；a11y 仅为 `___ it is!`（无尾随 `____`） |

---

## 2. g4v1_u1 · stage/6 · 第 1/6 题（修复后）

`after-g4v1_u1-q1-at-39c19269-localhost.png` — 单空 `___`，无句末幽灵 `____`。

---

## 3. g4v2_u2 · stage/6 · 第 1/6 题（四下 4 下划线 · 无回归）

`after-g4v2_u2-q1-at-39c19269-localhost.png` — 单空 `____`，句末无第二道虚线。

---

## 4. 测试日志文件

| 文件 | 内容 |
|------|------|
| `pnpm-test-fillChoice-verbose.txt` | 本次新增 10 条 `it` 的 **verbose ✓ 逐行** |
| `pnpm-test-full-console.txt` | `npx pnpm@9 test` **完整 console**（含失败栈） |

命令（本机无全局 pnpm，用 npx 等价）：

```bash
npx pnpm@9 test
npx vitest run src/lib/primaryHub/fillChoiceSentence.test.ts --reporter=verbose
```
