import { Link } from "react-router-dom";
import { ChevronRight, Rocket, BookOpen, Repeat, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { JUNIOR_LEVEL_META } from "@/lib/juniorGrammarFsrs";
import { T } from "@/i18n/T";

export type GrammarMapDrawerPoint = {
  id: string;
  title: string;
  cefr: string;
  summary: string;
  grade: number;
  categoryName?: string;
  categoryEmoji?: string;
  level: number;
  isDue?: boolean;
  hasRichContent?: boolean;
};

type Props = {
  point: GrammarMapDrawerPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GrammarMapDrawer({ point, open, onOpenChange }: Props) {
  if (!point) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md" />
      </Sheet>
    );
  }

  const meta = JUNIOR_LEVEL_META[point.level] ?? JUNIOR_LEVEL_META[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            {point.categoryEmoji && <span>{point.categoryEmoji}</span>}
            <span>{point.categoryName ?? "—"}</span>
            <span>·</span>
            <span>CEFR {point.cefr}</span>
            <span>·</span>
            <span>
              初{point.grade >= 7 ? point.grade - 6 : point.grade}
            </span>
          </div>
          <SheetTitle className="text-xl">{point.title}</SheetTitle>
          <SheetDescription className="text-sm">
            {point.summary || <T>暂无介绍</T>}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          {/* State pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold ${meta.color}`}>
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </span>
            {point.isDue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-600">
                <Repeat className="size-3" />
                <T>今日待复习</T>
              </span>
            )}
            {point.hasRichContent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600">
                <Sparkles className="size-3" />
                <T>升级版</T>
              </span>
            )}
          </div>

          {/* Mastery loop card */}
          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <T>教学循环</T>
            </div>
            <ol className="space-y-1.5 text-xs text-foreground/80">
              <li>
                📥 <T>输入：动画讲解 + 例句精读</T>
              </li>
              <li>
                🎮 <T>练习：游戏化测验 × 多题型</T>
              </li>
              <li>
                🔁 <T>间隔复习：1d / 3d / 7d / 21d（FSRS）</T>
              </li>
              <li>
                ✅ <T>多题型正确率 ≥ 85%，进入"掌握"</T>
              </li>
            </ol>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-2">
            <Button asChild className="w-full">
              <Link to={`/junior/grammar/${point.id}`}>
                <BookOpen className="mr-1 size-4" />
                <T>学习</T>
                <ChevronRight className="ml-0.5 size-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="default"
              className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90"
            >
              <Link to={`/junior/grammar-lab/${point.id}`}>
                <Rocket className="mr-1 size-4" />
                <T>全攻克 Lab</T>
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
