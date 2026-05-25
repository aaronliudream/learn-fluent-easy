# readWrite fill_choice 换行修复验收包 · 分支 `cursor/readwrite-wrap-fix`

## 改了什么

方案 A:把填空句拆成「外层正常换行文本」+「不可断组(空格前 1 词 + 空格 + 空格后内容)」。
空格不再单独换行到行首/行尾,长句仍自然换行。

| 文件 | 说明 |
|----|-----|
| `src/lib/primaryHub/fillChoiceDisplay.ts` | 新增 `buildFillChoiceGlueParts` —— 计算 `outerBefore / glueBefore / glueAfter / outerAfter`,句末标点后不把末词拉进 nowrap 组 |
| `src/lib/primaryHub/fillChoiceDisplay.test.ts` | 新增 5 条单测(含句末标点、长句、四下 4 下划线) |
| `src/components/primaryHub/ReadWriteTrainingStage.tsx` | `FillChoiceBody` 改用 `buildFillChoiceGlueParts` + 新 `FillChoiceBlankSpan`;`<p>` 外层 `text-left sm:text-center`,nowrap 组用 `whitespace-nowrap` 包裹 |

## 拍摄环境

| 项 | 值 |
|----|-----|
| 分支 | `cursor/readwrite-wrap-fix` |
| 来源 | **localhost:8080** 本地实拍(系统 Chrome via CDP) |
| Viewport | **390×844**(iPhone 12 Pro 宽度,DevTools device emulation 等价) |
| 包管理器 | npm(`npm install` / `npm run dev` / `npm test`) |

### 深链(localhost,guest 模式,连点正确答案到目标题)

- U1 Q3:`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u1/stage/6`(答对 Q1 Q2 → 停在 Q3)
- U2 Q6:`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u2/stage/6`(答对 Q1–Q5 → 停在 Q6)
- g4v2_u5 Q6:`/primary/hub/4/semester/grade4_volume2/unit/g4v2_u5/stage/6`(答对 Q1–Q5 → 停在 Q6)

---

## 1. g4v1_u1 · stage/6 · 第 3/6 题

`after-g4v1_u1-q3-390px.png` — 题号 **3/6** 已核对。句子 `John can't find his book. It's ___ the window.`
nowrap 组 = `It's ___ the window.`,空格不再孤悬。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">John can't find his book. <span class="whitespace-nowrap">It's <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> the window.</span></p>
```

## 2. g4v1_u2 · stage/6 · 第 6/6 题

`after-g4v1_u2-q6-390px.png` — 题号 **6/6** 已核对。句子 `The staff finds the bag. She says: ___ it is!`
nowrap 组 = `She says: ___ it is!`(冒号后保留 ≥2 词 glue)。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">The staff finds the bag. <span class="whitespace-nowrap">She says: <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> it is!</span></p>
```

## 3. g4v2_u5 · stage/6 · 第 6/6 题(长句无回归)

`after-g4v2_u5-q6-390px.png` — 题号 **6/6** 已核对。长句前文正常逐行换行,nowrap 组只 = `not ___ .`。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">Mike's pants are green. Amy sees green pants with a Dad label. Whose pants are these? They're your father's, <span class="whitespace-nowrap">not <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> .</span></p>
```

---

## 4. 测试日志

| 文件 | 内容 |
|------|------|
| `npm-test-full-console.txt` | `npm test` 完整 console |
| `capture-console.txt` | CDP 截图脚本输出(三题 `ok=true` + DOM 片段) |
| `acceptance-helper.js` | 浏览器/CDP 控制台辅助函数(取题号、DOM、点选项) |

- `fillChoice` 两个测试文件 **15 用例全过**(`fillChoiceDisplay` 5 + `fillChoiceSentence` 10)。
- 全量 `npm test`:**99 通过 / 10 失败**,失败全在 `src/i18n/__tests__/slangLocalization.test.tsx`(`I18nProvider → supabase.auth.getSession()`,jsdom/env 相关),与本修复无关,预存在 —— 见 `docs/notes/yak-shaving.md`。

命令:

```bash
npm install
npm run dev          # localhost:8080
npm test
```
