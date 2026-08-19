/**
 * 「从学习到掌握」这条路能不能走通 —— 按 2026-08-17 规格的五条验收判据写。
 *
 * 背景:用户学了 800+ 词、错题本 85 词三天连对已清除,**掌握数为 0**。
 * 根因不是数据没同步,是 todayPlan 把题型硬编码成 zh_choice,
 * 于是 isMasteredRow 的第三条(modes_correct ≥ 2)对绝大多数词**永远为假**。
 *
 * ⚠️ 这里一律调**真实现**(nextMasteryState / pickMode / isMasteredRow),
 *    不在测试里照抄那套算术 —— 抄一遍就是把状态机实现第二遍,
 *    真实现改坏了测试还会绿。
 */
import { describe, expect, it } from "vitest";
import { isMasteredRow, masteryProgress, MASTERY_THRESHOLDS } from "./data";
import { nextMasteryState } from "./vocabMastery";
import { MISTAKE_ALLOWED, MODE_ROTATION, pickMistakeMode, pickMode } from "./todayPlan";
import type { VocabMode } from "./vocabMastery";

/** 一个词的掌握度行,按天喂作答。 */
type Row = Parameters<typeof nextMasteryState>[0];
const EMPTY: Row = null;
const ALL = { audio: true, defEn: true };

/** 走一天:按当天该出的题型答一次。返回新行。 */
function answerOnce(row: Row, day: string, correct = true, mode?: VocabMode): Row {
  const m = mode ?? pickMode(row?.correct_days ?? 0, row?.modes_correct ?? [], ALL);
  return nextMasteryState(row, correct, m, day) as Row;
}

describe("判据①:新词走完全程能到掌握", () => {
  it("连续 4 个不同日子答对(题型按轮换)→ isMasteredRow 为 true", () => {
    let row: Row = EMPTY;
    const modesSeen: string[] = [];
    for (const day of ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"]) {
      const m = pickMode(row?.correct_days ?? 0, row?.modes_correct ?? [], ALL);
      modesSeen.push(m);
      row = nextMasteryState(row, true, m, day) as Row;
    }
    expect(row!.correct_days).toBe(4);
    expect(row!.mastery_level).toBe(4);
    expect(new Set(row!.modes_correct!).size).toBeGreaterThanOrEqual(MASTERY_THRESHOLDS.modes);
    expect(isMasteredRow(row!)).toBe(true);
    /* 顺带钉住:四天出的是四种**不同**题型,不是同一种重复四遍 */
    expect(new Set(modesSeen).size).toBe(4);
  });

  it("⚠️ 反证:题型全锁死成 zh_choice(修复前的行为)→ 学多少天都不掌握", () => {
    let row: Row = EMPTY;
    for (const day of ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"]) {
      row = nextMasteryState(row, true, "zh_choice", day) as Row;
    }
    expect(row!.correct_days).toBe(6);
    expect(row!.mastery_level).toBe(5);              // 等级早就顶格
    expect(new Set(row!.modes_correct!).size).toBe(1);
    expect(isMasteredRow(row!)).toBe(false);          // 第三条卡死
  });
});

describe("判据②:存量用户即刻受益(本次的已知答案样本)", () => {
  /* 规格给的样本形状:用户 591b95bc 中 correct_days>=3 AND mastery_level>=3 AND modes=1
     的词有 75+ 个。改完之后,这些词**再答对一次不同题型就该变掌握**。
     如果这条不过,是改动没生效 —— 不要先去怀疑数据。 */
  const stuck: Row = {
    mastery_level: 3, correct_days: 3, last_correct_date: "2026-08-16",
    modes_correct: ["zh_choice"], tested_count: 9, review_interval_idx: 2,
  };

  it("卡住的词:此刻确实不算掌握,且差的正是「题型」这一条", () => {
    expect(isMasteredRow(stuck!)).toBe(false);
    const p = masteryProgress(stuck!);
    expect(p.modes.ok).toBe(false);
    expect(p.modes.have).toBe(1);
  });

  it("换一天、按轮换答对一次 → 三条同时达标,当场变掌握", () => {
    const mode = pickMode(stuck!.correct_days ?? 0, stuck!.modes_correct ?? [], ALL);
    expect(mode).not.toBe("zh_choice");                       // 必须是没答对过的题型
    const after = nextMasteryState(stuck, true, mode, "2026-08-17") as Row;
    expect(after!.correct_days).toBe(4);
    expect(after!.mastery_level).toBe(4);
    expect(new Set(after!.modes_correct!).size).toBe(2);
    expect(isMasteredRow(after!)).toBe(true);
  });

  it("⚠️ 同一天答对不算数:last_correct_date 就是今天时,天数/等级都不动", () => {
    const mode = pickMode(stuck!.correct_days ?? 0, stuck!.modes_correct ?? [], ALL);
    const after = nextMasteryState(stuck, true, mode, "2026-08-16") as Row;   // 与 last_correct_date 同日
    expect(after!.correct_days).toBe(3);
    expect(after!.mastery_level).toBe(3);
    expect(new Set(after!.modes_correct!).size).toBe(2);   // 但题型仍并入 —— 换题型答对有信息量
    expect(isMasteredRow(after!)).toBe(false);
  });
});

describe("判据③:同日答对 10 次仍只 +1(别改坏现有行为)", () => {
  it("第一次 +1,之后 9 次不再加", () => {
    let row: Row = nextMasteryState(EMPTY, true, "zh_choice", "2026-08-01") as Row;
    expect(row!.correct_days).toBe(1);
    for (let i = 0; i < 9; i++) row = nextMasteryState(row, true, "zh_choice", "2026-08-01") as Row;
    expect(row!.correct_days).toBe(1);
    expect(row!.mastery_level).toBe(1);
    expect(row!.tested_count).toBe(10);        // 但作答次数照记
  });
});

describe("判据④:连续复习同一个词,题型互不相同", () => {
  it("连做三天,三种题型两两不同", () => {
    let row: Row = EMPTY;
    const seen: VocabMode[] = [];
    for (const day of ["2026-08-01", "2026-08-02", "2026-08-03"]) {
      const m = pickMode(row?.correct_days ?? 0, row?.modes_correct ?? [], ALL);
      seen.push(m);
      row = nextMasteryState(row, true, m, day) as Row;
    }
    expect(new Set(seen).size).toBe(3);
  });

  it("轮换表里全答对过之后,回落到 zh_choice(不再是瓶颈)", () => {
    const done = [...MODE_ROTATION];
    expect(pickMode(9, done, ALL)).toBe("zh_choice");
  });

  it("⚠️ 出不了的题型要跳过:没音频不出 listen,没英文释义不出 en_choice", () => {
    /* 出一道放不出声的听力题 = 用户答不了,却会被记一次作答 */
    expect(pickMode(1, ["zh_choice"], { audio: false, defEn: true })).not.toBe("listen");
    expect(pickMode(2, ["zh_choice", "listen"], { audio: true, defEn: false })).not.toBe("en_choice");
    /* 两个都缺:只剩 spell 和 zh_choice */
    expect(["spell", "zh_choice"]).toContain(pickMode(1, ["zh_choice"], { audio: false, defEn: false }));
  });

  it("按天数取的那一档已经答对过时,改挑别的没答对过的,而不是重复它", () => {
    /* correct_days=1 → 首选 listen;但这个词的 listen 已经答对过了 */
    const m = pickMode(1, ["listen"], ALL);
    expect(m).not.toBe("listen");
    expect(["zh_choice", "en_choice", "spell"]).toContain(m);
  });
});

describe("结构闸:轮换表里的每种题型,今日学习都得真的出得了", () => {
  /**
   * ⚠️ 这条防的是本次最危险的失败形态:
   *    往 MODE_ROTATION 里加一种题型,但 VocabToday 没有对应渲染分支 ——
   *    界面出的还是英汉选择,写库却记成新题型,**等于替用户记上他没做过的题型**,
   *    掌握度凭空达标。这种错不会让任何测试变红,界面看着也正常。
   * 判据只能做到"源码里出现过这个 mode 的分支",判不了渲染得对不对(那要人看)。
   * 但它足以拦住"加了表没加分支"这一类,成本又几乎为零。
   */
  it("VocabToday 源码里每个轮换题型都有分支", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync("src/pages/vocab/VocabToday.tsx", "utf8");
    for (const m of MODE_ROTATION) {
      // zh_choice 是兜底分支(else),源码里不会出现字面量,单独放过
      if (m === "zh_choice") continue;
      expect(src, `MODE_ROTATION 有 ${m},但 VocabToday.tsx 里找不到它的分支`)
        .toContain(`"${m}"`);
    }
  });

  it("match 不在轮换表里(它是多词翻牌,今日学习出不了单题)", () => {
    expect(MODE_ROTATION).not.toContain("match");
  });
});

describe("判据⑤:进度显示与 isMasteredRow 不许分叉", () => {
  /* 穷举三条腿在阈值附近的所有组合,masteryProgress().mastered 必须与 isMasteredRow 完全一致。
     这条防的是"进度显示 4/4 · 2/2 却不标掌握"那类鬼故事。 */
  it("阈值邻域穷举:两者结论逐个相同", () => {
    for (let level = 0; level <= 5; level++) {
      for (let days = 0; days <= 5; days++) {
        for (const modes of [[], ["zh_choice"], ["zh_choice", "listen"], ["zh_choice", "listen", "spell"]]) {
          const row = { mastery_level: level, correct_days: days, modes_correct: modes };
          expect(masteryProgress(row).mastered).toBe(isMasteredRow(row));
        }
      }
    }
  });

  it("三条腿的 ok 与阈值一致,且 have 不超报", () => {
    const p = masteryProgress({ mastery_level: 3, correct_days: 4, modes_correct: ["zh_choice", "zh_choice"] });
    expect(p.days).toEqual({ have: 4, need: MASTERY_THRESHOLDS.days, ok: true });
    expect(p.modes).toEqual({ have: 1, need: MASTERY_THRESHOLDS.modes, ok: false });  // 去重后只有 1 种
    expect(p.level).toEqual({ have: 3, need: MASTERY_THRESHOLDS.level, ok: false });
    expect(p.mastered).toBe(false);
  });

  it("空行(从没学过)不炸,三条腿都是 0", () => {
    const p = masteryProgress(null);
    expect(p.days.have).toBe(0);
    expect(p.modes.have).toBe(0);
    expect(p.mastered).toBe(false);
  });
});

describe("错题本也要有出口:只用错题本的用户不能永远拿不到第二种题型", () => {
  /**
   * 由来(2026-08-18 库内实证):某用户 710 词,轮换修复上线后又学了 41 个词,
   * modes_correct 仍然只有 zh_choice —— 那 41 个词**全部 in_mistake_book**。
   * 错题本按 last_wrong_mode 出题,错在 zh_choice 就永远只考 zh_choice,
   * 于是 modes 永远 =1,掌握第三条**永远为假**。有的词 tested_count 已经到 6。
   * 这不是轮换坏了,是**这条路径本身没有出口**。
   *
   * 规则改成两段:短板没补回来先补短板,补回来了才轮换。
   */
  /* ⚠️ 直接调**页面用的那份实现**,不在测试里照抄规则 ——
     抄一份的话,页面那份改坏了这里照样绿。 */
  const ALLOWED = MISTAKE_ALLOWED;
  const pickForMistake = (wrong: VocabMode, done: string[], days = 0) =>
    pickMistakeMode(wrong, done, days, ALL);

  it("【已知形状】modes=[zh_choice] 且 last_wrong_mode=zh_choice → 必须给出非 zh_choice", () => {
    /* 这就是那 41 个词此刻的形状:当初错的题型**已经重新答对过了**,
       再出它一遍不会让 modes 增加,用户就卡死在掌握线前。 */
    expect(pickForMistake("zh_choice", ["zh_choice"])).not.toBe("zh_choice");
    expect(pickForMistake("zh_choice", ["zh_choice"])).toBe("en_choice");
  });

  it("【已知形状】modes=[zh_choice] 但 last_wrong_mode=spell → 仍出 spell", () => {
    /* 短板还没补回来,先补短板 —— "错哪练哪"的初衷不能丢。
       ⚠️ spell 不在 ALLOWED 里,所以这条实际会落到轮换;
          断言写成"不是 zh_choice"才是这个页面能兑现的承诺。 */
    const m = pickForMistake("spell", ["zh_choice"]);
    expect(m).not.toBe("zh_choice");
  });

  it("补回来之后再来一轮 → 两种题型都答对过了,第三条达标", () => {
    let done = ["zh_choice"];
    const m1 = pickForMistake("zh_choice", done);
    done = [...done, m1];
    expect(new Set(done).size).toBe(2);
    expect(isMasteredRow({ mastery_level: 4, correct_days: 4, modes_correct: done })).toBe(true);
  });

  it("⚠️ 绝不选这个页面渲染不了的题型(listen / spell / match)", () => {
    /* 选了就会:界面照出选择题、库里记 listen —— 替用户记上他没做过的题型。 */
    for (const done of [[], ["zh_choice"], ["zh_choice", "en_choice"]]) {
      expect(ALLOWED).toContain(pickForMistake("zh_choice", done));
    }
  });

  it("反证:改造前的行为(一律出 last_wrong_mode)→ 学多少次都不掌握", () => {
    let row: Row = null;
    for (const day of ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"]) {
      row = nextMasteryState(row, true, "zh_choice", day) as Row;   // 永远只出错过的那一种
    }
    expect(row!.tested_count).toBe(6);
    expect(new Set(row!.modes_correct!).size).toBe(1);
    expect(isMasteredRow(row!)).toBe(false);
  });
});
