import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { getOnlineCount, pingPresence } from "@/lib/social";

/** 浮动展示在线学员人数 + 学习动态滚动 */
export default function OnlineWidget({ grade, page }: { grade?: string; page?: string }) {
  // 早期阶段隐藏在线人数 / 社交证明，等 DAU 上来后再开
  void grade; void page;
  return null;
}

function _Unused() {
  return (
    <>
      <span />
      <Users className="h-3.5 w-3.5" />
      <span>0 位同学在学习</span>
    </>
  );

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