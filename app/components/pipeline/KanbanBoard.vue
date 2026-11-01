<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { formatCompactKZT, formatKZT } from '~/utils/formatters'
import type { Deal, PipelineStage, StageId, RejectionReason } from '~/types/crm'

const props = defineProps<{
  mode: 'sales' | 'cases'
  stages: PipelineStage[]
  deals: Deal[]
}>()

const pipelineStore = usePipelineStore()
const toast = useToast()

const draggedDealId = ref<string | null>(null)
const dragOverStageId = ref<StageId | null>(null)

// Modal interceptor state
const isValidationModalOpen = ref(false)
const interceptedDeal = ref<Deal | null>(null)
const interceptedTargetStageId = ref<StageId | null>(null)
const blockerType = ref<'debt_amount' | 'conflict_check' | 'rejection_reason' | 'kz_deadline' | null>(null)
const blockerTitle = ref('')
const blockerMessage = ref('')

const mainColumns = computed(() => {
  return props.stages.filter(s => s.id !== 'lost')
})

const lostStage = computed(() => {
  return props.stages.find(s => s.id === 'lost') || null
})

function dealsInStage(stageId: StageId): Deal[] {
  return props.deals.filter(d => d.stageId === stageId)
}

function stageDebtSum(stageId: StageId): number {
  return dealsInStage(stageId).reduce((sum, d) => sum + (d.debtAmount || 0), 0)
}

function onDragStart(deal: Deal) {
  draggedDealId.value = deal.id
}

function onDragOver(stageId: StageId) {
  dragOverStageId.value = stageId
}

function onDragLeave() {
  dragOverStageId.value = null
}

function onDrop(targetStageId: StageId) {
  dragOverStageId.value = null
  if (!draggedDealId.value) return

  const deal = pipelineStore.deals.find(d => d.id === draggedDealId.value)
  draggedDealId.value = null
  if (!deal || deal.stageId === targetStageId) return

  // 1. Check mandatory stage validation rules (ТЗ §3, §6)
  const check = pipelineStore.validateStageTransition(deal, targetStageId)
  if (!check.valid && check.missingFieldType) {
    interceptedDeal.value = deal
    interceptedTargetStageId.value = targetStageId
    blockerType.value = check.missingFieldType
    blockerTitle.value = check.reasonTitle || 'Заполните обязательные данные'
    blockerMessage.value = check.reasonMessage || ''
    isValidationModalOpen.value = true
    return
  }

  // 2. If in Case Management and moving to 'sent' or 'awaiting_reply', prompt RK Working-Day Deadline calculator (ТЗ §9)
  if (props.mode === 'cases' && (targetStageId === 'sent' || targetStageId === 'awaiting_reply')) {
    interceptedDeal.value = deal
    interceptedTargetStageId.value = targetStageId
    blockerType.value = 'kz_deadline'
    blockerTitle.value = 'Контрольный срок'
    blockerMessage.value = 'Выберите процессуальное событие для расчёта срока в рабочих днях.'
    isValidationModalOpen.value = true
    return
  }

  executeStageMove(deal.id, targetStageId)
}

function executeStageMove(
  dealId: string,
  targetStageId: StageId,
  extra?: {
    debtAmount?: number
    rejectionReason?: RejectionReason
    rejectionComment?: string
    proceduralEventTitle?: string
    statutoryWorkingDays?: number
  }
) {
  const res = pipelineStore.moveDealStage(dealId, targetStageId, extra)
  if (res.handedOffToCases) {
    toast.add({
      title: 'Передано в «Дела»',
      description: 'Карточка и документы перенесены в производство.',
      color: 'success',
      icon: 'i-lucide-arrow-right-left'
    })
  } else {
    toast.add({
      title: `Этап: ${pipelineStore.getStageName(targetStageId)}`,
      description: extra?.proceduralEventTitle
        ? `Контрольный срок: ${extra.statutoryWorkingDays} раб. дн.`
        : undefined,
      color: 'primary',
      icon: 'i-lucide-check'
    })
  }
}

function handleModalConfirmed(payload: {
  debtAmount?: number
  rejectionReason?: RejectionReason
  rejectionComment?: string
  proceduralEventTitle?: string
  statutoryWorkingDays?: number
}) {
  if (!interceptedDeal.value || !interceptedTargetStageId.value) return
  executeStageMove(interceptedDeal.value.id, interceptedTargetStageId.value, payload)
}
</script>

<template>
  <div class="flex flex-col h-full gap-3">
    <!-- Horizontal Scrollable Kanban Columns -->
    <div class="flex-1 flex gap-3 overflow-x-auto pb-2 min-h-[480px]">
      <div
        v-for="stage in mainColumns"
        :key="stage.id"
        class="w-68 shrink-0 flex flex-col rounded-lg border transition-colors bg-muted/35"
        :class="
          dragOverStageId === stage.id
            ? 'border-primary bg-primary/5'
            : 'border-default'
        "
        @dragover.prevent="onDragOver(stage.id)"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop(stage.id)"
      >
        <!-- Column Header -->
        <div class="px-3 py-2.5 border-b border-default bg-elevated rounded-t-lg flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-sm font-medium text-highlighted truncate">
              {{ stage.name }}
            </span>
            <span class="text-xs font-mono text-muted shrink-0">
              {{ dealsInStage(stage.id).length }}
            </span>
          </div>
          <span
            v-if="stageDebtSum(stage.id) > 0"
            class="text-xs font-mono text-muted tabular-nums shrink-0"
          >
            {{ formatCompactKZT(stageDebtSum(stage.id)) }}
          </span>
        </div>

        <!-- Column Cards Container -->
        <div class="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)]">
          <div
            v-for="deal in dealsInStage(stage.id)"
            :key="deal.id"
            @dragstart="onDragStart(deal)"
          >
            <DealCardMini :deal="deal" :mode="mode" />
          </div>

          <div
            v-if="dealsInStage(stage.id).length === 0"
            class="py-8 text-center text-xs text-muted select-none"
          >
            Пусто
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Drop Zone for Sales Pipeline: «Закрыто и не реализовано» (ТЗ §3) -->
    <div
      v-if="lostStage"
      class="px-3.5 py-2.5 rounded-lg border transition-colors flex flex-wrap items-center justify-between gap-3"
      :class="
        dragOverStageId === 'lost'
          ? 'border-error bg-error/10'
          : 'border-default bg-elevated'
      "
      @dragover.prevent="onDragOver('lost')"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop('lost')"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-archive-x" class="size-4 text-muted" aria-hidden="true" />
        <span class="text-sm font-medium text-highlighted">
          {{ lostStage.name }}
        </span>
        <span class="text-xs font-mono text-muted">
          {{ dealsInStage('lost').length }}
        </span>
        <span class="text-xs text-muted hidden sm:inline">
          · перетащите карточку для закрытия
        </span>
      </div>

      <span
        v-if="stageDebtSum('lost') > 0"
        class="text-xs font-mono text-muted tabular-nums"
      >
        {{ formatKZT(stageDebtSum('lost')) }}
      </span>
    </div>

    <!-- Mandatory Stage Validation / RK Deadline Modal -->
    <StageValidationModal
      v-model:open="isValidationModalOpen"
      :deal="interceptedDeal"
      :target-stage-id="interceptedTargetStageId"
      :blocker-type="blockerType"
      :reason-title="blockerTitle"
      :reason-message="blockerMessage"
      @confirmed="handleModalConfirmed"
    />
  </div>
</template>
