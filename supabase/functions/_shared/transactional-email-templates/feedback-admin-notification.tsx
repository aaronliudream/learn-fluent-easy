/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  category?: string
  rating?: number
  message?: string
  email?: string
  page_url?: string
  user_id?: string
}

const CAT_LABEL: Record<string, string> = {
  bug: '🐛 Bug',
  suggestion: '💡 Suggestion',
  praise: '🌟 Praise',
  other: '📝 Other',
}

const FeedbackAdminEmail = ({ category = 'other', rating = 0, message = '', email = '', page_url = '', user_id = '' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {CAT_LABEL[category] || category} feedback</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📨 New feedback</Heading>
        <Section style={meta}>
          <Text style={metaLine}><b>Category:</b> {CAT_LABEL[category] || category}</Text>
          {rating ? <Text style={metaLine}><b>Rating:</b> {'⭐'.repeat(rating)} ({rating}/5)</Text> : null}
          <Text style={metaLine}><b>From:</b> {email || (user_id ? `user ${user_id}` : 'anonymous')}</Text>
          {page_url ? <Text style={metaLine}><b>Page:</b> {page_url}</Text> : null}
        </Section>
        <Section style={msgBox}>
          <Text style={msgText}>{message}</Text>
        </Section>
        <Text style={footer}>Big Moon English · Feedback notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FeedbackAdminEmail,
  subject: (data: Record<string, any>) => {
    const cat = CAT_LABEL[data?.category] || 'Feedback'
    return `[Big Moon] ${cat} — new feedback`
  },
  displayName: 'Feedback → Admin notification',
  previewData: { category: 'suggestion', rating: 4, message: 'Love the placement test! Would be cool to have IELTS-style writing too.', email: 'student@example.com', page_url: 'https://bigmoonenglish.com/' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '600px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0f172a', margin: '0 0 16px' }
const meta = { padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }
const metaLine = { fontSize: '13px', color: '#334155', margin: '4px 0' }
const msgBox = { padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }
const msgText = { fontSize: '14px', color: '#1f2937', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' as const }
const footer = { fontSize: '11px', color: '#94a3b8', marginTop: '24px', textAlign: 'center' as const }