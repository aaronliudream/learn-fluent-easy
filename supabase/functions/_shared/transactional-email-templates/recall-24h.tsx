/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Big Moon English'
const SITE_URL = 'https://bigmoonenglish.com'

interface RecallProps {
  name?: string
  lang?: string
}

type Dict = { greeting: string; title: string; body1: string; body2: string; cta: string; signoff: string }

const STRINGS: Record<string, Dict> = {
  zh: {
    greeting: '你好',
    title: '你的学习伙伴在等你 🌙',
    body1: '昨天注册了 Big Moon English，但还没开始第一节课？',
    body2: '只需要 3 分钟测一下你的英语等级，我们会为你定制下一步学习路径。坚持每天 15 分钟，30 天就能看到明显进步。',
    cta: '继续我的学习',
    signoff: '我们相信你可以的 ✨',
  },
  en: {
    greeting: 'Hi',
    title: 'Your learning companion is waiting 🌙',
    body1: "You signed up for Big Moon English yesterday — but haven't taken your first lesson yet.",
    body2: 'Just 3 minutes to take the placement test and we will tailor the next step for you. 15 minutes a day, 30 days, real progress — that is the science.',
    cta: 'Resume my learning',
    signoff: 'We believe in you ✨',
  },
}

const RecallEmail = ({ name, lang = 'en' }: RecallProps) => {
  const s = STRINGS[lang] || STRINGS.en
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{s.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{s.title}</Heading>
          <Text style={text}>{s.greeting}{name ? ` ${name}` : ''},</Text>
          <Text style={text}>{s.body1}</Text>
          <Text style={text}>{s.body2}</Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={`${SITE_URL}/placement`} style={button}>{s.cta}</Button>
          </Section>
          <Text style={footer}>{s.signoff}<br/>— {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: RecallEmail,
  subject: (data: Record<string, any>) =>
    (data?.lang === 'zh' || data?.lang === 'zh-TW')
      ? '你的学习伙伴在等你 🌙'
      : 'Your learning companion is waiting 🌙',
  displayName: '24h recall — sign-up nudge',
  previewData: { name: 'Alex', lang: 'en' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 14px' }
const button = { backgroundColor: '#5B2BC9', color: '#ffffff', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' as const, textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0', textAlign: 'center' as const }