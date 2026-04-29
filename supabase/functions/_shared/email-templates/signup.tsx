/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="zh-CN" dir="ltr">
    <Head />
    <Preview>验证你的邮箱，开始 {siteName} 学习之旅</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{siteName}</Text>
        <Heading style={h1}>欢迎加入！请验证你的邮箱 ✨</Heading>
        <Text style={text}>
          感谢你注册{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          。我们很高兴能陪你一起学习英语！
        </Text>
        <Text style={text}>
          请点击下方按钮验证你的邮箱地址（
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>
          ），即可同步你的学习进度：
        </Text>
        <Button style={button} href={confirmationUrl}>
          验证邮箱
        </Button>
        <Text style={footer}>
          如果你并未注册账号，请忽略此邮件。
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '13px', fontWeight: 'bold' as const, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 16px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1530', margin: '0 0 20px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55527a', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#7c3aed', textDecoration: 'underline' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9b98b3', margin: '32px 0 0', borderTop: '1px solid #ece9f5', paddingTop: '20px' }
