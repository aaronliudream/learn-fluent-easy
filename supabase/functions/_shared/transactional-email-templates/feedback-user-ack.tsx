/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { category?: string }

const FeedbackAckEmail = ({ category = 'other' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your feedback — thank you 🙏</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>谢谢你的反馈 🙏</Heading>
        <Text style={text}>你好，</Text>
        <Text style={text}>我们已经收到你给 Big Moon English 的反馈，会在 24–48 小时内查看并尽量回复。</Text>
        <Text style={text}>每一条意见都帮助我们把这个产品做得更好。如果你的反馈是 Bug，工程师会优先处理。</Text>
        <Text style={textEn}>(English) We have received your feedback and will get back to you within 24–48 hours. Thank you for helping us improve.</Text>
        <Text style={footer}>— The Big Moon English team 🌙</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FeedbackAckEmail,
  subject: '我们收到了你的反馈 🙏 / We received your feedback',
  displayName: 'Feedback → User acknowledgement',
  previewData: { category: 'suggestion' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px' }
const textEn = { fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: '20px 0 0', fontStyle: 'italic' as const }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0', textAlign: 'center' as const }