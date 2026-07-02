import { Link, NavLink } from "react-router-dom";
import { BrandLockup } from "@/components/brand/BrandLogo";
import UserAvatarMenu from "@/components/UserAvatarMenu";

/**
 * Top horizontal nav for the母品牌主页 + 子品牌页面.
 * 顺序与文案严格按用户规格: Home / Kids / Junior / Senior / CET / About Us.
 * 仅渲染导航本身 — 不包裹布局，方便在多个页面复用。
 */
const ITEMS: { to: string; label: string; soon?: boolean }[] = [
  { to: "/", label: "首页" },
  { to: "/kids", label: "小学" },
  { to: "/junior", label: "初中" },
  { to: "/senior", label: "高中", soon: true }, // 整理中:不可点
  { to: "/american", label: "美语" },
  { to: "/about", label: "关于我们" },
];

export default function BrandHubNav() {
  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
      <Link to="/" aria-label="Big Moon English home">
        <BrandLockup size={28} />
      </Link>
      <ul className="flex flex-wrap items-center gap-1">
        {ITEMS.map((it) =>
          it.soon ? (
            <li key={it.to}>
              <span
                aria-disabled="true"
                title="整理中"
                className="cursor-not-allowed rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-muted-foreground/50"
              >
                {it.label}
                <span className="ml-1 text-[9px] font-medium opacity-70">整理中</span>
              </span>
            </li>
          ) : (
            <li key={it.to}>
              <NavLink
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.14em] transition ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                {it.label}
              </NavLink>
            </li>
          ),
        )}
      </ul>
      <UserAvatarMenu variant="inline" />
    </nav>
  );
}