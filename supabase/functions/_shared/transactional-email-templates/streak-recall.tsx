/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Big Moon English'
const SITE_URL = 'https://bigmoonenglish.com'

interface StreakProps {
  name?: string
  lang?: string
  daysSilent?: number
  bestStreak?: number
}

type Dict = { greet: string; title: string; line1: string; line2: string; cta: string; ps: string }

const STRINGS: Record<string, Dict> = {
  zh: {
    greet: '你好',
    title: '你的连胜在等你回来 🔥',
    line1: '你曾经连续坚持过 {best} 天，最近 {n} 天没来了。',
    line2: '今晚只要 5 分钟，就能重新点亮连胜。学习伙伴还在等你。',
    cta: '继续学习',
    ps: '我们相信你 ✨',
  },
  en: {
    greet: 'Hi',
    title: 'Your streak is waiting for you 🔥',
    line1: "You hit a {best}-day streak before — it has been {n} days since your last lesson.",
    line2: 'Just 5 minutes tonight is enough to relight it. Your companion is still here.',
    cta: 'Resume learning',
    ps: 'We believe in you ✨',
  },
}

const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

const StreakRecall = ({ name, lang = 'zh', daysSilent = 7, bestStreak = 0 }: StreakProps) => {
  const s = STRINGS[lang] || STRINGS.zh
  const vars = { n: daysSilent, best: bestStreak }
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{s.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{s.title}</Heading>
          <Text style={text}>{s.greet}{name ? ` ${name}` : ''},</Text>
          <Text style={text}>{fmt(s.line1, vars)}</Text>
          <Text style={text}>{s.line2}</Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={`${SITE_URL}/`} style={button}>{s.cta}</Button>
          </Section>
          <Text style={footer}>{s.ps}<br/>— {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StreakRecall,
  subject: (data: Record<string, any>) =>
    (data?.lang === 'en')
      ? 'Your streak is waiting for you 🔥'
      : '你的连胜在等你回来 🔥',
  displayName: 'Streak break recall (7d silent)',
  previewData: { name: 'Alex', lang: 'zh', daysSilent: 7, bestStreak: 12 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 14px' }
const button = { backgroundColor: '#FF7A00', color: '#ffffff', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' as const, textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0', textAlign: 'center' as const }
