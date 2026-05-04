import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { T } from "@/i18n/T";

/**
 * 守护灵入职引导：3 题性格测试 → 推荐 1 只 → 用户主动 3 选 1
 * 仅在用户首次进入 /pets 且尚未选择过守护灵时弹出。
 * 文化中立：仅询问学习偏好，不涉及性别/家庭/宗教/外貌。
 */

type Element = "wood" | "fire" | "water";
type Companion = {
  speciesId: string;
  element: Element;
  emoji: string;
  nameCn: string;
  nameEn: string;
  tagCn: string;
  catchphrase: string;
  color: string;
};

const COMPANIONS: Companion[] = [
  { speciesId: "lumi_spark",     element: "wood",  emoji: "🌱", nameCn: "绿芽精灵", nameEn: "Sprout", tagCn: "温柔陪伴 · 耐心成长", catchphrase: "慢慢来，我陪着你 🌿", color: "from-emerald-400 to-green-500" },
  { speciesId: "fire_fox",       element: "fire",  emoji: "🦊", nameCn: "火焰狐",   nameEn: "Ember",  tagCn: "热情挑战 · 连击之王", catchphrase: "冲啊！你可以的 🔥",   color: "from-orange-500 to-red-500" },
  { speciesId: "rainbow_whale",  element: "water", emoji: "🐋", nameCn: "彩虹鲸",   nameEn: "Aqua",   tagCn: "沉静博学 · 故事之友", catchphrase: "每个词都是一道浪 🌊", color: "from-sky-400 to-blue-600" },
];

const QUIZ = [
  { q: { cn: "学英语时，你更喜欢…", en: "When learning English, you prefer..." },
    options: [
      { label: { cn: "立刻挑战难题", en: "Tackle hard challenges right away" }, score: { fire: 2, water: 0, wood: 0 } },
      { label: { cn: "读一段故事再开始", en: "Read a story first" },             score: { fire: 0, water: 2, wood: 0 } },
      { label: { cn: "慢慢一步步来",     en: "Take it one step at a time" },     score: { fire: 0, water: 0, wood: 2 } },
    ] },
  { q: { cn: "遇到不会的题，你会…", en: "When stuck on a question, you..." },
    options: [
      { label: { cn: "立即多试几次", en: "Try again immediately" },       score: { fire: 2, water: 0, wood: 0 } },
      { label: { cn: "思考后再回答", en: "Think it through first" },       score: { fire: 0, water: 2, wood: 0 } },
      { label: { cn: "想休息一下",   en: "Take a short break" },           score: { fire: 0, water: 0, wood: 2 } },
    ] },
  { q: { cn: "你最希望被夸…", en: "You most want to be praised for being..." },
    options: [
      { label: { cn: "厉害",   en: "Amazing"  }, score: { fire: 2, water: 0, wood: 0 } },
      { label: { cn: "聪明",   en: "Clever"   }, score: { fire: 0, water: 2, wood: 0 } },
      { label: { cn: "努力",   en: "Hardworking" }, score: { fire: 0, water: 0, wood: 2 } },
    ] },
];

type Props = { onDone: () => void };

export default function CompanionOnboarding({ onDone }: Props) {
  const [step, setStep] = useState<"intro" | "quiz" | "pick">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState<{ fire: number; water: number; wood: number }>({ fire: 0, water: 0, wood: 0 });
  const [picked, setPicked] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const recommended: Element = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] as Element) || "wood";
  const recommendedSpecies = COMPANIONS.find((c) => c.element === recommended)!;

  const choose = (idx: number) => {
    const opt = QUIZ[qIdx].options[idx];
    setScores((s) => ({ fire: s.fire + opt.score.fire, water: s.water + opt.score.water, wood: s.wood + opt.score.wood }));
    if (qIdx + 1 < QUIZ.length) setQIdx(qIdx + 1);
    else setStep("pick");
  };

  const adopt = async (speciesId: string) => {
    setSubmitting(true);
    setPicked(speciesId);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) { setSubmitting(false); return; }
      const sp = COMPANIONS.find((c) => c.speciesId === speciesId)!;
      // 录入选择
      await supabase.from("pet_companion_choice").upsert({
        user_id: uid, chosen_species_id: speciesId,
        personality_quiz_result: { scores, recommended },
      });
      // 创建宠物（其它 pet 设为非 active）
      await supabase.from("user_pets").update({ is_active: false }).eq("user_id", uid);
      await supabase.from("user_pets").insert({
        user_id: uid, species_id: speciesId, nickname: sp.nameCn,
        stage: 1, level: 1, exp: 0, hunger: 80, mood: 90, is_active: true,
      });
      onDone();
    } catch (e) {
      console.error("[onboarding] adopt failed", e);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        {step === "intro" && (
          <div className="text-center">
            <div className="text-6xl">🌟</div>
            <h2 className="mt-3 text-2xl font-extrabold"><T>选择你的英语守护灵</T></h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose your English Learning Companion<br />
              <T>一个会陪你成长、记得你、为你加油的 AI 伙伴</T>
            </p>
            <div className="my-5 grid grid-cols-3 gap-2">
              {COMPANIONS.map((c) => (
                <div key={c.speciesId} className={cn("rounded-2xl bg-gradient-to-br p-3 text-white", c.color)}>
                  <div className="text-3xl">{c.emoji}</div>
                  <div className="mt-1 text-[11px] font-bold"><T>{c.nameCn}</T></div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep("quiz")}
              className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-extrabold text-white shadow"
            >
              <T>开始 30 秒匹配</T> →
            </button>
            <button
              onClick={() => setStep("pick")}
              className="mt-2 w-full text-xs text-muted-foreground underline"
            >
              <T>跳过测试，我自己选</T>
            </button>
          </div>
        )}

        {step === "quiz" && (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span><T>性格匹配</T></span>
              <span>{qIdx + 1} / {QUIZ.length}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                   style={{ width: `${((qIdx + 1) / QUIZ.length) * 100}%` }} />
            </div>
            <h3 className="mt-5 text-lg font-extrabold"><T>{QUIZ[qIdx].q.cn}</T></h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{QUIZ[qIdx].q.en}</p>
            <div className="mt-4 space-y-2">
              {QUIZ[qIdx].options.map((opt, i) => (
                <button key={i} onClick={() => choose(i)}
                        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-bold transition hover:scale-[1.02] hover:border-primary hover:bg-primary/5">
                  <div><T>{opt.label.cn}</T></div>
                  <div className="text-[11px] font-normal text-muted-foreground">{opt.label.en}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "pick" && (
          <div>
            <h3 className="text-center text-xl font-extrabold"><T>挑选你的守护灵</T></h3>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {scores.fire + scores.water + scores.wood > 0
                ? <><T>根据测试，我们推荐</T> <T>{recommendedSpecies.nameCn}</T>，<T>但选择权在你！</T></>
                : <T>三只都很棒，跟着直觉选一只吧 ✨</T>}
            </p>
            <div className="mt-4 space-y-3">
              {COMPANIONS.map((c) => {
                const isReco = c.speciesId === recommendedSpecies.speciesId && (scores.fire + scores.water + scores.wood) > 0;
                return (
                  <button
                    key={c.speciesId}
                    disabled={submitting}
                    onClick={() => adopt(c.speciesId)}
                    className={cn(
                      "relative w-full overflow-hidden rounded-2xl bg-gradient-to-r p-4 text-left text-white shadow-lg transition disabled:opacity-50",
                      c.color,
                      isReco && "ring-4 ring-yellow-300",
                      !submitting && "hover:scale-[1.02]",
                      picked === c.speciesId && "scale-95"
                    )}
                  >
                    {isReco && (
                      <span className="absolute right-2 top-2 rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                        ⭐ <T>推荐</T>
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{c.emoji}</div>
                      <div className="flex-1">
                        <div className="text-lg font-extrabold"><T>{c.nameCn}</T> · {c.nameEn}</div>
                        <div className="text-xs opacity-90"><T>{c.tagCn}</T></div>
                        <div className="mt-1 text-[11px] italic opacity-80">"<T>{c.catchphrase}</T>"</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              <T>你可以随时在「领养」标签换养更多伙伴</T>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}