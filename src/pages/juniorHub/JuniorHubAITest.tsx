import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { shuffleArray, useJuniorHub } from "@/lib/juniorHub/context";
import { readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";
import { findUnit } from "@/lib/juniorHub/courseData";
import { getTotalCompletedStages } from "@/lib/juniorHub/progress";
import { AI_DIMENSIONS, type DimResults, type QuizQuestion } from "@/lib/juniorHub/types";
import { DimensionBars } from "@/components/juniorHub/DimensionBars";
import { savePersist } from "@/lib/juniorHub/storage";

export default function JuniorHubAITest() {
  const { grade, state, setState, addMistake } = useJuniorHub();
  const nav = useNavigate();
  const base = `/junior/hub/${grade}`;
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);

  const [questions] = useState(() => {
    const errorQs = state.mistakes.filter((m) => m.opts && m.opts.length > 1).slice(0, 6);
    const learnedQs: QuizQuestion[] = [];
    Object.keys(state.units).forEach((unitId) => {
      const us = state.units[unitId];
      if (us.completedStages.length > 0) {
        const unit = findUnit(unitId);
        if (unit) learnedQs.push(...unit.quizQuestions.map((q) => ({ ...q, unitTitle: unit.title })));
      }
    });
    const picked = shuffleArray([...errorQs, ...shuffleArray(learnedQs).slice(0, 4)]).slice(0, 10);
    return picked.map((q, i) => ({
      ...q,
      dim: q.dim || AI_DIMENSIONS[i % AI_DIMENSIONS.length].key,
    }));
  });

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [dimResults, setDimResults] = useState<DimResults>(() => {
    const d: DimResults = {};
    AI_DIMENSIONS.forEach((x) => {
      d[x.key] = { correct: 0, total: 0 };
    });
    return d;
  });
  const [done, setDone] = useState(false);

  const q = questions[index];
  const prevRecord = state.aiTestHistory[state.aiTestHistory.length - 1];

  const finish = (finalCorrect: number) => {
    const percent = Math.round((finalCorrect / questions.length) * 100);
    const now = new Date();
    const record = {
      date: now.toISOString().slice(0, 10),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      correct: finalCorrect,
      total: questions.length,
      percent,
      dims: dimResults,
      atStage: getTotalCompletedStages(state),
    };
    setState((prev) => {
      const next = {
        ...prev,
        aiTestHistory: [...prev.aiTestHistory, record],
        lastAITest: getTotalCompletedStages(prev),
        aiTestCount: (prev.aiTestCount || 0) + 1,
      };
      savePersist(grade, next);
      return next;
    });
    setDone(true);
  };

  const answer = (optIdx: number) => {
    if (answered || !q) return;
    setAnswered(true);
    const isCorrect = optIdx === q.answer;
    const dim = q.dim || "vocab";
    setDimResults((prev) => ({
      ...prev,
      [dim]: {
        correct: (prev[dim]?.correct ?? 0) + (isCorrect ? 1 : 0),
        total: (prev[dim]?.total ?? 0) + 1,
      },
    }));
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    if (isCorrect) setCorrect(nextCorrect);
    else {
      addMistake({
        q: q.q,
        opts: q.opts,
        answer: q.answer,
        point: q.point,
        unitTitle: q.unitTitle,
      });
    }
    setTimeout(() => {
      if (index >= questions.length - 1) finish(nextCorrect);
      else {
        setIndex((i) => i + 1);
        setAnswered(false);
      }
    }, 900);
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">还没有足够的学习内容来出题，先完成几关吧！</p>
        <Link to={withJuniorPublisher(base, pub)} className="text-[#FF6B35] font-semibold">
          返回首页
        </Link>
      </div>
    );
  }

  if (done) {
    const percent = Math.round((correct / questions.length) * 100);
    const level =
      percent >= 90 ? "🏆 优秀" : percent >= 75 ? "🌟 良好" : percent >= 60 ? "💪 加油" : "📖 努力";
    const diff = prevRecord ? percent - prevRecord.percent : 0;
    return (
      <div className="px-4 py-6">
        <div className="text-center">
          <div className="mb-2 text-6xl">🤖</div>
          <div className="text-xl font-bold">{level}</div>
          <div className="rounded-2xl bg-gradient-to-br from-[#B45EFF] to-[#7B5BFF] p-5 text-white mt-4">
            <div className="text-5xl font-bold">
              {percent}
              <span className="text-xl">分</span>
            </div>
            <div className="text-sm opacity-90">
              答对 {correct} / {questions.length}
            </div>
          </div>
        </div>
        {prevRecord && diff !== 0 && (
          <div
            className={`mt-3 rounded-xl p-3 text-center text-sm font-semibold ${
              diff > 0 ? "bg-[#EAF3DE] text-[#3B6D11]" : "bg-[#FFF4D6] text-[#854F0B]"
            }`}
          >
            {diff > 0 ? `📈 比上次进步了 +${diff} 分！` : `📉 比上次低 ${diff} 分，再加把劲`}
          </div>
        )}
        <div className="mt-4 rounded-xl border border-[#EEEAE0] bg-white p-3">
          <div className="mb-2 text-sm font-bold">🎯 本次能力分析</div>
          <DimensionBars dims={dimResults} />
        </div>
        <button
          type="button"
          onClick={() => nav(withJuniorPublisher(base, pub))}
          className="mt-4 w-full rounded-xl bg-[#FF6B35] py-3 font-bold text-white"
        >
          🏠 回到首页
        </button>
        <button
          type="button"
          onClick={() => nav(withJuniorPublisher(`${base}/aihistory`, pub))}
          className="mt-2 w-full rounded-xl border border-[#EEEAE0] bg-white py-3 font-semibold"
        >
          📊 查看测试历史
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={() => nav(withJuniorPublisher(base, pub))} className="text-xl">
          ←
        </button>
        <div className="font-bold">🤖 AI 智能小测试</div>
        <div className="ml-auto text-sm text-[#888780]">
          {index + 1}/{questions.length}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-4 text-base font-semibold">{q.q}</p>
        <div className="space-y-2">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => answer(i)}
              className={`quiz-opt flex w-full items-center gap-2 rounded-xl border-2 border-[#EEEAE0] p-3 text-left ${
                answered && i === q.answer ? "correct" : answered && i !== q.answer ? "dimmed" : ""
              }`}
            >
              <span className="grid size-7 place-items-center rounded-lg bg-[#F4F0E6] text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
