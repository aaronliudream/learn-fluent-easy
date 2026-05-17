import { PEP_PRIMARY_WORDS } from "@/data/pepWordList";
import type { SightWordGroup, SightWordItem } from "@/data/primarySightWords";

export type PepBookKey = keyof typeof PEP_PRIMARY_WORDS;

const BOOK_ORDER: PepBookKey[] = [
  "grade3a",
  "grade3b",
  "grade4a",
  "grade4b",
  "grade5a",
  "grade5b",
  "grade6a",
  "grade6b",
];

const BOOK_LABELS: Record<PepBookKey, string> = {
  grade3a: "三年级上册",
  grade3b: "三年级下册",
  grade4a: "四年级上册",
  grade4b: "四年级下册",
  grade5a: "五年级上册",
  grade5b: "五年级下册",
  grade6a: "六年级上册",
  grade6b: "六年级下册",
};

/** 四会词简明中文（教材常用义） */
const PEP_MEANINGS: Record<string, string> = {
  hello: "你好",
  hi: "嗨",
  i: "我",
  am: "是",
  what: "什么",
  your: "你的",
  name: "名字",
  bye: "再见",
  family: "家庭",
  father: "父亲",
  dad: "爸爸",
  mother: "母亲",
  mum: "妈妈",
  man: "男人",
  woman: "女人",
  sister: "姐妹",
  brother: "兄弟",
  grandmother: "祖母",
  grandma: "奶奶",
  grandfather: "祖父",
  grandpa: "爷爷",
  friend: "朋友",
  girl: "女孩",
  boy: "男孩",
  teacher: "老师",
  student: "学生",
  my: "我的",
  meet: "遇见",
  nice: "好的",
  too: "也",
  duck: "鸭子",
  pig: "猪",
  cat: "猫",
  bear: "熊",
  dog: "狗",
  elephant: "大象",
  monkey: "猴子",
  bird: "鸟",
  tiger: "老虎",
  panda: "熊猫",
  zoo: "动物园",
  bread: "面包",
  juice: "果汁",
  egg: "鸡蛋",
  milk: "牛奶",
  water: "水",
  cake: "蛋糕",
  fish: "鱼",
  rice: "米饭",
  one: "一",
  two: "二",
  three: "三",
  four: "四",
  five: "五",
  six: "六",
  seven: "七",
  eight: "八",
  nine: "九",
  ten: "十",
  plate: "盘子",
  uk: "英国",
  canada: "加拿大",
  usa: "美国",
  china: "中国",
  she: "她",
  he: "他",
  new: "新的",
  giraffe: "长颈鹿",
  tall: "高的",
  fat: "胖的",
  thin: "瘦的",
  short: "矮的",
  long: "长的",
  small: "小的",
  big: "大的",
  on: "在…上",
  in: "在…里",
  under: "在…下面",
  chair: "椅子",
  desk: "书桌",
  cap: "帽子",
  ball: "球",
  car: "小汽车",
  boat: "小船",
  map: "地图",
  toy: "玩具",
  box: "盒子",
  pear: "梨",
  apple: "苹果",
  orange: "橙子",
  banana: "香蕉",
  watermelon: "西瓜",
  strawberry: "草莓",
  grape: "葡萄",
  buy: "买",
  fruit: "水果",
  classroom: "教室",
  window: "窗户",
  board: "黑板",
  light: "灯",
  picture: "图画",
  door: "门",
  wall: "墙",
  floor: "地板",
  computer: "电脑",
  fan: "风扇",
  monday: "星期一",
  tuesday: "星期二",
  wednesday: "星期三",
  thursday: "星期四",
  friday: "星期五",
  saturday: "星期六",
  sunday: "星期日",
};

function slugWord(word: string): string {
  return (
    word
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || "word"
  );
}

function meaningFor(word: string): string {
  const key = word.toLowerCase().trim();
  return PEP_MEANINGS[key] ?? `单词：${word}`;
}

function exampleFor(word: string, meaning: string): { en: string; cn: string } {
  const w = word.trim();
  const startsVowel = /^[aeiou]/i.test(w);
  const article = startsVowel ? "an" : "a";
  if (w === "I") {
    return { en: "I am a student.", cn: "我是一名学生。" };
  }
  return {
    en: `This is ${article} ${w}.`,
    cn: `这是一${startsVowel ? "个" : "个"}${meaning.replace(/^单词：/, "")}。`,
  };
}

export function getPepBooksForGrade(grade: number): PepBookKey[] {
  const g = Math.min(Math.max(grade, 1), 6);
  if (g <= 2) return ["grade3a"];
  if (g === 3) return ["grade3a", "grade3b"];
  if (g === 4) return ["grade4a", "grade4b"];
  if (g === 5) return ["grade5a", "grade5b"];
  return ["grade6a", "grade6b"];
}

export function buildPepSightWords(books: PepBookKey[]): {
  groups: SightWordGroup[];
  items: SightWordItem[];
} {
  const groups: SightWordGroup[] = [];
  const items: SightWordItem[] = [];
  let groupSort = 0;
  let rank = 0;

  for (const book of books) {
    const bookLabel = BOOK_LABELS[book];
    const units = PEP_PRIMARY_WORDS[book];
    let unitNum = 0;
    for (const [unitKey, unit] of Object.entries(units)) {
      unitNum += 1;
      const groupId = `pep_${book}_${unitKey}`;
      groupSort += 1;
      groups.push({
        id: groupId,
        groupName: `Unit ${unitNum} · ${unit.title}`,
        groupNameEn: unit.title,
        rangeLabel: `人教 PEP · ${bookLabel}`,
        sparkIntro: `「${unit.title}」— ${bookLabel}第 ${unitNum} 单元,一起来认四会词吧!`,
        sparkOutro: `「${unit.title}」的四会词你都掌握啦,Spark 为你鼓掌!`,
        unlockReq: groupSort === 1 ? "开始人教 PEP 词汇" : "完成上一单元",
        sortOrder: groupSort,
      });

      unit.words.forEach((word, idx) => {
        rank += 1;
        const meaning = meaningFor(word);
        const ex = exampleFor(word, meaning);
        items.push({
          id: `pep_${book}_${unitKey}_${slugWord(word)}`,
          groupId,
          rank,
          word,
          ipa: "",
          meaningCn: meaning,
          pos: "word",
          posCn: "词汇",
          exampleSentence: ex.en,
          exampleSentenceCn: ex.cn,
          difficulty: book.startsWith("grade3") ? 1 : book.startsWith("grade4") ? 2 : 3,
          sortOrder: idx + 1,
        });
      });
    }
  }

  return { groups, items };
}

const ALL_BUILT = buildPepSightWords(BOOK_ORDER);

/** 当前年级应学的 PEP 单元与词汇 */
export function getPepSightWordsForGrade(grade: number) {
  return buildPepSightWords(getPepBooksForGrade(grade));
}

/** 全册 PEP 词汇（学习页 / 测验页按 id 查找） */
export const PEP_SIGHT_WORD_GROUPS = ALL_BUILT.groups;
export const PEP_SIGHT_WORD_ITEMS = ALL_BUILT.items;
