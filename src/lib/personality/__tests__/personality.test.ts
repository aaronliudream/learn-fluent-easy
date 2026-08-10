import { describe, expect, it } from "vitest";
import {
  ITEMS_PER_SCALE,
  PERSONALITY_ITEMS,
  SCALE_ORDER,
  orderedItems,
  type PersonalityItem,
  type ScaleId,
} from "../items";
import { PERSONALITY_ITEM_COUNT } from "../meta";
import { TOTAL_ITEMS, functionStackOf, scoreAll, type Answers } from "../scoring";
import { TYPE_PROFILES } from "../profiles";

/**
 * 这组测试守的是三件「坏了不会报错、只会悄悄给出错误结果」的事:
 *   ① 平衡计分被破坏(某量表正反向题不再是 6:6)→ 分数系统性偏向一极
 *   ② 呈现顺序漏题/重题 → 用户答不满 60 题却被判完成
 *   ③ 首页卡片上的「60 道题」与真实题量脱节 → 文案说谎
 */

const ALL_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

/** 全部题按同一方向作答:dir=1 → 每题 keyed 分都是 5(全部推向 A 极)。 */
function answersToward(dir: 1 | -1): Answers {
  const out: Answers = {};
  for (const item of PERSONALITY_ITEMS) {
    const wantsHigh = dir === 1;
    // key=+1 的题:选 5 得 5;key=-1 的题:选 1 翻转后得 5
    out[item.id] = item.key === 1 ? (wantsHigh ? 5 : 1) : wantsHigh ? 1 : 5;
  }
  return out;
}

describe("题库结构", () => {
  it("共 60 题,id 不重复", () => {
    expect(PERSONALITY_ITEMS).toHaveLength(60);
    expect(TOTAL_ITEMS).toBe(60);
    expect(new Set(PERSONALITY_ITEMS.map((i) => i.id)).size).toBe(60);
  });

  it("每个量表 12 题,且正向 6 / 反向 6(平衡计分)", () => {
    for (const scale of SCALE_ORDER) {
      const items = PERSONALITY_ITEMS.filter((i) => i.scale === scale);
      expect(items, scale).toHaveLength(ITEMS_PER_SCALE);
      expect(items.filter((i) => i.key === 1), `${scale} 正向题`).toHaveLength(6);
      expect(items.filter((i) => i.key === -1), `${scale} 反向题`).toHaveLength(6);
    }
  });

  it("每题中英文都不为空,且两种语言不是同一串", () => {
    for (const item of PERSONALITY_ITEMS) {
      expect(item.zh.trim().length, item.id).toBeGreaterThan(3);
      expect(item.en.trim().length, item.id).toBeGreaterThan(3);
      expect(item.zh).not.toBe(item.en);
    }
  });

  it("首页卡片上的题量常量与真实题量一致", () => {
    expect(PERSONALITY_ITEM_COUNT).toBe(PERSONALITY_ITEMS.length);
  });
});

describe("呈现顺序", () => {
  const ordered = orderedItems();

  it("不多不少,每题恰好出现一次", () => {
    expect(ordered).toHaveLength(PERSONALITY_ITEMS.length);
    expect(new Set(ordered.map((i) => i.id)).size).toBe(PERSONALITY_ITEMS.length);
  });

  it("相邻两题不会来自同一量表(避免连着问同一类问题)", () => {
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].scale, `第 ${i + 1} 题`).not.toBe(ordered[i - 1].scale);
    }
  });

  it("顺序是确定的(刷新页面不会变)", () => {
    expect(orderedItems().map((i) => i.id)).toEqual(ordered.map((i) => i.id));
  });
});

describe("计分", () => {
  it("全部推向高分端 → ESTJ-A,四个字母清晰度都是 100", () => {
    const r = scoreAll(answersToward(1));
    expect(r.type).toBe("ESTJ");
    expect(r.code).toBe("ESTJ-A");
    for (const scale of SCALE_ORDER) {
      expect(r.scales[scale].pomp, scale).toBe(100);
      expect(r.scales[scale].clarity, scale).toBe(100);
      expect(r.scales[scale].borderline, scale).toBe(false);
    }
  });

  it("全部推向低分端 → INFP-T", () => {
    const r = scoreAll(answersToward(-1));
    expect(r.code).toBe("INFP-T");
    for (const scale of SCALE_ORDER) expect(r.scales[scale].pomp, scale).toBe(0);
  });

  it("★平衡计分生效:全部选「非常符合」时每个量表都落在正中间", () => {
    // 一路点同意的人,正向题和反向题互相抵消 —— 这正是 balanced keying 的目的。
    // 如果哪天某个量表的正反向题不再 6:6,这条会立刻变红。
    const allAgree: Answers = {};
    for (const item of PERSONALITY_ITEMS) allAgree[item.id] = 5;
    const r = scoreAll(allAgree);
    for (const scale of SCALE_ORDER) {
      expect(r.scales[scale].pomp, scale).toBe(50);
      expect(r.scales[scale].clarity, scale).toBe(0);
      expect(r.scales[scale].borderline, scale).toBe(true);
    }
    // 平局一律判给 I/N/F/P(与 MBTI 官方平局归属规则一致)
    expect(r.type).toBe("INFP");
  });

  it("大五换算:高分端作答 → 尽责性/外向性满分,开放性/宜人性/神经质 0 分", () => {
    const r = scoreAll(answersToward(1));
    const byKey = Object.fromEntries(r.bigFive.map((b) => [b.key, b.score]));
    expect(byKey.C).toBe(100);
    expect(byKey.E).toBe(100);
    expect(byKey.O).toBe(0);
    expect(byKey.A).toBe(0);
    expect(byKey.N).toBe(0);
  });

  it("未作答的题按中点计入,不会让分数跑飞", () => {
    const r = scoreAll({});
    for (const scale of SCALE_ORDER) expect(r.scales[scale].pomp, scale).toBe(50);
    expect(r.answeredCount).toBe(0);
  });

  it("质量探针:直线作答 / 前后不一致 / 过快 都能识别", () => {
    const allAgree: Answers = {};
    for (const item of PERSONALITY_ITEMS) allAgree[item.id] = 5;
    // 全选 5:直线作答 + 正反向题彻底打架(差值 4)
    const straight = scoreAll(allAgree, 10 * 60 * 1000);
    expect(straight.quality.straightLining).toBe(true);
    expect(straight.quality.inconsistency).toBeCloseTo(4, 5);
    expect(straight.quality.inconsistent).toBe(true);
    expect(straight.quality.tooFast).toBe(false);

    // 前后一致的作答:不应触发任何旗标
    const clean = scoreAll(answersToward(1), 10 * 60 * 1000);
    expect(clean.quality.inconsistency).toBe(0);
    expect(clean.quality.any).toBe(false);

    // 60 题 30 秒 = 0.5 秒/题
    const fast = scoreAll(answersToward(1), 30 * 1000);
    expect(fast.quality.tooFast).toBe(true);
  });
});

describe("荣格功能序", () => {
  const KNOWN: Record<string, string[]> = {
    ESTJ: ["Te", "Si", "Ne", "Fi"],
    INFP: ["Fi", "Ne", "Si", "Te"],
    INTJ: ["Ni", "Te", "Fi", "Se"],
    ENFP: ["Ne", "Fi", "Te", "Si"],
    ISTP: ["Ti", "Se", "Ni", "Fe"],
    ESFJ: ["Fe", "Si", "Ne", "Ti"],
  };

  it("与标准功能序一致", () => {
    for (const [type, stack] of Object.entries(KNOWN)) {
      expect(functionStackOf(type), type).toEqual(stack);
    }
  });

  it("16 型的功能序两两不同,且每型四个功能互不重复", () => {
    const seen = new Set<string>();
    for (const type of ALL_TYPES) {
      const stack = functionStackOf(type);
      expect(new Set(stack).size, type).toBe(4);
      seen.add(stack.join("-"));
    }
    expect(seen.size).toBe(16);
  });
});

describe("16 型文案", () => {
  it("16 个类型一个不缺", () => {
    expect(Object.keys(TYPE_PROFILES).sort()).toEqual([...ALL_TYPES].sort());
  });

  it("每型的每个字段中英文都齐全,优势/盲点各至少 3 条", () => {
    for (const type of ALL_TYPES) {
      const p = TYPE_PROFILES[type];
      expect(p.code, type).toBe(type);
      expect(p.strengths.length, type).toBeGreaterThanOrEqual(3);
      expect(p.watchOuts.length, type).toBeGreaterThanOrEqual(3);
      const bis = [p.nickname, p.tagline, p.summary, p.stress, p.teamwork, p.englishTip, ...p.strengths, ...p.watchOuts];
      for (const bi of bis) {
        expect(bi.zh.trim().length, `${type} zh`).toBeGreaterThan(2);
        expect(bi.en.trim().length, `${type} en`).toBeGreaterThan(2);
      }
    }
  });

  it("类型名称不重复(防复制粘贴时漏改)", () => {
    const zhNames = ALL_TYPES.map((t) => TYPE_PROFILES[t].nickname.zh);
    const enNames = ALL_TYPES.map((t) => TYPE_PROFILES[t].nickname.en);
    expect(new Set(zhNames).size).toBe(16);
    expect(new Set(enNames).size).toBe(16);
  });

  it("每型的英语学习建议是独有的一段,不是复制的模板", () => {
    const tips = ALL_TYPES.map((t) => TYPE_PROFILES[t].englishTip.zh);
    expect(new Set(tips).size).toBe(16);
    for (const tip of tips) expect(tip.length).toBeGreaterThan(40);
  });
});

describe("量表方向", () => {
  it("每个量表单独推向高分端时,只有该量表的字母翻面", () => {
    const scales: ScaleId[] = ["EI", "SN", "TF", "JP"];
    for (const target of scales) {
      const answers: Answers = {};
      for (const item of PERSONALITY_ITEMS as PersonalityItem[]) {
        // 目标量表推向 A 极,其余量表全部答中点
        answers[item.id] = item.scale === target ? (item.key === 1 ? 5 : 1) : 3;
      }
      const r = scoreAll(answers);
      expect(r.scales[target].pomp, target).toBe(100);
      for (const other of scales.filter((s) => s !== target)) {
        expect(r.scales[other].pomp, `${target} 影响到了 ${other}`).toBe(50);
      }
    }
  });
});
