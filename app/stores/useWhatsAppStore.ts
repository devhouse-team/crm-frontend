import { defineStore } from 'pinia'
import type { WhatsAppMessage, QuickTemplate, ThreadMode } from '~/types/whatsapp'
import type { AIBrief, SmartWhisperSuggestion } from '~/types/ai-agent'
import { usePipelineStore } from './usePipelineStore'
import { formatKZT } from '~/utils/formatters'

export const useWhatsAppStore = defineStore('whatsapp', () => {
  const pipelineStore = usePipelineStore()

  // Global PII Masking Inspector Toggle (`🛡️ Режим ИИ-лога`)
  const showMaskedPiiLogMode = ref<boolean>(false)

  // Per-Deal Thread Mode (`ai_polling` | `waiting_manager` | `human_active`)
  const threadModes = ref<Record<string, ThreadMode>>({
    'deal-101': 'waiting_manager',
    'deal-102': 'waiting_manager',
    'deal-103': 'waiting_manager',
    'deal-104': 'ai_polling',
    'deal-105': 'human_active',
    'deal-106': 'ai_polling',
    'deal-107': 'human_active',
    'deal-201': 'human_active',
    'deal-202': 'human_active',
    'deal-203': 'human_active',
    'deal-204': 'human_active'
  })

  // Structured AI Briefs (`Резюме ИИ` — ТЗ §2)
  const aiBriefs = ref<Record<string, AIBrief>>({
    'deal-101': {
      dealId: 'deal-101',
      summary: 'Взыскатель (ИП/ФЛ) имеет решение СМЭС г. Алматы о взыскании 6 800 000 ₸ с ТОО «КазСтройМонтаж-7». ЧСИ Смагулов Б.К. 4 месяца не накладывает арест на спецтехнику и вынес отказ.',
      currentStageSummary: 'Исполнительное производство № 1452/26-75-3112 возбуждено. Получено постановление об отказе — срок подачи жалобы (10 раб. дней РК) истекает завтра.',
      missingDocuments: ['Удостоверение личности взыскателя (для оформления доверенности)'],
      recommendedNextStep: 'Срочно перехватить диалог, отправить КП на 450 000 ₸ (6.6% от долга) и подать жалобу в порядке ст. 127 Закона РК сегодня.',
      aiQuizStep: 'Квалификация завершена (4/4)',
      readinessTag: 'A',
      readinessReason: 'Горит процессуальный срок обжалования (остался 1 рабочий день РК)',
      lastUpdated: '2 мин назад',
      piiProtectedCount: 3
    },
    'deal-102': {
      dealId: 'deal-102',
      summary: 'Директор ТОО «АстанаЛогистикГрупп» просит снять арест со счетов компании на 14 200 000 ₸ по ИП № 889/26-71-0419 (ЧСИ Омаров К.Т.).',
      currentStageSummary: 'Арест наложен на все расчетные счета БВУ РК. ВНИМАНИЕ: Обнаружен конфликт интересов — наша компания уже представляла взыскателя АО «Торговый Дом Евразия-Снаб» по этому же ИП.',
      missingDocuments: ['Все первичные постановления получены'],
      recommendedNextStep: 'НЕ ОТПРАВЛЯТЬ КП до решения Руководителя в модуле «Конфликты интересов».',
      aiQuizStep: 'Квалификация завершена · Заблокировано проверкой конфликта',
      readinessTag: 'B',
      readinessReason: 'Крупный чек и все документы на руках, но обнаружен конфликт сторон по ИП № 889/26-71-0419',
      lastUpdated: '11 мин назад',
      piiProtectedCount: 4
    },
    'deal-103': {
      dealId: 'deal-103',
      summary: 'У клиента на руках решение суда г. Шымкент и исполнительный лист на 380 000 ₸ к физлицу Калиеву Р.С. Клиент написал, что стандартный тариф 120 000 ₸ для нее слишком дорогой.',
      currentStageSummary: 'Исполнительный лист еще не предъявлен ЧСИ. Возражение по цене («Дорого относительно суммы долга»).',
      missingDocuments: ['Полный комплект документов получен в WhatsApp'],
      recommendedNextStep: 'Предложить альтернативный тариф (Частичный Success-Fee): 50 000 ₸ аванс + 20% по факту реального взыскания.',
      aiQuizStep: 'Квалификация завершена (4/4)',
      readinessTag: 'B',
      readinessReason: 'Документы готовы, требуется согласование сниженного фиксированного платежа',
      lastUpdated: '18 мин назад',
      piiProtectedCount: 2
    },
    'deal-104': {
      dealId: 'deal-104',
      summary: 'Задолженность по алиментам более 3 лет в г. Караганда (ИП № 410/25-19-0921, ЧСИ Жумагулов Е.А.). Должник скрывает реальный доход.',
      currentStageSummary: 'AI-Агент ведет опрос: запрошено постановление ЧСИ о расчете задолженности для определения точной суммы долга.',
      missingDocuments: ['Постановление ЧСИ о расчете задолженности по алиментам', 'Удостоверение личности'],
      recommendedNextStep: 'Дождаться загрузки фото постановления в WhatsApp (AI-Агент автоматически извлечет сумму долга).',
      aiQuizStep: 'Шаг 3 из 4: Ожидание суммы долга и постановления ЧСИ',
      readinessTag: 'C',
      readinessReason: 'Клиент еще не знает точную сумму рассчитанной задолженности',
      lastUpdated: '5 мин назад',
      piiProtectedCount: 2
    },
    'deal-105': {
      dealId: 'deal-105',
      summary: 'Взыскание 18 500 000 ₸ с ТОО «ТрансОйлСервис» по решению СМЭС Атырауской области. Требуется розыск спецтехники и дебиторской задолженности.',
      currentStageSummary: 'КП на 950 000 ₸ (5.1% от долга) отправлено в WhatsApp. Ожидаем согласования договора директором.',
      missingDocuments: ['Все документы получены'],
      recommendedNextStep: 'Отправить проект Договора на оказание юридических услуг в WhatsApp.',
      aiQuizStep: 'Передано менеджеру',
      readinessTag: 'B',
      readinessReason: 'Крупный корпоративный долг, полный пакет документов',
      lastUpdated: '42 мин назад',
      piiProtectedCount: 2
    },
    'deal-201': {
      dealId: 'deal-201',
      summary: 'Активное дело в воронке «Ведение дел»: взыскано 4 800 000 ₸ из 12 400 000 ₸. ЧСИ Нурпеисов Д.М. просрочил ответ на ходатайство об аресте спецтехники на 2 рабочих дня РК.',
      currentStageSummary: 'Этап: Ожидание ответа. Контрольный срок истек с учетом праздников РК (День Республики).',
      missingDocuments: ['Комплект полный'],
      recommendedNextStep: 'Сформировать «Повторное обращение» или «Жалобу на бездействие ЧСИ» и уведомить клиента.',
      aiQuizStep: 'Исполнение договора (Ведение дел)',
      readinessTag: 'A',
      readinessReason: 'Просрочен процессуальный срок ответа ЧСИ',
      lastUpdated: 'Сегодня, 11:15',
      piiProtectedCount: 2
    }
  })

  // WhatsApp Message Threads (ТЗ §1, §2)
  const messagesByDeal = ref<Record<string, WhatsAppMessage[]>>({
    'deal-101': [
      {
        id: 'm-101-1',
        dealId: 'deal-101',
        sender: 'client',
        senderName: 'Ерлан Бекмухамедов',
        text: 'Здравствуйте! У меня на руках решение СМЭС г. Алматы о взыскании 6 800 000 тенге с ТОО «КазСтройМонтаж-7». Мой ИИН 860412301492, тел +7 701 554 82 19. ЧСИ Смагулов по ИП № 1452/26-75-3112 уже 4 месяца ничего не делает!',
        maskedText: 'Здравствуйте! У меня на руках решение СМЭС г. Алматы о взыскании 6 800 000 тенге с ТОО «КазСтройМонтаж-7». Мой ИИН [ИИН_СКРЫТ], тел [ТЕЛ_СКРЫТ]. ЧСИ Смагулов по ИП № 1452/26-75-3112 уже 4 месяца ничего не делает!',
        timestamp: '09:40',
        deliveryStatus: 'read',
        containsPii: true,
        piiTypes: ['ИИН/БИН', 'Телефон'],
        extractedFields: [
          { fieldKey: 'debtAmount', fieldLabel: 'Сумма долга', extractedValue: '6 800 000 ₸', confidence: 99 },
          { fieldKey: 'proceedingNumber', fieldLabel: 'Номер ИП', extractedValue: '№ 1452/26-75-3112', confidence: 98 },
          { fieldKey: 'scenario', fieldLabel: 'Ситуация', extractedValue: 'Бездействие ЧСИ', confidence: 96 }
        ]
      },
      {
        id: 'm-101-2',
        dealId: 'deal-101',
        sender: 'ai_agent',
        senderName: 'ИИ-агент ЮрКонтроль',
        text: 'Здравствуйте, Ерлан! Принял Ваше обращение по ИП № 1452/26-75-3112 (сумма долга 6 800 000 ₸). Подскажите, выносил ли ЧСИ Смагулов письменное постановление об отказе или бездействует без ответа? Направьте, пожалуйста, фото или PDF документов сюда в чат.',
        timestamp: '09:41',
        deliveryStatus: 'read'
      },
      {
        id: 'm-101-3',
        dealId: 'deal-101',
        sender: 'client',
        senderName: 'Ерлан Бекмухамедов',
        text: 'Да, он прислал постановление об отказе в аресте спецтехники 9 рабочих дней назад! Срок обжалования 10 рабочих дней заканчивается уже завтра! Вот файлы решения суда и постановления ЧСИ. Соедините со старшим специалистом, пожалуйста.',
        timestamp: '10:14',
        deliveryStatus: 'read',
        attachments: [
          {
            id: 'att-101-1',
            fileName: 'Reshenie_SMES_Almaty_101.pdf',
            fileType: 'pdf',
            fileSize: '1.4 МБ',
            categoryLabel: 'Решение суда',
            savedToDealDocs: true,
            previewSummary: 'СМЭС г. Алматы · Взыскать с ТОО «КазСтройМонтаж-7» 6 800 000 ₸'
          },
          {
            id: 'att-101-2',
            fileName: 'Postanovlenie_CHSI_Smagulov.pdf',
            fileType: 'pdf',
            fileSize: '840 КБ',
            categoryLabel: 'Постановление ЧСИ',
            savedToDealDocs: true,
            previewSummary: 'ЧСИ Смагулов Б.К. · ИП № 1452/26-75-3112 · Постановление'
          }
        ],
        extractedFields: [
          { fieldKey: 'readinessTag', fieldLabel: 'Готовность лида', extractedValue: 'A — Срочно (истекает срок 10 раб. дн.)', confidence: 99 }
        ]
      },
      {
        id: 'm-101-4',
        dealId: 'deal-101',
        sender: 'system',
        kind: 'warning',
        senderName: 'AI Handoff Engine',
        text: 'Клиент запросил специалиста + обнаружен горящий срок обжалования (Тег A — Срочно). Диалог закреплен вверху очереди менеджера, создана срочная задача юристу на сегодня.',
        timestamp: '10:15',
        deliveryStatus: 'read'
      }
    ],
    'deal-102': [
      {
        id: 'm-102-1',
        dealId: 'deal-102',
        sender: 'client',
        senderName: 'Серикжан Мукашев (ТОО «АстанаЛогистикГрупп»)',
        text: 'Добрый день. Нам ЧСИ Омаров К.Т. заблокировал все счета ТОО (БИН 890512300145) по исполнительному производству № 889/26-71-0419 на сумму 14 200 000 тенге в пользу АО «Торговый Дом Евразия-Снаб». Можете срочно подготовить заявление об отмене ареста?',
        maskedText: 'Добрый день. Нам ЧСИ Омаров К.Т. заблокировал все счета ТОО (БИН [ИИН_СКРЫТ]) по исполнительному производству № 889/26-71-0419 на сумму 14 200 000 тенге в пользу АО «Торговый Дом Евразия-Снаб». Можете срочно подготовить заявление об отмене ареста?',
        timestamp: '10:25',
        deliveryStatus: 'read',
        containsPii: true,
        piiTypes: ['ИИН/БИН'],
        attachments: [
          {
            id: 'att-102-1',
            fileName: 'Arest_CHSI_Omarov_889.pdf',
            fileType: 'pdf',
            fileSize: '1.1 МБ',
            categoryLabel: 'Постановление ЧСИ',
            savedToDealDocs: true
          }
        ],
        extractedFields: [
          { fieldKey: 'iinBin', fieldLabel: 'ИИН/БИН', extractedValue: '890512300145', confidence: 99 },
          { fieldKey: 'proceedingNumber', fieldLabel: 'Номер ИП', extractedValue: '№ 889/26-71-0419', confidence: 99 }
        ]
      },
      {
        id: 'm-102-2',
        dealId: 'deal-102',
        sender: 'system',
        kind: 'error',
        senderName: 'Conflict of Interest Gate',
        text: 'СТОП: Автоматическая проверка выявила совпадение по ИП № 889/26-71-0419 и БИН 890512300145. Наша компания уже представляет взыскателя АО «Торговый Дом Евразия-Снаб» (дело KZ-2026-204). Отправка КП заблокирована до решения Руководителя.',
        timestamp: '10:26',
        deliveryStatus: 'read'
      }
    ],
    'deal-103': [
      {
        id: 'm-103-1',
        dealId: 'deal-103',
        sender: 'client',
        senderName: 'Динара Садвакасова',
        text: 'Здравствуйте! Сумма долга по исполнительному листу 380 000 тенге (ИИН 921104400812). Вы написали базовый тариф 120 000 тенге, но для меня это слишком дорого относительно суммы долга — почти треть! Есть ли вариант с меньшей предоплатой?',
        maskedText: 'Здравствуйте! Сумма долга по исполнительному листу 380 000 тенге (ИИН [ИИН_СКРЫТ]). Вы написали базовый тариф 120 000 тенге, но для меня это слишком дорого относительно суммы долга — почти треть! Есть ли вариант с меньшей предоплатой?',
        timestamp: '11:04',
        deliveryStatus: 'read',
        containsPii: true,
        piiTypes: ['ИИН/БИН']
      }
    ],
    'deal-104': [
      {
        id: 'm-104-1',
        dealId: 'deal-104',
        sender: 'client',
        senderName: 'Айжан Нургалиева',
        text: 'Здравствуйте! Бывший муж не платит алименты уже 3 года по ИП № 410/25-19-0921 в Караганде. Мой ИИН 940721401290.',
        maskedText: 'Здравствуйте! Бывший муж не платит алименты уже 3 года по ИП № 410/25-19-0921 в Караганде. Мой ИИН [ИИН_СКРЫТ].',
        timestamp: '12:10',
        deliveryStatus: 'read',
        containsPii: true,
        piiTypes: ['ИИН/БИН']
      },
      {
        id: 'm-104-2',
        dealId: 'deal-104',
        sender: 'ai_agent',
        senderName: 'ИИ-агент ЮрКонтроль',
        text: 'Здравствуйте, Айжан! Мы поможем рассчитать задолженность, арестовать счета и ограничить выезд должника. Подскажите, известна ли Вам точная сумма задолженности по постановлению ЧСИ? Если постановление на руках, отправьте его фото в этот чат.',
        timestamp: '12:11',
        deliveryStatus: 'read'
      }
    ],
    'deal-105': [
      {
        id: 'm-105-1',
        dealId: 'deal-105',
        sender: 'manager',
        senderName: 'Айгерим Оспанова (Менеджер)',
        text: 'Бауржан, направляю Вам Коммерческое предложение по взысканию 18 500 000 ₸ с ТОО «ТрансОйлСервис». Тариф составляет 950 000 ₸ (всего 5.1% от суммы долга).',
        timestamp: '11:30',
        deliveryStatus: 'read',
        attachments: [
          {
            id: 'att-105-1',
            fileName: 'KP_KZ-2026-105_Inzhiniring.pdf',
            fileType: 'pdf',
            fileSize: '410 КБ',
            categoryLabel: 'Коммерческое предложение',
            savedToDealDocs: true
          }
        ]
      }
    ],
    'deal-201': [
      {
        id: 'm-201-1',
        dealId: 'deal-201',
        sender: 'manager',
        senderName: 'Алия Касымова (Старший юрист)',
        text: 'Асхат, добрый день! По Вашему делу ИП № 774/26-75 уже взыскано 4 800 000 ₸. По оставшимся 7 600 000 ₸ у ЧСИ Нурпеисова истек 5-дневный рабочий срок ответа на наше ходатайство. Сегодня направляем повторное досудебное требование и жалобу в Палату ЧСИ г. Алматы.',
        timestamp: '11:15',
        deliveryStatus: 'read'
      }
    ]
  })

  // 4 Quick Message Templates (WABA HSM & Quick Replies — ТЗ §1, §10)
  const quickTemplates = ref<QuickTemplate[]>([
    {
      id: 'qt-1',
      code: 'greeting',
      title: 'Приветствие и диагностика',
      category: 'WABA HSM',
      variables: ['{{client_name}}', '{{deal_code}}'],
      body: 'Здравствуйте, {{client_name}}! Вас приветствует юридическая служба «ЮрКонтроль» (обращение {{deal_code}}). Для экспресс-оценки перспективы взыскания напишите, пожалуйста, сумму задолженности и на какой стадии сейчас находится дело (суд или ЧСИ).'
    },
    {
      id: 'qt-2',
      code: 'doc_request',
      title: 'Запрос документов',
      category: 'Быстрый ответ',
      variables: ['{{client_name}}', '{{proceeding_number}}'],
      body: '{{client_name}}, для подготовки правовой позиции по производству {{proceeding_number}} направьте, пожалуйста, ответным сообщением в этот WhatsApp-чат фото или PDF: 1) Решения суда / судебного приказа; 2) Исполнительного листа; 3) Постановления ЧСИ.'
    },
    {
      id: 'qt-3',
      code: 'reminder',
      title: 'Напоминание о сроке',
      category: 'WABA HSM',
      variables: ['{{client_name}}', '{{debt_amount}}'],
      body: 'Уважаемый(-ая) {{client_name}}, напоминаем, что срок обжалования действий (бездействия) судебного исполнителя по ст. 127 Закона об исполнительном производстве составляет 10 рабочих дней. Чтобы не пропустить срок взыскания {{debt_amount}}, ожидаем от Вас недостающие документы сегодня.'
    },
    {
      id: 'qt-4',
      code: 'proposal',
      title: 'Отправка КП',
      category: 'WABA HSM',
      variables: ['{{client_name}}', '{{debt_amount}}', '{{recommended_fee}}'],
      body: '{{client_name}}, мы провели правовой аудит Вашего дела на сумму {{debt_amount}} и проверили отсутствие конфликта интересов. Направляем персональное Коммерческое предложение (тариф: {{recommended_fee}}). Готовы запустить подачу ходатайств ЧСИ сегодня после подписания договора.'
    }
  ])

  function getSmartWhispersForDeal(dealId: string): SmartWhisperSuggestion[] {
    const deal = pipelineStore.deals.find(d => d.id === dealId)
    if (!deal) return []

    const suggestions: SmartWhisperSuggestion[] = []

    // 1. If fee % is high (>25%) or in negotiation (like deal-103), offer Success-Fee objection handler
    if (
      deal.debtAmount &&
      (deal.recommendedFee / deal.debtAmount) * 100 > 25
    ) {
      suggestions.push({
        id: 'sw-objection',
        label: 'Предложить оплату по результату',
        triggerContext: 'Услуга > 25% от долга',
        category: 'objection_expensive',
        replyText: `${deal.clientName.split(' ')[0]}, понимаю Вас! Поскольку сумма долга составляет ${formatKZT(deal.debtAmount)}, мы можем предложить специальный тариф с оплатой за результат: фиксированный старт всего ${formatKZT(deal.alternativeFeeFixed)} + ${deal.alternativeFeePercent}% только после фактического поступления денег от должника на Ваш счет.`
      })
    }

    // 2. If Tag A (urgent deadline)
    if (deal.readinessTag === 'A') {
      suggestions.push({
        id: 'sw-urgent',
        label: 'Срочно: срок 10 раб. дн.',
        triggerContext: 'Тег A — Срочно',
        category: 'qualification',
        replyText: `${deal.clientName.split(' ')[0]}, я подключился к Вашему диалогу вместе со старшим юристом. Мы проверили даты с учетом праздничного календаря — подать жалобу на ЧСИ нужно не позднее завтрашнего рабочего дня. Направляю КП и договор, чтобы подать жалобу в СМАС/Палату ЧСИ сегодня.`
      })
    }

    // 3. Missing documents follow-up
    const missing = deal.requiredDocs.filter(r => !r.received)
    if (missing.length > 0) {
      suggestions.push({
        id: 'sw-docs',
        label: `Запросить документы: ${missing.map(m => m.label).join(', ')}`,
        triggerContext: 'Не хватает документов',
        category: 'doc_followup',
        replyText: `${deal.clientName.split(' ')[0]}, для запуска работы по ИП ${deal.proceedingNumber} нам осталось получить: ${missing.map(m => m.label).join(', ')}. Вы можете просто сфотографировать документ на телефон и отправить в этот чат.`
      })
    }

    // 4. Default commercial proposal whisper
    suggestions.push({
      id: 'sw-kp',
      label: `Согласовать КП · ${formatKZT(deal.recommendedFee)}`,
      triggerContext: 'Переход к договору',
      category: 'schedule_call',
      replyText: `${deal.clientName.split(' ')[0]}, по Вашему делу (${formatKZT(deal.debtAmount)}) рекомендованный тариф полного сопровождения составляет ${formatKZT(deal.recommendedFee)}. Подскажите, удобно ли подписать договор онлайн через ЭЦП / eGov Mobile сегодня?`
    })

    return suggestions.slice(0, 3)
  }

  function interpolateTemplate(rawBody: string, dealId: string): string {
    const deal = pipelineStore.deals.find(d => d.id === dealId)
    if (!deal) return rawBody
    const feePercent =
      deal.debtAmount && deal.debtAmount > 0
        ? ((deal.recommendedFee / deal.debtAmount) * 100).toFixed(1)
        : '10'

    return rawBody
      .replace(/\{\{client_name\}\}/g, deal.clientName)
      .replace(/\{\{deal_code\}\}/g, deal.code)
      .replace(/\{\{iin_bin\}\}/g, deal.iinBin || 'Не указан')
      .replace(/\{\{client_phone\}\}/g, deal.clientPhone)
      .replace(/\{\{debt_amount\}\}/g, formatKZT(deal.debtAmount))
      .replace(/\{\{scenario_label\}\}/g, deal.scenarioLabel)
      .replace(/\{\{recommended_fee\}\}/g, formatKZT(deal.recommendedFee))
      .replace(/\{\{fee_percent\}\}/g, feePercent)
      .replace(/\{\{proceeding_number\}\}/g, deal.proceedingNumber)
      .replace(/\{\{bailiff_name\}\}/g, deal.bailiffName)
      .replace(/\{\{opposing_party\}\}/g, deal.opposingPartyName)
  }

  function sendMessage(
    dealId: string,
    text: string,
    options?: {
      sender?: 'manager' | 'ai_agent' | 'client'
      senderName?: string
      isTemplate?: boolean
      templateTitle?: string
      attachment?: {
        fileName: string
        fileType: 'pdf' | 'image' | 'docx'
        fileSize: string
        categoryLabel: string
      }
    }
  ) {
    if (!text.trim() && !options?.attachment) return
    const list = messagesByDeal.value[dealId] ?? (messagesByDeal.value[dealId] = [])

    const sender = options?.sender ?? 'manager'
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      dealId,
      sender,
      senderName:
        options?.senderName ??
        (sender === 'manager' ? 'Менеджер' : 'ИИ-агент ЮрКонтроль'),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'read',
      isTemplate: options?.isTemplate,
      templateTitle: options?.templateTitle,
      attachments: options?.attachment
        ? [
            {
              id: `att-${Date.now()}`,
              fileName: options.attachment.fileName,
              fileType: options.attachment.fileType,
              fileSize: options.attachment.fileSize,
              categoryLabel: options.attachment.categoryLabel,
              savedToDealDocs: true
            }
          ]
        : undefined
    }

    list.push(newMsg)

    const deal = pipelineStore.deals.find(d => d.id === dealId)
    if (deal) {
      deal.lastActivityAt = 'Только что'
      if (sender === 'manager') {
        deal.unreadCount = 0
        deal.whatsappStatus = 'human_active'
        threadModes.value[dealId] = 'human_active'
      }
      if (options?.attachment) {
        deal.documents.unshift({
          id: `doc-${Date.now()}`,
          name: options.attachment.fileName,
          category: 'generated_doc',
          categoryLabel: options.attachment.categoryLabel,
          fileType: options.attachment.fileType === 'docx' ? 'docx' : 'pdf',
          size: options.attachment.fileSize,
          uploadedAt: 'Только что',
          source: 'generated',
          sentToWhatsApp: true
        })
      }
    }
  }

  function toggleThreadControl(dealId: string, targetMode: ThreadMode) {
    threadModes.value[dealId] = targetMode
    const deal = pipelineStore.deals.find(d => d.id === dealId)
    if (!deal) return

    deal.whatsappStatus = targetMode
    if (targetMode === 'human_active') {
      deal.unreadCount = 0
    }

    const list = messagesByDeal.value[dealId] ?? (messagesByDeal.value[dealId] = [])
    list.push({
      id: `sys-${Date.now()}`,
      dealId,
      sender: 'system',
      kind: 'info',
      senderName: 'AI Control Console',
      text:
        targetMode === 'human_active'
          ? 'Менеджер взял диалог. Автоответы ИИ на паузе.'
          : 'Диалог передан ИИ.',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'read'
    })
  }

  // Simulator: Incoming WhatsApp Lead with Live AI Qualification & PII Masking (for Stakeholder Demo)
  function simulateIncomingWhatsAppLead() {
    const created = pipelineStore.createNewDeal({
      clientName: 'Марат Жумадилов (ТОО «КазАгроТрейд»)',
      clientPhone: '+7 (701) 884-29-10',
      iinBin: '910412300412',
      debtAmount: 5_400_000,
      scenario: 'bailiff_inaction',
      scenarioLabel: 'Бездействие ЧСИ по исполнительному листу',
      proceedingNumber: '№ 2910/26-75-4401',
      bailiffName: 'ЧСИ Каримов Т.А. (г. Алматы)',
      region: 'г. Алматы'
    })

    created.aiPopulatedFields = ['debtAmount', 'iinBin', 'proceedingNumber', 'scenario']
    created.readinessTag = 'B'
    created.whatsappStatus = 'waiting_manager'
    threadModes.value[created.id] = 'waiting_manager'

    aiBriefs.value[created.id] = {
      dealId: created.id,
      summary: 'Взыскатель ТОО «КазАгроТрейд» обратился по WhatsApp: долг 5 400 000 ₸ подтвержден решением СМЭС. ЧСИ Каримов Т.А. не направляет запросы в банки.',
      currentStageSummary: 'AI-Агент автоматически извлек сумму долга (5 400 000 ₸), ИИН/БИН и № ИП, замаскировал персональные данные и перевел сделку в «Квалифицирована».',
      missingDocuments: ['Исполнительный лист (запрошен ИИ-агентом)'],
      recommendedNextStep: 'Отправить КП на 450 000 ₸ (8.3% от суммы долга).',
      aiQuizStep: 'Квалификация ИИ завершена',
      readinessTag: 'B',
      readinessReason: 'Сумма долга 5.4 млн ₸ рентабельна, конфликт интересов не обнаружен',
      lastUpdated: 'Только что',
      piiProtectedCount: 2
    }

    messagesByDeal.value[created.id] = [
      {
        id: `sim-1-${Date.now()}`,
        dealId: created.id,
        sender: 'client',
        senderName: 'Марат Жумадилов (ТОО «КазАгроТрейд»)',
        text: 'Добрый день! Пишу вам по поводу взыскания долга 5 400 000 тенге. Мой ИИН 910412300412, тел +7 701 884 29 10. Исполнительное производство № 2910/26-75-4401 у ЧСИ Каримова Т.А., движения нет.',
        maskedText: 'Добрый день! Пишу вам по поводу взыскания долга 5 400 000 тенге. Мой ИИН [ИИН_СКРЫТ], тел [ТЕЛ_СКРЫТ]. Исполнительное производство № 2910/26-75-4401 у ЧСИ Каримова Т.А., движения нет.',
        timestamp: 'Только что',
        deliveryStatus: 'read',
        containsPii: true,
        piiTypes: ['ИИН/БИН', 'Телефон'],
        extractedFields: [
          { fieldKey: 'debtAmount', fieldLabel: 'Сумма долга', extractedValue: '5 400 000 ₸', confidence: 99 },
          { fieldKey: 'iinBin', fieldLabel: 'ИИН/БИН', extractedValue: '910412300412', confidence: 99 },
          { fieldKey: 'proceedingNumber', fieldLabel: 'Номер ИП', extractedValue: '№ 2910/26-75-4401', confidence: 98 }
        ]
      },
      {
        id: `sim-2-${Date.now()}`,
        dealId: created.id,
        sender: 'ai_agent',
        senderName: 'ИИ-агент ЮрКонтроль',
        text: 'Здравствуйте, Марат! Ваше обращение зарегистрировано (сделка ' + created.code + '). Мы проверили базу: конфликта интересов нет. По сумме долга 5 400 000 ₸ готов подключить профильного юриста для подачи жалобы и ареста счетов должника.',
        timestamp: 'Только что',
        deliveryStatus: 'read'
      }
    ]

    return created
  }

  const totalUnreadCount = computed(() =>
    pipelineStore.deals.reduce((sum, d) => sum + (d.unreadCount || 0), 0)
  )

  const waitingManagerCount = computed(
    () =>
      pipelineStore.deals.filter(
        d => (threadModes.value[d.id] || d.whatsappStatus) === 'waiting_manager'
      ).length
  )

  return {
    showMaskedPiiLogMode,
    threadModes,
    aiBriefs,
    messagesByDeal,
    quickTemplates,
    totalUnreadCount,
    waitingManagerCount,
    getSmartWhispersForDeal,
    interpolateTemplate,
    sendMessage,
    toggleThreadControl,
    simulateIncomingWhatsAppLead
  }
})
