export type GameWord = {
  id: string; // en.toLowerCase().trim()
  en: string;
  cn: string;
  emoji?: string;
  phonetic?: string;
  unitId: string;
  volume: 1 | 2;
  type?: string;
};

export type WordSRS = {
  box: number; // 0..5，Leitner 盒子，越高越熟
  correct: number;
  wrong: number;
  streak: number; // 连续答对
  lastSeen: number; // ms epoch
  nextDue: number; // ms epoch，到这个时间才"该复习"
};

export type SrsStore = {
  version: 1;
  words: Record<string, WordSRS>;
  updatedAt: number;
};

export type GameKind = "match" | "rain" | "whack" | "spell";
