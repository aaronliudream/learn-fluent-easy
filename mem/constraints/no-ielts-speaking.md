---
name: no-ielts-speaking
description: IELTS Speaking module is permanently removed and must never be re-added
type: constraint
---
Do NOT add any IELTS Speaking feature, page, route, edge function, or database table.
The user permanently removed it. Removed assets included:
- pages: IeltsSpeaking.tsx, IeltsSpeakingSession.tsx
- component: IeltsVoiceCall.tsx
- edge functions: grade-ielts-speaking, grade-ielts-bands, ielts-voice-turn, ielts-examiner-chat
- tables: ielts_topics, ielts_sessions, ielts_errors
- routes: /ielts-speaking, /ielts-speaking/session/:id

**Why:** User explicitly stated they never want this feature. Mentions of "IELTS" in legal disclaimer copy are OK (referring to the exam org).
