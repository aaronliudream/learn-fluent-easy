/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as weeklyReport } from './weekly-report.tsx'
import { template as recall24h } from './recall-24h.tsx'
import { template as streakRecall } from './streak-recall.tsx'
import { template as feedbackAdminNotification } from './feedback-admin-notification.tsx'
import { template as feedbackUserAck } from './feedback-user-ack.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'weekly-report': weeklyReport,
  'recall-24h': recall24h,
  'streak-recall': streakRecall,
  'feedback-admin-notification': feedbackAdminNotification,
  'feedback-user-ack': feedbackUserAck,
}