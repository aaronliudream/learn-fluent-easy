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
}

function deriveContext(pathname: string, params: Record<string, string | undefined>): RouteCtx | null {
  const grade = params.grade ?? params.gradeId;
  // ---------- PRIMARY ----------
  if (pathname.startsWith("/primary")) {
    if (pathname.match(/\/primary\/vocab/)) return mk("primary-vocab", `小学英语词汇${grade ? ` · 第 ${grade} 册` : ""}`, "💬 小月 · 小学词汇辅导");
    if (pathname.match(/\/primary\/letters/)) return mk("primary-phonics", "小学自然拼读", "💬 小月 · 自然拼读辅导");
    if (pathname.match(/\/primary\/games/)) return mk("primary-games", "小学英语游戏练习", "💬 小月 · 小学游戏辅导");
    if (pathname.match(/\/primary\/reading/)) return mk("primary-reading", "小学英语阅读", "💬 小月 · 小学阅读辅导");
    if (pathname.match(/\/primary\/culture/)) return mk("primary-culture", "小学英文文化卡", "💬 小月 · 文化辅导");
    if (pathname.match(/\/primary\/chat/)) return mk("primary-chat", "小学英文对话", "💬 小月 · 小学对话练习");
    if (pathname.match(/\/primary\/lesson/)) return mk("primary-lesson", "小学英语课文", "💬 小月 · 课文讲解");
    if (pathname.match(/\/primary\/assessment/)) return mk("primary-assessment", "小学英语测评", "💬 小月 · 测评辅导");
    if (pathname.match(/\/primary\/parent/)) return mk("primary-parent", "小学家长指南", "💬 小月 · 家长答疑");
    if (pathname.match(/\/primary\/grade/)) return mk("primary-grade", `小学英语 · 第 ${grade ?? ""} 册`, "💬 小月 · 小学辅导");
    return mk("primary-home", "小学英语学习", "💬 小月 · 小学英语助手");
  }
  // ---------- JUNIOR ----------
  if (pathname.startsWith("/junior")) {
    if (pathname.match(/\/junior\/vocab/)) return mk("junior-vocab", `初中英语词汇${grade ? ` · 第 ${grade} 册` : ""}`, "💬 小月 · 初中词汇辅导");
    if (pathname.match(/\/junior\/grammar(\/lab)?$/)) return mk("junior-grammar-lab", "初中语法实验室", "💬 小月 · 语法辅导");
    if (pathname.match(/\/junior\/grammar\//)) return mk("junior-grammar-point", "初中语法知识点", "💬 小月 · 语法点辅导");
    if (pathname.match(/\/junior\/grammar/)) return mk("junior-grammar", "初中英语语法", "💬 小月 · 初中语法辅导");
    if (pathname.match(/\/junior\/reading/)) return mk("junior-reading", "初中英语阅读", "💬 小月 · 初中阅读辅导");
    if (pathname.match(/\/junior\/listening/)) return mk("junior-listening", "初中英语听力", "💬 小月 · 听力辅导");
    if (pathname.match(/\/junior\/writing/)) return mk("junior-writing", "初中英语写作", "💬 小月 · 写作辅导");
    if (pathname.match(/\/junior\/grade/)) return mk("junior-grade", `初中英语 · 第 ${grade ?? ""} 册`, "💬 小月 · 初中辅导");
    return mk("junior-home", "初中英语学习", "💬 小月 · 初中英语助手");
  }
  // ---------- GAOKAO (高中) ----------
  if (pathname.startsWith("/gaokao")) {
    if (pathname.match(/\/gaokao\/vocab/)) return mk("gaokao-vocab", "高考英语词汇 3500", "💬 小月 · 高考词汇辅导");
    if (pathname.match(/\/gaokao\/grammar\//)) return mk("gaokao-grammar-point", "高考语法知识点", "💬 小月 · 语法点辅导");
    if (pathname.match(/\/gaokao\/grammar/)) return mk("gaokao-grammar", "高考英语语法", "💬 小月 · 高考语法辅导");
    if (pathname.match(/\/gaokao\/reading/)) return mk("gaokao-reading", "高考英语阅读理解", "💬 小月 · 阅读辅导");
    if (pathname.match(/\/gaokao\/cloze/)) return mk("gaokao-cloze", "高考英语完形填空", "💬 小月 · 完形辅导");
    if (pathname.match(/\/gaokao\/mistakes/)) return mk("gaokao-mistakes", "高考英语错题本", "💬 小月 · 错题讲解");
    if (pathname.match(/\/gaokao\/exam/)) return mk("gaokao-exam", "高考英语真题", "💬 小月 · 真题辅导");
    if (pathname.match(/\/gaokao\/diagnostic/)) return mk("gaokao-diagnostic", "高考英语诊断", "💬 小月 · 诊断报告解读");
    if (pathname.match(/\/gaokao\/grade/)) return mk("gaokao-grade", `高考英语 · 第 ${grade ?? ""} 册`, "💬 小月 · 高考辅导");
    return mk("gaokao-home", "高考英语学习", "💬 小月 · 高考英语助手");
  }
  return null;
}

function mk(context: string, topic: string, pageTitle: string): RouteCtx {
  return { context, topic, pageTitle };
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
      }
    : null;

  useRegisterAssistant(state);
  return null;
}
