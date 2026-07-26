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
};
