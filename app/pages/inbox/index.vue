<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { formatKZT, READINESS_TAG_META } from '~/utils/formatters'
import type { StageId } from '~/types/crm'

const pipelineStore = usePipelineStore()
const whatsappStore = useWhatsAppStore()
const settingsStore = useSettingsStore()
const toast = useToast()

const selectedDealId = ref<string>(pipelineStore.deals[0]?.id || 'deal-101')
const queueFilter = ref<'all' | 'waiting_manager' | 'ai_polling' | 'human_active'>('all')
const searchQuery = ref('')

const modeCounts = computed(() => {
  const counts = {
    all: pipelineStore.deals.length,
    waiting_manager: 0,
    ai_polling: 0,
    human_active: 0
  }
  for (const d of pipelineStore.deals) {
    const mode = whatsappStore.threadModes[d.id] || d.whatsappStatus
    if (mode === 'waiting_manager') counts.waiting_manager += 1
    else if (mode === 'ai_polling') counts.ai_polling += 1
    else if (mode === 'human_active') counts.human_active += 1
  }
  return counts
})

const filterTabs = computed(() => [
  {
    label: 'Все',
    value: 'all',
    badge: { label: modeCounts.value.all, color: 'neutral' as const, variant: 'subtle' as const }
  },
  {
    label: 'Ждут',
    value: 'waiting_manager',
    badge:
      modeCounts.value.waiting_manager > 0
        ? { label: modeCounts.value.waiting_manager, color: 'warning' as const, variant: 'subtle' as const }
        : { label: 0, color: 'neutral' as const, variant: 'subtle' as const }
  },
  {
    label: 'ИИ',
    value: 'ai_polling',
    badge: { label: modeCounts.value.ai_polling, color: 'neutral' as const, variant: 'subtle' as const }
  },
  {
    label: 'Мои',
    value: 'human_active',
    badge: { label: modeCounts.value.human_active, color: 'neutral' as const, variant: 'subtle' as const }
  }
])

const sortedThreads = computed(() => {
  return [...pipelineStore.deals]
    .filter((d) => {
      const mode = whatsappStore.threadModes[d.id] || d.whatsappStatus
      if (queueFilter.value !== 'all' && mode !== queueFilter.value) {
        return false
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        return (
          d.clientName.toLowerCase().includes(q) ||
          d.clientPhone.toLowerCase().includes(q) ||
          d.iinBin.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      // Pin escalated (`waiting_manager`) and Tag A to the top of the queue
      const modeA = whatsappStore.threadModes[a.id] || a.whatsappStatus
      const modeB = whatsappStore.threadModes[b.id] || b.whatsappStatus
      const scoreA = (modeA === 'waiting_manager' ? 10 : 0) + (a.readinessTag === 'A' ? 5 : 0)
      const scoreB = (modeB === 'waiting_manager' ? 10 : 0) + (b.readinessTag === 'A' ? 5 : 0)
      return scoreB - scoreA
    })
})

const selectedDeal = computed(() => {
  return (
    pipelineStore.deals.find(d => d.id === selectedDealId.value) ??
    sortedThreads.value[0] ??
    null
  )
})

const selectedPricing = computed(() => {
  if (!selectedDeal.value) return null
  return settingsStore.calculatePricing(selectedDeal.value.debtAmount)
})

function threadDotClass(dealId: string, fallbackStatus: string) {
  const mode = whatsappStore.threadModes[dealId] || fallbackStatus
  if (mode === 'waiting_manager') return 'bg-warning'
  if (mode === 'ai_polling') return 'bg-secondary'
  return 'bg-primary'
}

function handleQuickStageChange(stageId: StageId) {
  if (!selectedDeal.value) return
  const check = pipelineStore.validateStageTransition(selectedDeal.value, stageId)
  if (!check.valid) {
    toast.add({
      title: check.reasonTitle || 'Переход заблокирован',
      description: check.reasonMessage,
      color: 'error',
      icon: 'i-lucide-lock'
    })
    return
  }
  pipelineStore.moveDealStage(selectedDeal.value.id, stageId)
  toast.add({
    title: 'Этап обновлён',
    description: pipelineStore.getStageName(stageId),
    color: 'primary',
    icon: 'i-lucide-check'
  })
}
</script>

<template>
  <UDashboardPanel id="whatsapp-inbox-console">
    <template #header>
      <UDashboardNavbar title="Входящие">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- 3-Column 100% Height Operator Console -->
      <div class="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-64px)] overflow-hidden bg-default">
        <!-- COLUMN 1 (3 cols): Thread Queue & Triage Filters -->
        <div class="lg:col-span-3 border-r border-default flex flex-col h-full overflow-hidden bg-elevated">
          <div class="px-3 pt-3 space-y-2 border-b border-default">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              size="sm"
              placeholder="Поиск..."
              class="w-full"
            />

            <UTabs
              v-model="queueFilter"
              :items="filterTabs"
              variant="link"
              color="primary"
              size="xs"
              :content="false"
              class="w-full"
              :ui="{
                list: 'px-0 py-0 border-b-0 gap-0',
                trigger: 'flex-1 px-1 py-2 text-xs gap-1 justify-center min-w-0',
                trailingBadge: 'px-1 py-0 font-mono'
              }"
            />
          </div>

          <!-- Thread List -->
          <div class="flex-1 overflow-y-auto divide-y divide-default">
            <button
              v-for="item in sortedThreads"
              :key="item.id"
              type="button"
              class="w-full p-3 text-left transition-colors cursor-pointer space-y-1.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              :class="
                selectedDeal?.id === item.id
                  ? 'bg-primary/10'
                  : 'hover:bg-accented/40'
              "
              @click="selectedDealId = item.id"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span
                    class="size-2 rounded-full shrink-0"
                    :class="threadDotClass(item.id, item.whatsappStatus)"
                  />
                  <span class="text-sm font-medium text-highlighted truncate">
                    {{ item.clientName }}
                  </span>
                </div>
                <span class="text-xs font-mono text-muted shrink-0">
                  {{ item.lastActivityAt }}
                </span>
              </div>

              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="font-mono text-default tabular-nums">
                  {{ formatKZT(item.debtAmount) }}
                </span>
                <UBadge
                  v-if="item.conflictStatus === 'flagged'"
                  color="error"
                  label="Конфликт"
                />
                <UBadge
                  v-else
                  :color="READINESS_TAG_META[item.readinessTag].color"
                  :label="READINESS_TAG_META[item.readinessTag].shortLabel"
                />
              </div>

              <div class="text-xs text-muted truncate">
                {{
                  (whatsappStore.messagesByDeal[item.id]?.slice(-1)[0]?.text) ||
                  item.scenarioLabel
                }}
              </div>
            </button>
          </div>
        </div>

        <!-- COLUMN 2 (5 cols): Active WhatsApp Conversation & AI Control Bar -->
        <div class="lg:col-span-5 border-r border-default flex flex-col h-full overflow-hidden">
          <WhatsAppThread v-if="selectedDeal" :deal="selectedDeal" />
        </div>

        <!-- COLUMN 3 (4 cols): Live Deal & AI Brief Inspector -->
        <div
          v-if="selectedDeal"
          class="hidden lg:flex lg:col-span-4 flex-col h-full overflow-y-auto p-3.5 space-y-3.5 bg-elevated"
        >
          <!-- Top Deal Quick Bar -->
          <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-default">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 text-xs text-muted">
                <span class="font-mono">{{ selectedDeal.code }}</span>
                <span>·</span>
                <span>{{ selectedDeal.pipelineId === 'sales' ? 'Продажи' : 'Дела' }}</span>
              </div>
              <h3 class="text-sm font-semibold text-highlighted truncate mt-0.5">
                {{ selectedDeal.title }}
              </h3>
            </div>

            <UButton
              color="neutral"
              variant="outline"
              size="xs"
              icon="i-lucide-panel-right-open"
              label="Открыть сделку"
              class="shrink-0"
              @click="pipelineStore.openDealWorkspace(selectedDeal.id, 'main')"
            />
          </div>

          <!-- Conflict Alert if flagged -->
          <ConflictCheckBanner :deal="selectedDeal" />

          <!-- Pinned Structured AI Brief -->
          <AiBriefCard :deal="selectedDeal" />

          <!-- Quick Deal Controls inside Inbox -->
          <div class="rounded-lg border border-default bg-default p-3.5 space-y-3 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-highlighted">Сделка</span>
              <AiMarker label="Автозаполнение из чата" />
            </div>

            <div>
              <label class="block text-xs text-muted mb-1">Этап</label>
              <select
                :value="selectedDeal.stageId"
                aria-label="Этап воронки"
                class="w-full rounded-md border border-default bg-elevated px-2.5 py-1.5 text-xs font-medium text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
                @change="handleQuickStageChange(($event.target as HTMLSelectElement).value as StageId)"
              >
                <option
                  v-for="st in (selectedDeal.pipelineId === 'sales' ? pipelineStore.salesStages : pipelineStore.caseStages)"
                  :key="st.id"
                  :value="st.id"
                >
                  {{ st.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-default">
              <div>
                <div class="text-xs text-muted">Долг</div>
                <div class="font-mono text-sm font-semibold text-highlighted tabular-nums mt-0.5">
                  {{ formatKZT(selectedDeal.debtAmount) }}
                </div>
              </div>
              <div v-if="selectedPricing">
                <div class="text-xs text-muted">Тариф ({{ selectedPricing.feePercentOfDebt }}%)</div>
                <div class="font-mono text-sm font-semibold text-highlighted tabular-nums mt-0.5">
                  {{ formatKZT(selectedPricing.recommendedFixedFee) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-default text-xs">
              <div>
                <div class="text-muted">ИИН/БИН</div>
                <div class="font-mono text-default mt-0.5">{{ selectedDeal.iinBin }}</div>
              </div>
              <div>
                <div class="text-muted">Производство</div>
                <div class="font-mono text-default truncate mt-0.5">{{ selectedDeal.proceedingNumber }}</div>
              </div>
            </div>
          </div>

          <!-- Document Checklist Summary -->
          <div class="rounded-lg border border-default bg-default p-3.5 space-y-2.5 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-highlighted">Документы</span>
              <UButton
                color="primary"
                variant="link"
                size="xs"
                label="Все шаблоны"
                trailing-icon="i-lucide-arrow-right"
                class="px-0"
                @click="pipelineStore.openDealWorkspace(selectedDeal.id, 'docs')"
              />
            </div>

            <div class="space-y-2">
              <div
                v-for="doc in selectedDeal.requiredDocs"
                :key="doc.key"
                class="flex items-center justify-between gap-2 text-xs"
              >
                <span class="truncate" :class="doc.received ? 'text-default' : 'text-muted'">
                  {{ doc.label }}
                </span>
                <span
                  class="inline-flex items-center gap-1 shrink-0 font-medium"
                  :class="doc.received ? 'text-success-700 dark:text-success-400' : 'text-warning-800 dark:text-warning-400'"
                >
                  <UIcon
                    :name="doc.received ? 'i-lucide-check' : 'i-lucide-clock'"
                    class="size-3.5"
                  />
                  <span>{{ doc.received ? 'Получен' : 'Ожидаем' }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
