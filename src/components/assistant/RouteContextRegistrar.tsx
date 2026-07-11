import { useLocation, useParams } from "react-router-dom";
import { useRegisterAssistant, type AssistantState } from "@/contexts/AIAssistantContext";

/**
 * Auto-registers a sensible AI-assistant context for every primary / junior /
 * gaokao page so the floating assistant always knows what the user is looking
 * at and can answer page-specific questions — without each page importing
 * `useRegisterAssistant` manually.
 *
 * Pages that DO call `useRegisterAssistant(...)` themselves (the answer/play
 * pages with strict per-question lock) keep working — their hook overrides
 * the route-derived state because their effect runs after this one when the
 * page mounts.
 */

interface RouteCtx {
  context: string;
  topic: string;
  pageTitle: string;
  starters?: string[];
}

// Per-bucket starter questions. Each set should match what the user is
// actually looking at on that kind of page — vocab pages get vocab Qs,
// reading pages get reading Qs, etc. Keep to 3 short prompts.
const STARTERS_VOCAB = [
  "这个词怎么记最快？",
  "用这个词造两个生活化例句",
  "这个词和近义词有什么区别？",
];
const STARTERS_GRAMMAR = [
  "这个语法点的核心规则是什么？",
  "再举两个生活化例句",
  "和类似语法点有什么区别？",
];
const STARTERS_READING = [
  "这篇文章的主旨是什么？",
  "解释一下这段难句",
  "高考阅读常见的出题套路是什么？",
];
const STARTERS_CLOZE = [
  "完形填空怎么排除干扰项？",
  "这道题的关键线索在哪里？",
  "讲一个常考的固定搭配",
];
const STARTERS_LISTENING = [
  "听不懂连读怎么办？",
  "高考听力常见场景词有哪些？",
  "怎么练才能跟上语速？",
];
const STARTERS_WRITING = [
  "高考作文怎么开头更出彩？",
  "给我一个高级句型模板",
  "怎么避免中式英语？",
];
const STARTERS_MISTAKES = [
  "我最近最该补哪个知识点？",
  "这道错题的关键点是什么？",
  "怎么避免下次再错？",
];
const STARTERS_PHONICS = [
  "这个字母组合怎么发音？",
  "再举几个同样发音的单词",
  "怎么练自然拼读最有效？",
];
const STARTERS_HOME = [
  "怎么规划接下来一周的学习？",
  "我现在最该练哪一项？",
  "高考英语怎么短期提分？",
];

function deriveContext(pathname: string, params: Record<string, string | undefined>): RouteCtx | null {
  const grade = params.grade ?? params.gradeId;
  // ---------- PRIMARY ----------
  if (pathname.startsWith("/primary")) {
    if (pathname.match(/\/primary\/vocab/)) return mk("primary-vocab", `小学英语词汇${grade ? ` · 第 ${grade} 册` : ""}`, "💬 小月 · 小学词汇辅导", STARTERS_VOCAB);
    if (pathname.match(/\/primary\/hub\/\d+\/.*\/phonics/))
      return mk("primary-phonics", "小学单元拼读", "💬 小月 · 自然拼读辅导", STARTERS_PHONICS);
    if (pathname.match(/\/primary\/letters/)) return mk("primary-phonics", "小学自然拼读", "💬 小月 · 自然拼读辅导", STARTERS_PHONICS);
    if (pathname.match(/\/primary\/games/)) return mk("primary-games", "小学英语游戏练习", "💬 小月 · 小学游戏辅导", STARTERS_HOME);
    if (pathname.match(/\/primary\/reading/)) return mk("primary-reading", "小学英语阅读", "💬 小月 · 小学阅读辅导", STARTERS_READING);
    if (pathname.match(/\/primary\/culture/)) return mk("primary-culture", "小学英文文化卡", "💬 小月 · 文化辅导", STARTERS_HOME);
    if (pathname.match(/\/primary\/chat/)) return mk("primary-chat", "小学英文对话", "💬 小月 · 小学对话练习", STARTERS_HOME);
    if (pathname.match(/\/primary\/lesson/)) return mk("primary-lesson", "小学英语课文", "💬 小月 · 课文讲解", STARTERS_READING);
    if (pathname.match(/\/primary\/assessment/)) return mk("primary-assessment", "小学英语测评", "💬 小月 · 测评辅导", STARTERS_HOME);
    if (pathname.match(/\/primary\/parent/)) return mk("primary-parent", "小学家长指南", "💬 小月 · 家长答疑", STARTERS_HOME);
    if (pathname.match(/\/primary\/grade/)) return mk("primary-grade", `小学英语 · 第 ${grade ?? ""} 册`, "💬 小月 · 小学辅导", STARTERS_HOME);
    return mk("primary-home", "小学英语学习", "💬 小月 · 小学英语助手", STARTERS_HOME);
  }
  // ---------- JUNIOR ----------
  if (pathname.startsWith("/junior")) {
    if (pathname.match(/\/junior\/vocab/)) return mk("junior-vocab", `初中英语词汇${grade ? ` · 第 ${grade} 册` : ""}`, "💬 小月 · 初中词汇辅导", STARTERS_VOCAB);
    if (pathname.match(/\/junior\/grammar(\/lab)?$/)) return mk("junior-grammar-lab", "初中语法实验室", "💬 小月 · 语法辅导", STARTERS_GRAMMAR);
    if (pathname.match(/\/junior\/grammar\//)) return mk("junior-grammar-point", "初中语法知识点", "💬 小月 · 语法点辅导", STARTERS_GRAMMAR);
    if (pathname.match(/\/junior\/grammar/)) return mk("junior-grammar", "初中英语语法", "💬 小月 · 初中语法辅导", STARTERS_GRAMMAR);
    if (pathname.match(/\/junior\/reading/)) return mk("junior-reading", "初中英语阅读", "💬 小月 · 初中阅读辅导", STARTERS_READING);
    if (pathname.match(/\/junior\/listening/)) return mk("junior-listening", "初中英语听力", "💬 小月 · 听力辅导", STARTERS_LISTENING);
    if (pathname.match(/\/junior\/writing/)) return mk("junior-writing", "初中英语写作", "💬 小月 · 写作辅导", STARTERS_WRITING);
    if (pathname.match(/\/junior\/grade/)) return mk("junior-grade", `初中英语 · 第 ${grade ?? ""} 册`, "💬 小月 · 初中辅导", STARTERS_HOME);
    return mk("junior-home", "初中英语学习", "💬 小月 · 初中英语助手", STARTERS_HOME);
  }
  // ---------- GAOKAO (高中) ----------
  if (pathname.startsWith("/gaokao")) {
    if (pathname.match(/\/gaokao\/vocab/)) return mk("gaokao-vocab", "高考英语词汇 3500", "💬 小月 · 高考词汇辅导", STARTERS_VOCAB);
    if (pathname.match(/\/gaokao\/grammar\//)) return mk("gaokao-grammar-point", "高考语法知识点", "💬 小月 · 语法点辅导", STARTERS_GRAMMAR);
    if (pathname.match(/\/gaokao\/grammar/)) return mk("gaokao-grammar", "高考英语语法", "💬 小月 · 高考语法辅导", STARTERS_GRAMMAR);
    if (pathname.match(/\/gaokao\/reading/)) return mk("gaokao-reading", "高考英语阅读理解", "💬 小月 · 阅读辅导", STARTERS_READING);
    if (pathname.match(/\/gaokao\/cloze/)) return mk("gaokao-cloze", "高考英语完形填空", "💬 小月 · 完形辅导", STARTERS_CLOZE);
    if (pathname.match(/\/gaokao\/mistakes/)) return mk("gaokao-mistakes", "高考英语错题本", "💬 小月 · 错题讲解", STARTERS_MISTAKES);
    if (pathname.match(/\/gaokao\/exam/)) return mk("gaokao-exam", "高考英语真题", "💬 小月 · 真题辅导", STARTERS_HOME);
    if (pathname.match(/\/gaokao\/grade/)) return mk("gaokao-grade", `高考英语 · 第 ${grade ?? ""} 册`, "💬 小月 · 高考辅导", STARTERS_HOME);
    return mk("gaokao-home", "高考英语学习", "💬 小月 · 高考英语助手", STARTERS_HOME);
  }
  return null;
}

function mk(context: string, topic: string, pageTitle: string, starters?: string[]): RouteCtx {
  return { context, topic, pageTitle, starters };
}

export default function RouteContextRegistrar() {
  const { pathname } = useLocation();
  const params = useParams();
  const route = deriveContext(pathname, params as Record<string, string | undefined>);

  const state: AssistantState | null = route
    ? {
        context: route.context,
        ref: pathname, // unique per URL
        topic: route.topic,
        mode: "free",
        unlocked: true,
        pageTitle: route.pageTitle,
        starters: route.starters,
      }
    : null;

  useRegisterAssistant(state);
  return null;
}
