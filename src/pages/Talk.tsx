import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mic, ArrowLeft, Sparkles, Lightbulb, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import ProWaitlistButton from "@/components/ProWaitlistButton";
import { AITalkDialog } from "@/components/AITalkDialog";
import { T } from "@/i18n/T";
import { LEVELS } from "@/data/course";
import { toast } from "sonner";
import { guestTrialsRemaining, GUEST_TRIAL_LIMIT } from "@/lib/guestTrial";
import { voiceQuotaRemaining, DAILY_VOICE_LIMIT } from "@/lib/dailyVoiceQuota";

type Topic = { key: string; label: string; prompt: string };

const TOPIC_PACKS: Record<string, { defaultLevel: string; topics: Topic[] }> = {
  primary: {
    defaultLevel: "A1",
    topics: [
      { key: "self",    label: "自我介绍",   prompt: "A primary-school child introducing themselves: name, age, school, hobbies. Use only the most basic 500 words." },
      { key: "family",  label: "我的家人",   prompt: "Talking about family members in very simple English suitable for a 7-10 year old." },
      { key: "animals", label: "我的宠物",   prompt: "Talking about pets and animals using simple words like cat, dog, big, small, cute." },
      { key: "school",  label: "我的学校",   prompt: "Describing school day, favorite subjects, classmates, in beginner English." },
      { key: "food",    label: "我喜欢的食物", prompt: "Talking about favorite foods and meals, very basic vocabulary." },
      { key: "weather", label: "今天天气",   prompt: "Discussing weather and clothing in simple English." },
    ],
  },
  junior: {
    defaultLevel: "A2",
    topics: [
      { key: "weekend", label: "周末活动",   prompt: "Junior-high student talking about weekend plans and after-school activities." },
      { key: "school",  label: "校园生活",   prompt: "Discussing classes, exams, friendships at junior high school." },
      { key: "hobby",   label: "兴趣爱好",   prompt: "Sharing hobbies like sports, music, gaming, reading at A2 level." },
      { key: "travel",  label: "旅行经历",   prompt: "Talking about a recent trip in simple past tense, A2 level." },
      { key: "festival", label: "节日文化",  prompt: "Comparing Chinese and Western festivals in simple English." },
      { key: "future",  label: "未来梦想",   prompt: "Talking about future career and dreams using simple future tense." },
    ],
  },
  gaokao: {
    defaultLevel: "B1",
    topics: [
      { key: "gaokao",   label: "高考口语题", prompt: "Mock gaokao oral exam: read-aloud passage, then 3 follow-up questions." },
      { key: "picture",  label: "看图说话",   prompt: "Describe a picture and tell a short story about it (gaokao-style)." },
      { key: "argue",    label: "议论话题",   prompt: "Discuss a debatable topic (e.g. online learning vs classroom) at B1-B2 level." },
      { key: "culture",  label: "中西文化对比", prompt: "Compare Chinese and Western cultural differences, B1-B2 level." },
      { key: "essay",    label: "议论文复述", prompt: "Summarize an opinion essay and share your view, B1-B2 level." },
      { key: "interview", label: "大学面试",  prompt: "Mock university admission interview practice." },
    ],
  },
  general: {
    defaultLevel: "B1",
    topics: [
      { key: "free",      label: "随便聊聊",   prompt: "" },
      { key: "weekend",   label: "周末计划",   prompt: "Talking about weekend plans" },
      { key: "food",      label: "美食与餐厅", prompt: "Ordering food and discussing favorite restaurants" },
      { key: "travel",    label: "旅行经历",   prompt: "Sharing travel experiences and recommendations" },
      { key: "movies",    label: "电影和剧集", prompt: "Discussing recent movies and TV shows" },
      { key: "work",      label: "工作日常",   prompt: "Workplace small talk and projects" },
      { key: "interview", label: "求职面试",   prompt: "Mock job interview practice" },
      { key: "airport",   label: "机场问路",   prompt: "Asking for directions at the airport" },
    ],
  },
};

const STAGE_LABEL: Record<string, string> = {
  primary: "小学口语 · Primary",
  junior:  "初中口语 · Junior",
  gaokao:  "高考口语 · Senior",
  general: "AI 英语口语对话",
};

const LEVELS_OPT = [
  { id: "A1", name: "A1 入门" },
  { id: "A2", name: "A2 初级" },
  { id: "B1", name: "B1 中级" },
  { id: "B2", name: "B2 中高级" },
  { id: "C1", name: "C1 高级" },
];

export default function Talk() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const stage = (params.get("stage") || "general") as keyof typeof TOPIC_PACKS;
  const pack = TOPIC_PACKS[stage] ?? TOPIC_PACKS.general;
  const TOPICS = pack.topics;

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [level, setLevel] = useState(pack.defaultLevel);
  const [open, setOpen] = useState(false);
  const [trialsLeft, setTrialsLeft] = useState<number>(GUEST_TRIAL_LIMIT);
  const [voiceLeft, setVoiceLeft] = useState<number>(DAILY_VOICE_LIMIT);

  // Re-init when stage changes (e.g. user navigates from another stage)
  useEffect(() => {
    setTopic(TOPICS[0]);
    setLevel(pack.defaultLevel);
  }, [stage]);

  // 🔥 WARM-UP: as soon as user lands on this page, preflight the AI provider
  // and microphone permission UI hint. This shaves ~1-2s off the first tap.
  useEffect(() => {
    // Provider resolution is cached for 6h in resolveProvider()
    import("@/lib/aiProvider").then((m) => m.resolveProvider().catch(() => {}));
  }, []);

  useEffect(() => {
    setTrialsLeft(guestTrialsRemaining());
    setVoiceLeft(voiceQuotaRemaining(userId));
  }, [open, userId]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setAuthed(!!session?.user);
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (active) { setAuthed(!!s?.user); setUserId(s?.user?.id ?? null); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  // Stage-aware session length (matches AITalkDialog STAGE_DURATION_SEC).
  const stageMinutes = stage === "primary" ? 5 : stage === "junior" ? 8 : 10;

  const start = () => {
    if (!authed && guestTrialsRemaining() <= 0) {
      toast("免费试用已结束 · 登录后可继续畅聊", {
        description: "登录账号即可解锁 10 分钟完整对话和学习记录",
        action: { label: "去登录", onClick: () => nav("/auth") },
        duration: 7000,
      });
      return;
    }
    if (authed && userId && voiceQuotaRemaining(userId) <= 0) {
      toast("今天的免费语音对话已用完", {
        description: "每位同学每天免费 1 次语音对话，明天再来吧～急着练可以试试『文字陪练』",
        duration: 7000,
      });
      return;
    }
    setOpen(true);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={STAGE_LABEL[stage] ?? STAGE_LABEL.general}
        subtitle={`和地道美国人 Alex 来一场 ${stageMinutes} 分钟全英文真人对话，结束后给你逐句中英讲解 + 词汇测试`}
        back={stage === "primary" ? "/primary" : stage === "junior" ? "/junior" : stage === "gaokao" ? "/gaokao" : "/"}
      />

      <section className="mb-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/0 p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-grad-title text-white shadow-lg">
            <Sparkles className="size-6" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold"><T>这是什么？</T></h2>
              <ProWaitlistButton feature="ai-talk-unlimited" source="talk-page" label={<T>解锁无限时长</T>} />
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              <T>{`Alex 是一位加州年轻人，只用英语和你聊天。${stageMinutes} 分钟到点自动结束。结束后 AI 会逐句翻译你说的话、给出更地道的说法，并出 5 道选择题让你巩固刚学到的词汇短语。每天免费 1 次。`}</T>
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
        className="flex w-full items-center justify-center gap-2 rounded-3xl bg-grad-title py-5 text-lg font-extrabold text-white shadow-tile transition hover:opacity-95"
      >
        <Mic className="size-6" />
        {authed
          ? (voiceLeft > 0
              ? <T>{`开始 ${stageMinutes} 分钟对话`}</T>
              : <T>今日语音已用完 · 明天再来</T>)
          : trialsLeft > 0
            ? <T>免费试一下 3 分钟</T>
            : <T>登录解锁完整对话</T>}
      </button>

      {authed && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {voiceLeft > 0
            ? <T>{`今日剩余免费语音对话：${voiceLeft} 次`}</T>
            : <T>今日 1 次免费语音已用完，明天 0 点重置</T>}
        </p>
      )}

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
        stage={stage as "primary" | "junior" | "gaokao" | "general"}
        userId={userId}
      />
    </main>
  );
}
