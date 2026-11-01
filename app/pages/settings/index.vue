<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import { formatKZT } from '~/utils/formatters'

const settingsStore = useSettingsStore()
const whatsappStore = useWhatsAppStore()
const toast = useToast()

const activeTab = ref<'pricing' | 'calendar' | 'templates'>('pricing')

const sectionTabs = [
  { label: 'Тарифы', value: 'pricing' },
  { label: 'Сроки', value: 'calendar' },
  { label: 'Шаблоны', value: 'templates' }
]

// 1. Live Pricing Simulator state
const simDebtInput = ref<number>(380_000)
const simCalc = computed(() => settingsStore.calculatePricing(simDebtInput.value))

// 2. Live Working-Day Deadline Tester state
const testStartDate = ref<string>('2026-10-22')
const testRuleId = ref<string>('sla-3')
const newHolidayDate = ref<string>('2026-12-17')
const newHolidayTitle = ref<string>('Дополнительный выходной день')

const selectedRule = computed(() => {
  return (
    settingsStore.deadlineRules.find(r => r.id === testRuleId.value) ??
    settingsStore.deadlineRules[0]!
  )
})

const testDeadlineResult = computed(() => {
  return settingsStore.calculateKZWorkingDeadline(
    testStartDate.value,
    selectedRule.value.statutoryWorkingDays
  )
})

function handleSaveBrackets() {
  toast.add({
    title: 'Тарифы сохранены',
    color: 'success',
    icon: 'i-lucide-check'
  })
}

function handleAddHoliday() {
  if (!newHolidayDate.value || !newHolidayTitle.value.trim()) return
  settingsStore.kzHolidays.push({
    date: newHolidayDate.value,
    title: newHolidayTitle.value.trim(),
    officialLawRef: 'Добавлено вручную'
  })
  toast.add({
    title: 'Праздничный день добавлен',
    description: `${newHolidayDate.value} · ${newHolidayTitle.value}`,
    color: 'success',
    icon: 'i-lucide-calendar-plus'
  })
}
</script>

<template>
  <UDashboardPanel id="settings-governance-panel">
    <template #header>
      <UDashboardNavbar title="Настройки">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <div class="border-b border-default">
          <UTabs
            v-model="activeTab"
            :items="sectionTabs"
            variant="link"
            color="primary"
            size="sm"
            :content="false"
            :ui="{
              list: 'p-0 border-b-0',
              trigger: 'px-3.5 py-2 text-xs font-medium'
            }"
          />
        </div>

        <!-- TAB 1: PRICING MATRIX & SIMULATOR -->
        <template v-if="activeTab === 'pricing'">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Editable Bracket Table (8 cols) -->
            <div class="lg:col-span-8">
              <PanelSection title="Тарифная сетка" no-padding>
                <template #actions>
                  <UButton
                    color="primary"
                    variant="solid"
                    size="xs"
                    label="Сохранить"
                    @click="handleSaveBrackets"
                  />
                </template>

                <div class="divide-y divide-default">
                  <div
                    v-for="bracket in settingsStore.pricingBrackets"
                    :key="bracket.id"
                    class="p-4 space-y-3 text-xs"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-semibold text-highlighted text-sm">{{ bracket.label }}</span>
                      <span class="text-xs text-muted">{{ bracket.recommendedPackageName }}</span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label class="block text-xs text-muted mb-1">Базовый тариф, ₸</label>
                        <UInput v-model.number="bracket.fixedFee" type="number" size="sm" class="w-full font-mono" />
                      </div>
                      <div>
                        <label class="block text-xs text-muted mb-1">Порог доли, %</label>
                        <UInput v-model.number="bracket.maxFeePercentOfDebt" type="number" size="sm" class="w-full font-mono" />
                      </div>
                      <div>
                        <label class="block text-xs text-muted mb-1">Аванс по результату, ₸</label>
                        <UInput v-model.number="bracket.altFixedFee" type="number" size="sm" class="w-full font-mono" />
                      </div>
                      <div>
                        <label class="block text-xs text-muted mb-1">Доля от взыскания, %</label>
                        <UInput v-model.number="bracket.altSuccessPercent" type="number" size="sm" class="w-full font-mono" />
                      </div>
                    </div>
                  </div>
                </div>
              </PanelSection>
            </div>

            <!-- Live Pricing Simulator (4 cols) -->
            <div class="lg:col-span-4">
              <PanelSection title="Проверка расчёта">
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-muted mb-1">
                      Сумма долга, ₸
                    </label>
                    <UInput
                      v-model.number="simDebtInput"
                      type="number"
                      size="sm"
                      class="w-full font-mono"
                    />
                    <div class="flex flex-wrap gap-1.5 mt-2">
                      <UButton color="neutral" variant="outline" size="xs" label="380 000 ₸" @click="simDebtInput = 380000" />
                      <UButton color="neutral" variant="outline" size="xs" label="1 500 000 ₸" @click="simDebtInput = 1500000" />
                      <UButton color="neutral" variant="outline" size="xs" label="6 800 000 ₸" @click="simDebtInput = 6800000" />
                    </div>
                  </div>

                  <div class="p-3.5 rounded-lg bg-default border border-default space-y-2 text-xs">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-muted">Диапазон</span>
                      <span class="font-medium text-highlighted text-right">{{ simCalc.bracket.label }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-muted">Базовый тариф</span>
                      <span class="font-mono text-sm font-semibold text-highlighted tabular-nums">
                        {{ formatKZT(simCalc.recommendedFixedFee) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-muted">Доля от долга</span>
                      <UBadge
                        :color="simCalc.isHighRatioWarning ? 'warning' : 'success'"
                        class="font-mono"
                        :label="`${simCalc.feePercentOfDebt}% (≤ ${simCalc.thresholdPercent}%)`"
                      />
                    </div>
                  </div>

                  <UAlert
                    v-if="simCalc.isHighRatioWarning"
                    color="warning"
                    variant="subtle"
                    icon="i-lucide-triangle-alert"
                    title="Тариф выше порога"
                    :description="`Оплата по результату: ${formatKZT(simCalc.alternativeFixedFee)} + ${simCalc.alternativeSuccessPercent}% (${formatKZT(simCalc.estimatedSuccessBonus)})`"
                  />
                </div>
              </PanelSection>
            </div>
          </div>
        </template>

        <!-- TAB 2: WORKING-DAY SLA & OFFICIAL HOLIDAY CALENDAR -->
        <template v-else-if="activeTab === 'calendar'">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Left (7 cols): Procedural SLA Rules & Holiday List -->
            <div class="lg:col-span-7 space-y-6">
              <PanelSection title="Процессуальные сроки" no-padding>
                <div class="divide-y divide-default text-xs">
                  <div
                    v-for="rule in settingsStore.deadlineRules"
                    :key="rule.id"
                    class="p-3.5 flex items-center justify-between gap-4"
                  >
                    <div class="space-y-0.5 min-w-0">
                      <div class="font-medium text-highlighted">{{ rule.eventTitle }}</div>
                      <div class="text-xs text-muted">{{ rule.authority }}</div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <UInput
                        v-model.number="rule.statutoryWorkingDays"
                        type="number"
                        size="xs"
                        class="w-16 font-mono"
                      />
                      <span class="font-mono text-muted">раб. дн.</span>
                    </div>
                  </div>
                </div>
              </PanelSection>

              <PanelSection title="Праздничные дни (2026)" no-padding>
                <div class="p-3.5 border-b border-default flex flex-wrap items-center gap-2">
                  <UInput v-model="newHolidayDate" type="date" size="xs" class="font-mono" />
                  <UInput v-model="newHolidayTitle" size="xs" placeholder="Название праздника..." class="flex-1 min-w-44" />
                  <UButton
                    color="primary"
                    variant="solid"
                    size="xs"
                    icon="i-lucide-plus"
                    label="Добавить"
                    @click="handleAddHoliday"
                  />
                </div>

                <div class="divide-y divide-default max-h-80 overflow-y-auto text-xs">
                  <div
                    v-for="h in settingsStore.kzHolidays"
                    :key="h.date"
                    class="px-4 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="font-mono text-muted shrink-0">{{ h.date }}</span>
                      <span class="font-medium text-highlighted truncate">{{ h.title }}</span>
                    </div>
                    <span class="text-xs text-muted font-mono shrink-0">{{ h.officialLawRef }}</span>
                  </div>
                </div>
              </PanelSection>
            </div>

            <!-- Right (5 cols): Interactive Working-Day Deadline Tester -->
            <div class="lg:col-span-5">
              <PanelSection title="Калькулятор срока">
                <div class="space-y-3.5 text-xs">
                  <div>
                    <label class="block text-muted mb-1">Процессуальное действие</label>
                    <select
                      v-model="testRuleId"
                      aria-label="Процессуальное действие"
                      class="w-full rounded-md border border-default bg-default px-3 py-2 text-xs text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
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
                    <label class="block text-muted mb-1">Дата подачи</label>
                    <UInput v-model="testStartDate" type="date" size="sm" class="w-full font-mono" />
                  </div>

                  <div class="p-3.5 rounded-lg bg-default border border-default space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-muted">Крайний срок</span>
                      <strong class="font-mono text-base text-highlighted">
                        {{ testDeadlineResult.targetDate }}
                      </strong>
                    </div>
                    <div class="space-y-1 pt-2 border-t border-default text-xs text-muted">
                      <div class="flex justify-between">
                        <span>Норматив</span>
                        <span class="font-mono text-default">{{ selectedRule.statutoryWorkingDays }} раб. дн.</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Календарных дней</span>
                        <span class="font-mono text-default">{{ testDeadlineResult.calendarDaysTotal }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Выходных</span>
                        <span class="font-mono text-default">{{ testDeadlineResult.skippedWeekends }}</span>
                      </div>
                      <div class="flex justify-between gap-2">
                        <span class="shrink-0">Праздники</span>
                        <span class="text-default text-right">
                          {{ testDeadlineResult.skippedHolidays.length ? testDeadlineResult.skippedHolidays.join(', ') : 'нет' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </PanelSection>
            </div>
          </div>
        </template>

        <!-- TAB 3: DOCUMENT TEMPLATES & WHATSAPP QUICK TEMPLATES -->
        <template v-else>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <PanelSection title="Документы" no-padding>
              <div class="divide-y divide-default">
                <div
                  v-for="tpl in settingsStore.documentTemplates"
                  :key="tpl.id"
                  class="p-4 space-y-2 text-xs"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-semibold text-highlighted">{{ tpl.title }}</span>
                    <span class="font-mono text-xs text-muted">{{ tpl.format }}</span>
                  </div>
                  <UTextarea v-model="tpl.bodyTemplate" :rows="3" class="w-full font-mono text-xs" />
                </div>
              </div>
            </PanelSection>

            <PanelSection title="Сообщения WhatsApp" no-padding>
              <div class="divide-y divide-default">
                <div
                  v-for="qt in whatsappStore.quickTemplates"
                  :key="qt.id"
                  class="p-4 space-y-2 text-xs"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-semibold text-highlighted">{{ qt.title }}</span>
                    <span class="text-xs text-muted">{{ qt.category }}</span>
                  </div>
                  <UTextarea v-model="qt.body" :rows="3" class="w-full text-xs" />
                </div>
              </div>
            </PanelSection>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
