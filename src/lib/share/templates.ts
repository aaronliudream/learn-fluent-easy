import type { ShareItem, ShareLocale } from "./types";

const BRAND_ZH = "大月亮英语";
const BRAND_EN = "Big Moon English";

function fmt(item: ShareItem, locale: ShareLocale): string {
  const B = locale === "zh" ? BRAND_ZH : BRAND_EN;
  switch (item.type) {
    case "listening":
      return locale === "zh"
        ? `我在「${B}」听了一段「${item.title}」${item.topic ? `（${item.topic}` : "（"}${item.duration ? ` · ${Math.round(item.duration)} 秒）` : "）"}，挺有意思的，你也来听听 🎧`
        : `Listened to "${item.title}" on ${B}${item.topic ? ` (${item.topic}` : ""}${item.duration ? `, ${Math.round(item.duration)}s)` : item.topic ? ")" : ""}. Worth a try 🎧`;
    case "reading":
      return locale === "zh"
        ? `「${B}」上推荐一篇${item.difficulty ?? ""}阅读：「${item.title}」${item.wordCount ? `（${item.wordCount} 词）` : ""}，逻辑清晰、生词不多 📖`
        : `Just read "${item.title}" on ${B}${item.wordCount ? ` — ${item.wordCount} words` : ""}${item.difficulty ? `, ${item.difficulty} level` : ""} 📖`;
    case "word":
      return locale === "zh"
        ? `今天在「${B}」学到一个词：${item.word} — ${item.meaning}${item.example ? `。例句：${item.example}` : ""} 📚`
        : `Word of the day on ${B}: ${item.word} — ${item.meaning}${item.example ? `. e.g. "${item.example}"` : ""} 📚`;
    case "cloze":
      return locale === "zh"
        ? `「${B}」这道完形「${item.title}」做得很爽${item.difficulty ? `，${item.difficulty} 难度` : ""}，来挑战吗？🧠`
        : `Nailed this cloze "${item.title}" on ${B}${item.difficulty ? ` (${item.difficulty})` : ""}. Try it? 🧠`;
    case "grammar":
      return locale === "zh"
        ? `在「${B}」终于搞懂了「${item.point}」${item.summary ? `：${item.summary}` : ""} 🧩`
        : `Finally got "${item.point}" on ${B}${item.summary ? `: ${item.summary}` : ""} 🧩`;
    case "score":
      return locale === "zh"
        ? `我刚在「${B}」${item.module} 拿了 ${item.score} 分${item.rank ? `（前 ${item.rank}%）` : ""}，来比比？🏆`
        : `Just scored ${item.score} on ${B} ${item.module}${item.rank ? ` (top ${item.rank}%)` : ""}. Beat me? 🏆`;
    case "achievement":
      return locale === "zh"
        ? `「${B}」解锁新成就：🏅 ${item.name} — ${item.desc}`
        : `Unlocked on ${B}: 🏅 ${item.name} — ${item.desc}`;
    case "app":
      return locale === "zh"
        ? `我在用「${B} 🌕」学英语，AI 个性化推送，真的有效，推荐给你 ✨`
        : `I'm learning English with ${B} 🌕 — AI-tailored, actually works ✨`;
  }
}

const HASHTAGS_ZH: Record<ShareItem["type"], string[]> = {
  listening:   ["#大月亮英语", "#英语听力", "#学英语"],
  reading:     ["#大月亮英语", "#英语阅读", "#学英语"],
  word:        ["#大月亮英语", "#背单词",   "#学英语"],
  cloze:       ["#大月亮英语", "#完形填空", "#高考英语"],
  grammar:     ["#大月亮英语", "#英语语法", "#学英语"],
  score:       ["#大月亮英语", "#英语打卡", "#学习日记"],
  achievement: ["#大月亮英语", "#英语打卡"],
  app:         ["#大月亮英语", "#AI学英语"],
};

const HASHTAGS_EN: Record<ShareItem["type"], string[]> = {
  listening:   ["#BigMoonEnglish", "#ESL", "#LearnEnglish"],
  reading:     ["#BigMoonEnglish", "#ESLReading", "#LearnEnglish"],
  word:        ["#BigMoonEnglish", "#WordOfTheDay", "#Vocabulary"],
  cloze:       ["#BigMoonEnglish", "#EnglishExam"],
  grammar:     ["#BigMoonEnglish", "#EnglishGrammar"],
  score:       ["#BigMoonEnglish", "#StudyLog"],
  achievement: ["#BigMoonEnglish"],
  app:         ["#BigMoonEnglish", "#AILearning"],
};

export function buildShareText(item: ShareItem, locale: ShareLocale): string {
  const text = fmt(item, locale);
  const tags = (locale === "zh" ? HASHTAGS_ZH : HASHTAGS_EN)[item.type].join(" ");
  return `${text}\n\n👉 ${item.url}\n\n${tags}`;
}

export function buildShareTitle(item: ShareItem, locale: ShareLocale): string {
  const B = locale === "zh" ? BRAND_ZH : BRAND_EN;
  switch (item.type) {
    case "listening":   return `${B} · ${item.title}`;
    case "reading":     return `${B} · ${item.title}`;
    case "word":        return `${B} · ${item.word}`;
    case "cloze":       return `${B} · ${item.title}`;
    case "grammar":     return `${B} · ${item.point}`;
    case "score":       return `${B} · ${item.module} ${item.score}`;
    case "achievement": return `${B} · ${item.name}`;
    case "app":         return B;
  }
}
