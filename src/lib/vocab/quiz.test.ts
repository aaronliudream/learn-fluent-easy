/**
 * 选项唯一性 —— 这一组测试守的是**同一个 bug**:
 * 两个不同的词共享同一条中文释义时,四个选项里出现两个一模一样的,
 * 学生选了"另一个对的"却被判错,而且这一错会写进掌握度。
 *
 * 不是理论风险:托福库 4470 词里有 **559 组**首义项完全相同
 * (heritage/legacy、initially/originally、depict/portray…),
 * 其中 17 组两词在词表里的下标相距不到一个取词窗口 —— heritage#90 / legacy#91
 * 干脆是挨着的,**迟早必然同框**。
 *
 * ⚠️ 按 word_id 去重拦不住这个 —— 它们本来就是不同的词。判据必须是**选项文本**。
 */
import { describe, expect, it } from "vitest";
import { buildQuestions, dedupeTake, optionText, tooSimilar } from "./quiz";
import type { VocabWord } from "./data";

const w = (id: string, headword: string, def_zh: string, pos = "n."): VocabWord => ({
  id, headword, def_zh, def_en: null, pos, ipa: null, audio_url: null, freq_rank: null,
} as unknown as VocabWord);

describe("dedupeTake", () => {
  it("剔掉与正确项同文的候选(不是按 id,而是按文本)", () => {
    expect(dedupeTake(["遗产", "传统", "遗产", "习俗"], "遗产", 3)).toEqual(["传统", "习俗"]);
  });

  it("候选之间也去重 —— 两个干扰项一样虽然不影响判分,但一眼就是错的", () => {
    expect(dedupeTake(["最初", "最初", "起初", "本来"], "原先", 3)).toEqual(["最初", "起初", "本来"]);
  });

  it("空串不算候选(没释义的词不该占一个选项位)", () => {
    expect(dedupeTake(["", "甲", "", "乙"], "丙", 3)).toEqual(["甲", "乙"]);
  });

  it("够 n 个就停,不多拿", () => {
    expect(dedupeTake(["甲", "乙", "丙", "丁"], "戊", 2)).toEqual(["甲", "乙"]);
  });

  it("候选不足时返回**能给多少给多少**,由调用方决定跳不跳这道题", () => {
    expect(dedupeTake(["甲"], "乙", 3)).toEqual(["甲"]);
  });
});

describe("tooSimilar · 同族不同框", () => {
  it("互为子串 → 同族(Aaron 报的那一对)", () => {
    expect(tooSimilar("as a result", "as a result of")).toBe(true);
    expect(tooSimilar("减轻", "减轻程度")).toBe(true);
  });

  it("⚠️ 中文一字之差**不算**同族 —— 那往往正是考点", () => {
    /* 「高估 / 低估」编辑距离 1、比例 0.50,和「减轻 / 减轻程度」一样;
       按距离判会把一对真正的对立选项判成同族。所以中文只判子串。 */
    expect(tooSimilar("高估", "低估")).toBe(false);
    expect(tooSimilar("一针见血", "一针见效")).toBe(false);
    expect(tooSimilar("打破僵局", "打破困局")).toBe(false);
  });

  it("拉丁字母:只拦拼写几乎一样的长串,短词不判", () => {
    expect(tooSimilar("commitment", "commitments")).toBe(true);   // 子串
    expect(tooSimilar("affect", "effect")).toBe(false);           // 长度 <8,不判
    expect(tooSimilar("in addition", "in particular")).toBe(false);
  });

  it("大小写/空格/标点归一后再比", () => {
    expect(tooSimilar("As a Result.", "as  a result")).toBe(true);
  });

  it("空串不参与判定", () => {
    expect(tooSimilar("", "任意")).toBe(false);
  });
});

describe("dedupeTake · 同族不同框", () => {
  it("与答案同族的候选被跳过,换下一个", () => {
    expect(dedupeTake(["as a result of", "in addition", "however"], "as a result", 2))
      .toEqual(["in addition", "however"]);
  });

  it("干扰项彼此同族也只留一个", () => {
    expect(dedupeTake(["减轻", "减轻程度", "加重"], "缓和", 3)).toEqual(["减轻", "加重"]);
  });
});

describe("optionText 只取首义项 —— 去重判据必须建立在同一口径上", () => {
  it("分号后的义项不进选项", () => {
    expect(optionText(w("1", "defense", "防御；辩护"), "zh")).toBe("防御");
  });

  it("两个词的**首义项**相同即视为撞车,哪怕完整释义不同", () => {
    expect(optionText(w("1", "heritage", "遗产；传统"), "zh"))
      .toBe(optionText(w("2", "legacy", "遗产；遗赠"), "zh"));
  });
});

describe("buildQuestions:释义撞车的词不许同时出现在四个选项里", () => {
  /* 真实撞车对(取自库内实测):heritage / legacy 首义项都是「遗产」 */
  const pool = [
    w("a", "heritage", "遗产；传统"),
    w("b", "legacy", "遗产；遗赠"),
    w("c", "custom", "习俗"),
    w("d", "tradition", "传统"),
    w("e", "ritual", "仪式"),
    w("f", "artifact", "文物"),
  ];

  it("答案是 heritage 时,legacy 不该混进选项(否则两个「遗产」)", () => {
    const [q] = buildQuestions(pool, [pool[0]], "zh");
    expect(q).toBeDefined();
    expect(q.options.filter(o => o === "遗产")).toHaveLength(1);
    expect(q.options[q.answerIndex]).toBe("遗产");
  });

  it("四个选项永远互不相同", () => {
    for (const t of pool) {
      const [q] = buildQuestions(pool, [t], "zh");
      if (!q) continue;                       // 池子不够时跳过整道题,是既定行为
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("answerIndex 指向的一定是这个词自己的释义", () => {
    for (const t of pool) {
      const [q] = buildQuestions(pool, [t], "zh");
      if (!q) continue;
      expect(q.options[q.answerIndex]).toBe(optionText(t, "zh"));
    }
  });

  it("池子小到凑不出 4 个不同选项时**不出残题**,而不是出三选项的题", () => {
    const tiny = [w("x", "heritage", "遗产"), w("y", "legacy", "遗产"), w("z", "custom", "习俗")];
    const qs = buildQuestions(tiny, tiny, "zh");
    for (const q of qs) expect(q.options).toHaveLength(4);
  });
});
