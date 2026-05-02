import { ImgHTMLAttributes } from "react";

/**
 * LazyImage — a drop-in <img> with sensible defaults for performance:
 *  - native lazy loading (loading="lazy")
 *  - async decoding (decoding="async")
 *  - explicit width/height to prevent layout shift (CLS)
 *
 * For above-the-fold hero images, pass `priority` to opt out of lazy loading.
 *
 * Usage:
 *   <LazyImage src="/cover.jpg" alt="Lesson cover" width={400} height={240} />
 *   <LazyImage src="/hero.jpg" alt="Hero" priority width={1200} height={630} />
 */
interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
}

export const LazyImage = ({ priority, alt, ...rest }: LazyImageProps) => (
  <img
    {...rest}
    alt={alt ?? ""}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
    fetchPriority={priority ? "high" : "auto"}
  />
);