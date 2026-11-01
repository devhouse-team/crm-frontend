<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { formatKZT, pluralizeRu, READINESS_TAG_META } from '~/utils/formatters'
import type { ReadinessTag } from '~/types/crm'

const pipelineStore = usePipelineStore()
const toast = useToast()

const tagBreakdown = computed(() => {
  const tags: ReadinessTag[] = ['A', 'B', 'C', 'D']
  return tags.map((tag) => {
    const matching = pipelineStore.deals.filter(d => d.readinessTag === tag)
    const debtSum = matching.reduce((sum, d) => sum + (d.debtAmount || 0), 0)
    return {
      tag,
      meta: READINESS_TAG_META[tag],
      count: matching.length,
      debtSum
    }
  })
})

const bracketAnalytics = [
  { label: 'До 500 000 ₸', leads: 18, converted: 4, conversionRate: 22, avgFee: 75_000, mainRejection: 'Высокая доля тарифа к долгу' },
  { label: '500 000 ₸ – 2 000 000 ₸', leads: 34, converted: 16, conversionRate: 47, avgFee: 250_000, mainRejection: 'Нет подтверждающих документов' },
  { label: '2 000 000 ₸ – 10 000 000 ₸', leads: 29, converted: 19, conversionRate: 65, avgFee: 450_000, mainRejection: 'Решил вопрос самостоятельно' },
  { label: 'Свыше 10 000 000 ₸', leads: 14, converted: 10, conversionRate: 71, avgFee: 950_000, mainRejection: 'Конфликт интересов' }
]

const rejectionStats = [
  { reason: 'Высокая стоимость относительно суммы долга', count: 14, share: 38 },
  { reason: 'Отсутствуют решение суда или исполнительный лист', count: 11, share: 30 },
  { reason: 'Сумма долга ниже рентабельного порога', count: 7, share: 18 },
  { reason: 'Конфликт интересов со встречной стороной', count: 5, share: 14 }
]

function handleExportCsv() {
  const headers = ['Код', 'Клиент', 'ИИН/БИН', 'Тег', 'Воронка', 'Этап', 'Сумма долга (KZT)', 'Взыскано (KZT)', 'Тариф (KZT)']
  const rows = pipelineStore.deals.map(d => [
    d.code,
    `"${d.clientName}"`,
    d.iinBin,
    d.readinessTag,
    d.pipelineId === 'sales' ? 'Продажи' : 'Дела',
    pipelineStore.getStageName(d.stageId),
    d.debtAmount || 0,
    d.recoveredAmount || 0,
    d.recommendedFee || 0
  ])
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'YurKontrol_Report_2026-11-01.csv'
  link.click()
  URL.revokeObjectURL(url)

  toast.add({
    title: 'Отчёт экспортирован',
    color: 'success',
    icon: 'i-lucide-download'
  })
}
</script>

<template>
  <UDashboardPanel id="analytics-reports-panel">
    <template #header>
      <UDashboardNavbar title="Аналитика">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-lucide-download"
            label="Экспорт CSV"
            @click="handleExportCsv"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6 max-w-[1440px] mx-auto">
        <!-- 1. Conversion by Debt Sum Brackets -->
        <PanelSection title="Конверсия по сумме долга" no-padding>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-default bg-default text-xs font-medium text-muted">
                  <th class="py-2.5 px-4">Диапазон долга</th>
                  <th class="py-2.5 px-4 text-right">Обращений</th>
                  <th class="py-2.5 px-4 text-right">Договоров</th>
                  <th class="py-2.5 px-4">Конверсия</th>
                  <th class="py-2.5 px-4 text-right">Средний чек</th>
                  <th class="py-2.5 px-4">Основная причина отказа</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr v-for="row in bracketAnalytics" :key="row.label" class="hover:bg-accented/30 transition-colors">
                  <td class="py-3 px-4 font-medium text-sm text-highlighted">{{ row.label }}</td>
                  <td class="py-3 px-4 text-right font-mono text-default tabular-nums">{{ row.leads }}</td>
                  <td class="py-3 px-4 text-right font-mono font-semibold text-highlighted tabular-nums">{{ row.converted }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-24 h-1.5 rounded-full bg-accented overflow-hidden">
                        <div class="h-full bg-primary rounded-full" :style="{ width: `${row.conversionRate}%` }" />
                      </div>
                      <span class="font-mono font-medium text-highlighted tabular-nums">{{ row.conversionRate }}%</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-default tabular-nums">{{ formatKZT(row.avgFee) }}</td>
                  <td class="py-3 px-4 text-muted">{{ row.mainRejection }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PanelSection>

        <!-- 2. Two-Column Breakdown: A/B/C/D Triage Distribution + Rejection Reasons -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left (6 cols): A/B/C/D Lead Readiness Breakdown -->
          <div class="lg:col-span-6">
            <PanelSection title="Категории готовности" no-padding>
              <div class="divide-y divide-default text-xs">
                <div
                  v-for="item in tagBreakdown"
                  :key="item.tag"
                  class="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <UBadge :color="item.meta.color" :label="item.meta.shortLabel" />
                      <span class="font-mono text-xs text-muted">
                        {{ pluralizeRu(item.count, 'сделка', 'сделки', 'сделок') }}
                      </span>
                    </div>
                    <p class="text-xs text-muted">{{ item.meta.description }}</p>
                  </div>
                  <div class="text-right font-mono text-sm font-semibold text-highlighted shrink-0 tabular-nums">
                    {{ formatKZT(item.debtSum) }}
                  </div>
                </div>
              </div>
            </PanelSection>
          </div>

          <!-- Right (6 cols): Rejection Reasons Analytics -->
          <div class="lg:col-span-6">
            <PanelSection title="Причины отказов" no-padding>
              <div class="divide-y divide-default text-xs">
                <div
                  v-for="rej in rejectionStats"
                  :key="rej.reason"
                  class="px-4 py-3 space-y-1.5"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-medium text-highlighted">{{ rej.reason }}</span>
                    <span class="font-mono text-muted shrink-0 tabular-nums">
                      <strong class="text-highlighted">{{ rej.share }}%</strong> · {{ rej.count }}
                    </span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-accented overflow-hidden">
                    <div class="h-full bg-error rounded-full" :style="{ width: `${rej.share}%` }" />
                  </div>
                </div>
              </div>
            </PanelSection>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
