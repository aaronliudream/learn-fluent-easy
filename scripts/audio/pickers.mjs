/**
 * 内容抽取器（picker）——每个都镜像一处**真实播放行为**。
 *
 * 这里的每条规则都是从组件行为抄过来的常量/取法（例如"对话每单元只取前 4 组 q/a"）。
 * 抄来的东西会漂：组件改了、这里不知道，缺口就从此不可见。
 * 因此每个 picker 都在 `PICKER_ANCHORS` 里登记了它镜像的组件源码锚点，
 * 由 `src/lib/primaryHub/audioPipelineParity.test.ts` 断言锚点仍然存在——
 * 组件一改，测试就红，逼人同步这里。
 */
import fs from 'node:fs';
import path from 'node:path';
// 切分规则的唯一实现（取数/抽取/播放三处共用）——Node 24 原生 import .ts
import { splitDialogue } from '../../src/lib/juniorHub/dialogueSplit.ts';

/** grade3.json → { grade3: {...} } */
const course = (json) => json[Object.keys(json)[0]];

export const pickers = {
  courseVocab(json) {
    const out = [];
    for (const sem of Object.values(course(json).semesters ?? {})) {
      for (const u of sem.units ?? []) {
        for (const [i, v] of (u.vocabulary ?? []).entries()) {
          if (v?.en) out.push({ text: v.en, record_id: `${u.id}#vocab[${i}]`, field: 'vocabulary.en' });
        }
      }
    }
    return out;
  },

  courseChunks(json) {
    const out = [];
    for (const sem of Object.values(course(json).semesters ?? {})) {
      for (const u of sem.units ?? []) {
        for (const [i, v] of (u.vocabulary ?? []).entries()) {
          for (const [ci, c] of (v.chunks ?? []).entries()) {
            if (c?.en) out.push({ text: c.en, record_id: `${u.id}#vocab[${i}].chunks[${ci}]`, field: 'chunks.en' });
          }
        }
      }
    }
    return out;
  },

  /** 镜像 StagePlay 的 SentenceStage：每单元只取前 4 组，且按 i += 2 配对。 */
  courseDialoguePairs(json) {
    const out = [];
    for (const sem of Object.values(course(json).semesters ?? {})) {
      for (const u of sem.units ?? []) {
        let pairs = 0;
        for (const d of u.dialogues ?? []) {
          const lines = d.lines ?? [];
          for (let i = 0; i < lines.length && pairs < DIALOGUE_PAIRS_PER_UNIT; i += 2) {
            if (lines[i]?.text) out.push({ text: lines[i].text, record_id: `${u.id}#dialogue.q${i}`, field: 'dialogues.lines.text' });
            if (lines[i + 1]?.text) out.push({ text: lines[i + 1].text, record_id: `${u.id}#dialogue.a${i + 1}`, field: 'dialogues.lines.text' });
            pairs++;
          }
        }
      }
    }
    return out;
  },

  /** 镜像 ListenMcStage：题目 audio + 答错后正音的 opts[answer]。 */
  courseListening(json) {
    const out = [];
    for (const sem of Object.values(course(json).semesters ?? {})) {
      for (const u of sem.units ?? []) {
        for (const [i, lq] of (u.listeningQuestions ?? []).entries()) {
          if (lq?.audio) out.push({ text: lq.audio, record_id: `${u.id}#listening[${i}]`, field: 'listeningQuestions.audio' });
          const ans = lq?.opts?.[lq.answer];
          if (ans) out.push({ text: ans, record_id: `${u.id}#listening[${i}].answer`, field: 'listeningQuestions.opts[answer]' });
        }
      }
    }
    return out;
  },

  /** 镜像 SentenceLessonStage 的 AudioBtn：question.en 与 answer.en。 */
  sentenceLesson(json) {
    const out = [];
    for (const mod of json.subModules ?? []) {
      for (const s of mod.sentences ?? []) {
        if (s.question?.en) out.push({ text: s.question.en, record_id: `${json.lessonId}#${mod.id}.${s.id}`, field: 'question.en' });
        if (s.answer?.en) out.push({ text: s.answer.en, record_id: `${json.lessonId}#${mod.id}.${s.id}`, field: 'answer.en' });
      }
    }
    return out;
  },

  /** 镜像闯关各关卡：audio（听力四关/填空）、display（排序关）、options[answer]（仅看图选词）。 */
  fcSeed(json) {
    const out = [];
    for (const q of Array.isArray(json) ? json : []) {
      if (q.audio) out.push({ text: q.audio, record_id: q.id, field: 'audio' });
      if (q.display) out.push({ text: q.display, record_id: q.id, field: 'display' });
      if (q.type === FC_OPTIONS_ANSWER_TYPE && Array.isArray(q.options) && q.options[q.answer]) {
        out.push({ text: q.options[q.answer], record_id: q.id, field: 'options[answer]' });
      }
    }
    return out;
  },

  /** phonics 是 .ts 模块：stage_1/stage_2 的 word + stage_3 的 options 都会被朗读。 */
  phonicsTs(_json, ctx) {
    const src = fs.readFileSync(ctx.absPath, 'utf8');
    const out = [];
    for (const m of src.matchAll(/\{\s*word:\s*"([^"]+)"/g)) {
      out.push({ text: m[1], record_id: `${path.basename(ctx.absPath)}#word`, field: 'phonics.word' });
    }
    for (const m of src.matchAll(/options:\s*\[([^\]]+)\]/g)) {
      for (const w of m[1].split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean)) {
        out.push({ text: w, record_id: `${path.basename(ctx.absPath)}#challenge`, field: 'stage_3_challenge.options' });
      }
    }
    return out;
  },

  /**
   * 初中 ListenMcStage 的**题目**（:630 hubSpeak(q.audio, listen)）。
   * 与 courseListening 不同：初中题目与正音是**两个不同档位**（0.8 / 0.7），
   * 合成一个 source 会给每条文本各多生成一档没人播的对象，所以拆开。
   */
  juniorCourseListeningAudio(json) {
    const out = [];
    for (const sem of Object.values(course(json).semesters ?? {})) {
      for (const u of sem.units ?? []) {
        for (const [i, lq] of (u.listeningQuestions ?? []).entries()) {
          if (lq?.audio) out.push({ text: lq.audio, record_id: `${u.id}#listening[${i}]`, field: 'listeningQuestions.audio' });
        }
      }
    }
    return out;
  },

  /** 初中 ListenMcStage 的**正确项正音**（:589 hubSpeak(q.opts[q.answer], slow)）。 */
  juniorCourseListeningAnswer(json) {
    const out = [];
    for (const sem of Object.values(course(json).semesters ?? {})) {
      for (const u of sem.units ?? []) {
        for (const [i, lq] of (u.listeningQuestions ?? []).entries()) {
          const ans = lq?.opts?.[lq.answer];
          if (ans) out.push({ text: ans, record_id: `${u.id}#listening[${i}].answer`, field: 'listeningQuestions.opts[answer]' });
        }
      }
    }
    return out;
  },

  /**
   * SentenceStage 的 4 个句型**写死在页面组件里**（JuniorHubStagePlay.tsx 的 SENTENCE_PATTERNS），
   * 不在 src/data 下 —— 靠 junior.json 的 extraFiles 把这个 tsx 纳入扫描。
   * 播放点：:787 q、:802 a，都是 normal(0.85)。
   * （grade9.json 里的 `dialogues` 字段**不是**这一关的来源，全站零消费，见 junior.json 注释。）
   */
  juniorSentencePatternsTsx(_json, ctx) {
    const src = fs.readFileSync(ctx.absPath, 'utf8');
    const block = /const SENTENCE_PATTERNS = \[([\s\S]*?)\n\];/.exec(src);
    if (!block) {
      throw new Error(`✗ ${ctx.rel} 里找不到 SENTENCE_PATTERNS 常量——句型关的文本来源变了，先核播放点再改 picker`);
    }
    const out = [];
    for (const key of ['q', 'a']) {
      for (const m of block[1].matchAll(new RegExp(`\\n\\s{4}${key}: "([^"]+)"`, 'g'))) {
        out.push({ text: m[1], record_id: `SENTENCE_PATTERNS#${key}`, field: `SENTENCE_PATTERNS.${key}` });
      }
    }
    if (!out.length) throw new Error(`✗ ${ctx.rel} 的 SENTENCE_PATTERNS 抽到 0 条文本`);
    return out;
  },

  // ---- senior（高中）JSON 课程源 ----
  //
  // 结构与初中不同：顶层可能是 { year1: {...} }（人教）也可能是 { "1": {...}, "2": ..., "3": ... }
  // （上外/外研社按年级分三份），下一层统一是 { name, semesters: { gk_required1: { units: [...] } } }。
  // 所以不能照抄 `course(json)` 只取第一个顶层键——那样会漏掉 sufe/fltrp 的第 2、3 份。
  seniorUnits(json) {
    const out = [];
    for (const grade of Object.values(json ?? {})) {
      for (const sem of Object.values(grade?.semesters ?? {})) {
        for (const u of sem?.units ?? []) out.push(u);
      }
    }
    return out;
  },

  /** 5 步关卡词卡/配对/默写：unit.vocabulary[].en（只有人教 year*.json 有，sufe/fltrp 为 0）。 */
  seniorCourseVocab(json) {
    const out = [];
    for (const u of pickers.seniorUnits(json)) {
      for (const [i, v] of (u.vocabulary ?? []).entries()) {
        if (v?.en) out.push({ text: v.en, record_id: `${u.id}#vocab[${i}]`, field: 'vocabulary.en' });
      }
    }
    return out;
  },

  /** 听力关题目：GaokaoHubStagePlay:354 hubSpeak(q.audio, 0.8)。 */
  seniorCourseListeningAudio(json) {
    const out = [];
    for (const u of pickers.seniorUnits(json)) {
      for (const [i, lq] of (u.listeningQuestions ?? []).entries()) {
        if (lq?.audio) out.push({ text: lq.audio, record_id: `${u.id}#listening[${i}]`, field: 'listeningQuestions.audio' });
      }
    }
    return out;
  },

  /** 听力关正确项正音：:320 hubSpeak(q.opts[q.answer], 0.7)。 */
  seniorCourseListeningAnswer(json) {
    const out = [];
    for (const u of pickers.seniorUnits(json)) {
      for (const [i, lq] of (u.listeningQuestions ?? []).entries()) {
        const ans = lq?.opts?.[lq.answer];
        if (ans) out.push({ text: ans, record_id: `${u.id}#listening[${i}].answer`, field: 'listeningQuestions.opts[answer]' });
      }
    }
    return out;
  },

  /**
   * unit.dialogues.lines[].text —— **目前没有播放调用**（句型关读的是组件常量 SENTENCE_PATTERNS）。
   * 保留 picker 是为了"哪天真接上了"能直接启用；senior.json 里这个 source 不挂 tiers 生效。
   */
  seniorCourseDialogues(json) {
    const out = [];
    for (const u of pickers.seniorUnits(json)) {
      for (const [di, d] of (u.dialogues ?? []).entries()) {
        for (const [li, l] of (d.lines ?? []).entries()) {
          if (l?.text) out.push({ text: l.text, record_id: `${u.id}#dialogue[${di}].line[${li}]`, field: 'dialogues.lines.text' });
        }
      }
    }
    return out;
  },

  /** 高中句型关的 4 组句型写死在 GaokaoHubStagePlay.tsx 的 SENTENCE_PATTERNS 里。 */
  seniorSentencePatternsTsx(_json, ctx) {
    const src = fs.readFileSync(ctx.absPath, 'utf8');
    const block = /const SENTENCE_PATTERNS = \[([\s\S]*?)\n\];/.exec(src);
    if (!block) {
      throw new Error(`✗ ${ctx.rel} 里找不到 SENTENCE_PATTERNS 常量——高中句型关的文本来源变了，先核播放点再改 picker`);
    }
    const out = [];
    for (const key of ['q', 'a']) {
      for (const m of block[1].matchAll(new RegExp(`\\n\\s{4}${key}: "([^"]+)"`, 'g'))) {
        out.push({ text: m[1], record_id: `SENTENCE_PATTERNS#${key}`, field: `SENTENCE_PATTERNS.${key}` });
      }
    }
    if (!out.length) throw new Error(`✗ ${ctx.rel} 的 SENTENCE_PATTERNS 抽到 0 条文本`);
    return out;
  },

  // ---- 表源 picker（入参是 DB 行数组，不是 JSON 文件）----

  /** junior_vocab.word —— 初中 hub 里唯一被朗读的词字段（词卡/听音辨词/默写关都是它）。 */
  juniorVocabWord(rows) {
    return rows
      .filter((r) => r.word)
      .map((r) => ({ text: r.word, record_id: `junior_vocab:${r.id ?? r.word}`, field: 'word', grade: r.grade }));
  },

  /**
   * junior_vocab 的 phrase_en / example_en —— 在 VocabStage 里被合成 chunks 显示，
   * **每条都带 🔊**（JuniorHubStagePlay:422/427 `speakWord(c.en)`），所以是真会被朗读的文本。
   * （第一版矩阵曾误判成"纯展示"，靠通读 speakWord 封装才发现。）
   */
  juniorVocabChunk(rows) {
    const out = [];
    for (const r of rows) {
      if (r.example_en) out.push({ text: r.example_en, record_id: `junior_vocab:${r.id}#example`, field: 'example_en', grade: r.grade });
      else if (r.phrase_en) out.push({ text: r.phrase_en, record_id: `junior_vocab:${r.id}#phrase`, field: 'phrase_en', grade: r.grade });
    }
    return out;
  },

  /**
   * junior_listening_items.audio_text —— 单元通关（FinalQuizStage）听力题的朗读文本。
   * 这张表**没有** audio_url 列，所以整批走 TTS：预热 :1017 与播放 :1099 都是 @0.8。
   * 只有 7B / 8A / 8B 会被取到（juniorFinalQuiz.ts listeningItemsForUnit 的判断），
   * 故 junior.json 里同时卡 volume —— 将来往 9A/9B 灌题而代码没放开，那批就是不可达的。
   */
  juniorListeningItemAudioText(rows, { source } = {}) {
    const [femaleTier, maleTier] = source?.genderTiers ?? [];
    if (!femaleTier || !maleTier) {
      throw new Error('✗ junior_listening_items 源必须声明 genderTiers: ["<女声档>", "<男声档>"]（对话要分角色）');
    }
    const out = [];
    for (const r of rows) {
      if (!r.audio_text) continue;
      // **切分规则只有一份**：与取数（能不能进池）、播放（分角色朗读）共用
      // src/lib/juniorHub/dialogueSplit.ts。null = 出现白名单外的说话人标记，
      // 性别不可判 → 不进可达集（junior.json 的 unreachableSources 里有声明）。
      const segs = splitDialogue(r.audio_text);
      if (!segs) continue;
      segs.forEach((seg, i) => {
        out.push({
          text: seg.text,
          tier: seg.gender === 'male' ? maleTier : femaleTier,
          record_id: `junior_listening_items:${r.id}${segs.length > 1 ? `#${i + 1}${seg.speaker ?? ''}` : ''}`,
          field: 'audio_text',
          grade: r.grade,
        });
      });
    }
    return out;
  },

  /**
   * junior_listening_exercises.transcript —— 仅当该行**没有**预生成 audio_url 时才会被
   * JuniorListeningPlay 用 speak() 现场朗读（用户默认音色）。有 audio_url 的直接播 CDN 文件。
   */
  juniorListeningTranscript(rows) {
    return rows
      .filter((r) => r.transcript && !r.audio_url)
      .map((r) => ({ text: r.transcript, record_id: `junior_listening:${r.id}`, field: 'transcript', grade: r.grade }));
  },
};

// ---------------------------------------------------------------------------
// 从组件行为抄来的常量（改组件必须同步改这里；由 parity 测试盯着）
// ---------------------------------------------------------------------------

/** StagePlay 的 SentenceStage 每单元只展示前 4 组句型对话，后面的不渲染也不朗读。 */
export const DIALOGUE_PAIRS_PER_UNIT = 4;

/** 闯关里只有「看图选词」会朗读 options[answer]；其余题型的选项不发音。 */
export const FC_OPTIONS_ANSWER_TYPE = 'picture_match_word';

/**
 * 每个 picker 镜像的组件源码锚点。
 * parity 测试会断言这些锚点仍存在于对应文件里——组件一改，锚点消失，测试红。
 */
export const PICKER_ANCHORS = {
  courseVocab: [
    { file: 'src/pages/primaryHub/PrimaryHubStagePlay.tsx', anchor: 'hubSpeak(word, HUB_FIXED_SPEAK_SPEED, grade)', why: '单词卡朗读 vocabulary[].en @fixed' },
    { file: 'src/components/primaryHub/SpellingStage.tsx', anchor: 'speakKid(spoken, { grade, speed: cfg.speechRate })', why: '拼写关按年级档朗读同一批词' },
  ],
  courseChunks: [
    { file: 'src/pages/primaryHub/vocabGames/VocabQuizGame.tsx', anchor: 'hubSpeak(c.en, HUB_FIXED_SPEAK_SPEED, grade)', why: '语块按钮朗读 chunks[].en @fixed' },
  ],
  courseDialoguePairs: [
    { file: 'src/pages/primaryHub/PrimaryHubStagePlay.tsx', anchor: 'out.length < 4', why: '每单元只取前 4 组 q/a —— DIALOGUE_PAIRS_PER_UNIT 抄的就是这个 4' },
    { file: 'src/pages/primaryHub/PrimaryHubStagePlay.tsx', anchor: 'i += 2', why: 'q/a 按步长 2 配对' },
    { file: 'src/pages/primaryHub/PrimaryHubStagePlay.tsx', anchor: 'hubSpeak(s.q, HUB_FIXED_SPEAK_SPEED, grade)', why: '对话句 @fixed 朗读' },
  ],
  courseListening: [
    { file: 'src/pages/primaryHub/PrimaryHubStagePlay.tsx', anchor: 'const text = q?.opts[q.answer]?.trim();', why: '答错后正音读的是 opts[answer]' },
    { file: 'src/pages/primaryHub/PrimaryHubStagePlay.tsx', anchor: 'hubSpeakAtSpeed(text, speed, grade)', why: '听力关走可切换三档' },
  ],
  sentenceLesson: [
    { file: 'src/components/primaryHub/SentenceLessonStage.tsx', anchor: 'text={item.question.en}', why: 'AudioBtn 朗读 question.en' },
    { file: 'src/components/primaryHub/SentenceLessonStage.tsx', anchor: 'text={item.answer.en}', why: 'AudioBtn 朗读 answer.en' },
  ],
  fcSeed: [
    { file: 'src/components/primaryHub/finalChallenge/levels/ListenChooseWordLevel.tsx', anchor: 'playTwice(q.audio)', why: '听力关朗读 audio 字段' },
    { file: 'src/components/primaryHub/finalChallenge/levels/SentenceOrderingLevel.tsx', anchor: 'speakDisplay(q.display)', why: '排序关朗读 display 字段' },
    { file: 'src/components/primaryHub/finalChallenge/levels/PicMatchWordLevel.tsx', anchor: 'speakKid(q.options[q.answer]', why: '只有看图选词朗读 options[answer] —— FC_OPTIONS_ANSWER_TYPE 的依据' },
    { file: 'src/components/primaryHub/finalChallenge/levels/PicMatchWordLevel.tsx', anchor: 'getQuestionsByType("picture_match_word"', why: '该关卡的题型名，即 FC_OPTIONS_ANSWER_TYPE 的字面量' },
  ],
  phonicsTs: [
    { file: 'src/pages/primaryHub/PrimaryHubPhonics.tsx', anchor: 'hubSpeak(word, HUB_FIXED_SPEAK_SPEED, grade)', why: '找一找朗读 stage_2 的 word' },
    { file: 'src/pages/primaryHub/PrimaryHubPhonics.tsx', anchor: 'hubSpeak(q.options[idx], HUB_FIXED_SPEAK_SPEED, grade)', why: '闯关朗读 stage_3 的 options' },
    { file: 'src/lib/primaryHub/phonicsAudio.ts', anchor: 'hubSpeak(fallbackText, HUB_FIXED_SPEAK_SPEED, grade)', why: 'stage_1 无录音时回退 TTS 朗读 word' },
  ],

  // ---- junior ----
  juniorCourseListeningAudio: [
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'hubSpeak(q.audio, JUNIOR_SPEAK_SPEED.listen, grade)', why: '内联听力关题目 @0.8' },
  ],
  juniorCourseListeningAnswer: [
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'hubSpeak(q.opts[q.answer], JUNIOR_SPEAK_SPEED.slow, grade)', why: '正确项正音 @0.7 —— 与题目**不同档**，所以两个 picker 分开' },
  ],
  juniorSentencePatternsTsx: [
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'const SENTENCE_PATTERNS = [', why: '句型关的文本写死在这个常量里（不是 JSON 的 dialogues）' },
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'hubSpeak(s.q, JUNIOR_SPEAK_SPEED.normal, grade)', why: '句型 q @0.85' },
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'hubSpeak(s.a, JUNIOR_SPEAK_SPEED.normal, grade)', why: '句型 a @0.85' },
  ],
  juniorVocabWord: [
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'const speakWord = (word: string) => hubSpeak(word, JUNIOR_SPEAK_SPEED.normal, grade)', why: '核心词汇关词点读 @0.85' },
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'hubSpeak(v.en, JUNIOR_SPEAK_SPEED.slow, grade)', why: '默写关词表点读 @0.7' },
    { file: 'src/lib/juniorHub/useUnitVocab.ts', anchor: '.select("id,word,phonetic,meaning_cn,phrase_en,example_en,example_cn")', why: '词从 junior_vocab 读，字段取法以此为准' },
    { file: 'src/pages/JuniorVocab.tsx', anchor: 'speak(cur.word)', why: '词汇板块用**用户设置音色**读同一批词（userDefault 档的由来）' },
  ],
  juniorVocabChunk: [
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'speakWord(c.en)', why: '语块按钮 @0.85 —— 语块**会被朗读**，不是纯展示' },
    { file: 'src/lib/juniorHub/useUnitVocab.ts', anchor: 'chunks: example ? [example] : phrase ? [{ en: phrase, cn: "" }] : undefined', why: '例句优先、无例句才用短语 —— picker 抄的就是这一行' },
  ],
  juniorListeningItemAudioText: [
    { file: 'src/lib/juniorFinalQuiz.ts', anchor: '.select("difficulty,kind,audio_text,question,options,answer,explanation")', why: '取数字段以此为准；带上表里不存在的列会 400 → 静默回退内联题（踩过）' },
    { file: 'src/lib/juniorFinalQuiz.ts', anchor: 'audio: r.audio_text,', why: '朗读文本就是 audio_text' },
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'speakDialogue(q.audio!, grade)', why: '单元通关听力题按说话人分角色朗读' },
    { file: 'src/pages/juniorHub/JuniorHubStagePlay.tsx', anchor: 'prefetchDialogue(audios, grade)', why: '预热与播放同源（都过 dialogueVoiceOf）' },
    { file: 'src/lib/juniorHub/speakDialogue.ts', anchor: 'export const MALE_VOICE = "echo"', why: '男声音色；女声沿用 KID_VOICE_ID' },
  ],
  juniorListeningTranscript: [
    { file: 'src/pages/JuniorListeningPlay.tsx', anchor: 'speak(e.transcript)', why: '无预生成 MP3 时现场读整段' },
    { file: 'src/pages/JuniorListeningPlay.tsx', anchor: 'speakFromUrl', why: '有 audio_url 就播固定文件、不经运行时 key —— picker 过滤掉那些行的依据' },
  ],
};
