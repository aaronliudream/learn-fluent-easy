import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { getOnlineCount, pingPresence } from "@/lib/social";

/** 浮动展示在线学员人数 + 学习动态滚动 */
export default function OnlineWidget({ grade, page }: { grade?: string; page?: string }) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      await pingPresence(grade, page);
      const n = await getOnlineCount();
      if (!cancelled) setCount(n);
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [grade, page]);

  return (
    <Link
      to="/social"
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
      title="点击进入同学社区"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Users className="h-3.5 w-3.5" />
      <span>{count} 位同学在学习</span>
    </Link>
  );
}