import type { StageArtworkEntry } from "@/components/stage/StageModuleCard";

/** 初中 — 柔和粉彩渐变 */
export const JUNIOR_ARTWORK: Record<string, StageArtworkEntry> = {
  vocabulary: {
    image: "/images/vocabulary-monet.jpg",
    artist: "莫奈",
    work: "睡莲",
    gradient: "from-rose-500/85 via-pink-500/75 to-sky-400/80",
  },
  grammar: {
    image: "/images/grammar-mondrian.jpg",
    artist: "蒙德里安",
    work: "构成",
    gradient: "from-red-500/80 via-white/60 to-blue-500/80",
  },
  reading: {
    image: "/images/reading-vermeer.jpg",
    artist: "维米尔",
    work: "读信少女",
    gradient: "from-amber-700/85 via-amber-500/70 to-yellow-400/75",
  },
  listening: {
    image: "/images/listening-kandinsky.jpg",
    artist: "康定斯基",
    work: "构成VIII",
    gradient: "from-violet-600/85 via-purple-500/75 to-orange-400/80",
  },
  writing: {
    image: "/images/writing-vangogh.jpg",
    artist: "梵高",
    work: "向日葵",
    gradient: "from-amber-500/85 via-yellow-400/75 to-orange-500/80",
  },
  exam: {
    image: "/images/exam-raphael.jpg",
    artist: "拉斐尔",
    work: "雅典学院",
    gradient: "from-stone-700/85 via-stone-500/75 to-amber-600/80",
  },
  classroom: {
    image: "/images/classroom-hokusai.jpg",
    artist: "葛饰北斋",
    work: "神奈川冲浪里",
    gradient: "from-indigo-700/85 via-blue-500/75 to-cyan-400/80",
  },
};

/** 高中 — 设计稿 gk- 名画，10% 极淡顶部渐变 */
export const GAOKAO_ARTWORK: Record<string, StageArtworkEntry> = {
  vocabulary: {
    image: "/images/gk-vocabulary-klimt.jpg",
    artist: "克里姆特",
    work: "吻",
    gradient: "from-amber-400/10 to-transparent",
  },
  grammar: {
    image: "/images/gk-grammar-escher.jpg",
    artist: "埃舍尔",
    work: "相对论",
    gradient: "from-slate-400/10 to-transparent",
  },
  reading: {
    image: "/images/gk-reading-rembrandt.jpg",
    artist: "伦勃朗",
    work: "学者像",
    gradient: "from-amber-400/10 to-transparent",
  },
  listening: {
    image: "/images/gk-listening-chagall.jpg",
    artist: "夏加尔",
    work: "蓝色小提琴手",
    gradient: "from-indigo-400/10 to-transparent",
  },
  writing: {
    image: "/images/gk-writing-picasso.jpg",
    artist: "毕加索",
    work: "蓝色时期",
    gradient: "from-blue-400/10 to-transparent",
  },
  exam: {
    image: "/images/gk-exam-michelangelo.jpg",
    artist: "米开朗基罗",
    work: "创世纪",
    gradient: "from-orange-400/10 to-transparent",
  },
  classroom: {
    image: "/images/gk-classroom-seurat.jpg",
    artist: "修拉",
    work: "大碗岛的星期天",
    gradient: "from-emerald-400/10 to-transparent",
  },

  /* 课本 7 册名画(复用初中名画资产,与高考专项 6 张 gk- 不撞画;贴册主题) */
  gk_required1: { image: "/images/writing-vangogh.jpg", artist: "梵高", work: "向日葵", gradient: "from-amber-400/10 to-transparent" },
  gk_required2: { image: "/images/vocabulary-monet.jpg", artist: "莫奈", work: "睡莲", gradient: "from-sky-400/10 to-transparent" },
  gk_required3: { image: "/images/classroom-hokusai.jpg", artist: "葛饰北斋", work: "神奈川冲浪里", gradient: "from-cyan-400/10 to-transparent" },
  gk_elective1: { image: "/images/exam-raphael.jpg", artist: "拉斐尔", work: "雅典学院", gradient: "from-stone-400/10 to-transparent" },
  gk_elective2: { image: "/images/listening-kandinsky.jpg", artist: "康定斯基", work: "构成VIII", gradient: "from-violet-400/10 to-transparent" },
  gk_elective3: { image: "/images/reading-vermeer.jpg", artist: "维米尔", work: "读信少女", gradient: "from-amber-500/10 to-transparent" },
  gk_elective4: { image: "/images/grammar-mondrian.jpg", artist: "蒙德里安", work: "构成", gradient: "from-rose-400/10 to-transparent" },
};
