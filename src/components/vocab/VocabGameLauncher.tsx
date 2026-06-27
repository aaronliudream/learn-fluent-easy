import { Brain, Sparkles, Music, Keyboard, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

export type VocabGameMode = "classic" | "bento" | "match" | "dict" | "context";

/**
 * 词汇「辅助训练」5 游戏启动卡 + 复习说明卡 —— 初中(JuniorVocab)与高中(GaokaoVocabBoard)共用,
 * 配色/文案/顺序 1:1。配色:绿智能选义[推荐] / 红便当 / 蓝翻牌 / 紫听写 / 橙情景。
 * onPick(mode) 由各自调用方接到自己的模式路由(初中 setParams、高中 setMode)。
 */
export default function VocabGameLauncher({ onPick }: { onPick: (m: VocabGameMode) => void }) {
  const { lang } = useI18n();
  const zh = lang === "zh" || lang === "zh-TW";
  const games: { mode: VocabGameMode; icon: typeof Brain; title: string; desc: string; gradient: string; badge?: string }[] = [
    { mode: "classic", icon: Brain, title: zh ? "智能选义" : "Smart meanings", desc: zh ? "听音辨义 · 自动接入复习曲线" : "Listen, choose meaning · feeds the review curve", gradient: "from-emerald-500 to-teal-500", badge: zh ? "推荐" : "Recommended" },
    { mode: "bento", icon: Sparkles, title: zh ? "单词便当" : "Word Bento", desc: zh ? "6×4 翻牌速配 · 训练反应力" : "6×4 fast matching · reaction training", gradient: "from-rose-500 to-orange-500" },
    { mode: "match", icon: Music, title: zh ? "记忆翻牌" : "Memory Match", desc: zh ? "图音中英匹配 · 经典训练法" : "Match words and meanings · classic drill", gradient: "from-sky-500 to-blue-500" },
    { mode: "dict", icon: Keyboard, title: zh ? "听写挑战" : "Dictation", desc: zh ? "听音拼词 · 锁定拼写细节" : "Hear it, spell it · lock in spelling", gradient: "from-violet-500 to-indigo-500" },
    { mode: "context", icon: BookOpen, title: zh ? "单词情景闯关" : "Context Quiz", desc: zh ? "读句子选最合适的词 · 语境运用" : "Read the sentence, pick the best word", gradient: "from-amber-500 to-orange-500" },
  ];
  return (
    <>
      <div className="mb-3 mt-2 flex items-end justify-between">
        <h2 className="text-base font-extrabold">{zh ? "辅助训练" : "Practice games"}</h2>
        <span className="text-[11px] text-muted-foreground">{zh ? "5 种游戏 · 全部接入复习曲线" : "5 games · all connected to the review curve"}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.mode}
              onClick={() => onPick(g.mode)}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5",
                g.gradient,
              )}>
              <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-5" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold">{g.title}</span>
                  {g.badge && <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">{g.badge}</span>}
                </div>
                <div className="mt-0.5 text-xs opacity-90">{g.desc}</div>
              </div>
            </button>);
        })}
      </div>

      <div className="mb-6 mt-3 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BarChart3 className="size-4 text-primary" /> {zh ? "全部游戏数据自动接入智能复习" : "Game results feed smart review automatically"}
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>{zh ? "答对：金币 +2，宠物经验自动累计" : "Correct answers: +2 coins and pet XP"}</li>
          <li>{zh ? "答错：自动进错题本，下次优先复习" : "Wrong answers: added to review priority"}</li>
          <li>{zh ? "每天通过任意 3 个游戏即可深度记住一组单词" : "Finish any 3 games to lock in one group each day"}</li>
        </ul>
      </div>
    </>
  );
}
