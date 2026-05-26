# 四上 U1 Stage 3「学习句型」改造前 Audit

> 只读审计，未改任何代码/数据。分支 `cursor/stage3-audit`。
> 术语：本文「Stage 3」= stages 数组 **index 3** = `type: "sentence"` = 「学习句型」，URL 为 `.../stage/3`。（stage 卡片上的序号是第 4 张，但 0-indexed 的 stage/3，registry 测试也用 `stage 3` 指它。）

---

## 1. Stage 3 数据 schema 在哪？

**关键纠偏：Stage 3 的内容不在 grade4.json 里。** grade4.json 的 stages 数组只存**关卡元数据**（标题/图标/类型），真正的句型内容在独立文件 `src/data/primaryHub/sentence/g4v1_u1_grammar.json`，由 `sentenceRegistry` 用 `import.meta.glob` 自动发现。

- grade4.json `g4v1_u1.stages[3]`（仅元数据）：
```json
{ "id": "s4", "title": "学习句型", "subtitle": "新教室·打扫 · 歌谣跟读", "icon": "...", "type": "sentence", "time": "..." }
```
- grade4.json `g4v1_u1` 里还有一个 `dialogues` 字段（A/B Let's talk）——**那是旧版 fallback 组件 `SentenceStage` 用的，不是当前 Stage 3 的内容源**（见 Q2）。别把它当成 Stage 3 数据。

**真实内容源** `src/data/primaryHub/sentence/g4v1_u1_grammar.json` 的 schema：顶层 `lessonId / unitId / stageIdx(=3) / title / transitionMessage / subModules[]`；每个 subModule = `id / title / description / color / estimatedMinutes / lockedUntil? / sentences[]`；每个 sentence = `id / question{en,zh} / answer{en,zh}|null / tag`。

- **没有** `audio_url`，**没有** `answer_en/answer_cn`（中英文是嵌套的 `question:{en,zh}` / `answer:{en,zh}`）。`answer` 可以是 `null`（如 B3「Thank you」无应答）。
- g4v1_u1 共 2 个 submodule：A（4 句）+ B（4 句，含 1 句 Let's chant 歌谣，id `C1`）。

真实数据片段（A 模块前两句 + B 模块的 null answer + 歌谣）：
```json
{
  "lessonId": "g4v1_u1_grammar", "unitId": "g4v1_u1", "stageIdx": 3, "title": "学习句型",
  "subModules": [
    { "id": "A", "title": "新教室 · What's in the classroom?", "color": "blue", "estimatedMinutes": 4,
      "sentences": [
        { "id": "A1", "question": { "en": "We have a new classroom.", "zh": "我们有一间新教室。" },
          "answer": { "en": "Really? What's in the classroom?", "zh": "真的吗？教室里有什么？" }, "tag": "A Let's talk" }
      ] },
    { "id": "B", "title": "打扫教室 · Let's clean", "color": "pink", "estimatedMinutes": 5, "lockedUntil": "A",
      "sentences": [
        { "id": "B3", "question": { "en": "Thank you.", "zh": "谢谢。" }, "answer": null, "tag": "B Let's talk" },
        { "id": "C1", "question": { "en": "What's in your new classroom? Four walls and a floor,", "zh": "...（歌谣）" },
          "answer": { "en": "Pictures and windows, and a yellow door!", "zh": "...（歌谣）" }, "tag": "Let's chant · 歌谣" }
      ] }
  ]
}
```

---

## 2. Stage 3 渲染组件在哪？

- 文件：**`src/components/primaryHub/SentenceLessonStage.tsx`**（387 行）。
- **不是共用组件**。每种 stage 类型在 `PrimaryHubStagePlay.tsx` 的 `switch (stage.type)` 里各有专属组件（VocabStage / MatchStage / FinalQuizStage…）。Stage 3 命中 `case "sentence"`：
```tsx
// src/pages/primaryHub/PrimaryHubStagePlay.tsx:1123
case "sentence":
  return sentenceLesson ? (
    <SentenceLessonStage lesson={sentenceLesson} unitId={unitId} stageIdx={stageIdx}
      grade={grade} onFinish={handleFinish} onProgress={reportStageProgress}
      onRegisterBack={registerSentenceBack} />
  ) : (
    <SentenceStage dialogues={unit.dialogues} ... />   // 旧版 fallback：无 grammar JSON 时才用
  );
```
  → g4v1_u1 有 grammar JSON，所以走 **SentenceLessonStage**；`SentenceStage`（吃 `unit.dialogues`）是历史 fallback，g4v1_u1 不走它。
- props：`lesson, unitId, stageIdx, grade, onFinish, onProgress, onRegisterBack`（**注意：没有 `onAwardPoints`/`addStar`**，见 Q4）。
- state：`view: "pick"|"module"|"transition"`、`activeModule`；**每句完成进度记在全局 state 的 `units[unitId].sentenceCompleted: string[]`**（按 sentence id），不在组件本地。
- **强耦合：组件写死 2 个 submodule**：
```tsx
// SentenceLessonStage.tsx:171
const modA = lesson.subModules[0];
const modB = lesson.subModules[1];
// ...:320  const aCount = modA ? countSubmoduleDone(modA, completed) : 0;
//          const bCount = modB ? countSubmoduleDone(modB, completed) : 0;
```
  A/B 双卡 + B `lockedUntil:"A"` 解锁流是写死的。改成 ≠2 个 submodule 必须同步改组件。

---

## 3. 音频文件怎么组织？

**没有逐句音频文件。Stage 3 用 TTS（文字转语音），不是音频资源。**

- 发音调用：`hubSpeakAtSpeed(text, speed, grade)`（`src/lib/primaryHub/speech.ts`）→ 优先 Web Speech API（`speakWebSpeech`），失败回退云端 TTS（`speakKid`）。
- **慢/正常/快 = 同一句 TTS 的 `rate` 参数，不是 3 个文件、也不是 `<audio>` 的 playbackRate**：
```ts
// src/lib/primaryHub/hubSpeakSpeed.ts:7
export const HUB_SPEAK_SPEED_LEVELS = [
  { value: 0.7, label: "慢速" }, { value: 0.85, label: "正常" }, { value: 1.0, label: "快速" },
];
export const HUB_SPEAK_SPEED_KEY = "primary_hub_speak_speed"; // localStorage，全 hub 共用
```
- 仓库里 Stage 3 用到的音频文件数 = **0**。`public/audio/` 下只有 `hub/oclock.mp3`（时钟音效，与句型无关）和 `primary/`，均非 Stage 3 句子音频。
- 含义：改造时**不需要也没有**逐句录音资源；speed 是全局 localStorage 设置（一处改、全 hub 生效）。

---

## 4. ⭐ 积分系统怎么实现？

**state 位置**：`PrimaryHubPersist.units[unitId].stars`（per-unit 整数），持久化到 localStorage key **`primary_hub_v1_<grade>`**（`STORAGE_PREFIX = "primary_hub_v1_"`，`src/lib/primaryHub/storage.ts`）。也会在登录时云同步（`hubCloudSync` / 合并取 `max(stars)`）。

**两条加分路径**（`PrimaryHubStagePlay.tsx`）：
```tsx
// 每答对一次 +1（quiz/match/listen 的 onCorrect/onMatch/onAwardPoints 才用）
const addStar = ... { units[unitId].stars = current.stars + 1; savePersist(...) };
// 完成一关 +5（首次完成该 stage 才加，幂等）—— context.tsx:229
if (!completed.includes(stageIdx)) { completed.push(stageIdx); us.stars += 5; }
```

**Stage 3 当前怎么累计**：SentenceLessonStage **没有** addStar/onAwardPoints，只在 `onFinish → handleFinish → completeStage(unitId, 3)` 时拿到**一次性 +5**（首次完成）。逐句跟读**不加分**，只写 `sentenceCompleted` 和 `stageProgress[3]`（封顶 99，完成时才由 completeStage 清零并标记）。所以 **Stage 3 目前 = 完成 +5，无逐句分**。

**跟其他 stage 是同一个系统吗**：是。`stars` 是 **per-unit 单一计数器**，所有 stage 共用同一个 `units[unitId].stars`。「87 ⭐」是跨 unit 求和的总数。

**改 Stage 3 积分会不会影响别的 stage**：
- ✅ **安全**：只给 Stage 3 接一个新的 addStar 式回调（逐句加分）是**叠加且隔离**的——其他 stage 各自调自己的 addStar/completeStage，不受影响。
- 🔴 **危险**：若去动 `completeStage` 里的 `+5` 或 `stars` 字段语义、或 STORAGE_PREFIX，会**一次性影响所有 stage / 所有 unit / 已存档的 87⭐**。改造应只新增 Stage 3 的加分调用，不碰共用的 completeStage/stars 机制。

---

## 5. 有没有分支正在改 Stage 3？

**没有在途分支。** `git log --all --not main` 对 Stage 3 相关文件（`SentenceLessonStage.tsx` / `sentenceRegistry.ts` / `sentence/*.json` / `sentenceTypes.ts`）查询结果为**空**——即所有 Stage 3 相关改动都已并入 main，无未合并工作。

`git branch -a` 里 `cursor/g4v2-u1-sentence-submodules`、`cursor/g4v1-content` 等名字相关，但对上述文件 **`main..<branch>` 无领先提交**（已合并/无独有改动）。

近 30 天涉及 Stage 3 文件的（均已在 main 的）提交：
```
52590516 Split g4v2_u1 sentence stage into A/B submodules with unlock flow   ← A/B 双模块 + 解锁流来源
80bd106a Fix mismatched LessonPanel closing tag in SentenceLessonStage
a901dfcc Add Unit 1 sentence TTS speed control ...
b8284434 Auto-discover primary hub sentence, phonics, and read-write configs ← registry 自动发现来源
fef1ea57 feat(primary-hub): generalize TTS speak speed across units
c237bab6 feat(primary-hub): g4v1_u1 My classroom full content (template unit) ← g4v1_u1 grammar.json 来源
0e19737b feat(primary-hub): g4v1_u2 My schoolbag full content ...
```
→ 改造可直接从 main 起分支，无冲突风险。

---

## 6. 测试相关

涉及 Stage 3 / sentence 的测试（`src/lib/primaryHub/registry.test.ts`）：
```ts
it("loads g4v1_u1 grammar lesson at stage 3", () => {
  const lesson = getSentenceLesson("g4v1_u1", 3);
  expect(lesson?.lessonId).toBe("g4v1_u1_grammar");
  expect(lesson?.subModules).toHaveLength(2);          // ← 写死 2 个 submodule
});
it("loads g4v2_u1 grammar lesson at stage 3", () => {   // g4v2_u1 还额外断言结构
  expect(lesson?.subModules[0].id).toBe("A");
  expect(lesson?.subModules[1].lockedUntil).toBe("A");
});
it("discovers sentence lessons for g4v1 u1–u2 and g4v2 u1–u6", () => {
  expect(__getSentenceLessonsForTest()).toHaveLength(8); // ← grammar 文件总数 8
});
```
另有 `isSentenceLessonConfig`（sentenceRegistry.ts）运行时校验：要求 `lessonId` 为 string 且 `subModules` 非空数组；`sentenceTypes.ts` 是编译期 TS 类型 `SentenceLessonConfig`。

**改 Stage 3 schema 会触发的测试/类型改动**：
- submodule 数从 2 变 → `toHaveLength(2)`（g4v1_u1）失败 + 组件 `modA/modB` 写死处要改。
- 新增/删除 grammar 文件 → `toHaveLength(8)` 失败。
- 改字段名/结构（如 question/answer 形状、新增字段）→ 要同步 `SentenceLessonConfig` 类型 + `isSentenceLessonConfig` 校验；动到 A/lockedUntil 命名会撞 g4v2_u1 的结构断言。
- 不涉及 readWrite 的 `fillChoice*` 测试、不涉及 finalQuiz 题数断言（那些是别的 stage）。改 Stage 3 **不**碰 registry.test 里 readWrite 的 `toHaveLength` 题数断言。

---

## 7. 给内容窗口的建议（容易踩坑处）

1. **改对文件**：Stage 3 内容在 `src/data/primaryHub/sentence/g4v1_u1_grammar.json`，**不是 grade4.json**。它由 `import.meta.glob` 自动发现，**没有 patch 脚本**（不像 unit.json→grade4 那套）；直接编辑该 JSON 即可，但命名要守 `g4v1_uN_grammar.json` 且 JSON 内 `unitId/stageIdx` 要和文件名解析一致（否则 registry 告警并以解析值为准）。
2. **别和 grade4 的 `dialogues` 字段搞混**：那是旧 `SentenceStage` fallback 的数据，当前 Stage 3 不读它。两条代码路径并存。
3. **2-submodule 是写死的**：组件 `modA/modB`、`aCount/bCount`、解锁流，加上 registry 测试 `toHaveLength(2)`、g4v2_u1 的 `subModules[1].lockedUntil==="A"`。要改成 1 个或 3+ 个模块，必须**组件 + 类型 + 测试三处同步**。
4. **没有音频资源**：慢/正常/快是 TTS `rate`（0.7/0.85/1.0）、全局 localStorage 设置。别按"3 个音频文件 / playbackRate"设计；要逐句不同语速以外的音频能力得新接 TTS 或录音，属新工程。
5. **积分只动 Stage 3、别碰共用机制**：Stage 3 现为"完成 +5、无逐句分"。要加逐句积分，新增一个 Stage-3 专用加分回调即可（隔离、安全）；**绝不要**改 `completeStage` 的 `+5`、`units[].stars` 语义或 `primary_hub_v1_` key——那会动到全部 stage/unit 和已存档的 87⭐，且需云同步迁移。
6. **`answer` 可为 null**：B3「Thank you」就是 `answer:null`。任何新渲染/计分逻辑要处理无应答句。
7. **进度按 sentence id 存档**：完成记录是 `units[unitId].sentenceCompleted=[ "A1","A2",...,"C1" ]`。**改 sentence 的 id 会让已存档进度对不上**（孩子已完成的句子被判未完成）。若必须改 id，要考虑迁移。
8. **stageProgress[3] 封顶 99**：跟读中途进度封顶 99，`completeStage` 时才清零并标 100/完成。完成模型有耦合，改交互流要保持这套约定，否则关卡显示"永远差一点"。
9. **从最新 main 起分支**：Stage 3 相关无在途分支（Q5），直接 main 拉新分支即可，无需 rebase 其他人。
