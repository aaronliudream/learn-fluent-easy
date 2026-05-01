/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="zh-CN" dir="ltr">
    <Head />
    <Preview>你的验证码</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Big Moon English</Text>
        <Heading style={h1}>身份验证码 🔑</Heading>
        <Text style={text}>请使用以下验证码确认你的身份：</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          该验证码将在短时间内失效。如果你并未发起此请求，可以放心忽略此邮件。
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '13px', fontWeight: 'bold' as const, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 16px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1530', margin: '0 0 20px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55527a', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#7c3aed', letterSpacing: '0.15em', backgroundColor: '#f5f3ff', padding: '16px 24px', borderRadius: '12px', display: 'inline-block', margin: '0 0 30px' }
const footer = { fontSize: '12px', color: '#9b98b3', margin: '32px 0 0', borderTop: '1px solid #ece9f5', paddingTop: '20px' }
