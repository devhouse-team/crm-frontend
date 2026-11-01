<script setup lang="ts">
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import type { Deal } from '~/types/crm'

const props = defineProps<{
  deal: Deal
  compact?: boolean
}>()

const whatsappStore = useWhatsAppStore()
const toast = useToast()

const currentMode = computed(() => {
  return whatsappStore.threadModes[props.deal.id] || props.deal.whatsappStatus || 'waiting_manager'
})

const statusMeta = computed(() => {
  if (currentMode.value === 'waiting_manager') {
    return {
      label: 'Ждёт ответа',
      dotClass: 'bg-warning'
    }
  }
  if (currentMode.value === 'ai_polling') {
    return {
      label: 'Отвечает ИИ',
      dotClass: 'bg-secondary'
    }
  }
  return {
    label: 'Ведёт менеджер',
    dotClass: 'bg-primary'
  }
})

function handleTakeover() {
  whatsappStore.toggleThreadControl(props.deal.id, 'human_active')
  toast.add({
    title: 'Диалог взят в работу',
    description: props.deal.clientName,
    color: 'primary',
    icon: 'i-lucide-user-check'
  })
}

function handleReturnToAi() {
  whatsappStore.toggleThreadControl(props.deal.id, 'ai_polling')
  toast.add({
    title: 'Диалог передан ИИ',
    description: props.deal.clientName,
    color: 'secondary',
    icon: 'i-lucide-bot'
  })
}
</script>

<template>
  <div class="flex items-center justify-between gap-2 px-3.5 py-2 bg-elevated border-b border-default">
    <div class="flex items-center gap-2 min-w-0">
      <span class="size-2 rounded-full shrink-0" :class="statusMeta.dotClass" />
      <span class="text-xs font-medium text-highlighted whitespace-nowrap">
        {{ statusMeta.label }}
      </span>
      <AiMarker v-if="currentMode === 'ai_polling'" label="Автоопрос ИИ" />
      <template v-if="!compact">
        <span class="text-xs text-muted">·</span>
        <span class="text-xs font-mono text-muted truncate">
          {{ deal.clientPhone }}
        </span>
      </template>
    </div>

    <div class="flex items-center gap-1.5 shrink-0">
      <UTooltip
        :text="
          whatsappStore.showMaskedPiiLogMode
            ? 'Скрыть маскирование данных'
            : 'Показать маскирование ИИН и телефона'
        "
      >
        <UButton
          :color="whatsappStore.showMaskedPiiLogMode ? 'primary' : 'neutral'"
          :variant="whatsappStore.showMaskedPiiLogMode ? 'soft' : 'ghost'"
          size="xs"
          icon="i-lucide-shield"
          aria-label="Показать маскирование персональных данных"
          :aria-pressed="whatsappStore.showMaskedPiiLogMode"
          @click="whatsappStore.showMaskedPiiLogMode = !whatsappStore.showMaskedPiiLogMode"
        />
      </UTooltip>

      <UButton
        v-if="currentMode !== 'human_active'"
        color="primary"
        variant="solid"
        size="xs"
        label="Взять диалог"
        @click="handleTakeover"
      />
      <UButton
        v-else
        color="neutral"
        variant="outline"
        size="xs"
        icon="i-lucide-bot"
        label="Вернуть ИИ"
        @click="handleReturnToAi"
      />
    </div>
  </div>
</template>
