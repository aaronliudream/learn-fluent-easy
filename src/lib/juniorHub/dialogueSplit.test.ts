/**
 * 切分规则守门人。这套规则同时被取数（能不能进池）、抽取（可达对象）、播放（分角色朗读）三处用，
 * 所以它错一次就是三处一起错。
 *
 * 规则依据 244 条 dialogue 的实测格式（见 docs/audio/JUNIOR_4_dialogue.md）：
 * 标记只有 W/M/A/B/Boy/Girl 六种 + 8 条具名/职业标记（不可判性别）+ 41 条无标记独白。
 */
import { describe, expect, it } from 'vitest';
import { splitDialogue, canSplitDialogue, isMultiVoice, SPEAKER_GENDER, NAMED_GENDER, ROLE_MARKERS } from './dialogueSplit';

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

describe('具名说话人：显式表，不做启发式', () => {
  it('Linda / Mary / Mandy → 女声（表里一条条列的）', () => {
    for (const name of ['Linda', 'Mary', 'Mandy']) {
      const segs = splitDialogue(`${name}: AI teachers will help answer questions.`)!;
      expect(segs).toHaveLength(1);
      expect(segs[0].speaker).toBe(name);
      expect(segs[0].gender).toBe('female');
    }
    expect(NAMED_GENDER).toEqual({ Linda: 'female', Mary: 'female', Mandy: 'female' });
  });

  it('表里没有的名字仍然判 null（加了交替规则也不许默认放行）', () => {
    expect(splitDialogue('Kevin: I will study harder.')).toBeNull();
    expect(splitDialogue('Ms Wang: Please open your books.')).toBeNull();
    expect(canSplitDialogue('W: Hi. Kevin: Hello.')).toBe(false);
  });
});

describe('职业/称谓标记：按出场顺序交替', () => {
  it('两个未知性别的说话人 → 第 1 个女、第 2 个男', () => {
    const segs = splitDialogue('Host: Will robots replace humans? Dr Lu: No, they will not.')!;
    expect(segs.map((s) => [s.speaker, s.gender])).toEqual([['Host', 'female'], ['Dr Lu', 'male']]);
  });

  it('顺序反过来，分配也跟着反（按出场，不按名字）', () => {
    const segs = splitDialogue('Dr Lu: Robots will help us. Host: That sounds great.')!;
    expect(segs.map((s) => [s.speaker, s.gender])).toEqual([['Dr Lu', 'female'], ['Host', 'male']]);
  });

  it('同一个说话人多轮只占一个号，交替不跳号', () => {
    const segs = splitDialogue('Host: Question one. Dr Lu: Answer one. Host: Question two. Dr Lu: Answer two.')!;
    expect(segs.map((s) => s.gender)).toEqual(['female', 'male', 'female', 'male']);
  });

  it('结果稳定：同一段跑两次完全一致（不随机）', () => {
    const t = 'Host: A? Dr Lu: B. Reporter: C?';
    expect(splitDialogue(t)).toEqual(splitDialogue(t));
  });

  it('具名不占交替号：Linda 先出场也不影响 Host/Dr Lu 的分配', () => {
    const segs = splitDialogue('Linda: Hello. Host: Welcome. Dr Lu: Thank you.')!;
    expect(segs.map((s) => [s.speaker, s.gender]))
      .toEqual([['Linda', 'female'], ['Host', 'female'], ['Dr Lu', 'male']]);
  });

  it('三个未知说话人 → 女、男、女（第 3 个回到女声）', () => {
    const segs = splitDialogue('Host: One. Reporter: Two. Dr Lu: Three.')!;
    expect(segs.map((s) => s.gender)).toEqual(['female', 'male', 'female']);
  });
});

describe('三人对话（题库里真实存在的那条）', () => {
  const REAL = 'Reporter: Girls, you are best friends, right? Linda: Yes! We have been best friends for three years. '
    + 'Reporter: What do you like about each other? Mary: She is funny and kind.';

  it('可切，四轮，说话人保留', () => {
    const segs = splitDialogue(REAL)!;
    expect(segs.map((s) => s.speaker)).toEqual(['Reporter', 'Linda', 'Reporter', 'Mary']);
  });

  /**
   * ⚠️ 已知代价：这条按规则算出来**三个人都是女声**——
   * Reporter 是首个未知性别的说话人 → 女；Linda / Mary 在具名表里 → 女。
   * 规则本身没问题（性别判断是对的），但这条题**听不出换人**。
   * 要区分只能给它单独指定角色性别，属于人工决策，不在切分规则里猜。
   */
  it('三人全女声 —— 记录这个已知代价，别哪天被当成 bug 改掉规则', () => {
    expect(splitDialogue(REAL)!.map((s) => s.gender)).toEqual(['female', 'female', 'female', 'female']);
  });
});

describe('仍然拒绝的情况（宁可不做也不猜）', () => {
  it('白名单外的新标记 → null', () => {
    expect(splitDialogue('Teacher: Open your books.')).toBeNull();
    expect(canSplitDialogue('Teacher: Open your books.')).toBe(false);
  });

  it('白名单标记与未知标记混排也判 null（不做半切）', () => {
    expect(splitDialogue('W: Who is that? Uncle: My cousin.')).toBeNull();
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
