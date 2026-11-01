export function formatKZT(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Не указана'
  }
  return new Intl.NumberFormat('ru-KZ', {
    maximumFractionDigits: 0
  }).format(amount) + '\u00A0₸'
}

export function formatCompactKZT(amount: number | null | undefined): string {
  if (!amount) return '0\u00A0₸'
  if (amount >= 1_000_000) {
    const mln = amount / 1_000_000
    return `${mln % 1 === 0 ? mln.toFixed(0) : mln.toFixed(1)}\u00A0млн\u00A0₸`
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}\u00A0тыс\u00A0₸`
  }
  return `${amount}\u00A0₸`
}

export function pluralizeRu(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return `${count}\u00A0${many}`
  if (n1 > 1 && n1 < 5) return `${count}\u00A0${few}`
  if (n1 === 1) return `${count}\u00A0${one}`
  return `${count}\u00A0${many}`
}

export function maskIinBin(iin: string): string {
  if (!iin) return '[ИИН_СКРЫТ]'
  const clean = iin.replace(/\D/g, '')
  if (clean.length < 6) return '[ИИН_СКРЫТ]'
  return `${clean.slice(0, 4)}••••••${clean.slice(-2)} [ИИН_СКРЫТ]`
}

export function maskPhone(phone: string): string {
  if (!phone) return '[ТЕЛ_СКРЫТ]'
  return '+7 (7••) •••-••-' + phone.slice(-2) + ' [ТЕЛ_СКРЫТ]'
}

export const SCENARIO_LABELS: Record<string, string> = {
  bailiff_inaction: 'Бездействие ЧСИ по исполнительному листу',
  alimony_arrears: 'Взыскание задолженности по алиментам',
  illegal_arrest: 'Снятие незаконного ареста со счетов / имущества',
  court_writ_unsubmitted: 'Есть решение суда, не передано на исполнение',
  debtor_hiding_assets: 'Розыск имущества и счетов должника (ТОО / ФЛ)'
}

export const REJECTION_REASON_LABELS: Record<string, string> = {
  expensive_relative_to_debt: 'Дорого относительно суммы долга',
  conflict_of_interest: 'Конфликт интересов (представляем другую сторону)',
  no_documents: 'Отсутствуют подтверждающие документы',
  out_of_scope: 'Не наш профиль / слишком малая сумма',
  went_to_competitor: 'Ушел к другим юристам',
  resolved_independently: 'Решил вопрос самостоятельно с должником'
}

export const READINESS_TAG_META: Record<'A' | 'B' | 'C' | 'D', {
  label: string
  shortLabel: string
  color: 'error' | 'success' | 'warning' | 'neutral'
  description: string
}> = {
  A: {
    label: 'A — Срочно (горит срок)',
    shortLabel: 'A · Срочно',
    color: 'error',
    description: 'Истекает процессуальный срок обжалования (10 раб. дней РК). Авто-задача юристу на сегодня.'
  },
  B: {
    label: 'B — Готов к КП',
    shortLabel: 'B · Готов',
    color: 'success',
    description: 'Документы на руках, сумма долга проходит по тарифу. Готов к отправке КП.'
  },
  C: {
    label: 'C — Не готов (ждем док.)',
    shortLabel: 'C · Ждём док.',
    color: 'warning',
    description: 'Не знает точную сумму долга или еще собирает постановления ЧСИ.'
  },
  D: {
    label: 'D — Не наш клиент',
    shortLabel: 'D · Отказ',
    color: 'neutral',
    description: 'Сумма долга ниже рентабельного порога; отправлена авто-инструкция в WhatsApp.'
  }
}
