/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Big Moon English'
const SITE_URL = 'https://bigmoonenglish.com'

interface WeeklyReportProps {
  name?: string
  lessonsCompleted?: number
  vocabLearned?: number
  studyMinutes?: number
  accuracy?: number
  quizTotal?: number
  streak?: number
  weekRange?: string
  lang?: string
}

type Dict = { greeting: string; subtitle: string; lessons: string; vocab: string; minutes: string; accuracy: string; streak: string; days: string; cta: string; encourage: string; nothing: string }

const STRINGS: Record<string, Dict> = {
  zh: { greeting: '你好', subtitle: '这是你本周的学习报告 📊', lessons: '完成课程', vocab: '新学词汇', minutes: '学习分钟', accuracy: '答题正确率', streak: '连续学习', days: '天', cta: '查看完整报告', encourage: '继续保持！每天一点进步，就能说出流利的英语 💪', nothing: '本周还没有学习记录，回来继续吧！' },
  en: { greeting: 'Hi', subtitle: 'Here is your weekly learning report 📊', lessons: 'Lessons completed', vocab: 'New words', minutes: 'Study minutes', accuracy: 'Quiz accuracy', streak: 'Day streak', days: 'days', cta: 'View full report', encourage: 'Keep going! A little each day adds up to fluency 💪', nothing: 'No activity this week — come back and keep learning!' },
  es: { greeting: 'Hola', subtitle: 'Este es tu informe semanal de estudio 📊', lessons: 'Lecciones', vocab: 'Palabras nuevas', minutes: 'Minutos', accuracy: 'Precisión', streak: 'Racha', days: 'días', cta: 'Ver informe completo', encourage: '¡Sigue así! Un poco cada día = fluidez 💪', nothing: 'Sin actividad esta semana, ¡vuelve a aprender!' },
  ja: { greeting: 'こんにちは', subtitle: '今週の学習レポートです 📊', lessons: '完了レッスン', vocab: '新しい単語', minutes: '学習時間（分）', accuracy: '正解率', streak: '連続学習', days: '日', cta: '詳細レポート', encourage: '頑張って！毎日少しずつ続けましょう 💪', nothing: '今週の記録はまだありません。続きを学びましょう！' },
  ko: { greeting: '안녕하세요', subtitle: '이번 주 학습 리포트 📊', lessons: '완료한 수업', vocab: '새 단어', minutes: '학습 분', accuracy: '정답률', streak: '연속 학습', days: '일', cta: '전체 리포트 보기', encourage: '계속 화이팅! 매일 조금씩이 유창함을 만듭니다 💪', nothing: '이번 주 활동이 없어요 — 다시 학습을 시작하세요!' },
  fr: { greeting: 'Bonjour', subtitle: 'Voici votre rapport de la semaine 📊', lessons: 'Leçons', vocab: 'Mots appris', minutes: 'Minutes', accuracy: 'Précision', streak: 'Série', days: 'jours', cta: 'Voir le rapport complet', encourage: 'Continuez ! Un peu chaque jour mène à la fluidité 💪', nothing: 'Pas d\'activité cette semaine — revenez apprendre !' },
  de: { greeting: 'Hallo', subtitle: 'Hier ist dein Wochenbericht 📊', lessons: 'Lektionen', vocab: 'Neue Wörter', minutes: 'Minuten', accuracy: 'Genauigkeit', streak: 'Streak', days: 'Tage', cta: 'Vollständigen Bericht ansehen', encourage: 'Weiter so! Jeden Tag etwas führt zur Fluenz 💪', nothing: 'Diese Woche keine Aktivität — komm zurück!' },
}

const WeeklyReportEmail = ({
  name,
  lessonsCompleted = 0,
  vocabLearned = 0,
  studyMinutes = 0,
  accuracy = 0,
  quizTotal = 0,
  streak = 0,
  weekRange = '',
  lang = 'zh',
}: WeeklyReportProps) => {
  const s = STRINGS[lang] || STRINGS.zh
  const hasActivity = lessonsCompleted + vocabLearned + studyMinutes + quizTotal > 0
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{s.subtitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>{SITE_NAME}</Text>
          <Heading style={h1}>{s.greeting}{name ? `, ${name}` : ''} 👋</Heading>
          <Text style={text}>{s.subtitle}{weekRange ? ` (${weekRange})` : ''}</Text>

          {hasActivity ? (
            <>
              <Section style={statsCard}>
                <Row>
                  <Column style={stat}><Text style={statValue}>{lessonsCompleted}</Text><Text style={statLabel}>{s.lessons}</Text></Column>
                  <Column style={stat}><Text style={statValue}>{vocabLearned}</Text><Text style={statLabel}>{s.vocab}</Text></Column>
                </Row>
                <Row>
                  <Column style={stat}><Text style={statValue}>{studyMinutes}</Text><Text style={statLabel}>{s.minutes}</Text></Column>
                  <Column style={stat}><Text style={statValue}>{quizTotal > 0 ? `${accuracy}%` : '—'}</Text><Text style={statLabel}>{s.accuracy}</Text></Column>
                </Row>
              </Section>
              {streak > 0 && (
                <Text style={streakText}>🔥 {s.streak}: <strong>{streak} {s.days}</strong></Text>
              )}
              <Text style={text}>{s.encourage}</Text>
            </>
          ) : (
            <Text style={text}>{s.nothing}</Text>
          )}

          <Button style={button} href={`${SITE_URL}/weekly-report`}>{s.cta}</Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WeeklyReportEmail,
  subject: (data: Record<string, any>) => {
    const lang = (data?.lang as string) || 'zh'
    const s = STRINGS[lang] || STRINGS.zh
    return `${SITE_NAME} — ${s.subtitle}`
  },
  displayName: 'Weekly learning report',
  previewData: { name: 'Alex', lessonsCompleted: 5, vocabLearned: 42, studyMinutes: 87, accuracy: 84, quizTotal: 25, streak: 4, weekRange: 'Apr 22 – Apr 28', lang: 'en' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '13px', fontWeight: 'bold' as const, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 16px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1530', margin: '0 0 12px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55527a', lineHeight: '1.6', margin: '0 0 20px' }
const statsCard = { backgroundColor: '#f7f5ff', borderRadius: '16px', padding: '20px', margin: '20px 0' }
const stat = { padding: '12px', textAlign: 'center' as const, width: '50%' }
const statValue = { fontSize: '28px', fontWeight: 'bold' as const, color: '#7c3aed', margin: '0' }
const statLabel = { fontSize: '12px', color: '#7a7898', margin: '4px 0 0' }
const streakText = { fontSize: '15px', color: '#1a1530', textAlign: 'center' as const, margin: '0 0 20px' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block', margin: '12px 0' }