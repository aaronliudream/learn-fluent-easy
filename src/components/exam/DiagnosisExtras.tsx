import { ReactNode } from "react";
import { CheckCircle2, XCircle, Sparkles, Clock, BookmarkPlus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ③ 诊断阶段的三个新增模块：
 *   - DiagnosisTable      考点掌握诊断表
 *   - MistakeBookCallout  错题已加入错题本提示卡 + 「和 AI 详谈这道题」按钮
 *   - NextStepCards       为你推荐的下一步（3 卡）
 */

/* ============ 1. 考点掌握表 ============ */

export type DiagnosisRow = {
  index: number;
  /** 原子考点（中文，例如「主旨大意」「细节定位」「推断」） */
  point: string;
  isCorrect: boolean;
  /** 陷阱类型（仅错题需要），可空 */
  trap?: string | null;
  /** 该考点累计掌握度 0-100，可空（未练过） */
  cumulativeMastery?: number | null;
};

const TRAP_BY_TYPE: Record<string, string> = {
  main_idea: "过度归纳 / 范围错配",
  detail: "字面理解偏差",
  inference: "推理过度",
  vocabulary: "脱离语境猜词",
  attitude: "情感色彩误判",
  purpose: "目的与结果混淆",
  data_interp: "数据-结论错配",
  viewpoint: "立场归属错位",
  reading: "证据不足",
};

/** 根据题型 key 给出常见陷阱（仅错题展示） */
export function inferTrap(questionTypeKey?: string | null) {
  if (!questionTypeKey) return null;
  return TRAP_BY_TYPE[questionTypeKey] ?? "证据不足";
}

export function DiagnosisTable({
  rows,
  subtitle,
}: {
  rows: DiagnosisRow[];
  subtitle?: string;
}) {
  return (
    <div className="exam-card p-5 sm:p-6">
      <div className="mb-3">
        <h2 className="exam-display text-[17px] mb-0.5">考点掌握诊断</h2>
        <p className="exam-mute text-[12.5px] exam-body-italic">
          {subtitle ?? `这一篇练到的 ${rows.length} 个原子考点的当前掌握度`}
        </p>
      </div>
      <div className="rounded-xl border exam-divider overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[11px] exam-eyebrow border-b exam-divider bg-[hsl(var(--exam-paper-soft))]">
          <div className="col-span-1">题号</div>
          <div className="col-span-3">原子考点</div>
          <div className="col-span-2">结果</div>
          <div className="col-span-3">陷阱类型</div>
          <div className="col-span-3">该考点累计掌握度</div>
        </div>
        {rows.map((r) => {
          const m = r.cumulativeMastery;
          const masteryColor =
            m == null
              ? "hsl(var(--exam-rule))"
              : m >= 80
                ? "hsl(var(--exam-green))"
                : m >= 50
                  ? "hsl(var(--exam-gold))"
                  : "hsl(var(--exam-accent))";
          return (
            <div
              key={r.index}
              className="grid grid-cols-12 gap-2 items-center px-4 py-3 text-[13.5px] border-b exam-divider last:border-b-0"
            >
              <div className="col-span-1 exam-display tabular-nums">
                {String(r.index).padStart(2, "0")}
              </div>
              <div className="col-span-3">{r.point}</div>
              <div className="col-span-2">
                {r.isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-[hsl(var(--exam-green))]">
                    <CheckCircle2 className="size-3.5" />
                    答对
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[hsl(var(--exam-accent))]">
                    <XCircle className="size-3.5" />
                    答错
                  </span>
                )}
              </div>
              <div className="col-span-3 exam-body-italic">
                {r.isCorrect ? (
                  <span className="exam-mute">—</span>
                ) : (
                  <span className="text-[hsl(var(--exam-accent))]">{r.trap ?? "—"}</span>
                )}
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: "hsl(var(--exam-rule))" }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${m ?? 0}%`,
                      background: masteryColor,
                    }}
                  />
                </div>
                <span
                  className="text-[11.5px] tabular-nums w-10 text-right"
                  style={{ color: masteryColor }}
                >
                  {m == null ? "新" : `${m}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ 2. 错题本提示卡 ============ */

export function MistakeBookCallout({
  mistakeCount,
  onAskAI,
}: {
  mistakeCount: number;
  onAskAI: () => void;
}) {
  if (mistakeCount === 0) {
    return (
      <div
        className="exam-card p-5 flex items-center justify-between gap-3 flex-wrap"
        style={{
          background: "hsl(var(--exam-green-soft))",
          borderColor: "hsl(var(--exam-green) / 0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2
            className="size-5"
            style={{ color: "hsl(var(--exam-green))" }}
          />
          <div>
            <div className="exam-display text-[15px]">全对！本次没有错题入库</div>
            <div className="exam-mute text-[12.5px] exam-body-italic">
              想跟译老师聊一下文章主旨或长难句吗？
            </div>
          </div>
        </div>
        <button onClick={onAskAI} className="exam-btn exam-btn-ghost !text-[13px]">
          和 AI 聊聊这篇文章
        </button>
      </div>
    );
  }

  return (
    <div
      className="exam-card p-5 flex items-center justify-between gap-3 flex-wrap"
      style={{
        background: "hsl(var(--exam-gold-soft))",
        borderColor: "hsl(var(--exam-gold) / 0.4)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <BookmarkPlus
          className="size-5 shrink-0"
          style={{ color: "hsl(var(--exam-gold))" }}
        />
        <div className="min-w-0">
          <div className="exam-display text-[15px]">
            这 {mistakeCount} 道错题已加入
            <span className="text-[hsl(var(--exam-accent))] mx-1">错题本</span>
          </div>
          <div className="exam-mute text-[12.5px] exam-body-italic">
            将在 1 天、3 天、7 天、14 天后自动安排你复习——直到连续两次正确为止。
          </div>
        </div>
      </div>
      <button onClick={onAskAI} className="exam-btn exam-btn-primary !text-[13px]">
        和 AI 详谈这道题 →
      </button>
    </div>
  );
}

/* ============ 3. 推荐下一步 3 卡 ============ */

export type NextStepCard = {
  tag: string;
  title: string;
  desc: string;
  meta: string; // 例如 "约 12 分钟 · 难度递进"
  onClick?: () => void;
};

export function NextStepCards({
  cards,
  heading = "为你推荐的下一步",
  subhead,
}: {
  cards: NextStepCard[];
  heading?: string;
  subhead?: string;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="exam-display text-[17px] mb-0.5">{heading}</h2>
        <p className="exam-mute text-[12.5px] exam-body-italic">
          {subhead ?? `基于你这次的表现，AI 已为你生成 ${cards.length} 条路径`}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={c.onClick}
            className="exam-card p-5 text-left transition hover:translate-y-[-1px] hover:shadow-md"
          >
            <div className="exam-eyebrow mb-2 text-[hsl(var(--exam-accent))]">{c.tag}</div>
            <div className="exam-display text-[16px] mb-2 leading-snug">{c.title}</div>
            <div className="exam-mute text-[13px] leading-relaxed border-b exam-divider pb-3 mb-3">
              {c.desc}
            </div>
            <div className="exam-mute text-[12px] flex items-center gap-1">
              <Clock className="size-3.5" />
              {c.meta}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Util ============ */

export function buildNextStepsFromResult({
  weakestPointCn,
  weakestPointKey,
  topicLabel,
  onWeakClick,
  onMockClick,
  onMicroLessonClick,
}: {
  weakestPointCn: string;
  weakestPointKey: string;
  topicLabel?: string | null;
  onWeakClick?: () => void;
  onMockClick?: () => void;
  onMicroLessonClick?: () => void;
}): NextStepCard[] {
  return [
    {
      tag: "薄弱点强化",
      title: `${weakestPointCn} · 专项 5 题`,
      desc: `用同一种考点模板再考你 5 次。打通这个考点至 90% 掌握度。`,
      meta: "约 12 分钟 · 难度递进",
      onClick: onWeakClick,
    },
    {
      tag: "真题对照",
      title: `相似话题真题 · ${topicLabel ?? "高频考点"}`,
      desc: `同样话题或题型组合。看看能否把今天学到的迁移过去。`,
      meta: "约 10 分钟 · 真题原题",
      onClick: onMockClick,
    },
    {
      tag: "微课补漏",
      title: `5 分钟微课 · "${weakestPointCn}"陷阱`,
      desc: `这是你今天踩的陷阱。学一节微课，配 3 道辨别练习。`,
      meta: "5 分钟课 + 3 题",
      onClick: onMicroLessonClick,
    },
  ];
}

export default DiagnosisTable;

// Allow importing default with extra named exports plus a small icon helper.
export const _ExtrasHelpers: ReactNode = null;