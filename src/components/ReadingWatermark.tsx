/**
 * 阅读水印：把用户邮箱+时间斜向铺满，截屏可溯源。
 * 不拦截点击（pointer-events:none），叠在正文之上。
 */
export default function ReadingWatermark({ text }: { text: string }) {
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
        className="absolute inset-0 flex flex-wrap content-start gap-x-16 gap-y-12 p-6 -rotate-12 origin-top-left text-[11px] font-bold text-foreground/15 whitespace-nowrap"
      >
        {Array.from({ length: 80 }).map((_, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}