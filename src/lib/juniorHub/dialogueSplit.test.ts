/**
 * 切分规则守门人。这套规则同时被取数（能不能进池）、抽取（可达对象）、播放（分角色朗读）三处用，
 * 所以它错一次就是三处一起错。
 *
 * 规则依据 244 条 dialogue 的实测格式（见 docs/audio/JUNIOR_4_dialogue.md）：
 * 标记只有 W/M/A/B/Boy/Girl 六种 + 8 条具名/职业标记（不可判性别）+ 41 条无标记独白。
 */
import { describe, expect, it } from 'vitest';
import { splitDialogue, canSplitDialogue, isMultiVoice, SPEAKER_GENDER } from './dialogueSplit';

describe('白名单标记：切分与性别', () => {
  it('W/M 两轮对话 → 女、男', () => {
    const segs = splitDialogue('W: You look pale. Do you have a fever? M: No, but I have a cough.')!;
    expect(segs.map((s) => [s.speaker, s.gender, s.text])).toEqual([
      ['W', 'female', 'You look pale. Do you have a fever?'],
      ['M', 'male', 'No, but I have a cough.'],
    ]);
  });

  it('A/B 与 Boy/Girl 同样按固定映射，不随机', () => {
    expect(splitDialogue('A: Hi. B: Hello.')!.map((s) => s.gender)).toEqual(['female', 'male']);
    expect(splitDialogue('Boy: Hi. Girl: Hello.')!.map((s) => s.gender)).toEqual(['male', 'female']);
    // 同一段跑两次必须完全一致（不随机）
    expect(splitDialogue('A: Hi. B: Hello.')).toEqual(splitDialogue('A: Hi. B: Hello.'));
  });

  it('5 轮往复对话按顺序切开，说话人交替保留', () => {
    const t = "W: I'm not sure which book to read. M: Did you consider this novel? W: What happened in it? "
      + 'M: A brave girl saved her people. W: Great, I will read it.';
    const segs = splitDialogue(t)!;
    expect(segs).toHaveLength(5);
    expect(segs.map((s) => s.gender)).toEqual(['female', 'male', 'female', 'male', 'female']);
    expect(segs[3].text).toBe('A brave girl saved her people.');
  });

  it('切出来的文本不含任何说话人标记（标记不会进 TTS）', () => {
    for (const s of splitDialogue('W: Hello there. M: Hi, W is my friend.')!) {
      expect(s.text).not.toMatch(/^(W|M|A|B|Boy|Girl)\s*:/);
    }
  });
});

describe('独白：无标记整段单人读', () => {
  it('无标记 → 单段、speaker=null、女声', () => {
    const segs = splitDialogue('Hello everyone. I am Peter. David is my classmate.')!;
    expect(segs).toHaveLength(1);
    expect(segs[0].speaker).toBeNull();
    expect(segs[0].gender).toBe('female');
    expect(segs[0].text).toBe('Hello everyone. I am Peter. David is my classmate.');
  });

  /**
   * 关键反例：正文里的冒号不能被当成说话人标记。
   * 用 `[A-Z]\w*:` 通配就会把这句从 "tips:" 处切碎。
   */
  it('正文里的小写冒号（"four tips: listen…"）不触发切分', () => {
    const t = 'To have a good conversation, remember four tips: listen carefully, be honest and sincere.';
    const segs = splitDialogue(t)!;
    expect(segs).toHaveLength(1);
    expect(segs[0].text).toBe(t);
  });

  it('单轮 W: 开头的步骤讲解仍算可切（一段女声）', () => {
    const segs = splitDialogue('W: First, peel and cut up the bananas. Next, put them into the blender.')!;
    expect(segs).toHaveLength(1);
    expect(segs[0].gender).toBe('female');
    expect(segs[0].text.startsWith('First,')).toBe(true);
  });
});

describe('不可安全分角色 → null（宁可不做也不猜）', () => {
  const cases: Array<[string, string]> = [
    ['具名女性（惯用女名也不猜）', 'Linda: In 20 years, students will not go to a school building.'],
    ['称谓 + 姓', 'Dr Lu: You will see robots working everywhere.'],
    ['职业词', 'Host: Do you think robots will replace humans? Dr Lu: No, I do not.'],
    ['三人对话', 'Reporter: Girls, you are best friends, right? Linda: Yes! Mary: We have known each other for years.'],
  ];
  for (const [why, text] of cases) {
    it(`${why} → null`, () => {
      expect(splitDialogue(text)).toBeNull();
      expect(canSplitDialogue(text)).toBe(false);
    });
  }

  it('白名单标记与未知标记混排也判 null（不做半切）', () => {
    expect(splitDialogue('W: Who is that? Linda: My cousin.')).toBeNull();
  });

  it('空串 → null', () => {
    expect(splitDialogue('')).toBeNull();
    expect(splitDialogue('   ')).toBeNull();
  });
});

describe('isMultiVoice：只有真需要两个音色时才为 true', () => {
  it('男女混合 → true；同性/独白 → false', () => {
    expect(isMultiVoice('W: Hi. M: Hello.')).toBe(true);
    expect(isMultiVoice('W: First, peel the bananas.')).toBe(false);
    expect(isMultiVoice('Hello everyone. I am Peter.')).toBe(false);
  });
});

describe('映射表本身', () => {
  it('六个标记的性别固定（改这里等于改音色分配）', () => {
    expect(SPEAKER_GENDER).toEqual({
      W: 'female', Girl: 'female', A: 'female',
      M: 'male', Boy: 'male', B: 'male',
    });
  });
});
