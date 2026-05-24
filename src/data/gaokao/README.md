# 高中 PEP 内容（人教版 7 册）

## 工作流

```bash
pip install pdfplumber
npm run pep:refresh   # extract all PDFs → build pep-bundle.json
```

## 文件

| 文件 | 说明 |
|------|------|
| `catalog.json` | 语法模块/分类（UI taxonomy） |
| `pep-bundle.json` | **源数据**：语法/阅读/词汇/写作/听力/完形（7 册 PDF 自动生成） |
| `grammarQuestions.ts` / `readingArticles.ts` | 从 bundle 再导出 |

## 年级 ↔ 教材

- **高一** `g1`: 必修第一册、必修第二册
- **高二** `g2`: 必修第三册、选择性必修第一册
- **高三** `g3`: 选择性必修第二、三、四册

## Bundle 模块统计（`npm run pep:build` 后见 `stats`）

- 词汇 ~980（每册约 140 词，课文句抽取）
- 阅读/完形/听力 各 21/21/20（每篇阅读 1 套）
- 写作 14（每册 2 题）
- 语法 21 点 × ~20 题

## 仍使用 Supabase / 未迁移

- **高考真题** (`GaokaoExam`) — 未做 PEP 种子
- 用户进度（完形提交、错题本、掌握度）仍写 Supabase；PEP 完形在本地评分
- 听力无原版录音，使用浏览器 **TTS** 朗读课文脚本
