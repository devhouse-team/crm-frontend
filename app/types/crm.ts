export type UserRole = 'executive' | 'lawyer' | 'manager'

export type ReadinessTag = 'A' | 'B' | 'C' | 'D'

export type PipelineId = 'sales' | 'cases'

export type SalesStageId =
  | 'new'
  | 'ai_quiz'
  | 'qualified'
  | 'awaiting_docs'
  | 'offer_sent'
  | 'negotiation'
  | 'contract_signed'
  | 'paid'
  | 'lost'

export type CaseStageId =
  | 'materials'
  | 'analysis'
  | 'doc_prep'
  | 'signing'
  | 'sent'
  | 'awaiting_reply'
  | 'next_action'
  | 'completed'

export type StageId = SalesStageId | CaseStageId

export type ClientScenario =
  | 'bailiff_inaction'
  | 'alimony_arrears'
  | 'illegal_arrest'
  | 'court_writ_unsubmitted'
  | 'debtor_hiding_assets'

export type PartyRole = 'creditor' | 'debtor'

export type RejectionReason =
  | 'expensive_relative_to_debt'
  | 'conflict_of_interest'
  | 'no_documents'
  | 'out_of_scope'
  | 'went_to_competitor'
  | 'resolved_independently'

export interface TeamMember {
  id: string
  name: string
  role: UserRole
  roleLabel: string
  email: string
  phone: string
  avatarText: string
  activeDealsCount: number
  activeCasesCount: number
  recoveredTotal: number
  online: boolean
}

export interface PipelineStage {
  id: StageId
  pipelineId: PipelineId
  name: string
  shortName: string
  order: number
  color: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  mandatoryFields?: string[]
  description?: string
}

export interface DealDocument {
  id: string
  name: string
  category: 'court_ruling' | 'writ' | 'bailiff_decree' | 'id_card' | 'generated_doc' | 'other'
  categoryLabel: string
  fileType: 'pdf' | 'docx' | 'jpg'
  size: string
  uploadedAt: string
  source: 'whatsapp' | 'generated' | 'manual'
  sentToWhatsApp?: boolean
}

export interface RequiredDocCheck {
  key: 'court_ruling' | 'writ' | 'bailiff_decree' | 'id_card' | 'power_of_attorney'
  label: string
  received: boolean
  fileName?: string
  receivedVia?: 'whatsapp' | 'upload'
}

export interface DealTask {
  id: string
  dealId: string
  title: string
  type: 'call' | 'court' | 'bailiff_control' | 'conflict_check' | 'doc_prep'
  typeLabel: string
  assigneeId: string
  assigneeName: string
  createdAt: string
  dueDate: string
  workingDaysAllowed: number
  workingDaysRemaining: number
  skippedHolidays: string[]
  status: 'on_track' | 'due_tomorrow' | 'overdue' | 'completed'
  escalatedToExecutive: boolean
  proceduralEvent?: string
}

export interface DealAuditEntry {
  id: string
  timestamp: string
  actor: string
  actorType: 'ai' | 'human' | 'system'
  action: string
  details: string
  piiMasked?: boolean
}

export interface Deal {
  id: string
  code: string
  title: string
  pipelineId: PipelineId
  stageId: StageId
  salesStageId: SalesStageId
  caseStageId?: CaseStageId
  readinessTag: ReadinessTag
  clientName: string
  clientPhone: string
  clientPhoneMasked: string
  iinBin: string
  iinBinMasked: string
  partyRole: PartyRole
  opposingPartyName: string
  opposingPartyIinBin: string
  debtAmount: number | null
  recoveredAmount: number
  recommendedFee: number
  alternativeFeeFixed: number
  alternativeFeePercent: number
  selectedTariffMode: 'fixed' | 'success_fee'
  scenario: ClientScenario
  scenarioLabel: string
  proceedingNumber: string
  bailiffName: string
  bailiffRegion: string
  region: string
  assignedManagerId: string
  assignedLawyerId: string
  conflictStatus: 'clear' | 'flagged' | 'approved' | 'rejected'
  conflictId?: string
  conflictNote?: string
  rejectionReason?: RejectionReason
  rejectionComment?: string
  aiPopulatedFields: string[]
  whatsappStatus: 'ai_polling' | 'waiting_manager' | 'human_active' | 'replied'
  unreadCount: number
  lastActivityAt: string
  createdAt: string
  handedOffToCasesAt?: string
  requiredDocs: RequiredDocCheck[]
  documents: DealDocument[]
  tasks: DealTask[]
  auditLog: DealAuditEntry[]
}
