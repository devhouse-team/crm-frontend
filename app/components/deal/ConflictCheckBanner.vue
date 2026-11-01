<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useAuthStore } from '~/stores/useAuthStore'
import type { Deal } from '~/types/crm'

const props = defineProps<{
  deal: Deal
}>()

const pipelineStore = usePipelineStore()
const authStore = useAuthStore()
const toast = useToast()

const resolutionComment = ref('Проверено: конфликт интересов отсутствует.')

const conflictRecord = computed(() => {
  return pipelineStore.conflicts.find(c => c.dealId === props.deal.id)
})

function handleDecision(decision: 'approved' | 'rejected') {
  if (!conflictRecord.value) return
  pipelineStore.resolveConflict(
    conflictRecord.value.id,
    decision,
    resolutionComment.value,
    authStore.currentUser.name
  )

  toast.add({
    title: decision === 'approved' ? 'Конфликт разрешён' : 'Сделка отклонена',
    description:
      decision === 'approved'
        ? 'Отправка КП разблокирована.'
        : 'Переведена в «Закрыто и не реализовано».',
    color: decision === 'approved' ? 'success' : 'error',
    icon: decision === 'approved' ? 'i-lucide-shield-check' : 'i-lucide-shield-x'
  })
}
</script>

<template>
  <div v-if="deal.conflictStatus === 'flagged'" class="space-y-2">
    <UAlert
      color="error"
      variant="subtle"
      icon="i-lucide-shield-alert"
      title="Конфликт интересов"
      :description="deal.conflictNote || `Совпадение по ИИН/БИН ${deal.iinBin} (${deal.proceedingNumber}). Отправка КП заблокирована.`"
    />

    <div
      v-if="authStore.canResolveConflicts && conflictRecord"
      class="p-3 rounded-lg border border-default bg-elevated flex flex-col sm:flex-row sm:items-center gap-2"
    >
      <UInput
        v-model="resolutionComment"
        size="xs"
        class="w-full flex-1"
        aria-label="Комментарий руководителя"
        placeholder="Комментарий руководителя"
      />
      <div class="flex items-center gap-1.5 shrink-0">
        <UButton
          color="primary"
          variant="solid"
          size="xs"
          icon="i-lucide-check"
          label="Разрешить"
          @click="handleDecision('approved')"
        />
        <UButton
          color="error"
          variant="outline"
          size="xs"
          icon="i-lucide-x"
          label="Отклонить"
          @click="handleDecision('rejected')"
        />
      </div>
    </div>

    <p v-else class="text-xs text-muted px-1">
      Ожидает решения руководителя.
    </p>
  </div>

  <div
    v-else-if="deal.conflictStatus === 'approved'"
    class="px-3 py-2 rounded-md border border-default bg-muted/40 flex items-center justify-between gap-2 text-xs text-muted"
  >
    <span class="flex items-center gap-1.5">
      <UIcon name="i-lucide-shield-check" class="size-3.5 text-primary shrink-0" aria-hidden="true" />
      <span>Конфликт проверен · согласовано руководителем</span>
    </span>
    <span class="font-mono">{{ deal.iinBin }}</span>
  </div>
</template>
