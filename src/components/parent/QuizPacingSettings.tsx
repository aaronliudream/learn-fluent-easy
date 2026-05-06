import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Brain, Target } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mix = { en2cn: number; cn2en: number; listen2en: number };

const SIZE_PRESETS = [
  { n: 4, label: "幼儿", hint: "5–6 岁专注极限" },
  { n: 6, label: "标准", hint: "推荐 · 7–9 岁" },
  { n: 8, label: "进阶", hint: "10+ 岁" },
  { n: 12, label: "挑战", hint: "考前冲刺" },
];

const MIX_PRESETS: { key: string; label: string; emoji: string; mix: Mix; hint: string }[] = [
  { key: "balanced", label: "全面均衡", emoji: "⚖️", mix: { en2cn: 1, cn2en: 1, listen2en: 1 }, hint: "听 · 读 · 写 三合一" },
  { key: "listening", label: "听力强化", emoji: "🎧", mix: { en2cn: 1, cn2en: 0, listen2en: 3 }, hint: "75% 听力题" },
  { key: "spelling",  label: "拼写强化", emoji: "✍️", mix: { en2cn: 0, cn2en: 3, listen2en: 1 }, hint: "75% 拼写认读" },
  { key: "meaning",   label: "认词强化", emoji: "📖", mix: { en2cn: 3, cn2en: 1, listen2en: 0 }, hint: "75% 看词识意" },
];

export default function QuizPacingSettings() {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [size, setSize] = useState(6);
  const [mix, setMix] = useState<Mix>({ en2cn: 2, cn2en: 2, listen2en: 2 });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id ?? null;
      setUid(id);
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("quiz_session_size, quiz_type_mix")
        .eq("user_id", id)
        .maybeSingle();
      if (data) {
        setSize((data as any).quiz_session_size ?? 6);
        const m = (data as any).quiz_type_mix as Mix | null;
        if (m) setMix({ en2cn: m.en2cn ?? 2, cn2en: m.cn2en ?? 2, listen2en: m.listen2en ?? 2 });
      }
      setLoading(false);
    })();
  }, []);

  async function save(next: { quiz_session_size?: number; quiz_type_mix?: Mix }) {
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(next).eq("user_id", uid);
    setSaving(false);
    if (error) toast.error("保存失败：" + error.message);
    else toast.success("已保存 ✓");
  }

  function setSizeAndSave(n: number) {
    setSize(n);
    save({ quiz_session_size: n });
  }

  function applyMixPreset(p: Mix) {
    setMix(p);
    save({ quiz_type_mix: p });
  }

  function bumpMix(k: keyof Mix, delta: number) {
    const next = { ...mix, [k]: Math.max(0, Math.min(10, mix[k] + delta)) };
    if (next.en2cn + next.cn2en + next.listen2en === 0) return;
    setMix(next);
    save({ quiz_type_mix: next });
  }

  const totalRatio = mix.en2cn + mix.cn2en + mix.listen2en;
  const pct = (n: number) => totalRatio ? Math.round((n / totalRatio) * 100) : 0;

  if (loading) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline size-4 animate-spin" /> 加载测验设置…
      </section>
    );
  }
  if (!uid) return null;

  return (
    <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-pink-500" />
          <div>
            <div className="text-sm font-extrabold">🧠 测验节奏 & 题型比例</div>
            <div className="text-[11px] text-muted-foreground">家长按孩子年龄调整每轮题数和题型分布</div>
          </div>
        </div>
        {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {/* 题量 */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold">每轮题数</span>
          <span className="text-muted-foreground">当前 <b className="text-pink-600">{size}</b> 题/轮</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SIZE_PRESETS.map(p => (
            <button
              key={p.n}
              onClick={() => setSizeAndSave(p.n)}
              className={cn(
                "rounded-2xl border-2 p-2.5 text-center transition hover:-translate-y-0.5",
                size === p.n
                  ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow dark:from-pink-950/30 dark:to-rose-950/30"
                  : "border-border bg-card"
              )}
            >
              <div className="text-lg font-black text-pink-600">{p.n}</div>
              <div className="text-xs font-extrabold">{p.label}</div>
              <div className="text-[10px] text-muted-foreground">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 题型比例 — 预设 */}
      <div className="mb-3">
        <div className="mb-1.5 text-xs font-bold">题型比例（一键预设）</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {MIX_PRESETS.map(p => {
            const active =
              p.mix.en2cn === mix.en2cn &&
              p.mix.cn2en === mix.cn2en &&
              p.mix.listen2en === mix.listen2en;
            return (
              <button
                key={p.key}
                onClick={() => applyMixPreset(p.mix)}
                className={cn(
                  "rounded-2xl border-2 p-2.5 text-left transition hover:-translate-y-0.5",
                  active ? "border-violet-500 bg-violet-50 shadow dark:bg-violet-950/30" : "border-border bg-card"
                )}
              >
                <div className="text-lg">{p.emoji}</div>
                <div className="text-xs font-extrabold">{p.label}</div>
                <div className="text-[10px] text-muted-foreground">{p.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 题型比例 — 微调 */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-3">
        <div className="mb-2 flex items-center gap-1 text-xs font-bold">
          <Target className="size-3.5 text-violet-500" /> 自定义比例（可微调）
        </div>
        <div className="space-y-2">
          <RatioRow label="📖 看英文 → 选中文" color="bg-sky-500" value={mix.en2cn} pct={pct(mix.en2cn)} onMinus={() => bumpMix("en2cn", -1)} onPlus={() => bumpMix("en2cn", 1)} />
          <RatioRow label="✍️ 看中文 → 选英文" color="bg-amber-500" value={mix.cn2en} pct={pct(mix.cn2en)} onMinus={() => bumpMix("cn2en", -1)} onPlus={() => bumpMix("cn2en", 1)} />
          <RatioRow label="🎧 听音 → 选英文" color="bg-emerald-500" value={mix.listen2en} pct={pct(mix.listen2en)} onMinus={() => bumpMix("listen2en", -1)} onPlus={() => bumpMix("listen2en", 1)} />
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          每轮 {size} 题，按上述比例随机抽取并打乱顺序
        </div>
      </div>
    </section>
  );
}

function RatioRow({
  label, color, value, pct, onMinus, onPlus,
}: {
  label: string; color: string; value: number; pct: number;
  onMinus: () => void; onPlus: () => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold">{label}</span>
        <div className="flex items-center gap-1.5">
          <button onClick={onMinus} className="grid size-6 place-items-center rounded-full border-2 border-border bg-card font-bold hover:border-violet-400">−</button>
          <span className="w-10 text-center font-extrabold">{value} <span className="text-[10px] text-muted-foreground">({pct}%)</span></span>
          <button onClick={onPlus} className="grid size-6 place-items-center rounded-full border-2 border-border bg-card font-bold hover:border-violet-400">+</button>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-card">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}