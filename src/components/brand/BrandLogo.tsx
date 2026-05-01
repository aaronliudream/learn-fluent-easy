/**
 * Big Moon English brand mark — vector version.
 *
 * Uses CSS variables (--brand-violet / --brand-magenta / --brand-coral)
 * defined in src/index.css so the logo always tracks the global VI tokens.
 * Scales crisply at any size; ideal for in-app UI (header, splash, empty
 * states, share cards). For favicon / app store / OG, use the PNG export
 * in src/assets/brand-mark.png + public/favicon.png.
 */
type Props = {
  size?: number;
  className?: string;
  /** Hide the heart for the most compact mark (e.g. tiny avatar). */
  bare?: boolean;
  ariaLabel?: string;
};

export function BrandLogo({ size = 32, className, bare = false, ariaLabel = "Big Moon English" }: Props) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      data-i18n-skip
    >
      <defs>
        <linearGradient id="bme-moon" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(var(--brand-violet))" />
          <stop offset="55%" stopColor="hsl(var(--brand-magenta))" />
          <stop offset="100%" stopColor="hsl(var(--brand-coral))" />
        </linearGradient>
        <radialGradient id="bme-glow" cx="50%" cy="55%" r="42%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </radialGradient>
      </defs>
      {/* Moon disc */}
      <circle cx="32" cy="32" r="30" fill="url(#bme-moon)" />
      {!bare && (
        <>
          {/* Soft inner glow behind the heart */}
          <circle cx="32" cy="34" r="20" fill="url(#bme-glow)" />
          {/* Heart — slightly off-center for warmth */}
          <path
            d="M32 44 C 22 36, 18 31, 22 26 C 25 22, 30 23, 32 27 C 34 23, 39 22, 42 26 C 46 31, 42 36, 32 44 Z"
            fill="#FFFFFF"
          />
        </>
      )}
    </svg>
  );
}

/**
 * Horizontal lockup: brand mark + wordmark.
 * Defaults to a stacked editorial feel using Fraunces (already loaded).
 */
export function BrandLockup({
  size = 36,
  className,
  showSlogan = false,
  slogan,
}: {
  size?: number;
  className?: string;
  showSlogan?: boolean;
  slogan?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className ?? ""}`} data-i18n-skip>
      <BrandLogo size={size} />
      <div className="flex flex-col leading-none">
        <span
          className="font-serif font-extrabold tracking-tight text-foreground"
          style={{ fontSize: size * 0.6, lineHeight: 1 }}
        >
          Big Moon <span className="bg-grad-brand-text bg-clip-text text-transparent">English</span>
        </span>
        {showSlogan && slogan && (
          <span
            className="mt-1 font-serif italic text-muted-foreground"
            style={{ fontSize: size * 0.32 }}
          >
            {slogan}
          </span>
        )}
      </div>
    </div>
  );
}
