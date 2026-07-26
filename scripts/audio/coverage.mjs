/**
 * 覆盖率哨兵（无副作用，可被单测直接 import）。
 *
 * dataRoots 解决了"新子目录不在扫描范围"，但它本身又是个单点：
 * 新建一个**不在 dataRoots 内**的顶层内容目录，扫描器压根不知道它存在。
 * 于是再加一层反向哨兵：枚举 contentParents 下的**实际条目**，
 * 每个都必须落在 dataRoots 内，或在 outOfScope 里被显式声明。
 */
import fs from 'node:fs';
import path from 'node:path';

const norm = (p) => String(p).replace(/\\/g, '/').replace(/\/+$/, '');

/**
 * @returns {string[]} 游离条目（既不在 dataRoots，也不在 outOfScope）的仓库相对路径
 * @throws 配置缺 contentParents 时抛错——哨兵不允许"没声明就等于通过"
 */
export function strayUnderContentParents(cfg, repoRoot) {
  const parents = cfg?.contentParents;
  if (!Array.isArray(parents) || parents.length === 0) {
    throw new Error(
      '配置缺 contentParents：反向哨兵需要显式声明内容父目录。' +
      '缺了就等于哨兵永远通过 —— 那正是它要防的失败模式。',
    );
  }
  const roots = (cfg.dataRoots ?? []).map(norm);
  const allowed = (cfg.outOfScope ?? []).flatMap((o) => o.paths ?? []).map(norm);

  const stray = [];
  for (const p of parents.map(norm)) {
    const abs = path.join(repoRoot, p);
    if (!fs.existsSync(abs)) continue;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = `${p}/${e.name}`;
      const inRoot = roots.some((r) => rel === r || rel.startsWith(`${r}/`) || r.startsWith(`${rel}/`));
      const declared = allowed.some((a) => rel === a || rel.startsWith(`${a}/`));
      if (!inRoot && !declared) stray.push(rel);
    }
  }
  return stray.sort();
}
