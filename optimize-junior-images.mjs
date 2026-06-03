// 初中专区背景图优化脚本（一次性，交 Claude Code 在项目根目录跑）
// 用法：
//   1) 先把 8 张源图重命名为下面的 ASCII 名（见聊天里的对照表），扩展名 png/jpg 均可
//   2) npm i -D sharp
//   3) node optimize-junior-images.mjs
// 产物：同目录下 *.webp（代码里改成引用 .webp）

import sharp from 'sharp';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIR = 'public/images/junior';

// 每个插槽的最大宽度 + WebP 质量（高度按比例自适应）
const slots = {
  'hero':           { maxW: 2000, q: 82 }, // 顶部横幅
  'banner-sync':    { maxW: 1800, q: 82 }, // 课堂同步 banner
  'card-vocab':     { maxW: 1000, q: 80 },
  'card-grammar':   { maxW: 1000, q: 80 },
  'card-reading':   { maxW: 1000, q: 80 },
  'card-listening': { maxW: 1000, q: 80 },
  'card-writing':   { maxW: 1000, q: 80 },
  'card-exam':      { maxW: 1000, q: 80 },
};

const exts = ['.png', '.jpg', '.jpeg'];
let total = 0;

for (const [name, cfg] of Object.entries(slots)) {
  const src = exts.map((e) => path.join(DIR, name + e)).find(existsSync);
  if (!src) {
    console.warn(`跳过（未找到源图）: ${name}`);
    continue;
  }
  const out = path.join(DIR, `${name}.webp`);
  const info = await sharp(src)
    .resize({ width: cfg.maxW, withoutEnlargement: true })
    .webp({ quality: cfg.q })
    .toFile(out);
  total += info.size;
  console.log(`${name}.webp  ${(info.size / 1024).toFixed(0)} KB  ${info.width}x${info.height}`);
}

console.log(`\n合计: ${(total / 1024 / 1024).toFixed(2)} MB`);
