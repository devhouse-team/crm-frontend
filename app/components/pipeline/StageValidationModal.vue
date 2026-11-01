<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { REJECTION_REASON_LABELS, formatKZT } from '~/utils/formatters'
import type { Deal, StageId, RejectionReason } from '~/types/crm'

const props = defineProps<{
  open: boolean
  deal: Deal | null
  targetStageId: StageId | null
  blockerType: 'debt_amount' | 'conflict_check' | 'rejection_reason' | 'kz_deadline' | null
  reasonTitle?: string
  reasonMessage?: string
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  confirmed: [payload: {
    debtAmount?: number
    rejectionReason?: RejectionReason
    rejectionComment?: string
    proceduralEventTitle?: string
    statutoryWorkingDays?: number
  }]
}>()

const pipelineStore = usePipelineStore()
const settingsStore = useSettingsStore()

const debtInput = ref<number>(1_500_000)
const selectedRejection = ref<RejectionReason>('expensive_relative_to_debt')
const rejectionComment = ref('')
const selectedRuleId = ref<string>('sla-2')

const selectedRule = computed(() => {
  return (
    settingsStore.deadlineRules.find(r => r.id === selectedRuleId.value) ??
    settingsStore.deadlineRules[0]!
  )
})

const deadlineCalc = computed(() => {
  return settingsStore.calculateKZWorkingDeadline(
    '2026-11-01',
    selectedRule.value.statutoryWorkingDays
  )
})

const pricingPreview = computed(() => {
  return settingsStore.calculatePricing(debtInput.value)
})

function handleConfirm() {
  if (props.blockerType === 'debt_amount') {
    if (!debtInput.value || debtInput.value <= 0) return
    emit('confirmed', { debtAmount: Number(debtInput.value) })
  } else if (props.blockerType === 'rejection_reason') {
    emit('confirmed', {
      rejectionReason: selectedRejection.value,
      rejectionComment: rejectionComment.value
    })
  } else if (props.blockerType === 'kz_deadline') {
    emit('confirmed', {
      proceduralEventTitle: selectedRule.value.eventTitle,
      statutoryWorkingDays: selectedRule.value.statutoryWorkingDays
    })
  }
  emit('update:open', false)
}

function handleOpenConflictQueue() {
  emit('update:open', false)
  if (props.deal) {
    pipelineStore.openDealWorkspace(props.deal.id, 'main')
  }
}
</script>

<template>
  <UModal
    :open="open"
    :title="reasonTitle || 'Заполните обязательные данные'"
    :description="reasonMessage || 'Заполните обязательные поля перед сменой этапа.'"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div v-if="deal" class="space-y-4 text-sm">
        <div class="px-3 py-2 rounded-md bg-muted/50 border border-default flex items-center justify-between gap-2 text-xs">
          <div class="min-w-0 truncate">
            <span class="font-mono text-muted">{{ deal.code }}</span> ·
            <span class="font-medium text-highlighted">{{ deal.clientName }}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-muted">{{ pipelineStore.getStageName(deal.stageId) }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3.5 text-muted" aria-hidden="true" />
            <UBadge
              color="primary"
              :label="targetStageId ? pipelineStore.getStageName(targetStageId) : ''"
            />
          </div>
        </div>

        <!-- 1. Missing Debt Amount Blocker (ТЗ §3) -->
        <div v-if="blockerType === 'debt_amount'" class="space-y-3">
          <div>
            <label for="modal-debt-input" class="block text-xs font-medium text-highlighted mb-1">
              Сумма долга (₸)
            </label>
            <UInput
              id="modal-debt-input"
              v-model.number="debtInput"
              type="number"
              size="md"
              class="font-mono"
              placeholder="2500000"
            />
          </div>

          <div class="p-3 rounded-md bg-muted/50 border border-default flex items-center justify-between text-xs">
            <span class="text-muted">Рекомендованный тариф</span>
            <span class="font-mono font-medium text-highlighted tabular-nums">
              {{ formatKZT(pricingPreview.recommendedFixedFee) }} ({{ pricingPreview.feePercentOfDebt }}%)
            </span>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" label="Отмена" @click="emit('update:open', false)" />
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-check"
              label="Сохранить и перевести"
              @click="handleConfirm"
            />
          </div>
        </div>

        <!-- 2. Conflict of Interest Gate Blocker (ТЗ §6) -->
        <div v-else-if="blockerType === 'conflict_check'" class="space-y-3">
          <UAlert
            color="error"
            variant="subtle"
            icon="i-lucide-shield-alert"
            :title="`Совпадение по ИИН/БИН ${deal.iinBin}`"
            :description="deal.conflictNote || `Компания уже представляет другую сторону по производству ${deal.proceedingNumber}.`"
          />

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" label="Закрыть" @click="emit('update:open', false)" />
            <UButton
              color="error"
              variant="solid"
              icon="i-lucide-panel-right-open"
              label="Открыть сделку"
              @click="handleOpenConflictQueue"
            />
          </div>
        </div>

        <!-- 3. Mandatory Rejection Reason Picker (ТЗ §3) -->
        <div v-else-if="blockerType === 'rejection_reason'" class="space-y-3">
          <div>
            <label for="modal-rejection-select" class="block text-xs font-medium text-highlighted mb-1">
              Причина отказа
            </label>
            <select
              id="modal-rejection-select"
              v-model="selectedRejection"
              class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
            >
              <option
                v-for="(label, key) in REJECTION_REASON_LABELS"
                :key="key"
                :value="key"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div>
            <label for="modal-rejection-comment" class="block text-xs text-muted mb-1">Комментарий</label>
            <UTextarea
              id="modal-rejection-comment"
              v-model="rejectionComment"
              :rows="2"
              placeholder="Детали отказа"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" label="Отмена" @click="emit('update:open', false)" />
            <UButton
              color="error"
              variant="solid"
              icon="i-lucide-archive"
              label="Закрыть сделку"
              @click="handleConfirm"
            />
          </div>
        </div>

        <!-- 4. Kazakhstan Procedural Working-Day Deadline Calculator (ТЗ §9) -->
        <div v-else-if="blockerType === 'kz_deadline'" class="space-y-3">
          <div>
            <label for="modal-rule-select" class="block text-xs font-medium text-highlighted mb-1">
              Процессуальное событие
            </label>
            <select
              id="modal-rule-select"
              v-model="selectedRuleId"
              class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
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

          <div class="p-3 rounded-md bg-muted/50 border border-default space-y-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-muted">Контрольная дата</span>
              <span class="font-mono font-medium text-highlighted">
                {{ deadlineCalc.targetDate }} ({{ selectedRule.statutoryWorkingDays }} раб. дн.)
              </span>
            </div>
            <div class="text-muted">
              Выходных: {{ deadlineCalc.skippedWeekends }} · Праздники: {{ deadlineCalc.skippedHolidays.length ? deadlineCalc.skippedHolidays.join(', ') : 'нет' }}
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" label="Пропустить" @click="emit('update:open', false)" />
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-calendar-check"
              label="Сохранить срок"
              @click="handleConfirm"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
