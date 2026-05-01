---
name: Gaokao section stays in Chinese
description: The Gaokao card on Index and Gaokao pages must always render in Chinese regardless of selected mother language
type: constraint
---
The Gaokao (高考英语) section is built specifically for Chinese high-school students. Its eyebrow, title, and description must ALWAYS be raw Chinese strings — never wrap in `<T>` or pass through `t()`. **Why:** target audience is Chinese students; translating to other languages is wrong/confusing.