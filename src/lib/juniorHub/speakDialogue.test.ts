/**
 * 分角色朗读：**预热 key 必须逐条等于播放 key**。
 *
 * 这是这个项目栽过两次的地方：小学 C2（预热漏传 speed，热到 getKidSpeed 档上）、
 * junior 默写关（同型）。对话又多了一维「音色随说话人变」，出错概率更高：
 * 只要预热按女声热、播放按男声播，那一半永远是冷合成。
 * 所以两侧都只能走 `dialogueVoiceOf`，这里逐段比对它们算出的 (voice, speed, text)。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: Array<{ api: string; text: string; voiceId?: string; speed?: number; grade?: number }> = [];

vi.mock('@/lib/speak', () => ({
  KID_VOICE_ID: 'el:lily',
  speak: (text: string, o: { voiceId?: string; speed?: number } = {}) => {
    calls.push({ api: 'speak', text, voiceId: o.voiceId, speed: o.speed });
    return Promise.resolve();
  },
  speakKid: (text: string, o: { grade?: number; speed?: number } = {}) => {
    calls.push({ api: 'speakKid', text, voiceId: 'el:lily', speed: o.speed, grade: o.grade });
    return Promise.resolve();
  },
  prefetchTTS: (text: string, o: { voiceId?: string; speed?: number } = {}) => {
    calls.push({ api: 'prefetchTTS', text, voiceId: o.voiceId, speed: o.speed });
  },
  prefetchTTSBatchKid: (texts: string[], o: { grade?: number; speed?: number } = {}) => {
    for (const text of texts) calls.push({ api: 'prefetchBatchKid', text, voiceId: 'el:lily', speed: o.speed, grade: o.grade });
  },
  stopSpeaking: () => {},
}));

const { speakDialogue, prefetchDialogue, dialogueVoiceOf, MALE_VOICE, DIALOGUE_SPEED, DIALOGUE_GAP_MS } =
  await import('./speakDialogue');

const DIALOGUE = 'W: Do you have a fever? M: No, but I have a cough. W: You should rest.';
/** 与 tts edge 的 keyInput 同构（accent 恒空）。 */
const keyOf = (c: { text: string; voiceId?: string; speed?: number }) =>
  `${String(c.voiceId).startsWith('el:') ? 'elevenlabs' : 'openai'}|${c.voiceId}|${c.speed}||${c.text}`;

beforeEach(() => { calls.length = 0; });

describe('播放：按说话人换音色', () => {
  it('三轮 W/M/W → 女、男、女，且速度恒 0.8', async () => {
    await speakDialogue(DIALOGUE, 8);
    expect(calls.map((c) => [c.voiceId, c.text])).toEqual([
      ['el:lily', 'Do you have a fever?'],
      [MALE_VOICE, 'No, but I have a cough.'],
      ['el:lily', 'You should rest.'],
    ]);
    expect(calls.every((c) => c.speed === DIALOGUE_SPEED)).toBe(true);
    expect(DIALOGUE_SPEED).toBe(0.8);
  });

  it('说话人标记不会被送进 TTS', async () => {
    await speakDialogue(DIALOGUE, 8);
    for (const c of calls) expect(c.text).not.toMatch(/^(W|M|A|B|Boy|Girl)\s*:/);
  });

  it('独白仍是一把嗓子读完（单次调用、女声）', async () => {
    await speakDialogue('Hello everyone. I am Peter. David is my classmate.', 8);
    expect(calls).toHaveLength(1);
    expect(calls[0].voiceId).toBe('el:lily');
  });

  it('性别不可判的对话不播（取数侧本就该拦住，这里是第二道）', async () => {
    await speakDialogue('Teacher: In 20 years, students will study at home.', 8);
    expect(calls).toHaveLength(0);
  });
});

describe('预热 key === 播放 key（逐段比对）', () => {
  it('同一段对话：预热与播放算出的 key 集合完全相同', async () => {
    prefetchDialogue([DIALOGUE], 8);
    const warm = calls.map(keyOf).sort();
    calls.length = 0;
    await speakDialogue(DIALOGUE, 8);
    const play = calls.map(keyOf).sort();
    expect(warm).toEqual(play);
  });

  it('男声那几句确实用 echo 预热（不是全按女声热一遍）', () => {
    prefetchDialogue([DIALOGUE], 8);
    const male = calls.filter((c) => c.voiceId === MALE_VOICE);
    expect(male).toHaveLength(1);
    expect(male[0].text).toBe('No, but I have a cough.');
    expect(male[0].speed).toBe(DIALOGUE_SPEED);
  });

  it('批量：混合独白/对话/不可判，预热与播放仍逐条相等', async () => {
    const list = [DIALOGUE, 'Hello everyone. I am Peter.', 'Teacher: unsplittable.', 'Boy: Hi. Girl: Hello.'];
    prefetchDialogue(list, 8);
    const warm = calls.map(keyOf).sort();
    calls.length = 0;
    for (const t of list) await speakDialogue(t, 8);
    expect(calls.map(keyOf).sort()).toEqual(warm);
  });
});

describe('派生函数是唯一来源', () => {
  it('dialogueVoiceOf 决定一切：女=el:lily，男=echo，速度恒 0.8', () => {
    expect(dialogueVoiceOf({ speaker: 'W', text: 'x', gender: 'female' })).toEqual({ voiceId: 'el:lily', speed: 0.8 });
    expect(dialogueVoiceOf({ speaker: 'M', text: 'x', gender: 'male' })).toEqual({ voiceId: MALE_VOICE, speed: 0.8 });
  });

  it('轮次间隔取 350ms（换人的自然间隙，比 speakSequence 默认的 80ms 长）', () => {
    expect(DIALOGUE_GAP_MS).toBe(350);
  });
});
