import brandMark from "@/assets/brand-mark.png";

/**
 * 阅读水印：Big Moon English 品牌水印，斜向铺满。
 * 不拦截点击（pointer-events:none），叠在正文之上。
 */
export default function ReadingWatermark({ text: _text }: { text?: string }) {
  const cell = `repeating-linear-gradient(45deg, transparent 0 120px, rgba(120,120,120,0.10) 120px 121px)`;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 5 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: cell,
          color: "transparent",
        }}
      />
      <div
        className="absolute inset-0 flex flex-wrap content-start gap-x-20 gap-y-16 p-6 -rotate-12 origin-top-left text-[13px] font-extrabold text-foreground/15 whitespace-nowrap"
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <img src={brandMark} alt="" className="h-4 w-4 opacity-60" />
            Big Moon English
          </span>
        ))}
      </div>
    </div>
  );
}