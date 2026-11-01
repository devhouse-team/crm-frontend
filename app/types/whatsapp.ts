export type ThreadMode = 'ai_polling' | 'waiting_manager' | 'human_active'

export interface WhatsAppAttachment {
  id: string
  fileName: string
  fileType: 'pdf' | 'image' | 'docx'
  fileSize: string
  categoryLabel: string
  savedToDealDocs: boolean
  previewSummary?: string
}

export interface ExtractedFieldHighlight {
  fieldKey: string
  fieldLabel: string
  extractedValue: string
  confidence: number
}

export interface WhatsAppMessage {
  id: string
  dealId: string
  sender: 'client' | 'ai_agent' | 'manager' | 'system'
  kind?: 'info' | 'warning' | 'error'
  senderName: string
  text: string
  maskedText?: string
  timestamp: string
  deliveryStatus: 'sent' | 'delivered' | 'read'
  attachments?: WhatsAppAttachment[]
  extractedFields?: ExtractedFieldHighlight[]
  containsPii?: boolean
  piiTypes?: ('ИИН/БИН' | 'Телефон')[]
  isTemplate?: boolean
  templateTitle?: string
}

export interface QuickTemplate {
  id: string
  code: 'greeting' | 'doc_request' | 'reminder' | 'proposal'
  title: string
  category: 'WABA HSM' | 'Быстрый ответ'
  body: string
  variables: string[]
}
