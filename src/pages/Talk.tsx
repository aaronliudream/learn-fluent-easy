import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, ArrowLeft, Sparkles, Lightbulb, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { AITalkDialog, type Mission } from "@/components/AITalkDialog";
import { T } from "@/i18n/T";
import { LEVELS } from "@/data/course";
import { toast } from "sonner";
import { guestTrialsRemaining, GUEST_TRIAL_LIMIT } from "@/lib/guestTrial";

const TOPICS = [
  { key: "free",      label: "随便聊聊",       prompt: "" },
  { key: "weekend",   label: "周末计划",       prompt: "Talking about weekend plans" },
  { key: "food",      label: "美食与餐厅",     prompt: "Ordering food and discussing favorite restaurants" },
  { key: "travel",    label: "旅行经历",       prompt: "Sharing travel experiences and recommendations" },
  { key: "movies",    label: "电影和剧集",     prompt: "Discussing recent movies and TV shows" },
  { key: "work",      label: "工作日常",       prompt: "Workplace small talk and projects" },
  { key: "interview", label: "求职面试",       prompt: "Mock job interview practice" },
  { key: "airport",   label: "机场问路",       prompt: "Asking for directions at the airport" },
];

const LEVELS_OPT = [
  { id: "A1", name: "A1 入门" },
  { id: "A2", name: "A2 初级" },
  { id: "B1", name: "B1 中级" },
  { id: "B2", name: "B2 中高级" },
  { id: "C1", name: "C1 高级" },
];

export default function Talk() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [level, setLevel] = useState("B1");
  const [open, setOpen] = useState(false);
  const [trialsLeft, setTrialsLeft] = useState<number>(GUEST_TRIAL_LIMIT);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);

  useEffect(() => {
    setTrialsLeft(guestTrialsRemaining());
  }, [open]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setAuthed(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (active) setAuthed(!!s?.user);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const start = async () => {
    if (!authed && guestTrialsRemaining() <= 0) {
      toast("免费试用已结束 · 登录后可继续畅聊", {
        description: "登录账号即可解锁 10 分钟完整对话和学习记录",
        action: { label: "去登录", onClick: () => nav("/auth") },
        duration: 7000,
      });
      return;
    }
    // Generate the mission first so Alex's prompt already includes it when
    // the realtime session opens. If it fails, we just open without one.
    setMissionLoading(true);
    setMission(null);
    const lvlName = LEVELS_OPT.find((l) => l.id === level)?.name;
    try {
      const { data, error } = await supabase.functions.invoke("talk-mission", {
        body: {
          topicLabel: topic.label,
          topicPrompt: topic.prompt,
          level,
          levelName: lvlName,
        },
      });
      if (!error && data?.mission) setMission(data.mission as Mission);
    } catch (e) {
      console.warn("mission gen failed, opening without one", e);
    } finally {
      setMissionLoading(false);
      setOpen(true);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title="AI 英语口语对话"
        subtitle="和地道美国人 Alex 来一场 10 分钟全英文真人对话，结束后给你逐句中英讲解 + 词汇测试"
        back="/"
      />

      <section className="mb-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/0 p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-grad-title text-white shadow-lg">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold"><T>这是什么？</T></h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              <T>Alex 是一位加州年轻人，只用英语和你聊天。10 分钟到点自动结束。结束后 AI 会逐句翻译你说的话、给出更地道的说法，并出 5 道选择题让你巩固刚学到的词汇短语。</T>
            </p>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground"><T>选择话题</T></h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOPICS.map((t) => {
            const active = topic.key === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTopic(t)}
                className={`rounded-2xl border p-3 text-sm font-semibold transition ${
                  active
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <T>{t.label}</T>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-7">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground"><T>难度</T></h3>
        <div className="flex flex-wrap gap-2">
          {LEVELS_OPT.map((l) => {
            const active = level === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active ? "bg-primary text-primary-foreground shadow" : "bg-secondary text-foreground/70 hover:bg-secondary/70"
                }`}
              >
                <T>{l.name}</T>
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={start}
        disabled={missionLoading}
        className="flex w-full items-center justify-center gap-2 rounded-3xl bg-grad-title py-5 text-lg font-extrabold text-white shadow-tile transition hover:opacity-95 disabled:opacity-70"
      >
        {missionLoading ? <Loader2 className="size-6 animate-spin" /> : <Mic className="size-6" />}
        {missionLoading
          ? <T>正在为你设计今日任务…</T>
          : authed
          ? <T>开始 10 分钟对话</T>
          : trialsLeft > 0
            ? <T>免费试一下 3 分钟</T>
            : <T>登录解锁完整对话</T>}
      </button>

      {!authed && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lightbulb className="size-3.5" />
          {trialsLeft > 0
            ? <T>免费试用，无需注册 · 登录后可享 10 分钟</T>
            : <T>免费试用已用完 · 登录后继续畅聊</T>}
          <Link to="/auth" className="ml-1 text-primary underline"><T>登录</T></Link>
        </p>
      )}

      <AITalkDialog
        open={open}
        onClose={() => setOpen(false)}
        lessonTitle={topic.prompt || undefined}
        levelName={LEVELS_OPT.find((l) => l.id === level)?.name}
        level={level}
        isGuest={authed === false}
        mission={mission}
      />
    </main>
  );
}
