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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="zh-CN" dir="ltr">
    <Head />
    <Preview>你受邀加入 {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{siteName}</Text>
        <Heading style={h1}>你受邀加入啦 🎉</Heading>
        <Text style={text}>
          你被邀请加入{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          。点击下方按钮接受邀请并创建账号，开启你的英语学习之旅。
        </Text>
        <Button style={button} href={confirmationUrl}>
          接受邀请
        </Button>
        <Text style={footer}>
          如果你没有预期此邀请，可以放心忽略此邮件。
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '13px', fontWeight: 'bold' as const, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 16px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1530', margin: '0 0 20px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55527a', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#7c3aed', textDecoration: 'underline' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9b98b3', margin: '32px 0 0', borderTop: '1px solid #ece9f5', paddingTop: '20px' }
