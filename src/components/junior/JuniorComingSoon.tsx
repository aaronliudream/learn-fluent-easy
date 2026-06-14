import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { T } from "@/i18n/T";

/** 初二/初三整理中占位(非管理员访问受限年级时显示)。 */
export default function JuniorComingSoon({ gradeLabel }: { gradeLabel?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-[#F0EDE6] text-3xl">
        <Construction className="size-8 text-[#b8893b]" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-[#1c2433]">
        {gradeLabel ? `${gradeLabel} · ` : ""}<T>内容整理中</T>
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#46506a]">
        <T>本年级内容正在精心打磨中,敬请期待 ✨ 先去初一继续学习吧。</T>
      </p>
      <Link
        to="/junior"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#1c2433] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <T>返回初中专区</T>
      </Link>
    </div>
  );
}
