import { defineStore } from 'pinia'
import type {
  Deal,
  PipelineStage,
  StageId,
  SalesStageId,
  CaseStageId,
  RejectionReason
} from '~/types/crm'
import type { ConflictRecord } from '~/types/legal'
import { useSettingsStore } from './useSettingsStore'
import { maskIinBin, maskPhone } from '~/utils/formatters'

export const usePipelineStore = defineStore('pipeline', () => {
  const settingsStore = useSettingsStore()

  // 1. Sales Pipeline Stages (8 active + 1 Lost drop zone — ТЗ §3)
  const salesStages = ref<PipelineStage[]>([
    {
      id: 'new',
      pipelineId: 'sales',
      name: 'Новая заявка',
      shortName: 'Новая',
      order: 1,
      color: 'neutral',
      description: 'Входящее сообщение WhatsApp / обращение'
    },
    {
      id: 'ai_quiz',
      pipelineId: 'sales',
      name: 'Опрос AI',
      shortName: 'Опрос AI',
      order: 2,
      color: 'secondary',
      description: 'ИИ-агент уточняет ситуацию, сумму долга и документы'
    },
    {
      id: 'qualified',
      pipelineId: 'sales',
      name: 'Квалифицирована',
      shortName: 'Квалиф.',
      order: 3,
      color: 'info',
      mandatoryFields: ['debtAmount', 'scenario'],
      description: 'Обязательно: Сумма долга и Ситуация'
    },
    {
      id: 'awaiting_docs',
      pipelineId: 'sales',
      name: 'Ждем документы',
      shortName: 'Ждем док.',
      order: 4,
      color: 'warning',
      description: 'Запрос решения суда / исполнительного листа / постановления ЧСИ'
    },
    {
      id: 'offer_sent',
      pipelineId: 'sales',
      name: 'Предложение отправлено',
      shortName: 'КП отпр.',
      order: 5,
      color: 'primary',
      mandatoryFields: ['debtAmount', 'conflictCleared'],
      description: 'Обязательно: Проверка конфликта интересов пройдена'
    },
    {
      id: 'negotiation',
      pipelineId: 'sales',
      name: 'Переговоры',
      shortName: 'Переговоры',
      order: 6,
      color: 'info',
      description: 'Согласование тарифа (фикс / частичный success-fee)'
    },
    {
      id: 'contract_signed',
      pipelineId: 'sales',
      name: 'Договор подписан',
      shortName: 'Договор',
      order: 7,
      color: 'primary',
      description: 'Договор и доверенность подписаны (ЭЦП / eGov)'
    },
    {
      id: 'paid',
      pipelineId: 'sales',
      name: 'Оплачена',
      shortName: 'Оплачена',
      order: 8,
      color: 'success',
      description: 'Оплата получена -> Автопереход в воронку «Ведение дел»'
    },
    {
      id: 'lost',
      pipelineId: 'sales',
      name: 'Закрыто и не реализовано',
      shortName: 'Отказ',
      order: 9,
      color: 'error',
      mandatoryFields: ['rejectionReason'],
      description: 'Обязательно: Причина отказа (в т.ч. «Дорого относительно долга»)'
    }
  ])

  // 2. Legal Case Management Stages («Ведение дел» — 8 stages — ТЗ §8)
  const caseStages = ref<PipelineStage[]>([
    {
      id: 'materials',
      pipelineId: 'cases',
      name: 'Сбор материалов',
      shortName: 'Сбор мат.',
      order: 1,
      color: 'neutral',
      description: 'Получение полного пакета документов и доверенности от клиента'
    },
    {
      id: 'analysis',
      pipelineId: 'cases',
      name: 'Анализ',
      shortName: 'Анализ',
      order: 2,
      color: 'info',
      description: 'Правовой аудит материалов ИП, проверка сроков обжалования РК'
    },
    {
      id: 'doc_prep',
      pipelineId: 'cases',
      name: 'Подготовка документа',
      shortName: 'Подготовка',
      order: 3,
      color: 'secondary',
      description: 'Формирование заявления / ходатайства / жалобы по шаблону'
    },
    {
      id: 'signing',
      pipelineId: 'cases',
      name: 'Подписание',
      shortName: 'Подписание',
      order: 4,
      color: 'warning',
      description: 'Согласование и подписание ЭЦП перед подачей в АИС ОИП / e-Otinish'
    },
    {
      id: 'sent',
      pipelineId: 'cases',
      name: 'Отправлено',
      shortName: 'Отправлено',
      order: 5,
      color: 'primary',
      description: 'Документ подан ЧСИ / в СМАС -> Запуск контрольного срока в раб. днях РК'
    },
    {
      id: 'awaiting_reply',
      pipelineId: 'cases',
      name: 'Ожидание ответа',
      shortName: 'Ждем ответ',
      order: 6,
      color: 'warning',
      description: 'Контроль ответа ЧСИ / суда по производственному календарю РК'
    },
    {
      id: 'next_action',
      pipelineId: 'cases',
      name: 'Следующее действие',
      shortName: 'След. шаг',
      order: 7,
      color: 'info',
      description: 'Повторное обращение, обжалование в Палату ЧСИ или фиксация взыскания'
    },
    {
      id: 'completed',
      pipelineId: 'cases',
      name: 'Завершено',
      shortName: 'Завершено',
      order: 8,
      color: 'success',
      description: 'Задолженность взыскана / постановление исполнено'
    }
  ])

  // 3. Pre-populated Realistic Kazakhstan Debt Collection Deals & Cases
  const deals = ref<Deal[]>([
    {
      id: 'deal-101',
      code: 'KZ-2026-101',
      title: 'Взыскание по ИП: ТОО «КазСтройМонтаж-7»',
      pipelineId: 'sales',
      stageId: 'qualified',
      salesStageId: 'qualified',
      readinessTag: 'A',
      clientName: 'Ерлан Бекмухамедов',
      clientPhone: '+7 (701) 554-82-19',
      clientPhoneMasked: maskPhone('+7 (701) 554-82-19'),
      iinBin: '860412301492',
      iinBinMasked: maskIinBin('860412301492'),
      partyRole: 'creditor',
      opposingPartyName: 'ТОО «КазСтройМонтаж-7»',
      opposingPartyIinBin: '190840018291',
      debtAmount: 6_800_000,
      recoveredAmount: 0,
      recommendedFee: 450_000,
      alternativeFeeFixed: 220_000,
      alternativeFeePercent: 10,
      selectedTariffMode: 'fixed',
      scenario: 'bailiff_inaction',
      scenarioLabel: 'Бездействие ЧСИ по исполнительному листу',
      proceedingNumber: '№ 1452/26-75-3112',
      bailiffName: 'ЧСИ Смагулов Б.К. (г. Алматы)',
      bailiffRegion: 'г. Алматы',
      region: 'г. Алматы',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-2',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'scenario', 'proceedingNumber', 'iinBin'],
      whatsappStatus: 'waiting_manager',
      unreadCount: 2,
      lastActivityAt: '2 мин назад',
      createdAt: '2026-11-01 09:40',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда СМЭС г. Алматы', received: true, fileName: 'Reshenie_SMES_Almaty_101.pdf', receivedVia: 'whatsapp' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'Ispolnitelny_list_1452.pdf', receivedVia: 'whatsapp' },
        { key: 'bailiff_decree', label: 'Постановление ЧСИ о возбуждении ИП', received: true, fileName: 'Postanovlenie_CHSI_Smagulov.pdf', receivedVia: 'whatsapp' },
        { key: 'id_card', label: 'Удостоверение личности / реквизиты', received: false }
      ],
      documents: [
        {
          id: 'doc-1',
          name: 'Reshenie_SMES_Almaty_101.pdf',
          category: 'court_ruling',
          categoryLabel: 'Решение суда',
          fileType: 'pdf',
          size: '1.4 МБ',
          uploadedAt: 'Сегодня, 10:12',
          source: 'whatsapp'
        },
        {
          id: 'doc-2',
          name: 'Postanovlenie_CHSI_Smagulov.pdf',
          category: 'bailiff_decree',
          categoryLabel: 'Постановление ЧСИ',
          fileType: 'pdf',
          size: '840 КБ',
          uploadedAt: 'Сегодня, 10:14',
          source: 'whatsapp'
        }
      ],
      tasks: [
        {
          id: 't-101',
          dealId: 'deal-101',
          title: 'Срочно: истекает 10 раб. дней на обжалование постановления ЧСИ Смагулова',
          type: 'bailiff_control',
          typeLabel: 'Срочный контроль ЧСИ (Тег A)',
          assigneeId: 'u-2',
          assigneeName: 'Алия Касымова',
          createdAt: '2026-11-01',
          dueDate: '2026-11-02',
          workingDaysAllowed: 10,
          workingDaysRemaining: 1,
          skippedHolidays: ['2026-10-25 (День Республики)', '2026-10-26 (Перенос выходного)'],
          status: 'due_tomorrow',
          escalatedToExecutive: false,
          proceduralEvent: 'Постановление ЧСИ об отказе в аресте счетов'
        }
      ],
      auditLog: [
        {
          id: 'aud-1',
          timestamp: 'Сегодня, 09:40',
          actor: 'WhatsApp WABA',
          actorType: 'system',
          action: 'Создана сделка и контакт из входящего сообщения WhatsApp',
          details: 'Клиент +7 (701) 554-82-19 написал в корпоративный канал'
        },
        {
          id: 'aud-2',
          timestamp: 'Сегодня, 09:42',
          actor: 'PII Privacy Shield',
          actorType: 'system',
          action: 'Маскирование персональных данных перед передачей в LLM',
          details: 'ИИН 860412301492 -> [ИИН_СКРЫТ], Телефон -> [ТЕЛ_СКРЫТ]',
          piiMasked: true
        },
        {
          id: 'aud-3',
          timestamp: 'Сегодня, 09:50',
          actor: 'AI Sales Agent',
          actorType: 'ai',
          action: 'Квалификация завершена, присвоен тег A — Срочно',
          details: 'Извлечена сумма долга 6 800 000 ₸, № ИП 1452/26-75-3112. Срок на жалобу истекает через 1 раб. день РК.'
        }
      ]
    },
    {
      id: 'deal-102',
      code: 'KZ-2026-102',
      title: 'Снятие ареста и встречное взыскание: ТОО «АстанаЛогистикГрупп»',
      pipelineId: 'sales',
      stageId: 'qualified',
      salesStageId: 'qualified',
      readinessTag: 'B',
      clientName: 'Серикжан Мукашев (Директор ТОО «АстанаЛогистикГрупп»)',
      clientPhone: '+7 (702) 318-90-44',
      clientPhoneMasked: maskPhone('+7 (702) 318-90-44'),
      iinBin: '890512300145',
      iinBinMasked: maskIinBin('890512300145'),
      partyRole: 'debtor',
      opposingPartyName: 'АО «Торговый Дом Евразия-Снаб»',
      opposingPartyIinBin: '150240009112',
      debtAmount: 14_200_000,
      recoveredAmount: 0,
      recommendedFee: 950_000,
      alternativeFeeFixed: 450_000,
      alternativeFeePercent: 8,
      selectedTariffMode: 'fixed',
      scenario: 'illegal_arrest',
      scenarioLabel: 'Снятие незаконного ареста со счетов / имущества',
      proceedingNumber: '№ 889/26-71-0419',
      bailiffName: 'ЧСИ Омаров К.Т. (г. Астана)',
      bailiffRegion: 'г. Астана',
      region: 'г. Астана',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-3',
      conflictStatus: 'flagged',
      conflictId: 'conf-1',
      conflictNote: 'ВНИМАНИЕ: Мы уже представляем взыскателя АО «Торговый Дом Евразия-Снаб» по ИП № 889/26-71-0419 (дело KZ-2026-204).',
      aiPopulatedFields: ['debtAmount', 'iinBin', 'proceedingNumber'],
      whatsappStatus: 'waiting_manager',
      unreadCount: 1,
      lastActivityAt: '11 мин назад',
      createdAt: '2026-11-01 10:15',
      requiredDocs: [
        { key: 'bailiff_decree', label: 'Постановление ЧСИ о наложении ареста', received: true, fileName: 'Arest_CHSI_Omarov_889.pdf', receivedVia: 'whatsapp' },
        { key: 'court_ruling', label: 'Судебный акт / Исполнительная надпись', received: true, fileName: 'Ispolnitelnaya_nadpis_889.pdf', receivedVia: 'whatsapp' },
        { key: 'id_card', label: 'Справка о гос. регистрации ТОО (БИН)', received: true, fileName: 'Spravka_eGov_AstanaLogistik.pdf', receivedVia: 'whatsapp' }
      ],
      documents: [
        {
          id: 'doc-102-1',
          name: 'Arest_CHSI_Omarov_889.pdf',
          category: 'bailiff_decree',
          categoryLabel: 'Постановление ЧСИ',
          fileType: 'pdf',
          size: '1.1 МБ',
          uploadedAt: 'Сегодня, 10:25',
          source: 'whatsapp'
        }
      ],
      tasks: [
        {
          id: 't-102',
          dealId: 'deal-102',
          title: 'Разрешить конфликт интересов по ИП № 889/26-71-0419 (Совпадение противоположной стороны)',
          type: 'conflict_check',
          typeLabel: 'Конфликт интересов (Руководителю)',
          assigneeId: 'u-1',
          assigneeName: 'Нурлан Сатпаев',
          createdAt: '2026-11-01',
          dueDate: '2026-11-01',
          workingDaysAllowed: 1,
          workingDaysRemaining: 0,
          skippedHolidays: [],
          status: 'due_tomorrow',
          escalatedToExecutive: true,
          proceduralEvent: 'Авто-блокировка отправки КП до решения Руководителя'
        }
      ],
      auditLog: [
        {
          id: 'aud-102-1',
          timestamp: 'Сегодня, 10:26',
          actor: 'Conflict Gate Engine',
          actorType: 'system',
          action: 'Обнаружен конфликт интересов по № ИП 889/26-71-0419 и ИИН/БИН',
          details: 'Переход на этап «Предложение отправлено» заблокирован. Назначена задача Руководителю Нурлану Сатпаеву.'
        }
      ]
    },
    {
      id: 'deal-103',
      code: 'KZ-2026-103',
      title: 'Взыскание долга по расписке: Садвакасова Д.М.',
      pipelineId: 'sales',
      stageId: 'negotiation',
      salesStageId: 'negotiation',
      readinessTag: 'B',
      clientName: 'Динара Садвакасова',
      clientPhone: '+7 (707) 412-67-08',
      clientPhoneMasked: maskPhone('+7 (707) 412-67-08'),
      iinBin: '921104400812',
      iinBinMasked: maskIinBin('921104400812'),
      partyRole: 'creditor',
      opposingPartyName: 'Калиев Руслан Серикович',
      opposingPartyIinBin: '880319300511',
      debtAmount: 380_000,
      recoveredAmount: 0,
      recommendedFee: 120_000,
      alternativeFeeFixed: 50_000,
      alternativeFeePercent: 20,
      selectedTariffMode: 'fixed',
      scenario: 'court_writ_unsubmitted',
      scenarioLabel: 'Есть решение суда, не передано на исполнение',
      proceedingNumber: 'Еще не возбуждено (ИЛ на руках)',
      bailiffName: 'Подбор ЧСИ по г. Шымкент',
      bailiffRegion: 'г. Шымкент',
      region: 'г. Шымкент',
      assignedManagerId: 'u-5',
      assignedLawyerId: 'u-2',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'scenario', 'iinBin'],
      whatsappStatus: 'waiting_manager',
      unreadCount: 1,
      lastActivityAt: '18 мин назад',
      createdAt: '2026-10-31 15:20',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда', received: true, fileName: 'Reshenie_Suda_Shymkent.pdf', receivedVia: 'whatsapp' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'Ispolnitelny_List_Sadvakasova.pdf', receivedVia: 'whatsapp' },
        { key: 'id_card', label: 'Удостоверение личности', received: true, fileName: 'Udv_Sadvakasova.jpg', receivedVia: 'whatsapp' }
      ],
      documents: [
        {
          id: 'doc-103-1',
          name: 'Reshenie_Suda_Shymkent.pdf',
          category: 'court_ruling',
          categoryLabel: 'Решение суда',
          fileType: 'pdf',
          size: '920 КБ',
          uploadedAt: 'Вчера, 16:05',
          source: 'whatsapp'
        }
      ],
      tasks: [],
      auditLog: [
        {
          id: 'aud-103-1',
          timestamp: 'Сегодня, 11:05',
          actor: 'Pricing Engine',
          actorType: 'system',
          action: 'Предупреждение по пропорции цены услуги к сумме долга',
          details: 'Базовый тариф 120 000 ₸ составляет 31.6% от долга (380 000 ₸) при пороге 25%. Рекомендован альтернативный тариф: 50 000 ₸ + 20% от взыскания.'
        }
      ]
    },
    {
      id: 'deal-104',
      code: 'KZ-2026-104',
      title: 'Взыскание алиментов за 3 года: Нургалиева А.С.',
      pipelineId: 'sales',
      stageId: 'ai_quiz',
      salesStageId: 'ai_quiz',
      readinessTag: 'C',
      clientName: 'Айжан Нургалиева',
      clientPhone: '+7 (747) 892-33-10',
      clientPhoneMasked: maskPhone('+7 (747) 892-33-10'),
      iinBin: '940721401290',
      iinBinMasked: maskIinBin('940721401290'),
      partyRole: 'creditor',
      opposingPartyName: 'Нургалиев Марат Еркинович',
      opposingPartyIinBin: '910214300981',
      debtAmount: null,
      recoveredAmount: 0,
      recommendedFee: 250_000,
      alternativeFeeFixed: 110_000,
      alternativeFeePercent: 15,
      selectedTariffMode: 'fixed',
      scenario: 'alimony_arrears',
      scenarioLabel: 'Взыскание задолженности по алиментам',
      proceedingNumber: '№ 410/25-19-0921',
      bailiffName: 'ЧСИ Жумагулов Е.А. (г. Караганда)',
      bailiffRegion: 'г. Караганда',
      region: 'г. Караганда',
      assignedManagerId: 'u-5',
      assignedLawyerId: 'u-6',
      conflictStatus: 'clear',
      aiPopulatedFields: ['scenario', 'proceedingNumber'],
      whatsappStatus: 'ai_polling',
      unreadCount: 0,
      lastActivityAt: '5 мин назад',
      createdAt: '2026-11-01 12:10',
      requiredDocs: [
        { key: 'court_ruling', label: 'Судебный приказ о взыскании алиментов', received: true, fileName: 'Sudebny_prikaz_alimony.pdf', receivedVia: 'whatsapp' },
        { key: 'bailiff_decree', label: 'Постановление ЧСИ о расчете задолженности', received: false },
        { key: 'id_card', label: 'Удостоверение личности', received: false }
      ],
      documents: [],
      tasks: [],
      auditLog: [
        {
          id: 'aud-104-1',
          timestamp: 'Сегодня, 12:12',
          actor: 'AI Sales Agent',
          actorType: 'ai',
          action: 'Опрос клиента в WhatsApp (Шаг 3 из 4)',
          details: 'Уточняется точная сумма задолженности по постановлению ЧСИ. Присвоен предварительный тег C — Не готов.'
        }
      ]
    },
    {
      id: 'deal-105',
      code: 'KZ-2026-105',
      title: 'Розыск активов должника ТОО «ТрансОйлСервис»',
      pipelineId: 'sales',
      stageId: 'offer_sent',
      salesStageId: 'offer_sent',
      readinessTag: 'B',
      clientName: 'Бауржан Тасмагамбетов (ТОО «Инжиниринг-Плюс»)',
      clientPhone: '+7 (701) 770-12-90',
      clientPhoneMasked: maskPhone('+7 (701) 770-12-90'),
      iinBin: '170440021904',
      iinBinMasked: maskIinBin('170440021904'),
      partyRole: 'creditor',
      opposingPartyName: 'ТОО «ТрансОйлСервис»',
      opposingPartyIinBin: '160940011402',
      debtAmount: 18_500_000,
      recoveredAmount: 0,
      recommendedFee: 950_000,
      alternativeFeeFixed: 450_000,
      alternativeFeePercent: 8,
      selectedTariffMode: 'fixed',
      scenario: 'debtor_hiding_assets',
      scenarioLabel: 'Розыск имущества и счетов должника (ТОО / ФЛ)',
      proceedingNumber: '№ 2190/26-23-1108',
      bailiffName: 'ЧСИ Досмагамбетов Р.С. (г. Атырау)',
      bailiffRegion: 'г. Атырау',
      region: 'г. Атырау',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-2',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'scenario', 'iinBin', 'proceedingNumber'],
      whatsappStatus: 'human_active',
      unreadCount: 0,
      lastActivityAt: '42 мин назад',
      createdAt: '2026-10-30 14:00',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение СМЭС Атырауской области', received: true, fileName: 'Reshenie_SMES_Atyrau.pdf', receivedVia: 'whatsapp' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'IL_2190.pdf', receivedVia: 'whatsapp' },
        { key: 'bailiff_decree', label: 'Постановление ЧСИ', received: true, fileName: 'Post_CHSI_Atyrau.pdf', receivedVia: 'whatsapp' }
      ],
      documents: [
        {
          id: 'doc-105-kp',
          name: 'KP_KZ-2026-105_Inzhiniring.pdf',
          category: 'generated_doc',
          categoryLabel: 'Коммерческое предложение',
          fileType: 'pdf',
          size: '410 КБ',
          uploadedAt: 'Сегодня, 11:30',
          source: 'generated',
          sentToWhatsApp: true
        }
      ],
      tasks: [],
      auditLog: []
    },
    {
      id: 'deal-106',
      code: 'KZ-2026-106',
      title: 'Бытовой долг без расписки: Омаров Т.К.',
      pipelineId: 'sales',
      stageId: 'new',
      salesStageId: 'new',
      readinessTag: 'D',
      clientName: 'Талгат Омаров',
      clientPhone: '+7 (775) 109-44-21',
      clientPhoneMasked: maskPhone('+7 (775) 109-44-21'),
      iinBin: '980115300412',
      iinBinMasked: maskIinBin('980115300412'),
      partyRole: 'creditor',
      opposingPartyName: 'Неизвестно (физ. лицо)',
      opposingPartyIinBin: '',
      debtAmount: 65_000,
      recoveredAmount: 0,
      recommendedFee: 120_000,
      alternativeFeeFixed: 50_000,
      alternativeFeePercent: 20,
      selectedTariffMode: 'fixed',
      scenario: 'court_writ_unsubmitted',
      scenarioLabel: 'Есть решение суда, не передано на исполнение',
      proceedingNumber: 'Отсутствует',
      bailiffName: 'Не назначен',
      bailiffRegion: 'г. Алматы',
      region: 'г. Алматы',
      assignedManagerId: 'u-5',
      assignedLawyerId: 'u-3',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount'],
      whatsappStatus: 'ai_polling',
      unreadCount: 0,
      lastActivityAt: '1 ч назад',
      createdAt: '2026-11-01 11:00',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда', received: false },
        { key: 'writ', label: 'Исполнительный лист', received: false }
      ],
      documents: [],
      tasks: [],
      auditLog: []
    },
    {
      id: 'deal-107',
      code: 'KZ-2026-107',
      title: 'Взыскание задолженности по поставке: ИП «Сарыарка-Трейд»',
      pipelineId: 'sales',
      stageId: 'contract_signed',
      salesStageId: 'contract_signed',
      readinessTag: 'B',
      clientName: 'Гульнара Абдрахманова (ИП «Сарыарка-Трейд»)',
      clientPhone: '+7 (701) 998-41-55',
      clientPhoneMasked: maskPhone('+7 (701) 998-41-55'),
      iinBin: '840918400219',
      iinBinMasked: maskIinBin('840918400219'),
      partyRole: 'creditor',
      opposingPartyName: 'ТОО «МегаПромСнаб»',
      opposingPartyIinBin: '200440015882',
      debtAmount: 4_500_000,
      recoveredAmount: 0,
      recommendedFee: 450_000,
      alternativeFeeFixed: 220_000,
      alternativeFeePercent: 10,
      selectedTariffMode: 'fixed',
      scenario: 'bailiff_inaction',
      scenarioLabel: 'Бездействие ЧСИ по исполнительному листу',
      proceedingNumber: '№ 3319/26-71-0881',
      bailiffName: 'ЧСИ Бейсембаев А.Н. (г. Астана)',
      bailiffRegion: 'г. Астана',
      region: 'г. Астана',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-2',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'scenario', 'iinBin', 'proceedingNumber'],
      whatsappStatus: 'human_active',
      unreadCount: 0,
      lastActivityAt: '30 мин назад',
      createdAt: '2026-10-29 10:00',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда', received: true, fileName: 'Reshenie_Saryarka.pdf', receivedVia: 'whatsapp' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'IL_3319.pdf', receivedVia: 'whatsapp' },
        { key: 'power_of_attorney', label: 'Доверенность представителя', received: true, fileName: 'Doverennost_eGov.pdf', receivedVia: 'whatsapp' }
      ],
      documents: [],
      tasks: [],
      auditLog: []
    },
    // --- CASE MANAGEMENT PIPELINE («Ведение дел») ---
    {
      id: 'deal-201',
      code: 'KZ-2026-201',
      title: 'ИП № 774/26-75: Взыскание с ТОО «АлматыБетонСтрой»',
      pipelineId: 'cases',
      stageId: 'awaiting_reply',
      salesStageId: 'paid',
      caseStageId: 'awaiting_reply',
      readinessTag: 'A',
      clientName: 'Асхат Досымов (ТОО «ТехноКрафт РК»)',
      clientPhone: '+7 (701) 332-18-77',
      clientPhoneMasked: maskPhone('+7 (701) 332-18-77'),
      iinBin: '180240004912',
      iinBinMasked: maskIinBin('180240004912'),
      partyRole: 'creditor',
      opposingPartyName: 'ТОО «АлматыБетонСтрой»',
      opposingPartyIinBin: '140740019283',
      debtAmount: 12_400_000,
      recoveredAmount: 4_800_000,
      recommendedFee: 950_000,
      alternativeFeeFixed: 450_000,
      alternativeFeePercent: 8,
      selectedTariffMode: 'fixed',
      scenario: 'bailiff_inaction',
      scenarioLabel: 'Бездействие ЧСИ по исполнительному листу',
      proceedingNumber: '№ 774/26-75-1904',
      bailiffName: 'ЧСИ Нурпеисов Д.М. (г. Алматы)',
      bailiffRegion: 'г. Алматы',
      region: 'г. Алматы',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-2',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'proceedingNumber'],
      whatsappStatus: 'replied',
      unreadCount: 0,
      lastActivityAt: 'Сегодня, 11:15',
      createdAt: '2026-10-12 09:00',
      handedOffToCasesAt: '2026-10-15 14:30',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда', received: true, fileName: 'Reshenie_201.pdf' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'IL_774.pdf' },
        { key: 'bailiff_decree', label: 'Постановление ЧСИ', received: true, fileName: 'Post_774.pdf' },
        { key: 'power_of_attorney', label: 'Нотариальная доверенность', received: true, fileName: 'Doverennost_201.pdf' }
      ],
      documents: [
        {
          id: 'doc-201-1',
          name: 'Hodataistvo_Arest_Schetov_201.pdf',
          category: 'generated_doc',
          categoryLabel: 'Ходатайство ЧСИ',
          fileType: 'pdf',
          size: '520 КБ',
          uploadedAt: '2026-10-20',
          source: 'generated',
          sentToWhatsApp: true
        }
      ],
      tasks: [
        {
          id: 't-201',
          dealId: 'deal-201',
          title: 'ПРОСРОЧЕНО: Контроль ответа ЧСИ Нурпеисова на ходатайство об аресте спецтехники',
          type: 'bailiff_control',
          typeLabel: 'Контроль ответа ЧСИ (Эскалация)',
          assigneeId: 'u-2',
          assigneeName: 'Алия Касымова',
          createdAt: '2026-10-20',
          dueDate: '2026-10-29',
          workingDaysAllowed: 5,
          workingDaysRemaining: -2,
          skippedHolidays: ['2026-10-25 (День Республики)', '2026-10-26 (Перенос выходного)'],
          status: 'overdue',
          escalatedToExecutive: true,
          proceduralEvent: 'Подано ходатайство ЧСИ (+5 раб. дней РК)'
        }
      ],
      auditLog: []
    },
    {
      id: 'deal-202',
      code: 'KZ-2026-202',
      title: 'ИП № 1920/26-71: Жалоба в СМАС г. Астана на ЧСИ',
      pipelineId: 'cases',
      stageId: 'sent',
      salesStageId: 'paid',
      caseStageId: 'sent',
      readinessTag: 'A',
      clientName: 'Кайрат Сулейменов',
      clientPhone: '+7 (702) 911-04-50',
      clientPhoneMasked: maskPhone('+7 (702) 911-04-50'),
      iinBin: '791022300118',
      iinBinMasked: maskIinBin('791022300118'),
      partyRole: 'creditor',
      opposingPartyName: 'ТОО «СтройИнвестАстана»',
      opposingPartyIinBin: '150840022190',
      debtAmount: 8_900_000,
      recoveredAmount: 3_200_000,
      recommendedFee: 450_000,
      alternativeFeeFixed: 220_000,
      alternativeFeePercent: 10,
      selectedTariffMode: 'fixed',
      scenario: 'bailiff_inaction',
      scenarioLabel: 'Бездействие ЧСИ по исполнительному листу',
      proceedingNumber: '№ 1920/26-71-0315',
      bailiffName: 'ЧСИ Абдрахманов С.К. (г. Астана)',
      bailiffRegion: 'г. Астана',
      region: 'г. Астана',
      assignedManagerId: 'u-5',
      assignedLawyerId: 'u-3',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'proceedingNumber'],
      whatsappStatus: 'replied',
      unreadCount: 0,
      lastActivityAt: 'Сегодня, 09:30',
      createdAt: '2026-10-18 11:00',
      handedOffToCasesAt: '2026-10-21 16:00',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда', received: true, fileName: 'Reshenie_202.pdf' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'IL_1920.pdf' },
        { key: 'power_of_attorney', label: 'Доверенность', received: true, fileName: 'Doverennost_202.pdf' }
      ],
      documents: [],
      tasks: [
        {
          id: 't-202',
          dealId: 'deal-202',
          title: 'Истекает завтра: срок рассмотрения жалобы Палатой ЧСИ г. Астана',
          type: 'court',
          typeLabel: 'Жалоба на ЧСИ (1 раб. день РК)',
          assigneeId: 'u-3',
          assigneeName: 'Данияр Ахметов',
          createdAt: '2026-10-16',
          dueDate: '2026-11-02',
          workingDaysAllowed: 10,
          workingDaysRemaining: 1,
          skippedHolidays: ['2026-10-25 (День Республики)', '2026-10-26 (Перенос выходного)'],
          status: 'due_tomorrow',
          escalatedToExecutive: false,
          proceduralEvent: 'Подана жалоба в порядке ст. 127 Закона РК (+10 раб. дней РК)'
        }
      ],
      auditLog: []
    },
    {
      id: 'deal-203',
      code: 'KZ-2026-203',
      title: 'ИП № 512/26-75: Подготовка ходатайства о запрете на выезд',
      pipelineId: 'cases',
      stageId: 'doc_prep',
      salesStageId: 'paid',
      caseStageId: 'doc_prep',
      readinessTag: 'B',
      clientName: 'Жанар Ибраева',
      clientPhone: '+7 (705) 488-71-23',
      clientPhoneMasked: maskPhone('+7 (705) 488-71-23'),
      iinBin: '870614400912',
      iinBinMasked: maskIinBin('870614400912'),
      partyRole: 'creditor',
      opposingPartyName: 'Сейтказиев Болат Амангельдиевич',
      opposingPartyIinBin: '850911300419',
      debtAmount: 3_450_000,
      recoveredAmount: 1_500_000,
      recommendedFee: 450_000,
      alternativeFeeFixed: 220_000,
      alternativeFeePercent: 10,
      selectedTariffMode: 'fixed',
      scenario: 'alimony_arrears',
      scenarioLabel: 'Взыскание задолженности по алиментам',
      proceedingNumber: '№ 512/26-75-0084',
      bailiffName: 'ЧСИ Тулегенов А.Б. (г. Алматы)',
      bailiffRegion: 'г. Алматы',
      region: 'г. Алматы',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-6',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount'],
      whatsappStatus: 'replied',
      unreadCount: 0,
      lastActivityAt: 'Вчера, 17:45',
      createdAt: '2026-10-24 10:00',
      handedOffToCasesAt: '2026-10-27 12:00',
      requiredDocs: [
        { key: 'court_ruling', label: 'Судебный приказ', received: true, fileName: 'Prikaz_512.pdf' },
        { key: 'bailiff_decree', label: 'Постановление о расчете задолженности', received: true, fileName: 'Raschet_512.pdf' }
      ],
      documents: [],
      tasks: [
        {
          id: 't-203',
          dealId: 'deal-203',
          title: 'Направить ходатайство о временном ограничении на выезд должника (ст. 33)',
          type: 'doc_prep',
          typeLabel: 'Подготовка ходатайства',
          assigneeId: 'u-6',
          assigneeName: 'Мадина Ержанова',
          createdAt: '2026-10-29',
          dueDate: '2026-11-05',
          workingDaysAllowed: 5,
          workingDaysRemaining: 4,
          skippedHolidays: [],
          status: 'on_track',
          escalatedToExecutive: false,
          proceduralEvent: 'Анализ материалов ИП завершен (+5 раб. дней РК)'
        }
      ],
      auditLog: []
    },
    {
      id: 'deal-204',
      code: 'KZ-2026-204',
      title: 'ИП № 889/26-71: Взыскание в пользу АО «Торговый Дом Евразия-Снаб»',
      pipelineId: 'cases',
      stageId: 'completed',
      salesStageId: 'paid',
      caseStageId: 'completed',
      readinessTag: 'B',
      clientName: 'АО «Торговый Дом Евразия-Снаб» (Представитель: Ким В.С.)',
      clientPhone: '+7 (701) 204-88-00',
      clientPhoneMasked: maskPhone('+7 (701) 204-88-00'),
      iinBin: '150240009112',
      iinBinMasked: maskIinBin('150240009112'),
      partyRole: 'creditor',
      opposingPartyName: 'ТОО «АстанаЛогистикГрупп»',
      opposingPartyIinBin: '890512300145',
      debtAmount: 14_200_000,
      recoveredAmount: 14_200_000,
      recommendedFee: 950_000,
      alternativeFeeFixed: 450_000,
      alternativeFeePercent: 8,
      selectedTariffMode: 'fixed',
      scenario: 'debtor_hiding_assets',
      scenarioLabel: 'Розыск имущества и счетов должника (ТОО / ФЛ)',
      proceedingNumber: '№ 889/26-71-0419',
      bailiffName: 'ЧСИ Омаров К.Т. (г. Астана)',
      bailiffRegion: 'г. Астана',
      region: 'г. Астана',
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-3',
      conflictStatus: 'clear',
      aiPopulatedFields: ['debtAmount', 'proceedingNumber'],
      whatsappStatus: 'replied',
      unreadCount: 0,
      lastActivityAt: '2 дня назад',
      createdAt: '2026-09-15 10:00',
      handedOffToCasesAt: '2026-09-18 11:20',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение СМЭС г. Астана', received: true, fileName: 'SMES_Astana_204.pdf' },
        { key: 'writ', label: 'Исполнительный лист', received: true, fileName: 'IL_889.pdf' }
      ],
      documents: [],
      tasks: [],
      auditLog: []
    }
  ])

  // 4. Conflict of Interest Queue (ТЗ §6)
  const conflicts = ref<ConflictRecord[]>([
    {
      id: 'conf-1',
      dealId: 'deal-102',
      dealCode: 'KZ-2026-102',
      newClientName: 'Серикжан Мукашев (ТОО «АстанаЛогистикГрупп»)',
      newClientRole: 'debtor',
      newClientIinBin: '890512300145',
      newProceedingNumber: '№ 889/26-71-0419',
      newDebtAmount: 14_200_000,
      assignedManagerName: 'Айгерим Оспанова',
      matchType: 'opposing_party_ip',
      severity: 'critical',
      matchedDealCode: 'KZ-2026-204',
      matchedEntityName: 'АО «Торговый Дом Евразия-Снаб»',
      matchedEntityRole: 'creditor',
      matchedEntityIinBin: '150240009112',
      matchedProceedingNumber: '№ 889/26-71-0419',
      matchedLawyerName: 'Данияр Ахметов',
      matchedStageName: 'Ведение дел · Завершено',
      detectedAt: 'Сегодня, 10:26',
      status: 'pending'
    },
    {
      id: 'conf-2',
      dealId: 'deal-105',
      dealCode: 'KZ-2026-105',
      newClientName: 'Бауржан Тасмагамбетов (ТОО «Инжиниринг-Плюс»)',
      newClientRole: 'creditor',
      newClientIinBin: '170440021904',
      newProceedingNumber: '№ 2190/26-23-1108',
      newDebtAmount: 18_500_000,
      assignedManagerName: 'Айгерим Оспанова',
      matchType: 'related_bin',
      severity: 'warning',
      matchedDealCode: 'KZ-2025-812',
      matchedEntityName: 'ТОО «Инжиниринг-Плюс Запад» (Аффилированное лицо)',
      matchedEntityRole: 'creditor',
      matchedEntityIinBin: '170440021904',
      matchedProceedingNumber: '№ 1104/25-23-0192',
      matchedLawyerName: 'Алия Касымова',
      matchedStageName: 'Архив · Успешно взыскано',
      detectedAt: 'Вчера, 16:40',
      status: 'approved',
      resolvedBy: 'Нурлан Сатпаев (Руководитель)',
      resolvedAt: 'Вчера, 17:10',
      resolutionComment: 'Конфликта нет: это повторное обращение нашего действующего клиента (взыскателя) по новому должнику.'
    }
  ])

  // Global active deal slide-over state
  const activeDealId = ref<string | null>(null)
  const isDealSlideoverOpen = ref<boolean>(false)
  const initialSlideoverTab = ref<string>('main')

  const activeDeal = computed<Deal | null>(() => {
    if (!activeDealId.value) return null
    return deals.value.find(d => d.id === activeDealId.value) ?? null
  })

  function openDealWorkspace(dealId: string, tab: 'main' | 'docs' | 'deadlines' | 'history' = 'main') {
    activeDealId.value = dealId
    initialSlideoverTab.value = tab
    isDealSlideoverOpen.value = true
  }

  function closeDealWorkspace() {
    isDealSlideoverOpen.value = false
  }

  // Stage Transition Validation Engine (ТЗ §3, §6)
  function validateStageTransition(deal: Deal, targetStageId: StageId): {
    valid: boolean
    reasonTitle?: string
    reasonMessage?: string
    missingFieldType?: 'debt_amount' | 'conflict_check' | 'rejection_reason'
  } {
    if (targetStageId === 'qualified') {
      if (!deal.debtAmount || deal.debtAmount <= 0) {
        return {
          valid: false,
          reasonTitle: 'Укажите сумму долга',
          reasonMessage: 'Перевод на этап «Квалифицирована» требует заполнения суммы задолженности.',
          missingFieldType: 'debt_amount'
        }
      }
    }

    if (targetStageId === 'offer_sent') {
      if (!deal.debtAmount || deal.debtAmount <= 0) {
        return {
          valid: false,
          reasonTitle: 'Укажите сумму долга',
          reasonMessage: 'Для расчёта тарифа и отправки КП укажите сумму задолженности.',
          missingFieldType: 'debt_amount'
        }
      }
      if (deal.conflictStatus === 'flagged') {
        return {
          valid: false,
          reasonTitle: 'Конфликт интересов',
          reasonMessage: 'Обнаружено совпадение по ИИН/БИН или № ИП со встречной стороной. Отправка КП заблокирована до решения руководителя.',
          missingFieldType: 'conflict_check'
        }
      }
    }

    if (targetStageId === 'lost' && !deal.rejectionReason) {
      return {
        valid: false,
        reasonTitle: 'Укажите причину отказа',
        reasonMessage: 'Выберите причину закрытия сделки из списка.',
        missingFieldType: 'rejection_reason'
      }
    }

    return { valid: true }
  }

  function moveDealStage(
    dealId: string,
    targetStageId: StageId,
    extraPayload?: {
      debtAmount?: number
      rejectionReason?: RejectionReason
      rejectionComment?: string
      proceduralEventTitle?: string
      statutoryWorkingDays?: number
    }
  ): { success: boolean; handedOffToCases?: boolean } {
    const deal = deals.value.find(d => d.id === dealId)
    if (!deal) return { success: false }

    if (extraPayload?.debtAmount && extraPayload.debtAmount > 0) {
      updateDealDebtAmount(deal.id, extraPayload.debtAmount)
    }

    if (extraPayload?.rejectionReason) {
      deal.rejectionReason = extraPayload.rejectionReason
      deal.rejectionComment = extraPayload.rejectionComment || ''
    }

    const isSalesTarget = salesStages.value.some(s => s.id === targetStageId)
    const isCaseTarget = caseStages.value.some(s => s.id === targetStageId)

    if (isSalesTarget) {
      deal.salesStageId = targetStageId as SalesStageId
      deal.stageId = targetStageId

      // Automatic handoff to Case Management when moved to "Оплачена" (ТЗ §3, §8)
      if (targetStageId === 'paid') {
        deal.pipelineId = 'cases'
        deal.caseStageId = 'materials'
        deal.stageId = 'materials'
        deal.handedOffToCasesAt = 'Только что (Автопереход)'
        deal.auditLog.unshift({
          id: `aud-${Date.now()}`,
          timestamp: 'Только что',
          actor: 'Digital Pipeline Engine',
          actorType: 'system',
          action: 'Оплата подтверждена -> Автоматическая передача в воронку «Ведение дел»',
          details: 'Карточка передана ответственному юристу на этап «Сбор материалов» со всеми документами из WhatsApp.'
        })
        return { success: true, handedOffToCases: true }
      }
    } else if (isCaseTarget) {
      deal.pipelineId = 'cases'
      deal.caseStageId = targetStageId as CaseStageId
      deal.stageId = targetStageId

      if (extraPayload?.proceduralEventTitle && extraPayload?.statutoryWorkingDays) {
        logProceduralDeadlineTask(
          deal.id,
          extraPayload.proceduralEventTitle,
          extraPayload.statutoryWorkingDays
        )
      }
    }

    deal.lastActivityAt = 'Только что'
    deal.auditLog.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Только что',
      actor: 'Система CRM',
      actorType: 'human',
      action: `Этап изменен на «${getStageName(targetStageId)}»`,
      details: extraPayload?.rejectionReason
        ? `Причина отказа: ${extraPayload.rejectionReason}`
        : 'Переход выполнен в соответствии с правилами воронки.'
    })

    return { success: true }
  }

  function getStageName(stageId: StageId): string {
    const found =
      salesStages.value.find(s => s.id === stageId) ??
      caseStages.value.find(s => s.id === stageId)
    return found ? found.name : stageId
  }

  function updateDealDebtAmount(dealId: string, newDebt: number) {
    const deal = deals.value.find(d => d.id === dealId)
    if (!deal) return
    deal.debtAmount = newDebt
    const calc = settingsStore.calculatePricing(newDebt)
    deal.recommendedFee = calc.recommendedFixedFee
    deal.alternativeFeeFixed = calc.alternativeFixedFee
    deal.alternativeFeePercent = calc.alternativeSuccessPercent

    // Automatic A/B/C/D readiness recalculation
    if (newDebt < 150_000) {
      deal.readinessTag = 'D'
    } else if (deal.readinessTag === 'C' || deal.readinessTag === 'D') {
      deal.readinessTag = 'B'
    }
  }

  function logProceduralDeadlineTask(dealId: string, eventTitle: string, workingDays: number) {
    const deal = deals.value.find(d => d.id === dealId)
    if (!deal) return
    const todayIso = '2026-11-01'
    const calc = settingsStore.calculateKZWorkingDeadline(todayIso, workingDays)

    deal.tasks.unshift({
      id: `t-${Date.now()}`,
      dealId: deal.id,
      title: `Контроль срока РК: ${eventTitle}`,
      type: 'bailiff_control',
      typeLabel: `Срок РК: ${workingDays} раб. дн.`,
      assigneeId: deal.assignedLawyerId,
      assigneeName: 'Назначенный юрист',
      createdAt: todayIso,
      dueDate: calc.targetDate,
      workingDaysAllowed: workingDays,
      workingDaysRemaining: workingDays,
      skippedHolidays: calc.skippedHolidays,
      status: workingDays <= 1 ? 'due_tomorrow' : 'on_track',
      escalatedToExecutive: false,
      proceduralEvent: eventTitle
    })

    deal.auditLog.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Только что',
      actor: 'Калькулятор сроков РК',
      actorType: 'system',
      action: `Рассчитан дедлайн: ${calc.targetDate} (+${workingDays} раб. дней РК)`,
      details: `Исключено выходных: ${calc.skippedWeekends}, праздников РК: ${calc.skippedHolidays.length ? calc.skippedHolidays.join(', ') : '0'}`
    })
  }

  function recordRecoveredAmount(dealId: string, addedAmount: number) {
    const deal = deals.value.find(d => d.id === dealId)
    if (!deal || addedAmount <= 0) return
    const maxDebt = deal.debtAmount ?? addedAmount
    deal.recoveredAmount = Math.min(maxDebt, deal.recoveredAmount + addedAmount)
    if (deal.debtAmount && deal.recoveredAmount >= deal.debtAmount) {
      deal.caseStageId = 'completed'
      deal.stageId = 'completed'
    }
    deal.auditLog.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Только что',
      actor: 'Юрист по делу',
      actorType: 'human',
      action: `Зафиксировано поступление взысканных средств: +${addedAmount.toLocaleString('ru-KZ')} ₸`,
      details: `Всего взыскано по делу: ${deal.recoveredAmount.toLocaleString('ru-KZ')} ₸`
    })
  }

  function resolveConflict(
    conflictId: string,
    decision: 'approved' | 'rejected',
    comment: string,
    executiveName: string
  ) {
    const conflict = conflicts.value.find(c => c.id === conflictId)
    if (!conflict) return

    conflict.status = decision
    conflict.resolvedBy = `${executiveName} (Руководитель)`
    conflict.resolvedAt = 'Только что'
    conflict.resolutionComment = comment

    const deal = deals.value.find(d => d.id === conflict.dealId)
    if (deal) {
      deal.conflictStatus = decision === 'approved' ? 'approved' : 'rejected'
      deal.conflictNote = comment
      if (decision === 'rejected') {
        deal.salesStageId = 'lost'
        deal.stageId = 'lost'
        deal.rejectionReason = 'conflict_of_interest'
        deal.rejectionComment = comment
      }
      deal.auditLog.unshift({
        id: `aud-${Date.now()}`,
        timestamp: 'Только что',
        actor: executiveName,
        actorType: 'human',
        action:
          decision === 'approved'
            ? 'Конфликт интересов проверен: Разрешено продолжение работы'
            : 'Сделка отклонена из-за конфликта интересов',
        details: comment
      })
    }
  }

  function checkManualConflict(query: string): ConflictRecord | null {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matchedDeal = deals.value.find(
      d =>
        d.iinBin.toLowerCase().includes(q) ||
        d.opposingPartyIinBin.toLowerCase().includes(q) ||
        d.proceedingNumber.toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q) ||
        d.opposingPartyName.toLowerCase().includes(q)
    )
    if (!matchedDeal) return null
    return {
      id: `scan-${Date.now()}`,
      dealId: matchedDeal.id,
      dealCode: matchedDeal.code,
      newClientName: 'Проверяемый запрос',
      newClientRole: 'debtor',
      newClientIinBin: matchedDeal.opposingPartyIinBin || matchedDeal.iinBin,
      newProceedingNumber: matchedDeal.proceedingNumber,
      newDebtAmount: matchedDeal.debtAmount || 0,
      assignedManagerName: 'Ручная проверка в базе',
      matchType: 'opposing_party_ip',
      severity: 'critical',
      matchedDealCode: matchedDeal.code,
      matchedEntityName: `${matchedDeal.clientName} vs ${matchedDeal.opposingPartyName}`,
      matchedEntityRole: matchedDeal.partyRole,
      matchedEntityIinBin: matchedDeal.iinBin,
      matchedProceedingNumber: matchedDeal.proceedingNumber,
      matchedLawyerName: 'База действующих дел РК',
      matchedStageName: getStageName(matchedDeal.stageId),
      detectedAt: 'Только что',
      status: 'pending'
    }
  }

  function createNewDeal(payload: {
    clientName: string
    clientPhone: string
    iinBin: string
    debtAmount: number | null
    scenario: Deal['scenario']
    scenarioLabel: string
    proceedingNumber: string
    bailiffName: string
    region: string
  }): Deal {
    const calc = settingsStore.calculatePricing(payload.debtAmount)
    const existingConflict = deals.value.find(
      d =>
        (payload.iinBin && (d.iinBin === payload.iinBin || d.opposingPartyIinBin === payload.iinBin)) ||
        (payload.proceedingNumber &&
          payload.proceedingNumber.length > 4 &&
          d.proceedingNumber === payload.proceedingNumber)
    )

    const id = `deal-${Date.now()}`
    const code = `KZ-2026-${Math.floor(300 + Math.random() * 600)}`

    const newDeal: Deal = {
      id,
      code,
      title: `Взыскание: ${payload.clientName}`,
      pipelineId: 'sales',
      stageId: payload.debtAmount ? 'qualified' : 'new',
      salesStageId: payload.debtAmount ? 'qualified' : 'new',
      readinessTag: payload.debtAmount && payload.debtAmount >= 500_000 ? 'B' : 'C',
      clientName: payload.clientName,
      clientPhone: payload.clientPhone,
      clientPhoneMasked: maskPhone(payload.clientPhone),
      iinBin: payload.iinBin,
      iinBinMasked: maskIinBin(payload.iinBin),
      partyRole: 'creditor',
      opposingPartyName: 'Уточняется по постановлению ЧСИ',
      opposingPartyIinBin: '',
      debtAmount: payload.debtAmount,
      recoveredAmount: 0,
      recommendedFee: calc.recommendedFixedFee,
      alternativeFeeFixed: calc.alternativeFixedFee,
      alternativeFeePercent: calc.alternativeSuccessPercent,
      selectedTariffMode: 'fixed',
      scenario: payload.scenario,
      scenarioLabel: payload.scenarioLabel,
      proceedingNumber: payload.proceedingNumber || 'Уточняется',
      bailiffName: payload.bailiffName || 'Не указан',
      bailiffRegion: payload.region,
      region: payload.region,
      assignedManagerId: 'u-4',
      assignedLawyerId: 'u-2',
      conflictStatus: existingConflict ? 'flagged' : 'clear',
      conflictNote: existingConflict
        ? `Совпадение ИИН/БИН или № ИП со сделкой ${existingConflict.code}`
        : undefined,
      aiPopulatedFields: [],
      whatsappStatus: 'waiting_manager',
      unreadCount: 1,
      lastActivityAt: 'Только что',
      createdAt: 'Сегодня',
      requiredDocs: [
        { key: 'court_ruling', label: 'Решение суда / Судебный приказ', received: false },
        { key: 'writ', label: 'Исполнительный лист', received: false },
        { key: 'bailiff_decree', label: 'Постановление ЧСИ', received: false }
      ],
      documents: [],
      tasks: [],
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          timestamp: 'Только что',
          actor: 'Менеджер CRM',
          actorType: 'human',
          action: 'Создана новая сделка в воронке продаж',
          details: `Клиент: ${payload.clientName}, ИИН/БИН: ${payload.iinBin || 'не указан'}`
        }
      ]
    }

    if (existingConflict) {
      const confId = `conf-${Date.now()}`
      newDeal.conflictId = confId
      conflicts.value.unshift({
        id: confId,
        dealId: newDeal.id,
        dealCode: newDeal.code,
        newClientName: newDeal.clientName,
        newClientRole: 'debtor',
        newClientIinBin: newDeal.iinBin,
        newProceedingNumber: newDeal.proceedingNumber,
        newDebtAmount: newDeal.debtAmount || 0,
        assignedManagerName: 'Айгерим Оспанова',
        matchType: 'duplicate_iin_opposing',
        severity: 'critical',
        matchedDealCode: existingConflict.code,
        matchedEntityName: existingConflict.clientName,
        matchedEntityRole: existingConflict.partyRole,
        matchedEntityIinBin: existingConflict.iinBin,
        matchedProceedingNumber: existingConflict.proceedingNumber,
        matchedLawyerName: 'Алия Касымова',
        matchedStageName: getStageName(existingConflict.stageId),
        detectedAt: 'Только что',
        status: 'pending'
      })
    }

    deals.value.unshift(newDeal)
    return newDeal
  }

  // Computed Aggregates
  const salesDeals = computed(() => deals.value.filter(d => d.pipelineId === 'sales'))
  const caseDeals = computed(() => deals.value.filter(d => d.pipelineId === 'cases'))
  const pendingConflictsCount = computed(
    () => conflicts.value.filter(c => c.status === 'pending').length
  )
  const overdueTasksCount = computed(() =>
    deals.value.reduce(
      (acc, d) => acc + d.tasks.filter(t => t.status === 'overdue').length,
      0
    )
  )

  return {
    salesStages,
    caseStages,
    deals,
    salesDeals,
    caseDeals,
    conflicts,
    pendingConflictsCount,
    overdueTasksCount,
    activeDealId,
    activeDeal,
    isDealSlideoverOpen,
    initialSlideoverTab,
    openDealWorkspace,
    closeDealWorkspace,
    validateStageTransition,
    moveDealStage,
    getStageName,
    updateDealDebtAmount,
    logProceduralDeadlineTask,
    recordRecoveredAmount,
    resolveConflict,
    checkManualConflict,
    createNewDeal
  }
})
