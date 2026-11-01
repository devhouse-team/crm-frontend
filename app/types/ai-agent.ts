import type { ReadinessTag } from './crm'

export interface AIBrief {
  dealId: string
  summary: string
  currentStageSummary: string
  missingDocuments: string[]
  recommendedNextStep: string
  aiQuizStep: string
  readinessTag: ReadinessTag
  readinessReason: string
  lastUpdated: string
  piiProtectedCount: number
}

export interface SmartWhisperSuggestion {
  id: string
  label: string
  triggerContext: string
  replyText: string
  category: 'qualification' | 'objection_expensive' | 'doc_followup' | 'schedule_call'
}
