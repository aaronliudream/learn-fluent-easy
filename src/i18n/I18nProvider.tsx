import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_LANG,
  LANGUAGES,
  detectBrowserLang,
  type LangCode,
  getLanguageInfo,
} from "./languages";
import { LANDING_EN_FALLBACKS } from "./landingEn";
import { BUILTIN, EN, ZH, type StringKey, interpolate } from "./strings";
import { localizeProtagonist } from "./protagonistName";

const STORAGE_LANG = "fluentpath.lang";
const STORAGE_PICKED = "fluentpath.langPicked";
// Session-only flag: true once the user manually picks a language in this
// browser tab. While set, sign-in MUST push the local choice up to the
// profile instead of pulling whatever stale value the profile holds — so
// "I clicked EN before logging in" survives across the auth boundary on
// every page, not just within a 5s race window.
const SESSION_MANUAL_PICK = "fluentpath.langPickedThisSession";
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
  ...LANDING_EN_FALLBACKS,
  // Pets page
  "🏠 我家": "🏠 Home",
  "🛒 商店": "🛒 Shop",
  "🗺️ 出游": "🗺️ Go out",
  "🥚 领养": "🥚 Adopt",
  "👕 皮肤": "👕 Skins",
  "📖 日记": "📖 Diary",
  "蛋": "Egg",
  "幼年": "Baby",
  "成年": "Adult",
  "传说": "Legend",
  "饱食": "Fullness",
  "心情": "Mood",
  // Evolution tree
  "成长之路": "Path of Growth",
  "完全透明 · 不开盲盒": "Fully transparent · no loot boxes",
  "起点": "Starting point",
  "Lv.1 解锁": "Unlock at Lv.1",
  "Lv.5 解锁": "Unlock at Lv.5",
  "Lv.15 解锁": "Unlock at Lv.15",
  "现在": "Now",
  "当前": "Current",
  "通过完成学习任务获得经验解锁下一阶段": "Complete learning tasks to gain XP and unlock the next stage",
  // Monthly postcard
  "本月明信片": "This month's postcard",
  "出游中": "On a trip",
  "至": "until",
  "来自": "Greetings from",
  "的问候": "",
  "休息也是学习的一部分 · 这几天不必赶进度": "Rest is also part of learning · no need to rush these days",
  "例如 1234": "e.g. 1234",
  "学习足迹（按有效时长占比）": "Learning Journey (share of effective study time)",
  "百分比 = 该主题占总学习时间的比例，非正确率": "Percentage = share of total study time on this topic, not accuracy",
  "各主题正确率": "Accuracy by Topic",
  "基于实际答题": "Based on actual answers",
  "Slang & Idioms": "Slang & Idioms",
  "小学 / Primary": "Primary",
  "初中 / Lower Secondary": "Lower Secondary",
  "高中 / Upper Secondary": "Upper Secondary",
  "还没有可统计的答题记录": "No answer records to summarize yet",
  "如：小明🐱、Dragon123": "e.g. KittyKat🐱, Dragon123",
  "首页": "Home",
  "课程": "Courses",
  "AI 对话": "AI Chat",
  "练习": "Practice",
  "错题": "Mistakes",
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

  // ===== Learning companion (FloatingPet, Pets, Friends, Companion*) =====
  "学习伙伴": "Learning buddy",
  "遇见伙伴": "Meet your buddy",
  "领养你的学习伙伴": "Adopt your learning buddy",
  "登录后领养你的学习伙伴": "Sign in to adopt your learning buddy",
  "查看你的学习伙伴": "View your learning buddy",
  "显示学习伙伴": "Show learning buddy",
  "伙伴设置": "Buddy settings",
  "伙伴模式": "Buddy mode",
  "完全隐藏伙伴": "Hide buddy entirely",
  "🤫 安静模式": "🤫 Quiet mode",
  "🌿 标准模式": "🌿 Standard mode",
  "🔥 关注模式": "🔥 Focus mode",
  "无动画、无主动提醒": "No animation, no active reminders",
  "平衡的陪伴感": "Balanced companionship",
  "更频繁的鼓励反馈": "More frequent encouragement",
  "在等你练习": "Waiting for you to practice",
  "没事，再来一次 💛": "No worries, try again 💛",
  "真棒": "Nice!",
  "闪光！": "Sparkle!",
  "学习朋友圈": "Learning friends",
  "互访朋友的伙伴 · 送礼物 · 拍合影": "Visit friends' buddies · send gifts · take photos",
  "小伙伴": "Buddy",
  "我的伙伴们": "My buddies",
  "还没有宠物哦": "No buddy yet",
  "先去领养一只宠物吧 🥚": "Go adopt one first 🥚",
  "去「领养」标签页带一只回家吧！": "Go to the Adopt tab and bring one home!",
  "你可以随时在「领养」标签换养更多伙伴": "You can adopt more buddies anytime from the Adopt tab",
  "登录后开启宠物之旅": "Sign in to start your buddy journey",
  "立即登录": "Sign in now",
  "请先登录": "Please sign in",
  "返回主页": "Back to home",
  "选择你的英语守护灵": "Choose your English spirit",
  "挑选你的守护灵": "Choose your spirit",
  "三只都很棒，跟着直觉选一只吧 ✨": "All three are great — pick the one your gut likes ✨",
  "但选择权在你！": "But the choice is yours!",
  "根据测试，我们推荐": "Based on the quiz, we recommend",
  "推荐": "Recommended",
  "性格匹配": "Personality match",
  "开始 30 秒匹配": "Start 30-sec match",
  "跳过测试，我自己选": "Skip quiz, I'll choose",
  "给它起个名字…": "Give it a name…",
  "领养": "Adopt",
  "领养中…": "Adopting…",
  "🎉 领养成功！欢迎回家": "🎉 Adopted! Welcome home",
  "奇幻宠物乐园": "Buddy park",
  "学习赚星币 → 领养 → 喂养 → 进化 → 出游": "Earn coins by studying → adopt → feed → evolve → explore",
  "学习赚星币，喂养专属伙伴": "Earn coins by studying to feed your buddy",
  "一个会陪你成长、记得你、为你加油的 AI 伙伴": "An AI buddy that grows with you, remembers you, and cheers you on",
  "出发": "Let's go",

  // Shop / inventory / wishlist
  "商店": "Shop",
  "心愿单": "Wishlist",
  "心愿单中": "In wishlist",
  "加入心愿单": "Add to wishlist",
  "已移出心愿单": "Removed from wishlist",
  "💭 已加入心愿单 · 48 小时后可确认购买": "💭 Added to wishlist · confirm purchase after 48 hours",
  "❌ 加入心愿单失败": "❌ Failed to add to wishlist",
  "❌ 装备失败": "❌ Failed to equip",
  "❌ 购买失败": "❌ Purchase failed",
  "已装备": "Equipped",
  "已换上": "Equipped",
  "已恢复原色": "Original color restored",
  "恢复原色": "Restore original",
  "皮肤！": "skin!",
  "还未拥有该皮肤": "You don't own this skin yet",
  "已经拥有啦": "Already owned",
  "已解锁": "Unlocked",
  "已解锁 ✨": "Unlocked ✨",
  "解锁": "Unlock",
  "装备": "Equip",
  "购买": "Buy",
  "花费": "Cost",
  "需要": "Need",
  "还需": "Need",
  "还差": "Still need",
  "才能装备": "to equip",
  "才可购买": "to purchase",
  "冷静期已过，可以购买": "Cool-down passed, ready to buy",
  "🛍️ 今天是商店开放日（每周三/六）—— 也是慢慢挑选的好日子。": "🛍️ Shop is open today (Wed/Sat) — a great day to browse slowly.",
  "🛍️ 商店每周三、周六最热闹 —— 把心愿留到那天再来看看。": "🛍️ The shop is busiest on Wed and Sat — save your wishlist for then.",
  "🛒 等待是值得的！购买成功": "🛒 Worth the wait! Purchase successful",
  "喜欢的物品先加入心愿单，48 小时后再决定买不买 —— 宠物相信会等待的孩子。": "Add favorites to your wishlist first; decide after 48 hours — your buddy trusts kids who can wait.",
  "💰 星币不够": "💰 Not enough coins",
  "💰 星币不够，先去学习赚星币吧！": "💰 Not enough coins — go study to earn more!",
  "💰 星币不够，再去学习赚一些吧！": "💰 Not enough coins — earn some by studying!",
  "💰 星币不够，继续学习吧！": "💰 Not enough coins — keep studying!",

  // Feeding
  "喂它吃点东西": "Feed it something",
  "点食物即可喂食": "Tap a food to feed",
  "🍽️ 喂食成功！": "🍽️ Fed successfully!",
  "宠物太饿啦，先喂饱再出门": "Buddy is too hungry — feed it before going out",
  "宠物还在蛋里，先去喂食孵化吧 🥚": "Buddy is still in the egg — feed to hatch 🥚",
  "背包空空，去「商店」买点食物吧 🛒": "Bag is empty — buy food in the Shop 🛒",
  "消化中": "Digesting",
  "刚学到的种子正在宠物体内消化，明天到账": "The seeds you just earned are digesting — they'll arrive tomorrow",
  "饱": "Full",

  // Status / abilities / diary
  "形态": "Form",
  "经": "EXP",
  "经验": "EXP",
  "等待": "Waiting",
  "在外面玩得超棒": "Had a great time outside",
  "在想…": "Thinking…",
  "🎉 玩得很开心！": "🎉 Had a great time!",
  "进化啦！": "Evolved!",
  "达成！": "Achieved!",
  "伙伴的能力": "Buddy abilities",
  "每掌握一个知识点，它就会解锁一个能力": "Each concept you master unlocks an ability",
  "宠物日记 · 今日": "Buddy diary · today",
  "动态日记会显示在这里": "Activity diary appears here",
  "点击生成今日日记，让宠物把今天的学习记下来 📝": "Generate today's diary — your buddy records what you studied 📝",
  "生成今日日记": "Generate today's diary",
  "生成中…": "Generating…",
  "重新生成": "Regenerate",
  "种子": "Seeds",
  "种子：学习产出，可在商店心愿单兑换": "Seeds: study rewards, redeemable in the Shop wishlist",
  "星光：连续学习奖励，未来可解锁场景": "Stars: streak rewards, unlock scenes later",
  "结晶：完成长期里程碑获得，购买稀有道具": "Crystals: long-term milestone rewards for rare items",

  // Chat with companion
  "聊天": "Chat",
  "说点什么…": "Say something…",
  "打个招呼吧！比如 \"今天我学了 5 个新单词\"": "Say hi! e.g. \"I learned 5 new words today\"",
  "发送": "Send",
  "我有点累了，等会儿再聊好吗？": "I'm a little tired — chat later?",
  "今天和我聊天的次数用完啦，明天再来吧 🌙": "We've used up today's chats — see you tomorrow 🌙",
  "今日剩余": "Left today",
  "今日额度用完了": "Daily limit reached",
  "次": "times",
  "轮": "rounds",
  "天 · 宠物耐心 +1（共": "days · Buddy patience +1 (total",
  "网络好像断了，再试一次吧。": "Network seems offline — please try again.",
  "未知错误": "Unknown error",
  "提交失败：": "Submit failed: ",
  "不要分享真实姓名、住址或电话。AI 回复仅供参考。": "Don't share real names, addresses or phone numbers. AI replies are for reference only.",

  // Report AI button
  "举报此 AI 内容": "Report this AI content",
  "为什么举报？": "Why are you reporting?",
  "举报": "Report",
  "举报已提交，谢谢！我们会尽快查看 🙏": "Report submitted — thank you! We'll review it soon 🙏",
  "和": "and",
  "心": "Heart",
  "慢一点，更稳一点": "Slow down, stay steady",
  "表情贴纸": "Emoji sticker",

  // Pets misc
  "移除": "Remove",
  "宠物正在消化…明天到账": "Buddy is digesting… arrives tomorrow",
  "继续 →": "Continue →",
  "你的小伙伴": "your buddy",
  "的信": "'s letter",
  "这一周，我们一起做到了 ✨": "This week, we did it together ✨",
  "嘿！这周我们一起学习了": "Hey! This week we studied together for",
  "天": "days",
  "升级！": "Level up!",
  "累计专注": "Focused for",
  "答对": "got",
  "道题": "questions right",
  "我注意到": "I noticed",
  "这块你有点纠结，下周我们慢慢来 🌱": "is a bit tricky for you — we'll take it slow next week 🌱",
  "而且你这周的耐心值": "And your patience this week",
  "—— 你愿意等待，比拿到东西更可贵。": "— being willing to wait matters more than what you get.",
  "下周也想和你一起继续，慢慢的，没关系 💛": "I'd love to keep going with you next week — slowly is fine 💛",
  "收下这封信 💌": "Keep this letter 💌",
  "学习星图": "Learning star map",
  "伙伴": "Buddy",
  "未知星球": "Unknown planet",
  "全球学习者一起探索 · 没有竞赛，只有发现": "Learners worldwide explore together · no competition, only discovery",
  "字母岛": "Alphabet Isle",
  "对话森林": "Conversation Wood",
  "故事之河": "Story River",
  "写作高地": "Writing Highlands",
  "26 个字母在这里冒险": "Where 26 letters have adventures",
  "学会和不同伙伴打招呼": "Learn to greet different buddies",
  "沿着河流读懂长篇文章": "Follow the river to read long passages",
  "在云端写出自己的故事": "Write your own stories in the clouds",
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

/**
 * Preload the static UI catalog for a target language so we can swap atomically
 * without rendering a half-translated UI. Returns a complete Catalog (all EN
 * keys filled, falling back to EN source if the edge function fails).
 */
async function preloadCatalog(lang: LangCode): Promise<Catalog> {
  const builtin = BUILTIN[lang];
  if (builtin) return builtin;
  const cached = loadCachedCatalog(lang);
  const allKeys = Object.keys(EN) as StringKey[];
  const missing = allKeys.filter((k) => !cached[k]);
  if (missing.length === 0) return cached;
  const items = missing.map((k) => ({
    key: k,
    text: (ZH as Record<string, string>)[k] || EN[k],
  }));
  const targetLanguage = getLanguageInfo(lang).englishName;
  try {
    const { data, error } = await invokeTranslateWithTimeout(targetLanguage, items);
    if (!error) {
      const translations: Record<string, string> = data?.translations || {};
      const cleaned: Record<string, string> = {};
      for (const [k, v] of Object.entries(translations)) {
        if (typeof v === "string") cleaned[k] = stripHtml(v);
      }
      const merged: Catalog = { ...cached, ...(cleaned as Catalog) };
      saveCachedCatalog(lang, merged);
      return merged;
    }
  } catch (e) {
    console.error("preloadCatalog failed", e);
  }
  // Fallback: fill missing with EN source so UI is at least monolingual.
  const fallback: Catalog = { ...cached };
  for (const k of missing) fallback[k] = EN[k];
  return fallback;
}

function isCatalogComplete(lang: LangCode, cat: Catalog): boolean {
  if (BUILTIN[lang]) return true;
  const allKeys = Object.keys(EN) as StringKey[];
  return allKeys.every((k) => !!cat[k]);
}

/** First visit: zh browsers → Chinese UI; everyone else → English. */
function resolveInitialLang(): LangCode {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const saved = localStorage.getItem(STORAGE_LANG) as LangCode | null;
  if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  const detected = detectBrowserLang();
  if (detected === "zh" || detected === "zh-TW") return detected;
  return DEFAULT_LANG;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(resolveInitialLang);
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

  // True once the static catalog for the current language is fully populated.
  // Children render is gated on this flag so the first paint is never a
  // mix of source-language and target-language strings.
  const [ready, setReady] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const builtin = BUILTIN[lang];
    if (builtin) return true;
    return isCatalogComplete(lang, loadCachedCatalog(lang));
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
      setReady(true);
    } else {
      const cached = loadCachedCatalog(lang);
      setCatalog(cached);
      setReady(isCatalogComplete(lang, cached));
    }
    const loadedDyn = lang === "zh" ? {} : loadDynCache(lang);
    const loadedEnDyn = loadDynCache("en" as LangCode);
    dynCacheRef.current =
      lang === "en" ? { ...LANDING_EN_FALLBACKS, ...loadedDyn } : loadedDyn;
    dynEnCacheRef.current = { ...LANDING_EN_FALLBACKS, ...loadedEnDyn };
  }, [lang]);

  // Fetch missing static-string translations from edge function.
  useEffect(() => {
    if (BUILTIN[lang]) return; // built-in catalog, no fetch needed
    const missingKeys = (Object.keys(EN) as StringKey[]).filter((k) => !catalog[k]);
    if (missingKeys.length === 0) { setReady(true); return; }
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
        setReady(true);
      } catch (e) {
        console.error("translate invoke failed", e);
        // Unblock UI even on error so the app stays usable (English fallback).
        setReady(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const setLang = useCallback(async (l: LangCode) => {
    lastManualLangAtRef.current = Date.now();
    try { sessionStorage.setItem(SESSION_MANUAL_PICK, "1"); } catch { /* ignore */ }
    try { localStorage.setItem(STORAGE_LANG, l); } catch { /* ignore */ }
    // Preload the target catalog BEFORE swapping `lang`, so the next render
    // already has every UI string in the new language — no flash of mixed
    // source / target text.
    if (BUILTIN[l]) {
      setCatalog(BUILTIN[l]!);
      setLangState(l);
      setReady(true);
    } else {
      setReady(false);
      const next = await preloadCatalog(l);
      setCatalog(next);
      setLangState(l);
      setReady(true);
    }
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
      // If the user explicitly picked a language in this tab/session,
      // their local choice always wins on sign-in. Push it up to the
      // profile instead of overwriting it with the stored profile value.
      let manualThisSession = false;
      try { manualThisSession = sessionStorage.getItem(SESSION_MANUAL_PICK) === "1"; } catch { /* ignore */ }
      if (manualThisSession) {
        await supabase.from("profiles").update({ preferred_language: lang } as never).eq("user_id", uid);
        return;
      }
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

  const translateImmediately = useCallback((text: string) => {
    if (lang === "en") return englishFallbackFor(text);
    return "";
  }, [lang]);

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
    // If the user chose Chinese: source text that's already Chinese (CJK)
    // can be returned as-is. But English source strings (e.g. the new
    // English-first landing page) MUST still be translated into Chinese,
    // otherwise Chinese users see raw English.
    if (lang === "zh" && CJK_TEXT_RE.test(text)) return localizeProtagonist(text, lang);
    // For English (and every other non-Chinese language): if the source text
    // contains CJK characters we MUST translate it. Previously English users
    // saw raw Chinese on the home page (e.g. "今天已经开练了") because we
    // short-circuited here.
    if (lang === "en" && !CJK_TEXT_RE.test(text)) return localizeProtagonist(text, lang);
    const cached =
      lang === "en"
        ? dynCacheRef.current[text] || dynEnCacheRef.current[text]
        : dynCacheRef.current[text];
    if (isUsableTranslation(lang, text, cached)) return localizeProtagonist(cached, lang);
    if (lang === "en" && CJK_TEXT_RE.test(text)) {
      const fb = englishFallbackFor(text);
      if (fb) return fb;
    }
    // Queue the request. Use a microtask-style 0ms timer so the *first*
    // render's strings ship in a single batch within the same tick — the
    // user perceives this as "instant" (only one network roundtrip per
    // page load instead of multiple debounced ones).
    if (lang === "en" && CJK_TEXT_RE.test(text)) {
      dynEnQueueRef.current.add(text);
      if (dynEnTimerRef.current === null) {
        dynEnTimerRef.current = window.setTimeout(() => {
          dynEnTimerRef.current = null;
          void flushDynEnQueue();
        }, 0);
      }
      if (dynEnQueueRef.current.size >= 24 && dynEnTimerRef.current !== null) {
        window.clearTimeout(dynEnTimerRef.current);
        dynEnTimerRef.current = null;
        void flushDynEnQueue();
      }
      return translateImmediately(text);
    }
    dynQueueRef.current.add(text);
    if (dynTimerRef.current === null) {
      dynTimerRef.current = window.setTimeout(() => {
        dynTimerRef.current = null;
        flushDynQueue(lang);
      }, 0);
    }
    if (dynQueueRef.current.size >= 24 && dynTimerRef.current !== null) {
      window.clearTimeout(dynTimerRef.current);
      dynTimerRef.current = null;
      void flushDynQueue(lang);
    }
    if (CJK_TEXT_RE.test(text)) return translateImmediately(text);
    // Source string contains no CJK — safe to show as-is while we wait
    // (e.g. an English helper string being translated into Spanish).
    return localizeProtagonist(text, lang);
  // dynVersion is intentionally a dep: when a translation batch resolves
  // we want every memoised consumer to recompute against the new cache.
  }, [lang, flushDynQueue, translateImmediately, dynVersion]);

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

  return (
    <I18nContext.Provider value={value}>
      {ready ? children : (
        <div
          aria-busy="true"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(var(--background))",
            color: "hsl(var(--muted-foreground))",
            fontSize: 14,
            zIndex: 9999,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
              marginRight: 10,
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading…
        </div>
      )}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}