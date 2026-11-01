<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import type { Deal } from '~/types/crm'
import type { DocumentTemplate } from '~/types/legal'

const props = defineProps<{
  deal: Deal
}>()

const settingsStore = useSettingsStore()
const whatsappStore = useWhatsAppStore()
const toast = useToast()

const previewTemplate = ref<DocumentTemplate | null>(null)
const isPreviewOpen = ref(false)

const receivedCount = computed(() =>
  props.deal.requiredDocs.filter(d => d.received).length
)

const interpolatedPreviewText = computed(() => {
  if (!previewTemplate.value) return ''
  return whatsappStore.interpolateTemplate(previewTemplate.value.bodyTemplate, props.deal.id)
})

function openPreview(tpl: DocumentTemplate) {
  previewTemplate.value = tpl
  isPreviewOpen.value = true
}

function handleGenerateAndSend(tpl: DocumentTemplate) {
  if (tpl.code === 'commercial_proposal' && props.deal.conflictStatus === 'flagged') {
    toast.add({
      title: 'Отправка КП заблокирована',
      description: 'Сначала разрешите конфликт интересов.',
      color: 'error',
      icon: 'i-lucide-shield-alert'
    })
    return
  }

  const fileName = `${tpl.code.toUpperCase()}_${props.deal.code}.pdf`

  whatsappStore.sendMessage(
    props.deal.id,
    `Направляю документ «${tpl.title}» по делу ${props.deal.proceedingNumber} (${props.deal.clientName}).`,
    {
      sender: 'manager',
      isTemplate: true,
      templateTitle: tpl.title,
      attachment: {
        fileName,
        fileType: 'pdf',
        fileSize: '510 КБ',
        categoryLabel: tpl.title
      }
    }
  )

  isPreviewOpen.value = false

  toast.add({
    title: 'Отправлено в WhatsApp',
    description: fileName,
    color: 'success',
    icon: 'i-lucide-file-check-2'
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- 1. Scenario Required Document Checklist -->
    <div class="rounded-lg border border-default bg-elevated p-4 space-y-2.5">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-highlighted">
          Первичные документы
        </h3>
        <span class="text-xs font-mono text-muted">
          {{ receivedCount }} / {{ deal.requiredDocs.length }}
        </span>
      </div>

      <div class="divide-y divide-default">
        <div
          v-for="doc in deal.requiredDocs"
          :key="doc.key"
          class="py-2 flex items-center justify-between gap-3 text-sm"
        >
          <label class="flex items-center gap-2 cursor-pointer min-w-0">
            <input
              v-model="doc.received"
              type="checkbox"
              class="rounded border-default accent-primary"
            >
            <span class="truncate" :class="doc.received ? 'text-highlighted' : 'text-muted'">
              {{ doc.label }}
            </span>
          </label>

          <span
            v-if="doc.received"
            class="text-xs font-mono text-muted truncate max-w-48 shrink-0"
          >
            {{ doc.fileName || 'Получено' }}
          </span>
          <span v-else class="text-xs text-muted shrink-0">
            Ожидается
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Six Automated Legal & Commercial Document Templates -->
    <div class="rounded-lg border border-default bg-elevated p-4 space-y-3">
      <h3 class="text-sm font-semibold text-highlighted">
        Шаблоны
      </h3>

      <div class="divide-y divide-default border border-default rounded-md bg-default">
        <div
          v-for="tpl in settingsStore.documentTemplates"
          :key="tpl.id"
          class="p-3 flex items-center justify-between gap-3"
        >
          <div class="min-w-0 space-y-0.5">
            <div class="text-sm font-medium text-highlighted truncate">{{ tpl.title }}</div>
            <p class="text-xs text-muted truncate">
              {{ tpl.description }}
            </p>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-eye"
              aria-label="Предпросмотр шаблона"
              @click="openPreview(tpl)"
            />
            <UButton
              color="primary"
              variant="soft"
              size="xs"
              icon="i-lucide-send"
              label="В WhatsApp"
              @click="handleGenerateAndSend(tpl)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Template Preview Modal -->
    <UModal
      v-model:open="isPreviewOpen"
      :title="previewTemplate?.title || 'Предпросмотр'"
      description="Данные сделки подставлены автоматически."
    >
      <template #body>
        <div v-if="previewTemplate" class="space-y-3">
          <div class="p-3.5 rounded-md bg-muted/50 border border-default font-mono text-xs whitespace-pre-line leading-relaxed text-default">
            {{ interpolatedPreviewText }}
          </div>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              label="Закрыть"
              @click="isPreviewOpen = false"
            />
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-send"
              label="Отправить в WhatsApp"
              @click="handleGenerateAndSend(previewTemplate)"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
