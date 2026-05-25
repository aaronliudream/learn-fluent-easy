# yak-shaving 登记（主线之外发现、暂不处理）

- 锁文件不一致:bun.lockb + package-lock.json 共存、无 pnpm-lock.yaml(npm install / npm test 实际可跑);四上完成后单独清理。
- `src/i18n/__tests__/slangLocalization.test.tsx` 10 个用例失败,源自 I18nProvider 调 `supabase.auth.getSession()`(jsdom/env 相关),与 readWrite 换行修复无关,预存在;另行处理。
