// Unified share-content schema. Add new types as needed.
export type ShareItem =
  | { type: "listening";   title: string; topic?: string; duration?: number; grade?: string; url: string }
  | { type: "reading";     title: string; wordCount?: number; difficulty?: string; url: string }
  | { type: "word";        word: string; meaning: string; example?: string; phonetic?: string; url: string }
  | { type: "cloze";       title: string; difficulty?: string; url: string }
  | { type: "grammar";     point: string; summary?: string; url: string }
  | { type: "score";       module: string; score: number; rank?: number; url: string }
  | { type: "achievement"; name: string; desc: string; url: string }
  | { type: "app";         url: string };

export type ShareLocale = "zh" | "en";
export type ShareRegion = "CN" | "INTL";
