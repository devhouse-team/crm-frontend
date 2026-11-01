<script setup lang="ts">
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import { READINESS_TAG_META } from '~/utils/formatters'
import type { Deal } from '~/types/crm'

const props = defineProps<{
  deal: Deal
  collapsible?: boolean
}>()

const whatsappStore = useWhatsAppStore()
const isExpanded = ref(true)

const brief = computed(() => {
  return (
    whatsappStore.aiBriefs[props.deal.id] || {
      dealId: props.deal.id,
      summary: `Обращение по сценарию «${props.deal.scenarioLabel}». Производство: ${props.deal.proceedingNumber}.`,
      currentStageSummary: `Стадия: ${props.deal.bailiffName}. Проверка документов по чек-листу.`,
      missingDocuments: props.deal.requiredDocs.filter(d => !d.received).map(d => d.label),
      recommendedNextStep: 'Сформировать коммерческое предложение и направить в WhatsApp.',
      aiQuizStep: 'Квалификация завершена',
      readinessTag: props.deal.readinessTag,
      readinessReason: READINESS_TAG_META[props.deal.readinessTag].description,
      lastUpdated: props.deal.lastActivityAt,
      piiProtectedCount: 2
    }
  )
})
</script>

<template>
  <div class="rounded-lg border border-default bg-default overflow-hidden">
    <div
      class="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-default"
      :class="collapsible ? 'cursor-pointer select-none' : ''"
      @click="collapsible ? (isExpanded = !isExpanded) : undefined"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="text-xs font-semibold text-highlighted">Резюме</span>
        <AiMarker label="Сформировано ИИ" />
      </div>

      <div class="flex items-center gap-1.5 min-w-0">
        <span class="text-xs text-muted truncate">
          {{ brief.aiQuizStep }}
        </span>
        <UButton
          v-if="collapsible"
          color="neutral"
          variant="ghost"
          size="xs"
          :icon="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          aria-label="Свернуть резюме"
          @click.stop="isExpanded = !isExpanded"
        />
      </div>
    </div>

    <div v-if="isExpanded" class="p-3.5 space-y-2.5">
      <p class="text-sm text-default leading-relaxed">
        {{ brief.summary }}
      </p>

      <div class="space-y-1.5 pt-2 border-t border-default text-xs">
        <div>
          <span class="text-muted">Стадия: </span>
          <span class="text-default">{{ brief.currentStageSummary }}</span>
        </div>
        <div>
          <span class="text-muted">Документы: </span>
          <span class="text-default">
            {{
              brief.missingDocuments.length > 0
                ? brief.missingDocuments.join('; ')
                : 'Комплект получен'
            }}
          </span>
        </div>
      </div>

      <div class="flex items-start gap-2 pt-2 border-t border-default text-xs">
        <UIcon name="i-lucide-arrow-right" class="size-3.5 text-primary shrink-0 mt-0.5" />
        <div class="min-w-0">
          <span class="font-medium text-highlighted">Далее: </span>
          <span class="text-default">{{ brief.recommendedNextStep }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
