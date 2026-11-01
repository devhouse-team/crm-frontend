<script setup lang="ts">
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import type { Deal } from '~/types/crm'

const props = defineProps<{
  deal: Deal
}>()

const emit = defineEmits<{
  selectReply: [text: string]
}>()

const whatsappStore = useWhatsAppStore()

const suggestions = computed(() => {
  return whatsappStore.getSmartWhispersForDeal(props.deal.id)
})
</script>

<template>
  <div
    v-if="suggestions.length > 0"
    class="px-3 py-2 bg-elevated border-t border-default space-y-1.5"
  >
    <div class="flex items-center gap-1.5 text-xs text-muted">
      <span class="font-medium">Подсказки</span>
      <AiMarker label="Подсказки ИИ" />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="item in suggestions"
        :key="item.id"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border text-left focus-visible:outline-2 focus-visible:outline-primary"
        :class="
          item.category === 'objection_expensive'
            ? 'bg-warning/10 border-warning/30 text-warning-700 dark:text-warning-300 hover:bg-warning/15'
            : 'bg-default border-default text-default hover:border-accented'
        "
        @click="emit('selectReply', item.replyText)"
      >
        <span>{{ item.label }}</span>
        <UIcon name="i-lucide-corner-down-left" class="size-3 text-muted shrink-0" />
      </button>
    </div>
  </div>
</template>
