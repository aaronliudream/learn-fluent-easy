import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Sparkles, Trophy, History, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const TARGET_BANDS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0];
const MODES = [
  { id: "training", name: "训练模式", desc: "题目→说→反馈→重说，最有效率提分" },
  { id: "mock_test", name: "模拟考试", desc: "全程不打断，结束后一次性出 band 评分" },
  { id: "review", name: "错题复习", desc: "专练你过去说错的句型（基于错题本）" },
] as const;

const TOPICS = [
  "Hometown", "Work / Study", "Hobbies", "Travel", "Food",
  "Technology", "Education", "Environment", "Health", "Media",
];

type RecentSession = {
  id: string;
  overall_band: number | null;
  mode: string;
  topic_category: string | null;
  completed_at: string | null;
  created_at: string;
};

export default function IeltsSpeaking() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [targetBand, setTargetBand] = useState(6.5);
  const [mode, setMode] = useState<"training" | "mock_test" | "review">("training");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [recent, setRecent] = useState<RecentSession[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
    });
  }, []);

  useEffect(() => {
    if (!authed) return;
    supabase.from("ielts_sessions")
      .select("id, overall_band, mode, topic_category, completed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecent(data || []));
  }, [authed]);

  const start = async () => {
    if (!authed) {
      toast("请先登录后开始练习", { action: { label: "去登录", onClick: () => nav("/auth") } });
      return;
    }
    const { data, error } = await supabase
      .from("ielts_sessions")
      .insert({
        target_band: targetBand,
        mode,
        topic_category: topic,
        current_part: 1,
        status: "in_progress",
        transcript: [],
      })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("创建练习失败：" + (error?.message || ""));
      return;
    }
    nav(`/ielts-speaking/session/${data.id}`);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title="雅思口语 AI 训练"
        subtitle="按官方雅思评分标准 · 考官+教练双角色 · Part 1 → 2 → 3 完整闭环"
        back="/"
      />

      {/* Hero */}
      <section className="mb-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/0 p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-grad-title text-white shadow-lg">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold leading-tight">像真考官一样评估，像私教一样纠错</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              用官方 9 分制 band descriptors 打分（流利度/词汇/语法/发音），每次最多 5 个高优先错误 + Band 7+ 升级表达 + 强制重说 + 自动错题本。
            </p>
          </div>
        </div>
      </section>

      {/* Target band */}
      <section className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Target className="size-4 text-primary" />
          目标分数
        </div>
        <div className="flex flex-wrap gap-2">
          {TARGET_BANDS.map((b) => (
            <button
              key={b}
              onClick={() => setTargetBand(b)}
              className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
                targetBand === b
                  ? "bg-primary text-primary-foreground ring-primary shadow-md"
                  : "bg-card text-foreground ring-border hover:bg-secondary"
              }`}
            >
              Band {b.toFixed(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Mode */}
      <section className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Mic className="size-4 text-primary" />
          训练模式
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-2xl border p-3 text-left transition ${
                mode === m.id
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <div className="text-sm font-bold">{m.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{m.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Topic */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold">
          <BookOpen className="size-4 text-primary" />
          话题方向（影响 Part 1 / Part 2 选题）
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                topic === t
                  ? "bg-primary/15 text-primary ring-primary"
                  : "bg-card text-muted-foreground ring-border hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={start}
        className="w-full rounded-2xl bg-grad-title px-6 py-4 text-base font-extrabold text-white shadow-tile transition hover:opacity-95"
      >
        🎙️ 开始口语练习（约 12-15 分钟）
      </button>

      {/* Recent sessions */}
      {recent.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <History className="size-4 text-primary" />
            最近练习
          </div>
          <div className="space-y-2">
            {recent.map((s) => (
              <button
                key={s.id}
                onClick={() => nav(`/ielts-speaking/session/${s.id}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-3 text-left hover:bg-secondary"
              >
                <div>
                  <div className="text-sm font-bold">
                    {s.topic_category || "未分类"}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {MODES.find((m) => m.id === s.mode)?.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString("zh-CN")}
                  </div>
                </div>
                {s.overall_band ? (
                  <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-extrabold text-amber-700">
                    <Trophy className="size-3.5" />
                    {s.overall_band.toFixed(1)}
                  </div>
                ) : (
                  <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">未完成</div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}