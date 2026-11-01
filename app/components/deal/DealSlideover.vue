<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import {
  formatKZT,
  READINESS_TAG_META,
  SCENARIO_LABELS
} from '~/utils/formatters'
import type { StageId } from '~/types/crm'

const pipelineStore = usePipelineStore()
const settingsStore = useSettingsStore()
const toast = useToast()

const deal = computed(() => pipelineStore.activeDeal)

const activeSubTab = ref<'main' | 'docs' | 'deadlines' | 'history'>('main')
const mobilePane = ref<'fields' | 'chat'>('fields')

watch(
  () => pipelineStore.initialSlideoverTab,
  (tab) => {
    if (tab === 'main' || tab === 'docs' || tab === 'deadlines' || tab === 'history') {
      activeSubTab.value = tab
    }
  },
  { immediate: true }
)

// Procedural deadline calculator form inside Sub-Tab 3
const selectedRuleId = ref<string>('sla-3')
const eventStartDate = ref<string>('2026-11-01')
const recoveryInput = ref<number>(500_000)

const selectedRule = computed(() => {
  return (
    settingsStore.deadlineRules.find(r => r.id === selectedRuleId.value) ??
    settingsStore.deadlineRules[0]!
  )
})

const deadlinePreview = computed(() => {
  return settingsStore.calculateKZWorkingDeadline(
    eventStartDate.value,
    selectedRule.value.statutoryWorkingDays
  )
})

function handleLogDeadline() {
  if (!deal.value) return
  pipelineStore.logProceduralDeadlineTask(
    deal.value.id,
    selectedRule.value.eventTitle,
    selectedRule.value.statutoryWorkingDays
  )
  toast.add({
    title: 'Срок добавлен',
    description: `${deadlinePreview.value.targetDate} (${selectedRule.value.statutoryWorkingDays} раб. дн.)`,
    color: 'success',
    icon: 'i-lucide-calendar-check'
  })
}

function handleRecordRecovery() {
  if (!deal.value || recoveryInput.value <= 0) return
  pipelineStore.recordRecoveredAmount(deal.value.id, Number(recoveryInput.value))
  toast.add({
    title: 'Оплата внесена',
    description: `+${formatKZT(recoveryInput.value)}`,
    color: 'success',
    icon: 'i-lucide-banknote'
  })
}

const availableStages = computed(() => {
  if (!deal.value) return []
  return deal.value.pipelineId === 'sales'
    ? pipelineStore.salesStages
    : pipelineStore.caseStages
})

function handleStageChange(targetStageId: StageId) {
  if (!deal.value) return
  const check = pipelineStore.validateStageTransition(deal.value, targetStageId)
  if (!check.valid) {
    toast.add({
      title: check.reasonTitle || 'Переход заблокирован',
      description: check.reasonMessage,
      color: 'error',
      icon: 'i-lucide-lock'
    })
    return
  }

  const res = pipelineStore.moveDealStage(deal.value.id, targetStageId)
  if (res.handedOffToCases) {
    toast.add({
      title: 'Передано в «Дела»',
      description: 'Карточка и документы перенесены в производство.',
      color: 'success',
      icon: 'i-lucide-arrow-right-left'
    })
  } else {
    toast.add({
      title: 'Этап обновлён',
      description: pipelineStore.getStageName(targetStageId),
      color: 'primary',
      icon: 'i-lucide-check'
    })
  }
}
</script>

<template>
  <USlideover
    v-model:open="pipelineStore.isDealSlideoverOpen"
    side="right"
    :ui="{ content: 'max-w-[94vw] xl:max-w-[1220px] w-full p-0' }"
    title="Сделка"
    description="Карточка сделки и чат WhatsApp"
  >
    <template #content>
      <div v-if="deal" class="flex flex-col h-full bg-default overflow-hidden">
        <!-- Sticky Top Workspace Header -->
        <div class="px-4 py-3 bg-elevated border-b border-default flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="font-mono text-xs text-muted shrink-0">{{ deal.code }}</span>
            <h2 class="text-base font-semibold text-highlighted truncate">
              {{ deal.title }}
            </h2>
            <UBadge
              v-if="deal.conflictStatus === 'flagged'"
              color="error"
              label="Конфликт"
              class="shrink-0"
            />
            <UBadge
              v-else
              :color="READINESS_TAG_META[deal.readinessTag].color"
              :label="READINESS_TAG_META[deal.readinessTag].shortLabel"
              class="shrink-0"
            />
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Stage Selector with Mandatory Guard -->
            <select
              :value="deal.stageId"
              aria-label="Этап сделки"
              class="text-xs rounded-md border border-default bg-default px-2.5 py-1.5 font-medium text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
              @change="handleStageChange(($event.target as HTMLSelectElement).value as StageId)"
            >
              <option
                v-for="st in availableStages"
                :key="st.id"
                :value="st.id"
              >
                {{ st.name }}
              </option>
            </select>

            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-x"
              aria-label="Закрыть карточку"
              @click="pipelineStore.closeDealWorkspace()"
            />
          </div>
        </div>

        <!-- Mobile Segmented Switcher (<1024px) -->
        <div class="flex lg:hidden border-b border-default bg-muted/40 p-1.5 gap-1.5">
          <UButton
            :color="mobilePane === 'fields' ? 'primary' : 'neutral'"
            :variant="mobilePane === 'fields' ? 'solid' : 'ghost'"
            size="xs"
            block
            class="flex-1"
            label="Карточка"
            @click="mobilePane = 'fields'"
          />
          <UButton
            :color="mobilePane === 'chat' ? 'primary' : 'neutral'"
            :variant="mobilePane === 'chat' ? 'solid' : 'ghost'"
            size="xs"
            block
            class="flex-1"
            :label="(deal.unreadCount || 0) > 0 ? `Чат (${deal.unreadCount})` : 'Чат'"
            @click="mobilePane = 'chat'"
          />
        </div>

        <!-- Main Split-Pane Workspace -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          <!-- LEFT PANE (7 cols on lg) -->
          <div
            class="lg:col-span-7 flex flex-col h-full border-r border-default overflow-hidden"
            :class="mobilePane === 'chat' ? 'hidden lg:flex' : 'flex'"
          >
            <!-- 4 Sub-Tabs -->
            <div class="flex items-center gap-1 px-4 border-b border-default bg-elevated overflow-x-auto">
              <button
                v-for="tab in [
                  { id: 'main', label: 'Карточка', count: null },
                  { id: 'docs', label: 'Документы', count: deal.documents.length },
                  { id: 'deadlines', label: 'Сроки', count: deal.tasks.length },
                  { id: 'history', label: 'История', count: null }
                ]"
                :key="tab.id"
                type="button"
                class="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                :class="
                  activeSubTab === tab.id
                    ? 'border-primary text-highlighted'
                    : 'border-transparent text-muted hover:text-default'
                "
                @click="activeSubTab = tab.id as any"
              >
                <span>{{ tab.label }}</span>
                <span v-if="tab.count !== null" class="font-mono text-muted">
                  {{ tab.count }}
                </span>
              </button>
            </div>

            <!-- Scrollable Sub-Tab Body -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <!-- SUB-TAB 1: КАРТОЧКА -->
              <template v-if="activeSubTab === 'main'">
                <ConflictCheckBanner :deal="deal" />

                <AiBriefCard :deal="deal" collapsible />

                <DebtPricingWidget :deal="deal" />

                <!-- Structured Legal & Enforcement Proceeding Fields -->
                <div class="rounded-lg border border-default bg-elevated p-4 space-y-3">
                  <h3 class="text-sm font-semibold text-highlighted">
                    Реквизиты
                  </h3>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <label for="deal-client-name" class="block text-xs text-muted mb-1">Клиент</label>
                      <UInput id="deal-client-name" v-model="deal.clientName" size="sm" class="w-full" />
                    </div>

                    <div>
                      <label for="deal-iin-bin" class="text-xs text-muted mb-1 flex items-center gap-1.5">
                        <span>ИИН / БИН</span>
                        <AiMarker v-if="deal.aiPopulatedFields.includes('iinBin')" />
                      </label>
                      <UInput id="deal-iin-bin" v-model="deal.iinBin" size="sm" class="w-full font-mono" />
                    </div>

                    <div>
                      <label for="deal-scenario" class="text-xs text-muted mb-1 flex items-center gap-1.5">
                        <span>Ситуация</span>
                        <AiMarker v-if="deal.aiPopulatedFields.includes('scenario')" />
                      </label>
                      <select
                        id="deal-scenario"
                        v-model="deal.scenario"
                        class="w-full text-xs rounded-md border border-default bg-default px-2.5 py-1.5 text-default focus-visible:outline-2 focus-visible:outline-primary"
                        @change="deal.scenarioLabel = SCENARIO_LABELS[deal.scenario] || deal.scenarioLabel"
                      >
                        <option
                          v-for="(label, key) in SCENARIO_LABELS"
                          :key="key"
                          :value="key"
                        >
                          {{ label }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label for="deal-proceeding" class="text-xs text-muted mb-1 flex items-center gap-1.5">
                        <span>Номер ИП</span>
                        <AiMarker v-if="deal.aiPopulatedFields.includes('proceedingNumber')" />
                      </label>
                      <UInput id="deal-proceeding" v-model="deal.proceedingNumber" size="sm" class="w-full font-mono" />
                    </div>

                    <div>
                      <label for="deal-bailiff" class="block text-xs text-muted mb-1">Судебный исполнитель (ЧСИ)</label>
                      <UInput id="deal-bailiff" v-model="deal.bailiffName" size="sm" class="w-full" />
                    </div>

                    <div>
                      <label for="deal-opposing" class="block text-xs text-muted mb-1">Вторая сторона</label>
                      <UInput id="deal-opposing" v-model="deal.opposingPartyName" size="sm" class="w-full" />
                    </div>
                  </div>

                  <!-- Recovery Progress -->
                  <div class="pt-3 border-t border-default flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xs text-muted">
                      Взыскано:
                      <strong class="font-mono font-medium text-highlighted tabular-nums">{{ formatKZT(deal.recoveredAmount) }}</strong>
                      из <span class="font-mono tabular-nums">{{ formatKZT(deal.debtAmount) }}</span>
                    </span>

                    <div class="flex items-center gap-1.5">
                      <UInput
                        v-model.number="recoveryInput"
                        type="number"
                        size="xs"
                        class="font-mono w-32"
                        aria-label="Сумма оплаты"
                        placeholder="Сумма ₸"
                      />
                      <UButton
                        color="neutral"
                        variant="outline"
                        size="xs"
                        icon="i-lucide-plus"
                        label="Внести оплату"
                        @click="handleRecordRecovery"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- SUB-TAB 2: ДОКУМЕНТЫ -->
              <template v-else-if="activeSubTab === 'docs'">
                <DocumentGenerator :deal="deal" />
              </template>

              <!-- SUB-TAB 3: СРОКИ -->
              <template v-else-if="activeSubTab === 'deadlines'">
                <div class="rounded-lg border border-default bg-elevated p-4 space-y-3">
                  <h3 class="text-sm font-semibold text-highlighted">
                    Новый срок
                  </h3>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div class="sm:col-span-2">
                      <label for="deadline-rule" class="block text-xs text-muted mb-1">Процессуальное событие</label>
                      <select
                        id="deadline-rule"
                        v-model="selectedRuleId"
                        class="w-full text-xs rounded-md border border-default bg-default px-2.5 py-1.5 text-default focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <option
                          v-for="rule in settingsStore.deadlineRules"
                          :key="rule.id"
                          :value="rule.id"
                        >
                          {{ rule.eventTitle }} (+{{ rule.statutoryWorkingDays }} раб. дн.)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label for="deadline-start" class="block text-xs text-muted mb-1">Дата подачи</label>
                      <UInput id="deadline-start" v-model="eventStartDate" type="date" size="sm" class="w-full font-mono" />
                    </div>
                  </div>

                  <div class="p-3 rounded-md bg-default border border-default text-xs flex flex-wrap items-center justify-between gap-2">
                    <div class="space-y-0.5">
                      <div>
                        До <strong class="font-mono font-medium text-highlighted">{{ deadlinePreview.targetDate }}</strong>
                        <span class="text-muted">
                          ({{ selectedRule.statutoryWorkingDays }} раб. дн. · {{ deadlinePreview.calendarDaysTotal }} кал. дн.)
                        </span>
                      </div>
                      <div class="text-muted">
                        Выходных: {{ deadlinePreview.skippedWeekends }} ·
                        Праздники: {{ deadlinePreview.skippedHolidays.length ? deadlinePreview.skippedHolidays.join(', ') : 'нет' }}
                      </div>
                    </div>

                    <UButton
                      color="primary"
                      variant="solid"
                      size="xs"
                      icon="i-lucide-plus"
                      label="Добавить срок"
                      @click="handleLogDeadline"
                    />
                  </div>
                </div>

                <!-- Active Tasks List -->
                <div class="space-y-2">
                  <h3 class="text-sm font-semibold text-highlighted">
                    Задачи
                  </h3>
                  <div
                    v-for="task in deal.tasks"
                    :key="task.id"
                    class="p-3 rounded-lg border border-default bg-elevated space-y-1"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-medium text-highlighted">{{ task.title }}</span>
                      <UBadge
                        :color="
                          task.status === 'overdue'
                            ? 'error'
                            : task.status === 'due_tomorrow'
                              ? 'warning'
                              : 'neutral'
                        "
                        :label="
                          task.status === 'overdue'
                            ? 'Просрочено'
                            : task.status === 'due_tomorrow'
                              ? `Завтра · ${task.dueDate}`
                              : `До ${task.dueDate}`
                        "
                      />
                    </div>
                    <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>{{ task.assigneeName }}</span>
                      <span class="font-mono">{{ task.workingDaysAllowed }} раб. дн.</span>
                      <span v-if="task.skippedHolidays.length">
                        Праздники: {{ task.skippedHolidays.join(', ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- SUB-TAB 4: ИСТОРИЯ -->
              <template v-else-if="activeSubTab === 'history'">
                <div class="rounded-lg border border-default bg-elevated overflow-hidden">
                  <div class="px-4 py-3 border-b border-default">
                    <h3 class="text-sm font-semibold text-highlighted">
                      Журнал действий
                    </h3>
                  </div>

                  <div class="divide-y divide-default">
                    <div
                      v-for="entry in deal.auditLog"
                      :key="entry.id"
                      class="px-4 py-2.5 space-y-0.5"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-medium text-highlighted">{{ entry.action }}</span>
                        <span class="text-xs text-muted font-mono">{{ entry.timestamp }}</span>
                      </div>
                      <p class="text-xs text-muted">{{ entry.details }}</p>
                      <div class="text-xs text-toned">
                        {{ entry.actor }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- RIGHT PANE (5 cols on lg): Persistent Platform WhatsApp Chat -->
          <div
            class="lg:col-span-5 flex flex-col h-full min-h-0 overflow-hidden"
            :class="mobilePane === 'fields' ? 'hidden lg:flex' : 'flex'"
          >
            <WhatsAppThread :deal="deal" />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
