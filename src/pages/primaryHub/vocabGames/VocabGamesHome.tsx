import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { getAllGrade4Words } from "@/lib/primaryHub/vocabGames/words";
import { getProgress } from "@/lib/primaryHub/vocabGames/srs";

const GAMES: Array<{
  key: string;
  emoji: string;
  name: string;
  desc: string;
  from: string;
  to: string;
}> = [
  { key: "match", emoji: "🃏", name: "单词配对", desc: "中英连连看", from: "#FF8A5B", to: "#FF6B35" },
  { key: "rain", emoji: "🌧️", name: "单词雨", desc: "听音抢答接住单词", from: "#5BA8FF", to: "#378ADD" },
  { key: "whack", emoji: "🔨", name: "打地鼠", desc: "看中文敲对的词", from: "#7C5CFF", to: "#B45EFF" },
  { key: "spell", emoji: "🔤", name: "拼字接龙", desc: "动手拼出单词", from: "#3FB23C", to: "#6BD968" },
  { key: "bubble", emoji: "🫧", name: "听音泡泡", desc: "听发音，戳破正确的泡泡", from: "#9B6BFF", to: "#6A8BFF" },
];

export default function VocabGamesHome() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;
  // 路由切换会重挂本页 → 每次进入都重新读进度,从游戏返回即刷新。
  const p = getProgress(getAllGrade4Words());

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7EE] to-[#F4EFE6] px-4 pb-24 pt-4">
      {/* 顶部 */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(base)} className="text-xl" aria-label="返回">
          ←
        </button>
        <div className="text-lg font-bold text-[#2b2b2b]">四年级词汇</div>
        <div className="ml-auto rounded-full bg-white px-3 py-1 text-sm font-bold text-[#FF6B35] shadow-sm">
          ⭐ {p.mastered}
        </div>
      </div>

      {/* 词汇收集进度卡 */}
      <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#B45EFF] to-[#7C5CFF] p-5 text-white shadow">
        <div className="text-sm opacity-90">词汇收集进度</div>
        <div className="mt-1 text-3xl font-extrabold">
          已掌握 {p.mastered}
          <span className="text-lg font-bold opacity-80"> / {p.total}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${p.percent}%` }} />
        </div>
        <div className="mt-2 text-xs opacity-90">
          已学过 {p.seen} 词 · 在任何游戏里学会的词，所有游戏都会少出 💪
        </div>
      </div>

      {/* 4 个游戏卡 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => navigate(`${base}/vocab-games/${g.key}`)}
            className="relative rounded-2xl p-4 text-left text-white shadow-sm transition active:scale-95"
            style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
          >
            {g.key === "bubble" && (
              <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-[#7C5CFF]">
                NEW
              </span>
            )}
            <div className="text-3xl">{g.emoji}</div>
            <div className="mt-2 text-base font-bold">{g.name}</div>
            <div className="text-xs opacity-90">{g.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-5 text-center text-xs text-[#999]">
        遗忘曲线智能出题：没学过的、做错的多出，学会的少出。
      </div>
    </div>
  );
}
