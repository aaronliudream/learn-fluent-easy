/**
 * 《英语闯关》题目数据契约 — Phase 1
 *
 * 判别联合 (discriminated union):
 *   - 每个 type 分支独立定义自己的必填字段；消费者用
 *     Extract<FCQuestion, { type: "xxx" }> 拿到精确类型，
 *     字段访问编译期校验。
 *   - Phase 2 AI 出题时本 schema 直接做 Claude API 返回值契约，
 *     TS 强制 AI 输出合规。
 *
 * 7 个题型：本 Phase 1 实际用前 6 个，第 7 个 reading_choose_answer
 * 提前留口（Phase 3 关卡 6 下半题），形状与 reading_judge_TF 一致。
 */

/* ---------- 共通基础字段（所有题型必有） ---------- */
interface FCQuestionBase {
  id: string;
  /** 所属 PEP unit，如 "g4v2_u3"。 */
  unitId: string;
  difficulty: Difficulty;
  /** Phase 2 AI 出题词义域标签，非空。 */
  vocab_domain: string[];
  /** Phase 2 AI 出题语法点标签，非空。 */
  grammar_point: string[];
  /** 中文题干指令。 */
  prompt: string;
  source: FinalChallengeSource;
  /** 来源溯源（"A 套 第 X 题"等），可选。 */
  source_ref?: string;
  /** 出题意图说明，可选。 */
  note?: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export type FinalChallengeSource = "real_exam" | "ai_generated" | "manual";

export type FinalChallengeQuestionType =
  | "picture_match_sentence"
  | "picture_match_word"
  | "listen_and_choose_word"
  | "listen_and_judge_picture"
  | "odd_one_out"
  | "reading_judge_TF"
  | "reading_choose_answer";

/** 阅读类题目内部的子题。 */
export interface FCSubQuestion {
  stem: string;
  options: string[];
  answer: number;
}

/* ---------- 各题型分支 ---------- */

export type FCQuestion =
  /** 关 1：看图选句 */
  | (FCQuestionBase & {
      type: "picture_match_sentence";
      emoji: string;
      options: string[];
      answer: number;
    })
  /** 关 2：看图选词 */
  | (FCQuestionBase & {
      type: "picture_match_word";
      emoji: string;
      options: string[];
      answer: number;
    })
  /** 关 3：听音辨词。`audio` 为 TTS 文本。 */
  | (FCQuestionBase & {
      type: "listen_and_choose_word";
      audio: string;
      options: string[];
      answer: number;
    })
  /** 关 4：听句判图。`options` 固定 [T, F]，`answer` ∈ {0, 1}。 */
  | (FCQuestionBase & {
      type: "listen_and_judge_picture";
      emoji: string;
      audio: string;
      options: string[];
      answer: number;
    })
  /** 关 5：找不同类词 */
  | (FCQuestionBase & {
      type: "odd_one_out";
      options: string[];
      answer: number;
    })
  /** 关 6 上半：阅读判断 T/F。
   * 顶层不再带 options/answer，真选项全在 subQuestions 里。 */
  | (FCQuestionBase & {
      type: "reading_judge_TF";
      passage: string;
      subQuestions: FCSubQuestion[];
    })
  /** 关 6 下半（Phase 3）：阅读选择。形状与 reading_judge_TF 一致。 */
  | (FCQuestionBase & {
      type: "reading_choose_answer";
      passage: string;
      subQuestions: FCSubQuestion[];
    });

/** 向后兼容/语义化别名：在非 Phase 1 业务里读起来更清楚。 */
export type FinalChallengeQuestion = FCQuestion;
