import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { toast } from "sonner";

// Simple, kid-safe demo prompts (G3 default). Pet-driven scenarios.
const PROMPT_DECK = [
  { sentence: "Hello! I'm Spark. Nice to meet you!", scenario: "Spark 第一次和你打招呼", grade: 3 },
  { sentence: "I'm hungry. Can I have an apple?", scenario: "Spark 饿了，想吃东西", grade: 3 },
  { sentence: "Let's play together in the park!", scenario: "Spark 想和你去公园玩", grade: 3 },
  { sentence: "I like sunny days. They make me happy.", scenario: "Spark 在聊今天的好天气", grade: 3 },
  { sentence: "Thank you for being my friend.", scenario: "Spark 谢谢你陪它学习", grade: 3 },
];

type GradeResult = {
  transcript: string;
  overall_score: number;
  pronunciation_score: number;
  fluency_score: number;
  completeness_score: number;
  encouragement: string;
  corrections: { word: string; tip_cn: string }[];
  replacements: string[];
};

export default function PrimarySpeak() {
  const [idx, setIdx] = useState(0);
  const prompt = PROMPT_DECK[idx];
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTsRef = useRef<number>(0);

  useEffect(() => () => {
    try { recRef.current?.stream.getTracks().forEach(t => t.stop()); } catch {}
  }, []);

  async function startRec() {
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => handleStop(mr.mimeType || "audio/webm");
      mr.start();
      recRef.current = mr;
      startTsRef.current = Date.now();
      setRecording(true);
    } catch (e) {
      toast.error("无法打开麦克风，请检查权限");
    }
  }

  function stopRec() {
    if (!recRef.current) return;
    setRecording(false);
    recRef.current.stop();
    recRef.current.stream.getTracks().forEach(t => t.stop());
  }

  async function handleStop(mime: string) {
    setBusy(true);
    try {
      const blob = new Blob(chunksRef.current, { type: mime });
      const buf = await blob.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const { data, error } = await supabase.functions.invoke("primary-speaking-grade", {
        body: {
          target: prompt.sentence,
          audio_base64: b64,
          mime,
          grade: prompt.grade,
          scenario: prompt.scenario,
          audio_duration_ms: Date.now() - startTsRef.current,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as GradeResult);
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("RATE_LIMIT")) toast.error("练得太快啦，休息一下再来 ✨");
      else if (msg.includes("PAYMENT_REQUIRED")) toast.error("AI 额度用完了，请稍后");
      else toast.error("评分失败，再试一次吧");
    } finally {
      setBusy(false);
    }
  }

  const next = () => { setResult(null); setIdx((idx + 1) % PROMPT_DECK.length); };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <Link to="/primary" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回小学专区
      </Link>

      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          AI SPEAKING · 跟 Spark 一起说
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
          🐾 Spark 想和你聊天
        </h1>
      </div>

      {/* Scenario card */}
      <Card className="mb-4 overflow-hidden bg-gradient-to-br from-pink-400 via-fuchsia-400 to-violet-400 p-5 text-white">
        <div className="text-xs opacity-90">情境 · {prompt.scenario}</div>
        <div className="mt-2 text-xl font-bold leading-snug">{prompt.sentence}</div>
        <button
          onClick={() => speak(prompt.sentence)}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur"
        >
          <Volume2 className="size-3.5" /> 听 Spark 读
        </button>
      </Card>

      {/* Recorder */}
      <div className="mb-4 flex items-center justify-center gap-3">
        {!recording ? (
          <Button onClick={startRec} disabled={busy} size="lg" className="rounded-full px-8">
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mic className="mr-2 size-4" />}
            {busy ? "Spark 在听…" : "按住我会读"}
          </Button>
        ) : (
          <Button onClick={stopRec} size="lg" variant="destructive" className="rounded-full px-8 animate-pulse">
            <Square className="mr-2 size-4" /> 录音中 · 点击结束
          </Button>
        )}
        <Button onClick={next} variant="outline" size="lg" className="rounded-full">
          <RefreshCw className="mr-1 size-4" /> 换一句
        </Button>
      </div>

      {/* Result */}
      {result && (
        <Card className="space-y-4 p-5">
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-sm text-muted-foreground">综合得分</div>
              <div className="text-3xl font-extrabold text-primary">{result.overall_score}</div>
            </div>
            <Progress value={result.overall_score} className="mt-2 h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <ScoreChip label="发音" value={result.pronunciation_score} />
            <ScoreChip label="流利" value={result.fluency_score} />
            <ScoreChip label="完整" value={result.completeness_score} />
          </div>

          <div className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
            <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
              <Sparkles className="size-4" /> Spark 说
            </div>
            <div className="mt-1 text-foreground">{result.encouragement}</div>
          </div>

          {result.transcript && (
            <div className="text-xs text-muted-foreground">
              我听到你说：<span className="italic">"{result.transcript}"</span>
            </div>
          )}

          {result.corrections?.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-bold">🎯 小提示</div>
              <ul className="space-y-1.5">
                {result.corrections.map((c, i) => (
                  <li key={i} className="rounded-lg border border-border/60 p-2 text-sm">
                    <button onClick={() => speak(c.word)} className="font-bold text-primary underline-offset-2 hover:underline">
                      {c.word}
                    </button>
                    <span className="ml-2 text-muted-foreground">{c.tip_cn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.replacements?.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-bold">✨ 试试换一种说法</div>
              <ul className="space-y-2">
                {result.replacements.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted p-2.5 text-sm">
                    <span className="flex-1">{s}</span>
                    <button onClick={() => speak(s)} className="rounded-full bg-background p-1.5 shadow-sm">
                      <Volume2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </main>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  const color = value >= 85 ? "text-emerald-600" : value >= 70 ? "text-amber-600" : "text-rose-600";
  return (
    <div className="rounded-xl border border-border/60 p-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}