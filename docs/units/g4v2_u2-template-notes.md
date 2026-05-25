# g4v2_u2 · Unit 2 样板说明

## Phonics（任务 4b 前跳过）

Unit 2 Let's spell：**ir / ur** — girl, bird, nurse, hamburger, dirt, birth, hurt, number.

未接入 `phonics/g4v2_u2_*.ts`；认识单词关无拼读 Tab。

## 口语语速（hubSpeakSpeed）

全 Hub 默认 **0.85**（`hubSpeakSpeed.ts`），句型关顶部可调。本 Unit 无单独 JSON 字段。

## 题干文案（finalQuiz · 无音频选择题）

| 场景 | 标准题干 | 说明 |
|------|----------|------|
| **看中文选英文** | `看中文选词：「{中文释义}」` | finalQuiz / 无 `audio` 字段；**禁止**写「听意思选词」 |
| **真听音选词** | s2 `listenWord` | UI 为「🎧 听一听，是哪个单词？」+ 🔊 播英文 TTS |
| **真听音选句** | s6 `listenSent` | UI 为「🎧 听一听，是哪一句？」+ 🔊 播 `listeningQuestions[].audio` |

`FinalQuizStage` 只渲染 `q` 文字，**不会**播放题干音频。

## 出题铁律（finalQuiz · Unit 2–6 必守）

1. **题干不得含正确答案的英文原词**（释义题用中文描述，不用「「tomato」的意思是？」式自指）
2. **干扰项必须同语义场**（餐点 vs 餐点、许可回答 vs 许可回答、蔬菜 vs 蔬菜）
3. **学生必须需要思考才能答对**（自检：闭眼能不能蒙对？）
4. **干扰项要「似是而非」**（不能掺明显无关项如把 English class 放进餐点题）
5. **对话/情境题必须明确角色**：用了谁问谁答、谁对谁说的情境时，题干要写清双方；不能让学生猜「这句话是谁说的」。
   - 反例：「外面很冷，妈妈不让出门。选合适回答」——妈妈已表态，选项又是妈妈口吻，角色颠倒。
   - 正例：「小明问妈妈：Can I go outside now? 妈妈会怎么回答？」

6. **情境/填空题须有可推理线索**（readWrite `fill_choice`、finalQuiz 同理）：题干必须给出能排除干扰项的信息，不能让学生只靠背课文原句或猜。
   - 反例：「麦克唐纳先生的 ___」选项 farm / garden 都成立。
   - 正例：「Cows, hens and sheep live here. Mr MacDonald's ___」→ 有动物只能是 farm。

7. **中文题干须自然，场景须一致**（finalQuiz / readWrite / 句型关中文同理）：
   - 中文须符合母语者习惯，**禁止**按英文句式逐字硬译（如把 how are 译成「……今天怎么样？」指价格/贵贱）。
   - 涉及**货币、地点、角色**时，须符合 PEP 课本设定（四下人物在中国场景：价钱用 **元 / yuan**，勿混用美元场景除非课文明确）。
   - 自检：读题干出声，是否像小学语文老师会写的提示？

## 跨 Unit 复现钩子（finalQuiz）

`quizQuestions[].point` 使用前缀，供 Unit 3–6 选题脚本或人工挑题：

| point 前缀 | 含义 |
|------------|------|
| `u2:recall_vocab` | 可回考的核心词义 |
| `u2:recall_time` | 整点 / What time is it? |
| `u2:recall_routine` | time for / time to 作息句 |

Unit 3+ 的 `finalQuiz` 可混入 1–2 题 `point` 含 `u2:` 的题，或复制题干并改 `unitTitle`。

## 产品阶段映射（8 关 · 无 phonics Tab）

| 规格名 | stage | type |
|--------|-------|------|
| vocab | s1 | vocab |
| vocabQuiz | s2–s3, s5 | listenWord, match, write |
| listen | s6 | listenSent |
| speak | s4 | sentence (+ 歌谣句在 submodule B) |
| readWrite | s7 | readWrite |
| chant/song | s4 | sentence 内 tag「Let's chant」 |
| finalQuiz | s8 | finalQuiz |

## Tech Debt

- **独立 chant 阶段未支持**：当前歌谣寄存在 s4 句型关 submodule B 末尾（tag `Let's chant · 歌谣`）。未来若要独立 chant 阶段，需架构任务（类似任务 5），不在 Unit 2–6 内容阶段处理。
