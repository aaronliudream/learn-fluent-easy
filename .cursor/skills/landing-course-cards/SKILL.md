---
name: landing-course-cards
description: Maintain Big Moon English homepage course cards with world-university photo backgrounds. Use when editing LandingPage.tsx course section, adding/removing stage cards, or updating public/landing/universities assets.
---

# Landing course cards

## Layout

- File: `src/components/LandingPage.tsx`
- Section id: `#courses`
- Left: 2×2 grid of `CourseCard` links
- Right: `为什么选择 Big Moon English?` only — no extra course card in sidebar

## Card data (`COURSE_CARDS`)

Each entry requires:

| Field | Purpose |
|-------|---------|
| `to` | React Router path |
| `icon` | Lucide icon in glass badge |
| `title` / `desc` / `tag` | Copy (wrap with `<T>` in component) |
| `image` | `/landing/universities/<file>.jpg` |
| `university` | Chinese label pill (e.g. 斯坦福大学) |

Current mapping:

- 小学 → Stanford → `/kids`
- 初中 → Harvard → `/junior`
- 高中 → Oxford → `/gaokao`
- 成人 → Tsinghua → `/levels`

## Visual rules

- Full-bleed photo + `bg-gradient-to-t from-slate-950/90` bottom overlay
- White text; CTA always `去学习`
- Hover: slight lift + image scale
- Do **not** re-add `AI 智能练习` to this grid

## Assets

- Directory: `public/landing/universities/`
- Filenames: `stanford.jpg`, `harvard.jpg`, `oxford.jpg`, `tsinghua.jpg`
- Prefer Unsplash download URLs or design zip assets; verify file size &gt; 50KB
- Iconic landmarks (Unsplash IDs): Stanford Hoover Tower `f5OO7rL6OD8`, Harvard Langdell Hall `T-tVt4xsCdE`, Oxford Radcliffe Camera `mT-D4OLaBHw`, Tsinghua gate `Rph9CCc2P1c`

## Related junior patterns

- `/junior` hero: `src/components/junior/JuniorHero.tsx` (Monet 睡莲)
- `/gaokao` hero: `src/components/gaokao/GaokaoHero.tsx` (Van Gogh 星月夜)
- Junior vocab review: single banner reading `junior_word_mastery` — do not duplicate with `ReviewPool` + smart review
