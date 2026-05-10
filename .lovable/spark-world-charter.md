# Spark World Charter

_Last updated: 2026-05-10. Every change to /primary/* must point to one of these three rules._

## 1. Product essence (locked)

这是一个**陪伴型学习世界**(B),不是 AI 英语功能集合(A)。
Spark 是主角,学习是孩子陪 Spark 长大的方式。

所有产品决策必须先过这一问:**"这件事让 Spark 更在场,还是更不在场?"**
如果答案是"让 Spark 更不在场",不做。

## 2. Delete list (functional but kills the world)

- `Primary.tsx` 的 6 个年级九宫格 → 年级是后台数据,孩子不该选。
- `PrimaryGrade.tsx` 的 6 个能力按钮入口(游戏/听力/阅读/词汇/文化/Spark) → 能力维度是家长视角,孩子只看"今天和 Spark 做什么"。
- `PrimaryGrade.tsx` 的"今日 10 词挑战"独立卡 → 并入冒险流的一步,不再是独立入口。

## 3. Keep list (the 4 学习引擎不动)

- `PrimaryLesson.tsx` 课时引擎
- `PrimaryReadingPlay.tsx` 绘本引擎
- `PrimaryVocab.tsx` 词汇引擎
- `PrimaryGames.tsx` 游戏引擎

这 4 个组件**只改包装、文案、入口**,不改内部逻辑。新需求一律先问"能不能塞进这 4 个里",不能再造第 5 个。

## 4. 工程纪律

- 每个 PR 描述里写明:对应章程第几条,是哪个阶段。
- 冒出"不如顺手做个新功能"的念头 → 写到 `.lovable/backlog.md`,本周不做。
- 阶段 1-3(入口 → 流 → 反馈)按顺序做,顺序倒了会返工。