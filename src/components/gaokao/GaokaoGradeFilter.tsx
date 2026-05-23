import { cn } from "@/lib/utils";

export type GaokaoGradeKey = "all" | "g1" | "g2" | "g3";

const GRADES: { id: GaokaoGradeKey; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "g1", label: "高一" },
  { id: "g2", label: "高二" },
  { id: "g3", label: "高三" },
];

type Props = {
  value: GaokaoGradeKey;
  onChange: (grade: GaokaoGradeKey) => void;
  className?: string;
};

export function GaokaoGradeFilter({ value, onChange, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground font-['Noto_Serif_SC',serif]">年级筛选</span>
      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        {GRADES.map((grade, index) => (
          <button
            key={grade.id}
            type="button"
            onClick={() => onChange(grade.id)}
            className={cn(
              "px-5 py-2 text-sm transition-colors font-['Noto_Serif_SC',serif]",
              "focus:outline-none focus:relative focus:z-10 focus:ring-2 focus:ring-ring",
              index !== GRADES.length - 1 && "border-r border-border",
              value === grade.id
                ? "bg-foreground font-medium text-background"
                : "bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {grade.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 高一/高二/高三 → URL 参数 grade=1|2|3，路径 /gaokao/g/1|2|3 */
export function gaokaoGradeParams(key: GaokaoGradeKey): {
  yearBand: number | null;
  pathGrade: string | null;
  query: string;
} {
  if (key === "g1") return { yearBand: 1, pathGrade: "1", query: "?grade=1" };
  if (key === "g2") return { yearBand: 2, pathGrade: "2", query: "?grade=2" };
  if (key === "g3") return { yearBand: 3, pathGrade: "3", query: "?grade=3" };
  return { yearBand: null, pathGrade: null, query: "" };
}

export const GAOKAO_GRADE_LABELS: Record<GaokaoGradeKey, string> = {
  all: "全部年级",
  g1: "高一",
  g2: "高二",
  g3: "高三",
};
