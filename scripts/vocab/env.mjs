/**
 * 共用的 env 载入(generate-content / generate-audio 都用这个)。
 *
 * ⚠️ 为什么要探多个目录:`.env` 在 .gitignore 里,只存在于主工作树。
 *    本分支跑在独立 worktree(C:\Projects\learn-fluent-easy-vocab)时,
 *    自己目录下没有 .env,必须回落到主工作树去读,否则 VITE_SUPABASE_URL
 *    是 undefined,报一句没头没尾的 "Invalid URL"。
 *
 * 优先级:进程环境变量 > --env-dir=<路径> > 本仓库根 > 主工作树。
 * 载入后会打印实际用的是哪个文件,别让来源变成黑箱。
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export function loadEnv(repoRoot, { quiet = false } = {}) {
  const out = { ...process.env };
  const cliDir = process.argv.find(a => a.startsWith('--env-dir='))?.split('=').slice(1).join('=');

  const dirs = [
    cliDir,
    repoRoot,
    path.resolve(repoRoot, '..', 'learn-fluent-easy'),   // 主工作树
  ].filter(Boolean);

  const used = [];
  for (const dir of dirs) {
    for (const f of ['.env.local', '.env']) {
      const p = path.join(dir, f);
      if (!existsSync(p)) continue;
      let added = 0;
      for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
        if (!line.includes('=') || line.trim().startsWith('#')) continue;
        const i = line.indexOf('=');
        const k = line.slice(0, i).trim();
        if (out[k] !== undefined) continue;                // 先到先得,不覆盖
        out[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
        added++;
      }
      if (added) used.push(`${p} (+${added})`);
    }
  }
  if (!quiet) process.stdout.write(`· env: ${used.length ? used.join(', ') : '仅进程环境变量'}\n`);
  return out;
}

/** 缺 key 时给出可执行的下一步,而不是干巴巴一句 undefined。 */
export function requireKeys(env, keys) {
  const missing = keys.filter(k => !env[k]);
  if (!missing.length) return;
  throw new Error(
    `缺少环境变量:${missing.join(', ')}\n` +
    `  解法(任选其一):\n` +
    `    1) 写进主工作树的 .env.local\n` +
    `    2) 当次注入:  OPENAI_API_KEY=sk-xxx node <脚本>\n` +
    `    3) 指定目录:  node <脚本> --env-dir=D:/somewhere\n` +
    `  注:OPENAI_API_KEY 目前只存在于 Supabase edge secrets(Deno.env),本地磁盘上没有。`
  );
}
