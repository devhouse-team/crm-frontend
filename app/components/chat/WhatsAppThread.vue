<script setup lang="ts">
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { formatKZT } from '~/utils/formatters'
import type { Deal } from '~/types/crm'
import type { QuickTemplate, WhatsAppMessage } from '~/types/whatsapp'

const props = defineProps<{
  deal: Deal
  showBriefInStream?: boolean
}>()

const whatsappStore = useWhatsAppStore()
const settingsStore = useSettingsStore()
const toast = useToast()

const draftMessage = ref('')
const isTemplateMenuOpen = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

const messages = computed(() => {
  return whatsappStore.messagesByDeal[props.deal.id] || []
})

function systemNoticeMeta(msg: WhatsAppMessage) {
  if (msg.kind === 'error') {
    return {
      icon: 'i-lucide-shield-alert',
      boxClass: 'bg-error/10 border-error/30 text-error-700 dark:text-error-300',
      iconClass: 'text-error-700 dark:text-error-400'
    }
  }
  if (msg.kind === 'warning') {
    return {
      icon: 'i-lucide-triangle-alert',
      boxClass: 'bg-warning/10 border-warning/30 text-warning-800 dark:text-warning-300',
      iconClass: 'text-warning-800 dark:text-warning-400'
    }
  }
  return {
    icon: 'i-lucide-info',
    boxClass: 'bg-elevated border-default text-muted',
    iconClass: 'text-muted'
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

watch(
  () => [props.deal.id, messages.value.length],
  () => {
    scrollToBottom()
  }
)

onMounted(() => {
  scrollToBottom()
})

function handleSend() {
  if (!draftMessage.value.trim()) return
  whatsappStore.sendMessage(props.deal.id, draftMessage.value)
  draftMessage.value = ''
  scrollToBottom()
}

function handleApplyWhisper(replyText: string) {
  draftMessage.value = replyText
}

function handleInsertTemplate(tpl: QuickTemplate) {
  const interpolated = whatsappStore.interpolateTemplate(tpl.body, props.deal.id)
  draftMessage.value = interpolated
  isTemplateMenuOpen.value = false
  toast.add({
    title: 'Шаблон подставлен',
    description: tpl.title,
    color: 'info',
    icon: 'i-lucide-message-square-code'
  })
}

function handleSendCommercialProposalPdf() {
  if (props.deal.conflictStatus === 'flagged') {
    toast.add({
      title: 'Конфликт интересов',
      description: 'Отправка КП заблокирована до решения руководителя',
      color: 'error',
      icon: 'i-lucide-shield-alert'
    })
    return
  }

  const calc = settingsStore.calculatePricing(props.deal.debtAmount)
  const feeToUse =
    props.deal.selectedTariffMode === 'success_fee'
      ? `${formatKZT(calc.alternativeFixedFee)} + ${calc.alternativeSuccessPercent}% от взыскания`
      : `${formatKZT(calc.recommendedFixedFee)} (${calc.feePercentOfDebt}% от долга)`

  const fileName = `KP_${props.deal.code}_${props.deal.clientName.split(' ')[0]}.pdf`

  whatsappStore.sendMessage(
    props.deal.id,
    `${props.deal.clientName.split(' ')[0]}, направляю персональное Коммерческое предложение по делу ${props.deal.proceedingNumber} (сумма долга: ${formatKZT(props.deal.debtAmount)}). Выбранный тариф: ${feeToUse}.`,
    {
      sender: 'manager',
      isTemplate: true,
      templateTitle: 'Коммерческое предложение (PDF)',
      attachment: {
        fileName,
        fileType: 'pdf',
        fileSize: '420 КБ',
        categoryLabel: 'Коммерческое предложение'
      }
    }
  )

  toast.add({
    title: 'КП отправлено',
    description: fileName,
    color: 'success',
    icon: 'i-lucide-file-check'
  })
}
</script>

<template>
  <div class="flex flex-col h-full bg-default overflow-hidden">
    <!-- Top AI Sales Agent Control Bar -->
    <AiAgentStatusBar :deal="deal" />

    <!-- Scrollable Message Stream -->
    <div
      ref="scrollContainer"
      class="flex-1 overflow-y-auto p-3.5 space-y-3 bg-default"
    >
      <!-- Optional Pinned AI Brief inside stream -->
      <AiBriefCard v-if="showBriefInStream" :deal="deal" collapsible />

      <!-- PII Masking Inspector Notice (only when active) -->
      <div v-if="whatsappStore.showMaskedPiiLogMode" class="flex items-center justify-center">
        <UBadge color="primary" variant="subtle" icon="i-lucide-shield">
          Показан текст с маскированием ИИН и телефона
        </UBadge>
      </div>

      <!-- Messages -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="{
          'items-start': msg.sender === 'client',
          'items-end': msg.sender === 'manager' || msg.sender === 'ai_agent',
          'items-center': msg.sender === 'system'
        }"
      >
        <!-- System / Handoff / Conflict Alert Message -->
        <div
          v-if="msg.sender === 'system'"
          class="max-w-lg px-3 py-1.5 rounded-md border text-xs flex items-start gap-2"
          :class="systemNoticeMeta(msg).boxClass"
        >
          <UIcon
            :name="systemNoticeMeta(msg).icon"
            class="size-3.5 shrink-0 mt-0.5"
            :class="systemNoticeMeta(msg).iconClass"
          />
          <span>{{ msg.text }}</span>
        </div>

        <!-- Standard Chat Bubble (Client / AI Agent / Manager) -->
        <div
          v-else
          class="max-w-[86%] rounded-lg px-3.5 py-2.5 border space-y-2"
          :class="{
            'bg-elevated border-default text-default rounded-tl-xs': msg.sender === 'client',
            'bg-secondary/8 border-secondary/25 text-default rounded-tr-xs': msg.sender === 'ai_agent',
            'bg-primary/10 border-primary/25 text-default rounded-tr-xs': msg.sender === 'manager'
          }"
        >
          <!-- Bubble Header -->
          <div class="flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span class="font-medium text-highlighted truncate">{{ msg.senderName }}</span>
              <AiMarker v-if="msg.sender === 'ai_agent'" label="Ответ ИИ-агента" />

              <UBadge
                v-if="msg.containsPii"
                color="neutral"
                variant="subtle"
                icon="i-lucide-shield"
              >
                Скрыто: {{ msg.piiTypes?.join(', ') }}
              </UBadge>
            </div>
            <div class="flex items-center gap-1 text-xs text-muted font-mono shrink-0">
              <span>{{ msg.timestamp }}</span>
              <UIcon
                v-if="msg.sender !== 'client'"
                name="i-lucide-check-check"
                class="size-3.5 text-primary"
              />
            </div>
          </div>

          <!-- Message Body (Swaps to masked PII text when PII Inspector mode is active) -->
          <p class="text-sm leading-relaxed whitespace-pre-line text-default">
            {{ whatsappStore.showMaskedPiiLogMode && msg.maskedText ? msg.maskedText : msg.text }}
          </p>

          <!-- Attachments (PDFs / Court rulings / Bailiff decrees) -->
          <div v-if="msg.attachments && msg.attachments.length > 0" class="space-y-1.5 pt-1">
            <div
              v-for="att in msg.attachments"
              :key="att.id"
              class="flex items-center justify-between gap-2.5 p-2 rounded-md bg-default border border-default"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div class="flex items-center justify-center size-7 rounded bg-accented text-toned shrink-0">
                  <UIcon name="i-lucide-file-text" class="size-3.5" />
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-xs text-highlighted truncate">
                    {{ att.fileName }}
                  </div>
                  <div class="text-xs text-muted flex items-center gap-1.5">
                    <span>{{ att.categoryLabel }}</span>
                    <span>·</span>
                    <span class="font-mono">{{ att.fileSize }}</span>
                  </div>
                </div>
              </div>

              <UIcon
                v-if="att.savedToDealDocs"
                name="i-lucide-check"
                class="size-3.5 text-success shrink-0"
                title="Сохранено в документах сделки"
              />
            </div>
          </div>

          <!-- AI Live Extracted Fields Callout -->
          <div
            v-if="msg.extractedFields && msg.extractedFields.length > 0"
            class="pt-2 border-t border-default flex flex-wrap items-center gap-1.5"
          >
            <AiMarker label="Извлечено ИИ в карточку" />
            <span
              v-for="ef in msg.extractedFields"
              :key="ef.fieldKey"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accented/60 text-xs font-mono text-highlighted"
            >
              <span class="text-muted">{{ ef.fieldLabel }}:</span>
              <span class="font-medium">{{ ef.extractedValue }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Smart Whisper Contextual Replies -->
    <AiSmartWhisper :deal="deal" @select-reply="handleApplyWhisper" />

    <!-- Quick Templates Drawer / Popover Bar -->
    <div v-if="isTemplateMenuOpen" class="p-3 bg-elevated border-t border-default space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-highlighted">
          Шаблоны сообщений
        </span>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-x"
          aria-label="Закрыть шаблоны"
          @click="isTemplateMenuOpen = false"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-for="tpl in whatsappStore.quickTemplates"
          :key="tpl.id"
          type="button"
          class="p-2.5 rounded-md border border-default bg-default hover:border-accented text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          @click="handleInsertTemplate(tpl)"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs font-medium text-highlighted">{{ tpl.title }}</span>
            <span class="text-xs text-muted">{{ tpl.category }}</span>
          </div>
          <p class="text-xs text-muted line-clamp-2">
            {{ whatsappStore.interpolateTemplate(tpl.body, deal.id) }}
          </p>
        </button>
      </div>
    </div>

    <!-- Bottom WhatsApp Composer Dock -->
    <div class="p-3 bg-elevated border-t border-default space-y-2">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-1.5">
          <UButton
            color="neutral"
            variant="outline"
            size="xs"
            icon="i-lucide-message-square-text"
            label="Шаблоны"
            @click="isTemplateMenuOpen = !isTemplateMenuOpen"
          />
          <UButton
            color="primary"
            variant="soft"
            size="xs"
            icon="i-lucide-file-output"
            label="Отправить КП"
            @click="handleSendCommercialProposalPdf"
          />
        </div>
        <span class="text-xs text-muted">
          Enter — отправить
        </span>
      </div>

      <form class="flex items-end gap-2" @submit.prevent="handleSend">
        <UTextarea
          v-model="draftMessage"
          :rows="2"
          autoresize
          placeholder="Сообщение..."
          class="flex-1 text-sm"
          @keydown.enter.exact.prevent="handleSend"
        />
        <UButton
          type="submit"
          color="primary"
          variant="solid"
          icon="i-lucide-send"
          label="Отправить"
          :disabled="!draftMessage.trim()"
        />
      </form>
    </div>
  </div>
</template>
