import { T } from "@/i18n/T";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BackLink from "@/components/BackLink";
import { writePrimaryGradeToStorage } from "@/lib/primaryGrade";
import type { PrimaryHubGrade } from "@/lib/primaryHub/types";
import "@/lib/primaryHub/styles";

const GRADES: Array<{
  id: PrimaryHubGrade;
  name_cn: string;
  emoji: string;
  gradient: string;
}> = [
  { id: 3, name_cn: "三年级", emoji: "🦊", gradient: "from-rose-300 via-fuchsia-300 to-violet-300" },
  { id: 4, name_cn: "四年级", emoji: "🐼", gradient: "from-violet-300 via-indigo-300 to-blue-300" },
  { id: 5, name_cn: "五年级", emoji: "🦁", gradient: "from-blue-300 via-sky-300 to-cyan-300" },
  { id: 6, name_cn: "六年级", emoji: "🦉", gradient: "from-cyan-300 via-teal-300 to-emerald-300" },
];

export default function Primary() {
  const nav = useNavigate();

  useEffect(() => {
    document.title = "小学英语 G3-G6 · 人教版 PEP | FluentPath";
  }, []);

  function enterGrade(id: PrimaryHubGrade) {
    writePrimaryGradeToStorage(id);
    nav(`/primary/hub/${id}`);
  }

  return (
    <main className="primary-hub-root mx-auto min-h-screen max-w-lg px-5 py-6">
      <BackLink to="/#courses" className="mb-4 inline-flex items-center gap-1 text-sm text-[#888780] hover:text-[#2C2C2A]">
        <ArrowLeft className="size-4" /> <T>返回学习阶段</T>
      </BackLink>

      <div className="rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#FFB627] p-6 text-center text-white shadow-sm">
        <div className="text-5xl">📚</div>
        <h1 className="mt-2 text-xl font-extrabold">小学英语学习中心</h1>
        <p className="mt-1 text-sm opacity-90">人教版 PEP · 三年级起点 · 上下册同步</p>
      </div>

      <p className="mt-5 px-1 text-sm font-semibold text-[#2C2C2A]">选择年级进入学习</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {GRADES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => enterGrade(g.id)}
            className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient} p-4 text-left shadow-sm transition hover:-translate-y-0.5`}
          >
            <div className="text-4xl">{g.emoji}</div>
            <div className="absolute inset-x-4 bottom-4">
              <div className="text-lg font-extrabold text-white drop-shadow">{g.name_cn}</div>
              <div className="text-[11px] font-bold text-white/90">上册 · 下册</div>
            </div>
            {g.id === 4 && (
              <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-extrabold text-[#FF6B35]">
                内容最多
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-[#888780]">
        旧版 Spark 冒险等内容仍可从
        <Link to="/primary/adventure/4" className="mx-1 text-[#FF6B35] font-semibold">
          这里
        </Link>
        访问（过渡期）
      </p>
    </main>
  );
}
