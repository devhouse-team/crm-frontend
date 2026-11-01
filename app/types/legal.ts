import type { PartyRole } from './crm'

export interface PricingBracket {
  id: string
  label: string
  minDebt: number
  maxDebt: number | null
  fixedFee: number
  maxFeePercentOfDebt: number
  altFixedFee: number
  altSuccessPercent: number
  recommendedPackageName: string
}

export interface PricingCalculationResult {
  debtAmount: number
  bracket: PricingBracket
  recommendedFixedFee: number
  feePercentOfDebt: number
  isHighRatioWarning: boolean
  thresholdPercent: number
  alternativeFixedFee: number
  alternativeSuccessPercent: number
  estimatedSuccessBonus: number
}

export interface ConflictRecord {
  id: string
  dealId: string
  dealCode: string
  newClientName: string
  newClientRole: PartyRole
  newClientIinBin: string
  newProceedingNumber: string
  newDebtAmount: number
  assignedManagerName: string
  matchType: 'opposing_party_ip' | 'duplicate_iin_opposing' | 'related_bin'
  severity: 'critical' | 'warning'
  matchedDealCode: string
  matchedEntityName: string
  matchedEntityRole: PartyRole
  matchedEntityIinBin: string
  matchedProceedingNumber: string
  matchedLawyerName: string
  matchedStageName: string
  detectedAt: string
  status: 'pending' | 'approved' | 'rejected'
  resolvedBy?: string
  resolvedAt?: string
  resolutionComment?: string
}

export interface DocumentTemplate {
  id: string
  code:
    | 'commercial_proposal'
    | 'contract'
    | 'familiarization_request'
    | 'petition'
    | 'repeat_appeal'
    | 'bailiff_complaint'
  title: string
  stageScope: 'sales' | 'cases' | 'both'
  format: 'PDF' | 'DOCX + PDF'
  description: string
  variables: string[]
  bodyTemplate: string
}

export interface KZHoliday {
  date: string // YYYY-MM-DD
  title: string
  officialLawRef: string
}

export interface KZDeadlineRule {
  id: string
  eventCode: string
  eventTitle: string
  statutoryWorkingDays: number
  authority: string
  autoEscalateToExecutive: boolean
}
