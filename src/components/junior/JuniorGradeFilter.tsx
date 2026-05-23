import { cn } from "@/lib/utils";

export type JuniorGradeKey = "all" | "g7" | "g8" | "g9";

const GRADES: { id: JuniorGradeKey; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "g7", label: "初一" },
  { id: "g8", label: "初二" },
  { id: "g9", label: "初三" },
];

type Props = {
  value: JuniorGradeKey;
  onChange: (grade: JuniorGradeKey) => void;
  className?: string;
};

export function JuniorGradeFilter({ value, onChange, className }: Props) {
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

/** Map filter key → DB grade (7/8/9) and URL path segment (1/2/3). */
export function juniorGradeParams(key: JuniorGradeKey): {
  dbGrade: number | null;
  pathGrade: string | null;
  query: string;
} {
  if (key === "g7") return { dbGrade: 7, pathGrade: "1", query: "?grade=7" };
  if (key === "g8") return { dbGrade: 8, pathGrade: "2", query: "?grade=8" };
  if (key === "g9") return { dbGrade: 9, pathGrade: "3", query: "?grade=9" };
  return { dbGrade: null, pathGrade: null, query: "" };
}

export const GRADE_LABELS: Record<JuniorGradeKey, string> = {
  all: "全部年级",
  g7: "初一",
  g8: "初二",
  g9: "初三",
};
