/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="zh-CN" dir="ltr">
    <Head />
    <Preview>你的 {siteName} 登录链接</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{siteName}</Text>
        <Heading style={h1}>你的登录链接 ✉️</Heading>
        <Text style={text}>
          点击下方按钮即可登录 {siteName}。该链接将在短时间内失效。
        </Text>
        <Button style={button} href={confirmationUrl}>
          立即登录
        </Button>
        <Text style={footer}>
          如果你并未请求该链接，可以放心忽略此邮件。
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '13px', fontWeight: 'bold' as const, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 16px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1530', margin: '0 0 20px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55527a', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9b98b3', margin: '32px 0 0', borderTop: '1px solid #ece9f5', paddingTop: '20px' }
