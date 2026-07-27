# yak-shaving 登记（主线之外发现、暂不处理）

- 锁文件不一致:bun.lockb + package-lock.json 共存、无 pnpm-lock.yaml(npm install / npm test 实际可跑);四上完成后单独清理。
- `src/i18n/__tests__/slangLocalization.test.tsx` 10 个用例失败,源自 I18nProvider 调 `supabase.auth.getSession()`(jsdom/env 相关),与 readWrite 换行修复无关,预存在;另行处理。
- 本地 bundle 完形篇目质量存疑(2026-07-26 记):`src/data/gaokao/pep-bundle.json` → `clozePassages` 共 21 篇,首篇 `28b9b6ee-fff8-59d7-b56a-17a2b52b07c5` 正文为 `__1__ the __2__ that __3__ how you __4__.` 这类近乎全挖空文本,疑生成事故。需与 `gaokao_cloze_passages` 表内篇目对照抽查。与「词汇题语义对应铁律」的回溯审计(`docs/junior/BASELINE_junior_pep_latest.md` D-10)并列,等高中部分稳定后一起处理。发现于完形错题本空号改造调查,与该改造无关。
