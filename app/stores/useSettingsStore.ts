import { defineStore } from 'pinia'
import type {
  PricingBracket,
  PricingCalculationResult,
  DocumentTemplate,
  KZHoliday,
  KZDeadlineRule
} from '~/types/legal'

export const useSettingsStore = defineStore('settings', () => {
  // 1. Dynamic Debt-to-Service Pricing Matrix (ТЗ §4)
  const pricingBrackets = ref<PricingBracket[]>([
    {
      id: 'br-1',
      label: 'До 500 000 ₸ (Малый долг)',
      minDebt: 0,
      maxDebt: 500_000,
      fixedFee: 120_000,
      maxFeePercentOfDebt: 25,
      altFixedFee: 50_000,
      altSuccessPercent: 20,
      recommendedPackageName: 'Базовый контроль ЧСИ (Частичный Success-Fee)'
    },
    {
      id: 'br-2',
      label: '500 000 ₸ – 2 000 000 ₸',
      minDebt: 500_001,
      maxDebt: 2_000_000,
      fixedFee: 250_000,
      maxFeePercentOfDebt: 25,
      altFixedFee: 110_000,
      altSuccessPercent: 15,
      recommendedPackageName: 'Стандарт Взыскание + Запросы в госорганы'
    },
    {
      id: 'br-3',
      label: '2 000 000 ₸ – 10 000 000 ₸',
      minDebt: 2_000_001,
      maxDebt: 10_000_000,
      fixedFee: 450_000,
      maxFeePercentOfDebt: 20,
      altFixedFee: 220_000,
      altSuccessPercent: 10,
      recommendedPackageName: 'Комплексное сопровождение ИП + Обжалование ЧСИ'
    },
    {
      id: 'br-4',
      label: 'Свыше 10 000 000 ₸ (Крупный/Корпоративный)',
      minDebt: 10_000_001,
      maxDebt: null,
      fixedFee: 950_000,
      maxFeePercentOfDebt: 15,
      altFixedFee: 450_000,
      altSuccessPercent: 8,
      recommendedPackageName: 'VIP Взыскание + Розыск активов ТОО/ФЛ + Суд'
    }
  ])

  function calculatePricing(debtAmount: number | null | undefined): PricingCalculationResult {
    const safeDebt = debtAmount && debtAmount > 0 ? debtAmount : 350_000
    const bracket =
      pricingBrackets.value.find(
        b => safeDebt >= b.minDebt && (b.maxDebt === null || safeDebt <= b.maxDebt)
      ) ?? pricingBrackets.value[0]!

    const feePercentOfDebt = Math.round((bracket.fixedFee / safeDebt) * 1000) / 10
    const isHighRatioWarning = feePercentOfDebt > bracket.maxFeePercentOfDebt
    const estimatedSuccessBonus = Math.round((safeDebt * bracket.altSuccessPercent) / 100)

    return {
      debtAmount: safeDebt,
      bracket,
      recommendedFixedFee: bracket.fixedFee,
      feePercentOfDebt,
      isHighRatioWarning,
      thresholdPercent: bracket.maxFeePercentOfDebt,
      alternativeFixedFee: bracket.altFixedFee,
      alternativeSuccessPercent: bracket.altSuccessPercent,
      estimatedSuccessBonus
    }
  }

  function updateBracket(updated: PricingBracket) {
    const idx = pricingBrackets.value.findIndex(b => b.id === updated.id)
    if (idx !== -1) {
      pricingBrackets.value[idx] = { ...updated }
    }
  }

  // 2. Republic of Kazakhstan Official Public Holidays & SLA Rules (ТЗ §9)
  const kzHolidays = ref<KZHoliday[]>([
    { date: '2026-01-01', title: 'Новый год (1-2 января)', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-01-02', title: 'Новый год (второй день)', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-01-07', title: 'Православное Рождество (выходной)', officialLawRef: 'ТК РК ст. 84' },
    { date: '2026-03-08', title: 'Международный женский день', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-03-21', title: 'Наурыз мейрамы (21–23 марта)', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-03-22', title: 'Наурыз мейрамы', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-03-23', title: 'Наурыз мейрамы (перенос)', officialLawRef: 'Закон РК О праздниках ст. 5' },
    { date: '2026-05-01', title: 'Праздник единства народа Казахстана', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-05-07', title: 'День защитника Отечества', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-05-09', title: 'День Победы', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-07-06', title: 'День Столицы', officialLawRef: 'Закон РК О праздниках ст. 3' },
    { date: '2026-08-30', title: 'День Конституции РК', officialLawRef: 'Закон РК О праздниках ст. 2' },
    { date: '2026-10-25', title: 'День Республики Казахстан (Национальный праздник)', officialLawRef: 'Закон РК О праздниках ст. 2' },
    { date: '2026-10-26', title: 'Перенос выходного дня (День Республики)', officialLawRef: 'Закон РК О праздниках ст. 5' },
    { date: '2026-11-05', title: 'Региональный судебный день технического окна (АПК РК)', officialLawRef: 'Регламент ВС РК' },
    { date: '2026-12-16', title: 'День Независимости Республики Казахстан', officialLawRef: 'Закон РК О праздниках ст. 3' }
  ])

  const deadlineRules = ref<KZDeadlineRule[]>([
    {
      id: 'sla-1',
      eventCode: 'familiarization',
      eventTitle: 'Заявление об ознакомлении с материалами ИП',
      statutoryWorkingDays: 3,
      authority: 'Частный судебный исполнитель (ЧСИ)',
      autoEscalateToExecutive: true
    },
    {
      id: 'sla-2',
      eventCode: 'petition_arrest',
      eventTitle: 'Ходатайство о наложении ареста / розыске имущества',
      statutoryWorkingDays: 5,
      authority: 'ЧСИ / Региональная палата ЧСИ',
      autoEscalateToExecutive: true
    },
    {
      id: 'sla-3',
      eventCode: 'bailiff_complaint',
      eventTitle: 'Жалоба на действия (бездействие) судебного исполнителя в порядке АППК / СМАС',
      statutoryWorkingDays: 10,
      authority: 'Специализированный межрайонный административный суд (СМАС) / Палата ЧСИ',
      autoEscalateToExecutive: true
    },
    {
      id: 'sla-4',
      eventCode: 'prosecutor_appeal',
      eventTitle: 'Повторное обращение / Жалоба в органы прокуратуры и Департамент юстиции',
      statutoryWorkingDays: 15,
      authority: 'Департамент юстиции МЮ РК / Прокуратура',
      autoEscalateToExecutive: true
    }
  ])

  function calculateKZWorkingDeadline(startDateStr: string, workingDaysToAdd: number): {
    targetDate: string
    skippedWeekends: number
    skippedHolidays: string[]
    calendarDaysTotal: number
  } {
    const start = new Date(startDateStr)
    if (Number.isNaN(start.getTime())) {
      return {
        targetDate: startDateStr,
        skippedWeekends: 0,
        skippedHolidays: [],
        calendarDaysTotal: workingDaysToAdd
      }
    }

    const current = new Date(start)
    let added = 0
    let skippedWeekends = 0
    const skippedHolidays: string[] = []
    let calendarDaysTotal = 0

    while (added < workingDaysToAdd) {
      current.setDate(current.getDate() + 1)
      calendarDaysTotal++
      const dayOfWeek = current.getDay()
      const iso = current.toISOString().slice(0, 10)
      const holiday = kzHolidays.value.find(h => h.date === iso)

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        skippedWeekends++
      } else if (holiday) {
        skippedHolidays.push(`${iso} (${holiday.title})`)
      } else {
        added++
      }
    }

    return {
      targetDate: current.toISOString().slice(0, 10),
      skippedWeekends,
      skippedHolidays,
      calendarDaysTotal
    }
  }

  // 3. Six Built-in Legal & Commercial Document Templates (ТЗ §4, §10)
  const documentTemplates = ref<DocumentTemplate[]>([
    {
      id: 'tpl-1',
      code: 'commercial_proposal',
      title: 'Коммерческое предложение (КП)',
      stageScope: 'sales',
      format: 'PDF',
      description: 'Автоматический расчет стоимости услуг по взысканию с учетом суммы долга и выбранного тарифа.',
      variables: ['{{client_name}}', '{{iin_bin}}', '{{debt_amount}}', '{{scenario_label}}', '{{recommended_fee}}', '{{fee_percent}}'],
      bodyTemplate: `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ ПО ЮРИДИЧЕСКОМУ СОПРОВОЖДЕНИЮ\n\nУважаемый(-ая) {{client_name}} (ИИН/БИН: {{iin_bin}})!\n\nПо результатам правового экспресс-анализа Вашей ситуации («{{scenario_label}}») по взысканию задолженности в размере {{debt_amount}} (производство № {{proceeding_number}}, ЧСИ {{bailiff_name}}), предлагаем комплексное юридическое сопровождение.\n\nРекомендованный тариф: {{recommended_fee}} ({{fee_percent}}% от суммы основного долга).\nСрок запуска процессуальных действий: в день подписания договора.`
    },
    {
      id: 'tpl-2',
      code: 'contract',
      title: 'Договор на оказание юридических услуг',
      stageScope: 'sales',
      format: 'DOCX + PDF',
      description: 'Договор поручения на представление интересов в исполнительном производстве и судах РК.',
      variables: ['{{client_name}}', '{{iin_bin}}', '{{client_phone}}', '{{debt_amount}}', '{{recommended_fee}}', '{{proceeding_number}}'],
      bodyTemplate: `ДОГОВОР НА ОКАЗАНИЕ ЮРИДИЧЕСКИХ УСЛУГ № {{deal_code}}\nг. Алматы / Астана\n\nЗаказчик: {{client_name}}, ИИН/БИН {{iin_bin}}, тел. {{client_phone}}.\nПредмет договора: Представление интересов Заказчика по исполнительному производству № {{proceeding_number}} о взыскании суммы {{debt_amount}}.\nСтоимость услуг: {{recommended_fee}}.`
    },
    {
      id: 'tpl-3',
      code: 'familiarization_request',
      title: 'Заявление об ознакомлении с материалами ИП',
      stageScope: 'cases',
      format: 'DOCX + PDF',
      description: 'Процессуальный запрос ЧСИ на предоставление полного доступа к материалам исполнительного производства.',
      variables: ['{{bailiff_name}}', '{{proceeding_number}}', '{{client_name}}', '{{iin_bin}}', '{{debt_amount}}'],
      bodyTemplate: `Частному судебному исполнителю {{bailiff_name}}\nОт представителя стороны: {{client_name}} (ИИН/БИН {{iin_bin}})\n\nЗАЯВЛЕНИЕ ОБ ОЗНАКОМЛЕНИИ С МАТЕРИАЛАМИ ИСПОЛНИТЕЛЬНОГО ПРОИЗВОДСТВА\n\nВ Вашем производстве находится исполнительное производство № {{proceeding_number}} о взыскании {{debt_amount}}. На основании ст. 14 Закона РК «Об исполнительном производстве и статусе судебных исполнителей» прошу предоставить материалы ИП для ознакомления и снятия копий в течение 3 рабочих дней.`
    },
    {
      id: 'tpl-4',
      code: 'petition',
      title: 'Ходатайство о совершении исполнительных действий',
      stageScope: 'cases',
      format: 'DOCX + PDF',
      description: 'Требование о наложении ареста на счета БВУ, запрете на выезд из РК и розыске активов должника.',
      variables: ['{{bailiff_name}}', '{{proceeding_number}}', '{{client_name}}', '{{opposing_party}}', '{{debt_amount}}'],
      bodyTemplate: `Частному судебному исполнителю {{bailiff_name}}\nПо исполнительному производству № {{proceeding_number}}\n\nХОДАТАЙСТВО О ПРИНЯТИИ МЕР ПРИНУДИТЕЛЬНОГО ИСПОЛНЕНИЯ\n\nВ интересах {{client_name}} прошу незамедлительно вынести постановления: 1) о наложении ареста на денежные средства должника {{opposing_party}} в БВУ РК; 2) о временном ограничении на выезд из РК (ст. 33 Закона РК); 3) о направлении запросов в НАО «ГК Правительство для граждан» и КГД МФ РК.`
    },
    {
      id: 'tpl-5',
      code: 'repeat_appeal',
      title: 'Повторное обращение ЧСИ',
      stageScope: 'cases',
      format: 'DOCX + PDF',
      description: 'Фиксация нарушения процессуальных сроков ЧСИ перед подачей жалобы в Палату и СМАС.',
      variables: ['{{bailiff_name}}', '{{proceeding_number}}', '{{client_name}}', '{{debt_amount}}'],
      bodyTemplate: `Частному судебному исполнителю {{bailiff_name}}\nКопия: Региональная палата ЧСИ\n\nПОВТОРНОЕ ОБРАЩЕНИЕ ПО ИП № {{proceeding_number}}\n\nРанее в Ваш адрес было направлено ходатайство по делу {{client_name}} (сумма долга {{debt_amount}}). В установленный законом срок ответ не предоставлен, исполнительные действия не совершены. Требуем устранить нарушения в течение 2 рабочих дней.`
    },
    {
      id: 'tpl-6',
      code: 'bailiff_complaint',
      title: 'Жалоба на бездействие ЧСИ',
      stageScope: 'cases',
      format: 'DOCX + PDF',
      description: 'Административный иск / жалоба в порядке ст. 127 Закона РК и АППК РК на незаконные действия или бездействие ЧСИ.',
      variables: ['{{bailiff_name}}', '{{proceeding_number}}', '{{client_name}}', '{{iin_bin}}', '{{debt_amount}}'],
      bodyTemplate: `В Специализированный межрайонный административный суд / Департамент юстиции\nАдминистративный истец: {{client_name}} (ИИН/БИН {{iin_bin}})\nОтветчик: ЧСИ {{bailiff_name}}\n\nЖАЛОБА (АДМИНИСТРАТИВНЫЙ ИСК)\nна бездействие частного судебного исполнителя по ИП № {{proceeding_number}}\n\nПо исполнительному производству о взыскании {{debt_amount}} ЧСИ {{bailiff_name}} допускает незаконное бездействие. Прошу признать бездействие незаконным и обязать совершить исполнительные действия в полном объеме.`
    }
  ])

  return {
    pricingBrackets,
    calculatePricing,
    updateBracket,
    kzHolidays,
    deadlineRules,
    calculateKZWorkingDeadline,
    documentTemplates
  }
})
