import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import WordMatchingGame from "@/components/hub/WordMatchingGame";
import { getMatchPool } from "@/lib/primaryHub/vocabGames/words";
import { selectWords, recordResult } from "@/lib/primaryHub/vocabGames/srs";
import { prefetchHubVocabulary } from "@/lib/primaryHub/speech";
import { unlockAudioSync, stopSpeaking } from "@/lib/speak";
import GameResult from "./GameResult";

const ROUND = 6;

export default function VocabMatchGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;

  const [round, setRound] = useState(0); // 换一批就 +1,触发重选词
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const words = useMemo(() => selectWords(getMatchPool(), ROUND), [round]);

  const begin = () => {
    unlockAudioSync(); // iOS:必须在点击同步事件里解锁
    prefetchHubVocabulary(words.map((w) => w.en), 4);
    setStarted(true);
  };

  const finish = () => {
    // 配对成功即视为答对:本轮 6 个词统一记对(组件无单词级配错回调)
    words.forEach((w) => recordResult(w.id, true));
    stopSpeaking();
    setDone(true);
  };

  const again = () => {
    setDone(false);
    setStarted(false);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="单词配对"
        emoji="🃏"
        hint="把英文和中文一一连起来。本轮 6 个词。"
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7EE] to-[#F4EFE6]">
      <WordMatchingGame
        key={round}
        vocabulary={words.map((w) => ({ en: w.en, cn: w.cn, emoji: w.emoji }))}
        grade={4}
        onFinish={finish}
      />
      {done && (
        <GameResult
          title="全部配对成功！"
          emoji="🎊"
          stars={3}
          lines={[`这一轮 ${words.length} 个词都记一次复习 ✅`]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}

export function Intro({
  title,
  emoji,
  hint,
  onStart,
  onBack,
}: {
  title: string;
  emoji: string;
  hint: string;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-[#FFF7EE] to-[#F4EFE6] px-6 text-center">
      <div>
        <div className="text-6xl">{emoji}</div>
        <div className="mt-3 text-2xl font-extrabold text-[#2b2b2b]">{title}</div>
        <div className="mx-auto mt-2 max-w-xs text-sm text-[#666]">{hint}</div>
        <button
          type="button"
          onClick={onStart}
          className="mt-6 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] px-12 py-3 text-lg font-bold text-white shadow"
        >
          开始 →
        </button>
        <div>
          <button type="button" onClick={onBack} className="mt-4 text-sm text-[#999]">
            返回游戏中心
          </button>
        </div>
      </div>
    </div>
  );
}
