import { T } from "@/i18n/T";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BackLink from "@/components/BackLink";
import { writePrimaryGradeToStorage } from "@/lib/primaryGrade";
import type { PrimaryHubGrade } from "@/lib/primaryHub/types";
import { cn } from "@/lib/utils";
import "@/lib/primaryHub/styles";

const GRADES: Array<{
  id: PrimaryHubGrade;
  name_cn: string;
  image: string;
  imageAlt: string;
  overlay: string;
}> = [
  {
    id: 3,
    name_cn: "三年级",
    image: "/images/primary/grade3-fox.jpg",
    imageAlt: "可爱的红狐狸",
    overlay: "from-rose-950/90 via-fuchsia-900/50 to-black/20",
  },
  {
    id: 4,
    name_cn: "四年级",
    image: "/images/primary/grade4-panda.jpg",
    imageAlt: "可爱的大熊猫",
    overlay: "from-indigo-950/90 via-violet-900/50 to-black/20",
  },
  {
    id: 5,
    name_cn: "五年级",
    image: "/images/primary/grade5-lion.jpg",
    imageAlt: "可爱的幼狮",
    overlay: "from-sky-950/90 via-blue-900/50 to-black/20",
  },
  {
    id: 6,
    name_cn: "六年级",
    image: "/images/primary/grade6-owl.jpg",
    imageAlt: "可爱的猫头鹰",
    overlay: "from-emerald-950/90 via-teal-900/50 to-black/20",
  },
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
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-sm",
              "transition hover:-translate-y-0.5 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/60 focus:ring-offset-2",
            )}
          >
            <img
              src={g.image}
              alt={g.imageAlt}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className={cn("absolute inset-0 bg-gradient-to-t", g.overlay)} />
            <div className="relative z-10 flex h-full flex-col justify-end p-4">
              <div className="text-lg font-extrabold text-white drop-shadow-md">{g.name_cn}</div>
              <div className="text-[11px] font-bold text-white/90">上册 · 下册</div>
            </div>
          </button>
        ))}
      </div>

    </main>
  );
}
