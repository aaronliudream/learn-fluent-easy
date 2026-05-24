import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ReadWriteSimplifiedConfig,
  ReadWriteSimplifiedQuestion,
} from "@/lib/primaryHub/readWriteTypes";

type Props = {
  config: ReadWriteSimplifiedConfig;
  onFinish: () => void;
  onAwardPoints: (n: number) => void;
};

const CORRECT_DELAY_MS = 1000;
const WRONG_DELAY_MS = 1500;

type Feedback = "idle" | "correct" | "wrong";

function FeedbackBanner({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const cls =
    tone === "success"
      ? "bg-[#EAF3DE] text-[#3B6D11] border-[#97C459]"
      : "bg-[#FFF0EB] text-[#A32D2D] border-[#E24B4A]";
  return (
    <div
      className={`mt-4 rounded-xl border-2 px-4 py-3 text-center text-[15px] font-semibold ${cls}`}
    >
      {tone === "success" ? "✅ " : "❌ "}
      {children}
    </div>
  );
}

function PictureChoiceBody({ q }: { q: Extract<ReadWriteSimplifiedQuestion, { type: "picture_choice" }> }) {
  return (
  <>
      <div className="overflow-hidden rounded-2xl border border-[#EEEAE0] bg-[#FFF8F0]">
        <img
          src={q.image}
          alt={q.imageAlt}
          className="mx-auto h-auto max-h-52 w-full object-contain p-3 sm:max-h-60"
        />
      </div>
      <p className="mt-3 text-center text-[14px] text-[#888780]">哪句话符合图片？</p>
    </>
  );
}

function FillChoiceBody({ q }: { q: Extract<ReadWriteSimplifiedQuestion, { type: "fill_choice" }> }) {
  const parts = q.sentence.split("____");
  return (
    <div className="rounded-2xl border border-[#EEEAE0] bg-[#FFF8F0] px-4 py-6 text-center">
      <p className="text-[22px] font-bold leading-snug text-[#2C2C2A]">
        {parts[0]}
        <span className="mx-1 inline-block min-w-[80px] border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]">
          ____
        </span>
        {parts[1] ?? ""}
      </p>
      <p className="mt-2 text-[14px] text-[#888780]">选一个词填入空格</p>
    </div>
  );
}

export default function ReadWriteTrainingStage({ config, onFinish, onAwardPoints }: Props) {
  const total = config.questions.length;
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [finished, setFinished] = useState(false);
  const [awardedQs, setAwardedQs] = useState<Set<number>>(() => new Set());
  const timerRef = useRef<number | null>(null);

  const q = config.questions[qIdx];
  const progressPct = finished ? 100 : ((qIdx + (feedback === "correct" ? 1 : 0)) / total) * 100;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const goNext = useCallback(() => {
    if (qIdx >= total - 1) {
      setFinished(true);
      return;
    }
    setQIdx((i) => i + 1);
    setPicked(null);
    setFeedback("idle");
  }, [qIdx, total]);

  const handlePick = (optIdx: number) => {
    if (feedback !== "idle" || finished) return;
    const opt = q.options[optIdx];
    if (!opt) return;

    setPicked(optIdx);
    if (opt.correct) {
      setFeedback("correct");
      if (!awardedQs.has(qIdx)) {
        setAwardedQs((prev) => new Set(prev).add(qIdx));
        setScore((s) => s + config.pointsPerQuestion);
        for (let i = 0; i < config.pointsPerQuestion; i++) onAwardPoints(1);
      }
      clearTimer();
      timerRef.current = window.setTimeout(goNext, CORRECT_DELAY_MS);
    } else {
      setFeedback("wrong");
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        setPicked(null);
        setFeedback("idle");
      }, WRONG_DELAY_MS);
    }
  };

  const optionClass = (optIdx: number) => {
    let cls =
      "w-full rounded-xl border-2 px-4 py-3 text-left text-[16px] font-medium transition disabled:cursor-not-allowed ";
    if (feedback === "idle") {
      cls +=
        picked === optIdx
          ? "border-[#378ADD] bg-[#E6F1FB]"
          : "border-[#EEEAE0] bg-white hover:border-[#FF6B35]/50";
      return cls;
    }
    const opt = q.options[optIdx];
    if (opt?.correct) cls += "border-[#6FA92A] bg-[#EAF3DE] text-[#3B6D11]";
    else if (picked === optIdx) cls += "border-[#E24B4A] bg-[#FFF0EB] text-[#A32D2D]";
    else cls += "border-[#EEEAE0] bg-white opacity-50";
    return cls;
  };

  if (finished) {
    const pct = Math.round((score / config.totalPoints) * 100);
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-5xl">🏆</div>
        <h2 className="mt-3 text-xl font-bold text-[#FF6B35]">读写训练完成！</h2>
        <p className="mt-2 text-[16px] text-[#2C2C2A]">
          得分：<span className="font-bold text-[#FF6B35]">{score}</span> / {config.totalPoints}
        </p>
        <p className="mt-1 text-[14px] text-[#888780]">正确率 {pct}%</p>
        <div className="mt-3 text-2xl">
          {score >= config.totalPoints ? "⭐⭐⭐" : score >= 3 ? "⭐⭐" : "⭐"}
        </div>
        <button
          type="button"
          onClick={onFinish}
          className="mt-6 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white hover:bg-[#E55A28]"
        >
          进入下一关 →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">📝 {config.title}</span>
        <span className="text-sm font-bold tabular-nums text-[#FF6B35]">
          {score}/{config.totalPoints} 分
        </span>
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-[#888780]">
        <span>
          第 {qIdx + 1} / {total} 题
        </span>
        <span>{q.type === "picture_choice" ? "看图选句" : "填空选词"}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#F4F0E6]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] transition-all duration-300"
          style={{ width: `${Math.min(100, progressPct)}%` }}
        />
      </div>

      {q.hint_zh && (
        <p className="mb-3 text-[14px] text-[#888780]">💡 {q.hint_zh}</p>
      )}

      {q.type === "picture_choice" ? <PictureChoiceBody q={q} /> : <FillChoiceBody q={q} />}

      <div className="mt-4 flex flex-col gap-2">
        {q.options.map((opt, i) => (
          <button
            key={`${opt.text}-${i}`}
            type="button"
            disabled={feedback !== "idle"}
            className={optionClass(i)}
            onClick={() => handlePick(i)}
          >
            {q.type === "fill_choice" ? (
              <span className="font-semibold">{opt.text}</span>
            ) : (
              opt.text
            )}
          </button>
        ))}
      </div>

      {feedback === "correct" && <FeedbackBanner tone="success">答对了！</FeedbackBanner>}
      {feedback === "wrong" && (
        <FeedbackBanner tone="error">
          再想想…
          {q.type === "fill_choice" && q.correctSentence && (
            <span className="mt-1 block text-[14px] font-normal">参考答案：{q.correctSentence}</span>
          )}
          {q.type === "picture_choice" && (
            <span className="mt-1 block text-[14px] font-normal">
              参考答案：{q.options.find((o) => o.correct)?.text}
            </span>
          )}
        </FeedbackBanner>
      )}
    </div>
  );
}
