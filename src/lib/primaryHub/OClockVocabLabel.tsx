/** Tight o'clock label (no visual gap after apostrophe on Windows). */
export function OClockVocabLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`whitespace-nowrap ${className}`}
      style={{ fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif" }}
    >
      o<span className="inline-block" style={{ marginInline: "-0.06em" }}>
        '
      </span>
      clock
    </span>
  );
}
