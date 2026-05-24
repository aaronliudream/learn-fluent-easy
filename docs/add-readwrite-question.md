# Primary Hub — ReadWrite 题目配置指南

读写训练（`readWrite` stage）使用 simplified 格式：一屏一题、5 道选择题。

## 文件位置与命名

| 项 | 规范 |
|----|------|
| 目录 | `src/data/primaryHub/readWrite/` |
| 文件名 | `{unitId}_read_write.json` 或 `{unitId}_stage{N}.json`（推荐前者） |
| 插图资源 | `public/primary/hub/{unitId}/`（推荐，非强制） |

Registry 会从文件名解析 `unitId`；`stageIdx` 可写在 JSON 内（如 `"stageIdx": 6` 对应 s7）。

## 配置根结构

```json
{
  "unitId": "g4v2_u2",
  "stageIdx": 6,
  "title": "读写训练",
  "totalPoints": 5,
  "pointsPerQuestion": 1,
  "questions": []
}
```

## picture_choice 插图：三路径选择（visual / image / 无图）

本项目遵循「**主路径 + escape hatch**」模式（与 `docs/add-new-unit.md` §4.3 一致）：

| 路径 | 字段 | 何时用 |
|------|------|--------|
| **主路径** | `visual` | 优先：可用轻量图示表达，不依赖精确场景细节 |
| **Escape hatch** | `image` | 仅当题目强依赖精确插图（如钟表盘、楼层图、地图） |
| **无图** | `fill_choice` | 纯句子填空，不需要插图 |

> 注意：当前 `ReadWritePictureVisual.tsx` 仅内置 **5 个 u1 专用** `visual` key（`place_books` 等），新 Unit 暂时无法在**零 TS 改动**前提下新增 `visual` key。  
> 因此新 Unit 的实际选择通常是：能不配图就用 `fill_choice`；需要配图则用 `image`。

### 路径 1 — `image`（escape hatch）

```json
{
  "type": "picture_choice",
  "image": "/primary/hub/g4v2_u2/clock_8am.svg",
  "imageAlt": "Wall clock showing eight o'clock",
  "prompt_zh": "现在几点？",
  "hint_zh": "看钟表指针",
  "options": [
    { "text": "It's eight o'clock.", "correct": true },
    { "text": "It's twelve o'clock.", "correct": false }
  ]
}
```

- `image`：站点相对路径（`public/` 下）或绝对 URL（CDN）
- 路径 helper（可选）：`defaultReadWriteImagePath("g4v2_u2", "clock_8am.svg")` → `/primary/hub/g4v2_u2/clock_8am.svg`
- 加载失败：显示带 `imageAlt` 的灰色占位框；DEV 下 console 警告

### 路径 2 — `visual`（u1 遗留内置 SVG）

```json
{
  "type": "picture_choice",
  "visual": "place_books",
  "imageAlt": "Books on shelves — library",
  "prompt_zh": "这是什么地方？",
  "options": []
}
```

内置 key（仅 u1 遗留）：`place_books` | `place_playground` | `floor_building` | `room_row` | `student_count`

### 二选一规则

| 情况 | 行为 |
|------|------|
| 仅 `visual` | 渲染内置 SVG |
| 仅 `image` | 渲染 `<img>` |
| 两者都有 | **`image` 优先**，DEV warn |
| 都没有 | alt 占位框，DEV warn |

## fill_choice 题型

```json
{
  "type": "fill_choice",
  "sentence": "It's ____ o'clock.",
  "hint_zh": "选一个时间词",
  "correctSentence": "It's eight o'clock.",
  "options": [
    { "text": "eight", "correct": true },
    { "text": "twelve", "correct": false }
  ]
}
```

## Unit 2 完整示例片段

```json
{
  "unitId": "g4v2_u2",
  "stageIdx": 6,
  "title": "读写训练",
  "totalPoints": 5,
  "pointsPerQuestion": 1,
  "questions": [
    {
      "type": "picture_choice",
      "image": "/primary/hub/g4v2_u2/clock_8am.svg",
      "imageAlt": "Analog clock with hands at 8:00",
      "prompt_zh": "看图选句子：现在几点？",
      "hint_zh": "短针指向 8，长针指向 12",
      "options": [
        { "text": "It's eight o'clock.", "correct": true },
        { "text": "It's two o'clock.", "correct": false }
      ]
    },
    {
      "type": "fill_choice",
      "sentence": "What time is it? — It's ____ o'clock.",
      "hint_zh": "根据上一题选词",
      "options": [
        { "text": "eight", "correct": true },
        { "text": "eleven", "correct": false }
      ]
    }
  ]
}
```

上线 readWrite JSON 后，对应 Unit 的 s7 自动从「即将上线」占位变为可玩，无需改 TS。
