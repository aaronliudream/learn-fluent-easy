import React from "react";

/**
 * Strip simple HTML tags so the text can be safely sent to TTS or shown as plain text.
 * Handles common artifacts from scraped sources: <b>, </b>, <i>, </i>, <em>, <strong>, etc.
 */
export function stripTags(input: string): string {
  if (!input) return "";
  return input
    .replace(/<\/?(?:b|i|em|strong|u|span|small|mark)\b[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Render text that may contain <b>...</b> (and similar inline emphasis tags) as
 * proper React nodes — never as raw escaped characters. Unknown tags are stripped.
 */
export function renderRich(input: string): React.ReactNode {
  if (!input) return null;
  // Normalize entities first
  const text = input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Split on supported emphasis tags, keeping the delimiters
  const parts = text.split(/(<\/?(?:b|strong|i|em|u|mark)>)/gi);
  const out: React.ReactNode[] = [];
  const stack: string[] = [];
  let key = 0;

  const wrap = (children: React.ReactNode, tag: string) => {
    const t = tag.toLowerCase();
    if (t === "b" || t === "strong") return <strong key={key++}>{children}</strong>;
    if (t === "i" || t === "em") return <em key={key++}>{children}</em>;
    if (t === "u") return <u key={key++}>{children}</u>;
    if (t === "mark") return <mark key={key++}>{children}</mark>;
    return <span key={key++}>{children}</span>;
  };

  // Simple linear pass: turn <b>X</b> into <strong>X</strong>
  let buffer: React.ReactNode[] = [];
  const stackBuffers: React.ReactNode[][] = [];
  for (const part of parts) {
    const open = part.match(/^<([a-z]+)>$/i);
    const close = part.match(/^<\/([a-z]+)>$/i);
    if (open) {
      stack.push(open[1]);
      stackBuffers.push(buffer);
      buffer = [];
    } else if (close && stack.length && stack[stack.length - 1].toLowerCase() === close[1].toLowerCase()) {
      const tag = stack.pop()!;
      const inner = buffer;
      buffer = stackBuffers.pop()!;
      buffer.push(wrap(inner, tag));
    } else if (part) {
      buffer.push(part);
    }
  }
  // Any unclosed tags: flatten remaining buffers as-is
  while (stackBuffers.length) {
    const prev = stackBuffers.pop()!;
    prev.push(...buffer);
    buffer = prev;
  }
  out.push(...buffer);
  return out;
}