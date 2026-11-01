<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import { formatKZT, READINESS_TAG_META } from '~/utils/formatters'
import type { Deal } from '~/types/crm'

const props = defineProps<{
  deal: Deal
  mode?: 'sales' | 'cases'
}>()

const pipelineStore = usePipelineStore()
const whatsappStore = useWhatsAppStore()

const tagMeta = computed(() => READINESS_TAG_META[props.deal.readinessTag])

const threadMode = computed(() => {
  return whatsappStore.threadModes[props.deal.id] || props.deal.whatsappStatus
})

const primaryTask = computed(() => props.deal.tasks[0] || null)

const recoveryPercent = computed(() => {
  if (!props.deal.debtAmount || props.deal.debtAmount <= 0) return 0
  return Math.min(100, Math.round((props.deal.recoveredAmount / props.deal.debtAmount) * 100))
})

const feePercent = computed(() => {
  if (!props.deal.debtAmount || props.deal.debtAmount <= 0) return null
  return Math.round((props.deal.recommendedFee / props.deal.debtAmount) * 100)
})

function handleCardClick() {
  pipelineStore.openDealWorkspace(
    props.deal.id,
    props.mode === 'cases' ? 'deadlines' : 'main'
  )
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    draggable="true"
    class="rounded-md border border-default bg-elevated hover:border-accented p-3 space-y-1.5 transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary"
    @click="handleCardClick"
    @keydown.enter.prevent="handleCardClick"
    @keydown.space.prevent="handleCardClick"
  >
    <!-- Row 1: Code + Single Priority Badge -->
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-mono text-muted truncate">{{ deal.code }}</span>
      <UBadge
        v-if="deal.conflictStatus === 'flagged'"
        color="error"
        label="Конфликт"
      />
      <UBadge
        v-else-if="mode === 'sales' && threadMode === 'waiting_manager'"
        color="warning"
        label="Ждёт ответа"
      />
      <UBadge
        v-else
        :color="tagMeta.color"
        :label="tagMeta.shortLabel"
      />
    </div>

    <!-- Row 2: Client Name -->
    <div class="text-sm font-medium text-highlighted line-clamp-2 leading-snug">
      {{ deal.clientName }}
    </div>

    <!-- Row 3: Financial Line -->
    <template v-if="mode !== 'cases'">
      <div class="flex items-baseline justify-between gap-2 text-xs font-mono tabular-nums">
        <span :class="deal.debtAmount ? 'font-medium text-highlighted' : 'text-warning-700 dark:text-warning-400'">
          {{ formatKZT(deal.debtAmount) }}
        </span>
        <span v-if="feePercent !== null" class="text-muted">
          тариф {{ feePercent }}%
        </span>
      </div>
    </template>

    <template v-else>
      <div class="space-y-1">
        <div class="flex items-baseline justify-between gap-2 text-xs font-mono tabular-nums">
          <span class="font-medium text-highlighted">{{ formatKZT(deal.debtAmount) }}</span>
          <span class="text-muted">взыскано {{ recoveryPercent }}%</span>
        </div>
        <div class="w-full h-1 rounded-full bg-accented overflow-hidden">
          <div
            class="h-full bg-primary rounded-full"
            :style="{ width: `${recoveryPercent}%` }"
          />
        </div>
      </div>
    </template>

    <!-- Row 4: Status Dot + SLA / Activity + Unread Count -->
    <div class="pt-1 flex items-center justify-between gap-2 text-xs">
      <div v-if="primaryTask" class="flex items-center gap-1.5 min-w-0">
        <span
          class="size-1.5 rounded-full shrink-0"
          :class="{
            'bg-error': primaryTask.status === 'overdue',
            'bg-warning': primaryTask.status === 'due_tomorrow',
            'bg-accented': primaryTask.status === 'on_track'
          }"
          aria-hidden="true"
        />
        <span
          class="truncate"
          :class="{
            'text-error-700 dark:text-error-400 font-medium': primaryTask.status === 'overdue',
            'text-warning-800 dark:text-warning-400 font-medium': primaryTask.status === 'due_tomorrow',
            'text-muted': primaryTask.status === 'on_track'
          }"
        >
          {{
            primaryTask.status === 'overdue'
              ? `Просрочено ${Math.abs(primaryTask.workingDaysRemaining)} раб. дн.`
              : primaryTask.status === 'due_tomorrow'
                ? 'Срок завтра'
                : `Срок ${primaryTask.workingDaysRemaining} раб. дн.`
          }}
        </span>
      </div>
      <span v-else class="text-muted truncate">{{ deal.lastActivityAt }}</span>

      <span
        v-if="deal.unreadCount > 0"
        class="inline-flex items-center gap-1 font-mono font-medium text-primary shrink-0"
        :aria-label="`Непрочитанных сообщений: ${deal.unreadCount}`"
      >
        <UIcon name="i-lucide-message-square" class="size-3.5" aria-hidden="true" />
        {{ deal.unreadCount }}
      </span>
    </div>
  </div>
</template>
