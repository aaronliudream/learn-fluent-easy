# Project Memory

## Core
高考词汇浏览**绝不能按字母排序**。默认排序 = freq_rank↑ → exam_frequency↓ → star_level↓ (Zipf + Nation 2013)。
浏览页提供 4 个科学 Tab：🔥 高频优先 / 📚 CEFR 阶梯 / 🎨 主题词群 / 🎯 高考考点。
中文是高考板块唯一展示语言（见 mem://constraints/gaokao-chinese-only）。
Tailwind 颜色 class 必须静态（用 COLOR_CLASSES 映射），动态拼接会被 purge。

## Memories
- [Gaokao Chinese only](mem://constraints/gaokao-chinese-only) — 高考所有 UI 文案仅中文
