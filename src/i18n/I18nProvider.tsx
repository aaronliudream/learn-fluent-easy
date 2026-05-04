import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_LANG,
  LANGUAGES,
  type LangCode,
  getLanguageInfo,
} from "./languages";
import { BUILTIN, EN, ZH, type StringKey, interpolate } from "./strings";
import { localizeProtagonist } from "./protagonistName";

const STORAGE_LANG = "fluentpath.lang";
const STORAGE_PICKED = "fluentpath.langPicked";
// v4: earlier versions persisted Chinese source text into non-Chinese
// catalogs (ja/ko/etc.), so even after adding new keys the provider would
// "find" a cached value and skip re-translating. Bump the prefix and add a
// stricter sanitiser (see sanitizeCachedCatalog) to evict stale entries.
// v5: previously we sent English as the translation source, which made the
// model occasionally echo the English back unchanged for less-common target
// languages (Punjabi, Bengali, etc.). Those fallbacks then poisoned the
// catalog. Bump the prefix so every client re-fetches once with the new
// Chinese-source pipeline.
const STORAGE_CACHE_PREFIX = "fluentpath.i18n.v5.";
const TRANSLATION_FETCH_TIMEOUT_MS = 2500;

// =====================================================
// Bilingual EN-translation observability
// Lightweight in-memory metrics for the EN-side translation pipeline.
// Logged to console every 30s and exposed via window.__i18nEnStats() so
// you can call it from the dev console at any time.
// =====================================================
const enStats = {
  hits: 0,            // dyn cache hit
  misses: 0,          // queued for translation
  requests: 0,        // edge-function calls
  translated: 0,      // successful items returned
  errors: 0,
  totalMs: 0,         // accumulated request latency
  lastFlushAt: 0,
};
function logEnStats(reason: string) {
  const total = enStats.hits + enStats.misses;
  const hitRate = total ? ((enStats.hits / total) * 100).toFixed(1) : "0.0";
  const avgMs = enStats.requests ? Math.round(enStats.totalMs / enStats.requests) : 0;
  console.info(
    `[i18n.en] ${reason} hits=${enStats.hits} misses=${enStats.misses} ` +
    `hitRate=${hitRate}% requests=${enStats.requests} translated=${enStats.translated} ` +
    `errors=${enStats.errors} avgMs=${avgMs}`,
  );
}
if (typeof window !== "undefined") {
  // @ts-expect-error dev hook
  window.__i18nEnStats = () => ({ ...enStats });
  // Periodic snapshot every 30s if there was activity since last log.
  setInterval(() => {
    if (enStats.hits + enStats.misses === enStats.lastFlushAt) return;
    logEnStats("snapshot");
    enStats.lastFlushAt = enStats.hits + enStats.misses;
  }, 30000);
}

type Catalog = Partial<Record<StringKey, string>>;

const CJK_TEXT_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const HANGUL_TEXT_RE = /[\uac00-\ud7af]/;
const JAPANESE_TEXT_RE = /[\u3040-\u30ff]/;
// Han ideographs (shared by zh / ja / ko). A pure-Han string can be valid
// Japanese (e.g. "単元", "学習") or valid Korean Hanja, so we must NOT reject
// it just because it lacks kana / hangul. Only reject when the value is
// identical to the original Chinese source (i.e. translation didn't happen).
const HAN_RE = /[\u3400-\u9fff]/;

const EN_FALLBACKS: Record<string, string> = {
  "首页": "Home",
  "课程": "Courses",
  "AI 对话": "AI Chat",
  "排行榜": "Leaderboard",
  "我的": "Me",
  "主导航": "Main navigation",
  "家长 / 老师": "Parents / Teachers",
  "当前连胜": "Current streak",
  "今天开练，点亮你的第一天": "Start today and light up your first day",
  "每天 5 分钟，足够养成习惯": "Five minutes a day is enough to build the habit",
  "查看进度": "View progress",
  "欢迎加入": "Welcome aboard",
  "完成第一节课，点亮你的第一颗 ⭐": "Complete your first lesson and light up your first star ⭐",
  "5 分钟即可建立第一天连胜，从此每晚都进步一点点。": "Build your first-day streak in five minutes, then improve a little every night.",
  "测一测你的英语等级": "Check your English level",
  "免费 · 3 分钟": "Free · 3 min",
  "更多学习方式": "More ways to learn",
  "本周排行榜": "Weekly leaderboard",
  "和全球学员一起冲榜，每周清零": "Climb the board with learners worldwide. Resets weekly.",
  "加好友 · 互相鼓励": "Add friends · Encourage each other",
  "看看朋友的连胜，一起坚持下去": "See your friends' streaks and keep going together",
  "登录": "Log in",
  "注册": "Sign up",
  "退出": "Exit",
  "返回": "Back",
  "加载中…": "Loading…",
  "关闭": "Close",
  "取消": "Cancel",
  "确认": "Confirm",
  "保存": "Save",
  "删除": "Delete",
  "提交": "Submit",
  "下一步": "Next",
  "上一步": "Back",
  "开始": "Start",
  "继续": "Continue",
  "完成": "Done",
  "已保存": "Saved",
  "请输入有效邮箱": "Please enter a valid email address",
  "密码至少 6 位": "Password must be at least 6 characters",
  "升级成功！现在可以用邮箱登录了 🎉": "Upgrade successful! You can now log in with email 🎉",
  "昵称至少 2 个字符": "Nickname must be at least 2 characters",
  "数据已导出": "Data exported",
  "导出失败：": "Export failed: ",
  "请输入 DELETE 以确认": "Enter DELETE to confirm",
  "账户已删除": "Account deleted",
  "删除失败：": "Delete failed: ",
  "账户与隐私": "Account & Privacy",
  "管理你的账户、数据与隐私设置": "Manage your account, data and privacy settings",
  "账户信息": "Account information",
  "邮箱": "Email",
  "密码": "Password",
  "昵称": "Nickname",
  "告诉我们你的想法 💬": "Tell us what you think 💬",
  "仅限英语学习 / 网站相关反馈 · 我们会在 24h 内查看": "English-learning or website feedback only · We'll review it within 24 hours",
  "建议": "Suggestion",
  "表扬": "Praise",
  "其他": "Other",
  "整体满意度（可选）": "Overall satisfaction (optional)",
  "发送中…": "Sending…",
  "发送反馈": "Send feedback",
  "反馈": "Feedback",
  "内容不能为空": "Content can't be empty",
  "反馈已收到，谢谢你 🙏": "Feedback received. Thank you 🙏",
  "提交失败": "Submit failed",
  "提交失败，请稍后重试": "Submit failed. Please try again later",
  "把 Big Moon 装到主屏幕": "Install Big Moon on your home screen",
  "点击 Safari 底部的": "Tap the button at the bottom of Safari",
  "分享按钮": "Share button",
  "选择": "Choose",
  "添加到主屏幕": "Add to Home Screen",
  "菜单按钮": "menu button",
  "安装应用": "Install app",
  "在 Chrome / Edge 地址栏右侧点击": "In Chrome / Edge, tap the icon on the right side of the address bar",
  "安装": "Install",
  "图标": "icon",
  "或打开浏览器菜单，选择": "Or open the browser menu and choose",
  "安装 Big Moon": "Install Big Moon",
  "像 App 一样打开，离线也能学，连胜不会断。": "Open it like an app, learn offline, and keep your streak going.",
  "一键安装": "Install now",
  "语音设置": "Voice settings",
  "选择你喜欢的发音角色和语速": "Choose the voice and speed you prefer",
  "角色": "Voice",
  "语速": "Speed",
  "试听示例": "Preview example",
  "重播当前": "Replay current",
  "让发音更自然（强烈推荐）": "Make pronunciation more natural (strongly recommended)",
  "关于我们": "About us",
  "我们的使命": "Our mission",
  "核心价值": "Core values",
  "联系我们": "Contact us",
  "隐私政策": "Privacy Policy",
  "服务条款": "Terms of Service",
  "免责声明": "Disclaimer",
  "句": "sentences",
  "组对话": "dialogue sets",
  "内容更新中，敬请期待 ✨": "Content is being updated. Stay tuned ✨",
  "停止播放": "Stop playback",
  "播放整段对话": "Play full dialogue",
  "巩固一下": "Practice it",
  "播放": "Play",
  "换种说法": "Say it another way",
  "分钟": "min",
  "小时": "hr",
  "分": "min",
  "单词": "Vocabulary",
  "语法": "Grammar",
  "阅读": "Reading",
  "完形": "Cloze",
  "听力": "Listening",
  "写作": "Writing",
  "请先登录后再查看": "Please log in to view this",
};

function englishFallbackFor(text: string) {
  const exact = EN_FALLBACKS[text];
  if (exact) return exact;
  let match = text.match(/^已经坚持\s*(\d+)\s*天，继续保持！$/);
  if (match) return `You've kept going for ${match[1]} days — keep it up!`;
  match = text.match(/^本月已学\s*(\d+)\s*分钟\s*·\s*答对\s*(\d+)\s*题$/);
  if (match) return `Studied ${match[1]} minutes this month · ${match[2]} correct answers`;
  return "";
}

// Strip any HTML tags (e.g. <b>, </b>, <i>) the translator may have added,
// decode common entities, and collapse whitespace. Translations are rendered
// as plain text, so any tag would otherwise show up literally on screen.
function stripHtml(value: string): string {
  if (!value) return value;
  return value
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hasWrongScript(lang: LangCode, value: string | undefined) {
  if (!value) return false;
  if (lang === "zh" || lang === "zh-TW") return false;
  // Japanese and Korean both legitimately use Han characters, so we only
  // flag values that contain CJK characters that are clearly *not* valid
  // for the target language. A value made of pure Han (no kana/hangul)
  // is allowed — the "is it really a translation?" check is handled by
  // the source-equality test in isUsableTranslation.
  if (lang === "ja" || lang === "ko") return false;
  // Other Latin / Cyrillic / etc. languages should never contain CJK at all.
  return CJK_TEXT_RE.test(value);
}

function isUsableTranslation(lang: LangCode, source: string, value: string | undefined) {
  if (!value) return false;
  const cleaned = stripHtml(value);
  if (!cleaned) return false;
  if (lang !== "zh" && lang !== "zh-TW" && cleaned.trim() === stripHtml(source).trim()) return false;
  // For Japanese / Korean, a *long* value with no kana/hangul almost
  // certainly wasn't translated (the model echoed the Chinese back).
  // Short pure-Han results like "単元" are valid translations.
  if (lang === "ja" && cleaned.length > 6 && HAN_RE.test(cleaned) && !JAPANESE_TEXT_RE.test(cleaned)) return false;
  if (lang === "ko" && cleaned.length > 6 && HAN_RE.test(cleaned) && !HANGUL_TEXT_RE.test(cleaned)) return false;
  return !hasWrongScript(lang, cleaned);
}

function sanitizeCachedCatalog(lang: LangCode, cat: Catalog): Catalog {
  const cleaned: Catalog = {};
  for (const [k, v] of Object.entries(cat)) {
    if (typeof v !== "string") continue;
    if (hasWrongScript(lang, v)) continue;
    const stripped = stripHtml(v);
    // Drop entries that aren't actually translated for the target language.
    // This catches stale cache entries where the value equals the English
    // source, or where (for ja/ko) the value is pure Han characters that
    // are really just the original Chinese leaking through. Dropping them
    // forces the next load to re-fetch a real translation.
    const sourceEn = EN[k as StringKey];
    if (sourceEn && !isUsableTranslation(lang, sourceEn, stripped)) continue;
    cleaned[k as StringKey] = stripped;
  }
  return cleaned;
}

function sanitizeDynCache(lang: LangCode, cache: Record<string, string>) {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(cache)) {
    if (typeof v !== "string") continue;
    if (hasWrongScript(lang, v)) continue;
    cleaned[k] = stripHtml(v);
  }
  return cleaned;
}

type I18nContextValue = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  hasPicked: boolean;
  markPicked: () => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  tDynamic: (text: string) => string; // for content (dialogue Chinese hints, etc.)
  /** English version of a static key (for bilingual display). */
  tEn: (key: StringKey, vars?: Record<string, string | number>) => string;
  /** English translation of an arbitrary source text. Async — returns
   *  empty string for one tick if not yet cached, then re-renders. */
  tDynamicEn: (text: string) => string;
  /** Chinese version of a static key (for fixed bilingual zh/EN display). */
  tZh: (key: StringKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function loadCachedCatalog(lang: LangCode): Catalog {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_PREFIX + lang);
    const parsed = raw ? (JSON.parse(raw) as Catalog) : {};
    return sanitizeCachedCatalog(lang, parsed);
  } catch {
    return {};
  }
}

function saveCachedCatalog(lang: LangCode, cat: Catalog) {
  try {
    localStorage.setItem(STORAGE_CACHE_PREFIX + lang, JSON.stringify(cat));
  } catch {
    /* ignore quota */
  }
}

// Per-page dynamic-text cache (e.g., Chinese hint strings inside dialogues
// translated into the user's language). Keyed by source string.
function loadDynCache(lang: LangCode): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_PREFIX + lang + ".dyn");
    const parsed = raw ? JSON.parse(raw) : {};
    return sanitizeDynCache(lang, parsed);
  } catch { return {}; }
}
function saveDynCache(lang: LangCode, c: Record<string, string>) {
  try { localStorage.setItem(STORAGE_CACHE_PREFIX + lang + ".dyn", JSON.stringify(c)); } catch { /* ignore */ }
}

function isSupportedLang(value: unknown): value is LangCode {
  return typeof value === "string" && LANGUAGES.some((l) => l.code === value);
}

async function invokeTranslateWithTimeout(
  targetLanguage: string,
  items: { key: string; text: string }[],
) {
  return Promise.race([
    supabase.functions.invoke("translate", { body: { targetLanguage, items } }),
    new Promise<{ data: null; error: Error }>((resolve) => {
      window.setTimeout(() => resolve({ data: null, error: new Error("translation timeout") }), TRANSLATION_FETCH_TIMEOUT_MS);
    }),
  ]);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const saved = localStorage.getItem(STORAGE_LANG) as LangCode | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    return DEFAULT_LANG;
  });
  const [hasPicked, setHasPicked] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_PICKED) === "1";
  });

  // Static UI catalog for current language.
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const builtin = BUILTIN[lang];
    if (builtin) return builtin;
    return loadCachedCatalog(lang);
  });

  // Dynamic-text cache (translated content snippets).
  const dynCacheRef = useRef<Record<string, string>>({});
  // Separate cache for English translations (used by bilingual UI when the
  // user's chosen language is not English). Keyed by source string.
  const dynEnCacheRef = useRef<Record<string, string>>({});
  // Bumped whenever a batch of dynamic translations lands. We MUST include
  // this in the memoised context value so that <T> / useT() consumers
  // actually re-render and pick up the freshly cached translation —
  // otherwise translations sit in the cache forever and the user keeps
  // seeing the original Chinese source.
  const [dynVersion, bump] = useState(0);

  // Pending dynamic-translation queue (debounced batch).
  const dynQueueRef = useRef<Set<string>>(new Set());
  const dynTimerRef = useRef<number | null>(null);
  const dynEnQueueRef = useRef<Set<string>>(new Set());
  const dynEnTimerRef = useRef<number | null>(null);
  const lastManualLangAtRef = useRef(0);

  // Load catalog + dyn cache when language changes.
  useEffect(() => {
    const builtin = BUILTIN[lang];
    if (builtin) {
      setCatalog(builtin);
    } else {
      setCatalog(loadCachedCatalog(lang));
    }
    dynCacheRef.current = lang === "zh" ? {} : loadDynCache(lang);
    dynEnCacheRef.current = loadDynCache("en" as LangCode);
  }, [lang]);

  // Fetch missing static-string translations from edge function.
  useEffect(() => {
    if (BUILTIN[lang]) return; // built-in catalog, no fetch needed
    const missingKeys = (Object.keys(EN) as StringKey[]).filter((k) => !catalog[k]);
    if (missingKeys.length === 0) return;
    let cancelled = false;
    (async () => {
      // Prefer the Chinese source when available: the AI is much less likely
      // to echo a Chinese string back unchanged when asked to translate into
      // (say) Punjabi or Spanish, which means our isUsableTranslation filter
      // doesn't end up discarding the result and falling back to raw English.
      const items = missingKeys.map((k) => ({
        key: k,
        text: (ZH as Record<string, string>)[k] || EN[k],
      }));
      const targetLanguage = getLanguageInfo(lang).englishName;
      try {
        const { data, error } = await invokeTranslateWithTimeout(targetLanguage, items);
        if (cancelled) return;
        if (error) {
          console.error("translate error", error);
          return;
        }
        const translations: Record<string, string> = data?.translations || {};
        const cleaned: Record<string, string> = {};
        for (const [k, v] of Object.entries(translations)) {
          if (typeof v === "string") cleaned[k] = stripHtml(v);
        }
        const merged: Catalog = { ...catalog, ...(cleaned as Catalog) };
        setCatalog(merged);
        saveCachedCatalog(lang, merged);
      } catch (e) {
        console.error("translate invoke failed", e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const setLang = useCallback((l: LangCode) => {
    lastManualLangAtRef.current = Date.now();
    setLangState(l);
    try { localStorage.setItem(STORAGE_LANG, l); } catch { /* ignore */ }
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      return supabase.from("profiles").update({ preferred_language: l } as never).eq("user_id", uid);
    }).catch(() => { /* best-effort sync */ });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncProfileLanguage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid || cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("user_id", uid)
        .maybeSingle();
      const profileLang = (data as any)?.preferred_language;
      if (isSupportedLang(profileLang) && profileLang !== lang) {
        if (Date.now() - lastManualLangAtRef.current < 5000) {
          await supabase.from("profiles").update({ preferred_language: lang } as never).eq("user_id", uid);
          return;
        }
        setLangState(profileLang);
        try { localStorage.setItem(STORAGE_LANG, profileLang); } catch { /* ignore */ }
      } else if (!profileLang && lang) {
        await supabase.from("profiles").update({ preferred_language: lang } as never).eq("user_id", uid);
      }
    };
    void syncProfileLanguage();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void syncProfileLanguage();
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [lang]);

  const markPicked = useCallback(() => {
    setHasPicked(true);
    try { localStorage.setItem(STORAGE_PICKED, "1"); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: StringKey, vars?: Record<string, string | number>) => {
    const tmpl = catalog[key] ?? EN[key] ?? key;
    return interpolate(tmpl, vars);
  }, [catalog]);

  const flushDynQueue = useCallback(async (l: LangCode) => {
    const toSend = Array.from(dynQueueRef.current);
    dynQueueRef.current.clear();
    if (toSend.length === 0) return;
    const targetLanguage = getLanguageInfo(l).englishName;
    // Use index keys so we keep mapping; truncate text to a sane length.
      const items = toSend.slice(0, 12).map((text, i) => ({ key: String(i), text }));
      const sent = toSend.slice(0, 12);
    try {
      const { data, error } = await invokeTranslateWithTimeout(targetLanguage, items);
      if (error) return;
      const translations: Record<string, string> = data?.translations || {};
      const next = { ...dynCacheRef.current };
      sent.forEach((src, i) => {
        const tr = translations[String(i)];
        if (isUsableTranslation(l, src, tr)) next[src] = stripHtml(tr);
      });
      dynCacheRef.current = next;
      saveDynCache(l, next);
      bump((x) => x + 1);
    } catch (e) {
      console.error("dyn translate failed", e);
    }
  }, []);

  // Flush English-translation queue (for bilingual mode).
  const flushDynEnQueue = useCallback(async () => {
    const toSend = Array.from(dynEnQueueRef.current);
    dynEnQueueRef.current.clear();
    if (toSend.length === 0) return;
    const items = toSend.slice(0, 12).map((text, i) => ({ key: String(i), text }));
    const sent = toSend.slice(0, 12);
    enStats.requests += 1;
    const startedAt = performance.now();
    try {
      const { data, error } = await invokeTranslateWithTimeout("English", items);
      enStats.totalMs += performance.now() - startedAt;
      if (error) { enStats.errors += 1; return; }
      const translations: Record<string, string> = data?.translations || {};
      const next = { ...dynEnCacheRef.current };
      sent.forEach((src, i) => {
        const tr = translations[String(i)];
        if (typeof tr === "string" && tr.trim()) {
          next[src] = stripHtml(tr);
          enStats.translated += 1;
        }
      });
      dynEnCacheRef.current = next;
      saveDynCache("en" as LangCode, next);
      bump((x) => x + 1);
    } catch (e) {
      enStats.errors += 1;
      console.error("dyn en translate failed", e);
    }
  }, []);

  const tDynamic = useCallback((text: string) => {
    if (!text) return text;
    // No translation needed if the user chose Chinese, which is the app's
    // original helper-language for lesson notes and hints.
    if (lang === "zh") return localizeProtagonist(text, lang);
    // For English (and every other non-Chinese language): if the source text
    // contains CJK characters we MUST translate it. Previously English users
    // saw raw Chinese on the home page (e.g. "今天已经开练了") because we
    // short-circuited here.
    if (lang === "en" && !CJK_TEXT_RE.test(text)) return localizeProtagonist(text, lang);
    const cached = dynCacheRef.current[text];
    if (isUsableTranslation(lang, text, cached)) return localizeProtagonist(cached, lang);
    // Queue the request. Use a microtask-style 0ms timer so the *first*
    // render's strings ship in a single batch within the same tick — the
    // user perceives this as "instant" (only one network roundtrip per
    // page load instead of multiple debounced ones).
    dynQueueRef.current.add(text);
    if (dynTimerRef.current === null) {
      dynTimerRef.current = window.setTimeout(() => {
        dynTimerRef.current = null;
        flushDynQueue(lang);
      }, 0);
    }
    // If the queue is already big (e.g. a long lesson page just rendered),
    // flush immediately without waiting for the timer.
    if (dynQueueRef.current.size >= 24 && dynTimerRef.current !== null) {
      window.clearTimeout(dynTimerRef.current);
      dynTimerRef.current = null;
      // Fire and forget — flushDynQueue handles its own state.
      void flushDynQueue(lang);
    }
    // For distant networks, never block the UI on AI translation. If the
    // source is Chinese, show a readable fallback immediately and swap in the
    // chosen-language translation only if it arrives quickly.
    // Source contains CJK and we don't have a translation yet. Showing the
    // raw Chinese to a non-Chinese user is the bug we're fixing — return an
    // empty string so the UI shows nothing for one tick instead of leaking
    // Chinese. The component re-renders as soon as the translation lands
    // (dynVersion bumps).
    if (CJK_TEXT_RE.test(text)) return "";
    // Source string contains no CJK — safe to show as-is while we wait
    // (e.g. an English helper string being translated into Spanish).
    return localizeProtagonist(text, lang);
  // dynVersion is intentionally a dep: when a translation batch resolves
  // we want every memoised consumer to recompute against the new cache.
  }, [lang, flushDynQueue, dynVersion]);

  const tEn = useCallback((key: StringKey, vars?: Record<string, string | number>) => {
    const tmpl = EN[key] ?? key;
    return interpolate(tmpl, vars);
  }, []);

  const tZh = useCallback((key: StringKey, vars?: Record<string, string | number>) => {
    const tmpl = ZH[key] ?? EN[key] ?? key;
    return interpolate(tmpl, vars);
  }, []);

  const tDynamicEn = useCallback((text: string) => {
    if (!text) return text;
    // Source already English (no CJK) → just return it.
    if (!CJK_TEXT_RE.test(text)) return localizeProtagonist(text, "en" as LangCode);
    const cached = dynEnCacheRef.current[text];
    if (cached) { enStats.hits += 1; return localizeProtagonist(cached, "en" as LangCode); }
    enStats.misses += 1;
    dynEnQueueRef.current.add(text);
    if (dynEnTimerRef.current === null) {
      dynEnTimerRef.current = window.setTimeout(() => {
        dynEnTimerRef.current = null;
        flushDynEnQueue();
      }, 0);
    }
    if (dynEnQueueRef.current.size >= 24 && dynEnTimerRef.current !== null) {
      window.clearTimeout(dynEnTimerRef.current);
      dynEnTimerRef.current = null;
      void flushDynEnQueue();
    }
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushDynEnQueue, dynVersion]);

  const value = useMemo<I18nContextValue>(() => ({
    lang, setLang, hasPicked, markPicked, t, tDynamic, tEn, tDynamicEn, tZh,
  }), [lang, setLang, hasPicked, markPicked, t, tDynamic, tEn, tDynamicEn, tZh, dynVersion]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}