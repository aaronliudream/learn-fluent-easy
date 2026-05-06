import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { PRIMARY_CULTURE_CARDS, CULTURE_CATEGORIES, type CultureCard } from "@/data/primaryCultureCards";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function PrimaryCulture() {
  const { grade } = useParams<{ grade: string }>();
  const g = Number(grade ?? "1");
  const [filter, setFilter] = useState<CultureCard["category"] | "all">("all");
  const [openCard, setOpenCard] = useState<CultureCard | null>(null);

  const cards = useMemo(
    () => (filter === "all" ? PRIMARY_CULTURE_CARDS : PRIMARY_CULTURE_CARDS.filter((c) => c.category === filter)),
    [filter]
  );

  const cats = Object.entries(CULTURE_CATEGORIES) as [CultureCard["category"], typeof CULTURE_CATEGORIES[CultureCard["category"]]][];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to={`/primary/grade/${g}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回 {g} 年级
      </BackLink>
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CULTURE · 文化意识</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">🌍 西方文化小课堂</h1>
        <p className="mt-1 text-xs text-muted-foreground">课标核心素养 · 节日 · 礼仪 · 校园 · 生活，30 张卡片轻松了解</p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
            filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
          }`}
        >
          全部 · {PRIMARY_CULTURE_CARDS.length}
        </button>
        {cats.map(([key, cat]) => {
          const count = PRIMARY_CULTURE_CARDS.filter((c) => c.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
                filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {cat.emoji} {cat.label} · {count}
            </button>
          );
        })}
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((c) => {
          const cat = CULTURE_CATEGORIES[c.category];
          return (
            <button
              key={c.id}
              onClick={() => setOpenCard(c)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5`}
            >
              <span className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-white/20 blur-2xl" />
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-2 text-sm font-extrabold leading-tight">{c.title_cn}</div>
              <div className="mt-0.5 text-[11px] font-bold opacity-90">{c.title_en}</div>
              <div className="mt-2 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm">
                {cat.emoji} {cat.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* 卡片详情弹窗 */}
      {openCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpenCard(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${CULTURE_CATEGORIES[openCard.category].color}`} />
            <div className="text-center">
              <div className="mx-auto text-6xl">{openCard.emoji}</div>
              <div className="mt-3 text-xl font-extrabold">{openCard.title_cn}</div>
              <button
                onClick={() => speak(openCard.title_en)}
                className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary hover:bg-primary/20"
              >
                <Volume2 className="size-3.5" /> {openCard.title_en}
              </button>
            </div>
            <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">{openCard.desc_cn}</p>
            <div className="mt-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">关键词 · 点击发音</div>
              <div className="flex flex-wrap gap-1.5">
                {openCard.keywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => speak(kw)}
                    className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-bold transition hover:border-primary hover:bg-primary/5"
                  >
                    <Volume2 className="size-3" /> {kw}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setOpenCard(null)}
              className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground hover:bg-primary/90"
            >
              知道啦 ✨
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
