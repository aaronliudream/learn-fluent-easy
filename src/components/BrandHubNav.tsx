import { Link, NavLink } from "react-router-dom";
import { BrandLockup } from "@/components/brand/BrandLogo";

/**
 * Top horizontal nav for the母品牌主页 + 子品牌页面.
 * 顺序与文案严格按用户规格: Home / Kids / Junior / Senior / CET / About Us.
 * 仅渲染导航本身 — 不包裹布局，方便在多个页面复用。
 */
const ITEMS: { to: string; label: string }[] = [
  { to: "/", label: "首页" },
  { to: "/kids", label: "小学" },
  { to: "/junior", label: "初中" },
  { to: "/senior", label: "高中" },
  { to: "/slang", label: "俚语" },
  { to: "/about", label: "关于我们" },
];

export default function BrandHubNav() {
  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
      <Link to="/" aria-label="Big Moon English home">
        <BrandLockup size={28} />
      </Link>
      <ul className="flex flex-wrap items-center gap-1">
        {ITEMS.map((it) => (
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
        ))}
      </ul>
    </nav>
  );
}