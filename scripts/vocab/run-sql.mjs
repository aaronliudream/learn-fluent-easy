/**
 * 直连生产库跑 SQL 文件 —— 用 `pg`,不依赖本机装 psql。
 *
 * ── ⚠️ 这是本仓库唯一一处会**写生产库**的脚本 ────────────────────
 * 长期铁律是"改库 SQL 一律由 Aaron 在 Dashboard 跑,CC 只 anon 只读验"
 * (见 db-and-forbidden-iron-rules)。Aaron 2026-08-09 明确改了这条,
 * 授权我用 `DATABASE_URL` 直连来跑词库灌装。**这是他的决定,不是我自己放开的。**
 * 其余铁律不变:事务包裹、前后计数、断言不过就回滚。
 *
 * ── 凭据处理 ────────────────────────────────────────────────────
 * · 只从 `process.env.DATABASE_URL` 或 `.env.local` 读,**绝不写进任何输出**;
 * · 打印时一律脱敏成 `host/dbname`,不带用户名密码;
 * · `.env.local` 已加进 .gitignore(`.env` 只匹配确切文件名,不覆盖 `.env.local`——
 *   2026-08-09 差点让连接串进版本库,已补 `.env*.local` 通配)。
 *
 * ── 安全做法 ────────────────────────────────────────────────────
 * · **默认 dry-run**:只连库、跑 `BEGIN` 再 `ROLLBACK`,验证语法与权限,不落盘。
 *   要真写必须显式 `--commit`。
 * · SQL 文件自带 `BEGIN;…COMMIT;` 时,本脚本不再另包一层(会嵌套报错),
 *   而是**把文件里的 COMMIT 换成 ROLLBACK** 来做 dry-run。
 * · 每条语句的返回都打出来,便于核对 BEFORE/AFTER 计数与断言。
 *
 * 用法:
 *   node scripts/vocab/run-sql.mjs SQLAA/xxx.sql              # dry-run(默认)
 *   node scripts/vocab/run-sql.mjs SQLAA/xxx.sql --commit     # 真跑
 */
import { readFileSync, existsSync } from "node:fs";
import pg from "pg";

const file = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!file) { console.error("用法: node scripts/vocab/run-sql.mjs <file.sql> [--commit]"); process.exit(1); }
if (!existsSync(file)) { console.error(`文件不存在: ${file}`); process.exit(1); }

/** 从环境变量或 .env.local 取连接串。⚠️ 取到之后**只用不打印**。 */
function connString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL.trim();
  for (const f of [".env.local", ".env"]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
      const i = line.indexOf("=");
      if (i > 0 && line.slice(0, i).trim() === "DATABASE_URL") {
        return line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return "";
}

const conn = connString();
if (!conn) {
  console.error(`✗ 没找到 DATABASE_URL。

  把它放进 ${process.cwd()}\\.env.local(该文件已被 .gitignore 忽略):
      DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres

  ⚠️ 别贴进聊天记录,也别进仓库。`);
  process.exit(1);
}

/** 脱敏:只留 host 和库名,绝不回显用户名/密码。 */
function safeLabel(u) {
  try { const x = new URL(u); return `${x.hostname}${x.port ? ":" + x.port : ""}${x.pathname}`; }
  catch { return "(连接串格式无法解析)"; }
}

let sql = readFileSync(file, "utf8");
const selfTx = /^\s*BEGIN\s*;/im.test(sql);

if (!COMMIT) {
  if (selfTx) {
    /* 文件自带事务 → 把最后的 COMMIT 换成 ROLLBACK,其余原样跑。
       ⚠️ 只换**最后一个**,文件中间若有 COMMIT 说明它不是单事务,直接拒跑。 */
    const hits = [...sql.matchAll(/^\s*COMMIT\s*;/gim)];
    if (hits.length !== 1) {
      console.error(`✗ 文件里有 ${hits.length} 个 COMMIT,不是单事务,dry-run 无法安全改写。请人工确认后用 --commit。`);
      process.exit(2);
    }
    sql = sql.replace(/^\s*COMMIT\s*;/im, "ROLLBACK;");
  } else {
    sql = `BEGIN;\n${sql}\nROLLBACK;`;
  }
}

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
console.log(`· 目标 ${safeLabel(conn)}`);
console.log(`· 文件 ${file}(${(sql.length / 1024).toFixed(0)} KB)`);
console.log(`· 模式 ${COMMIT ? "**真写(--commit)**" : "dry-run(自动 ROLLBACK,不落盘)"}\n`);

const t0 = Date.now();
try {
  await client.connect();
  const res = await client.query(sql);
  const list = Array.isArray(res) ? res : [res];
  for (const r of list) {
    if (r.command === "SELECT" && r.rows?.length) {
      console.log(`— SELECT (${r.rows.length} 行)`);
      for (const row of r.rows.slice(0, 20)) console.log("   ", JSON.stringify(row));
    } else if (["INSERT", "UPDATE", "DELETE"].includes(r.command)) {
      console.log(`— ${r.command} 影响 ${r.rowCount} 行`);
    }
  }
  console.log(`\n✓ 执行完成,用时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (!COMMIT) console.log("⚠️ 这是 dry-run,**已回滚,库里没有任何改动**。确认无误后加 --commit 再跑一次。");
} catch (e) {
  /* ⚠️ 错误里可能带 SQL 片段但不会带连接串;仍然只打 message/位置,不打整条 stack 里的 config */
  console.error(`\n✗ 失败:${e.message}`);
  if (e.position) console.error(`   位置 offset ${e.position}`);
  if (e.detail) console.error(`   detail ${e.detail}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
