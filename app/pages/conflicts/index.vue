<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { formatKZT } from '~/utils/formatters'
import type { ConflictRecord } from '~/types/legal'

const pipelineStore = usePipelineStore()
const authStore = useAuthStore()
const toast = useToast()

const statusFilter = ref<'all' | 'pending' | 'resolved'>('all')
const manualQuery = ref('')
const manualScanResult = ref<ConflictRecord | null | 'none'>(null)
const resolutionComments = reactive<Record<string, string>>({
  'conf-1': 'Проверено руководителем: подтвержден конфликт сторон по ИП № 889/26-71-0419.'
})

const resolvedCount = computed(
  () => pipelineStore.conflicts.filter(c => c.status !== 'pending').length
)

const filterTabs = computed(() => [
  {
    label: 'Все',
    value: 'all',
    badge: { label: pipelineStore.conflicts.length, color: 'neutral' as const, variant: 'subtle' as const }
  },
  {
    label: 'Ожидают',
    value: 'pending',
    badge:
      pipelineStore.pendingConflictsCount > 0
        ? { label: pipelineStore.pendingConflictsCount, color: 'error' as const, variant: 'subtle' as const }
        : { label: 0, color: 'neutral' as const, variant: 'subtle' as const }
  },
  {
    label: 'Решённые',
    value: 'resolved',
    badge: { label: resolvedCount.value, color: 'neutral' as const, variant: 'subtle' as const }
  }
])

const filteredConflicts = computed(() => {
  return pipelineStore.conflicts.filter((c) => {
    if (statusFilter.value === 'pending') return c.status === 'pending'
    if (statusFilter.value === 'resolved') return c.status !== 'pending'
    return true
  })
})

function handleManualScan() {
  if (!manualQuery.value.trim()) return
  const res = pipelineStore.checkManualConflict(manualQuery.value)
  manualScanResult.value = res || 'none'
}

function handleResolve(conflictId: string, decision: 'approved' | 'rejected') {
  const comment =
    resolutionComments[conflictId] ||
    (decision === 'approved'
      ? 'Разрешено руководителем: конфликт интересов отсутствует.'
      : 'Отклонено руководителем: конфликт интересов со встречной стороной.')

  pipelineStore.resolveConflict(
    conflictId,
    decision,
    comment,
    authStore.currentUser.name
  )

  toast.add({
    title: decision === 'approved' ? 'Сделка разрешена' : 'Сделка отклонена',
    description: comment,
    color: decision === 'approved' ? 'success' : 'error',
    icon: decision === 'approved' ? 'i-lucide-shield-check' : 'i-lucide-shield-x'
  })
}
</script>

<template>
  <UDashboardPanel id="conflicts-resolution-panel">
    <template #header>
      <UDashboardNavbar title="Конфликты">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <!-- Manual IIN/BIN & Proceeding # Scanner -->
        <PanelSection title="Проверка по базе">
          <div class="space-y-3">
            <form class="flex flex-wrap items-center gap-2" @submit.prevent="handleManualScan">
              <UInput
                v-model="manualQuery"
                icon="i-lucide-search"
                size="sm"
                placeholder="ИИН/БИН, номер производства или наименование..."
                class="flex-1 min-w-[260px] font-mono"
              />
              <UButton
                type="submit"
                color="primary"
                variant="solid"
                size="sm"
                icon="i-lucide-search"
                label="Проверить"
              />
            </form>

            <UAlert
              v-if="manualScanResult && manualScanResult !== 'none'"
              color="error"
              variant="subtle"
              icon="i-lucide-shield-alert"
              :title="`Совпадение: ${manualScanResult.matchedDealCode} · ${manualScanResult.matchedEntityName}`"
              :description="`ИИН/БИН: ${manualScanResult.matchedEntityIinBin} · Производство: ${manualScanResult.matchedProceedingNumber} · ${manualScanResult.matchedStageName}`"
              :actions="[
                {
                  label: 'Открыть сделку',
                  color: 'neutral',
                  variant: 'outline',
                  size: 'xs',
                  onClick: () => {
                    if (manualScanResult && manualScanResult !== 'none') {
                      pipelineStore.openDealWorkspace(manualScanResult.dealId, 'main')
                    }
                  }
                }
              ]"
            />

            <UAlert
              v-else-if="manualScanResult === 'none'"
              color="success"
              variant="subtle"
              icon="i-lucide-shield-check"
              title="Совпадений не найдено"
              :description="`Запрос «${manualQuery}» не пересекается с действующими и архивными делами.`"
            />
          </div>
        </PanelSection>

        <!-- Queue Filter Tabs -->
        <div class="flex items-center justify-between gap-3 flex-wrap border-b border-default">
          <UTabs
            v-model="statusFilter"
            :items="filterTabs"
            variant="link"
            color="primary"
            size="sm"
            :content="false"
            :ui="{
              list: 'p-0 border-b-0',
              trigger: 'px-3 py-2 text-xs gap-1.5',
              trailingBadge: 'px-1.5 py-0 font-mono'
            }"
          />

          <span v-if="!authStore.canResolveConflicts" class="text-xs text-muted pb-1">
            Решения принимает руководитель
          </span>
        </div>

        <!-- Side-by-Side Conflict Comparison Tables -->
        <div class="space-y-4">
          <div
            v-for="item in filteredConflicts"
            :key="item.id"
            class="rounded-lg border border-default bg-elevated overflow-hidden"
          >
            <!-- Top Incident Strip -->
            <div class="px-4 py-3 border-b border-default flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 flex-wrap">
                <UBadge
                  :color="item.status === 'pending' ? 'error' : item.status === 'approved' ? 'success' : 'neutral'"
                  :label="
                    item.status === 'pending'
                      ? 'Ожидает решения'
                      : item.status === 'approved'
                        ? 'Разрешено'
                        : 'Отклонено'
                  "
                />
                <span class="text-sm font-semibold text-highlighted">
                  {{
                    item.matchType === 'opposing_party_ip'
                      ? 'Встречная сторона по производству'
                      : 'Совпадение ИИН/БИН'
                  }}
                </span>
                <span class="text-xs font-mono text-muted">· {{ item.detectedAt }}</span>
              </div>

              <UButton
                color="neutral"
                variant="outline"
                size="xs"
                icon="i-lucide-panel-right-open"
                :label="`Открыть ${item.dealCode}`"
                @click="pipelineStore.openDealWorkspace(item.dealId, 'main')"
              />
            </div>

            <!-- 2-Column Side-by-Side Comparison Table -->
            <div class="overflow-x-auto bg-default">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-default bg-elevated text-muted">
                    <th class="py-2 px-4 w-40 font-medium">Поле</th>
                    <th class="py-2 px-4 w-1/2 font-medium">
                      Новая заявка · <span class="font-mono text-highlighted">{{ item.dealCode }}</span>
                    </th>
                    <th class="py-2 px-4 w-1/2 font-medium border-l border-default">
                      В базе · <span class="font-mono text-highlighted">{{ item.matchedDealCode }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-default">
                  <tr>
                    <td class="py-2.5 px-4 text-muted">Сторона</td>
                    <td class="py-2.5 px-4">
                      <span class="text-sm font-medium text-highlighted">{{ item.newClientName }}</span>
                      <span class="text-muted ml-2">
                        ({{ item.newClientRole === 'debtor' ? 'Должник' : 'Взыскатель' }})
                      </span>
                    </td>
                    <td class="py-2.5 px-4 border-l border-default">
                      <span class="text-sm font-medium text-highlighted">{{ item.matchedEntityName }}</span>
                      <span class="text-muted ml-2">
                        ({{ item.matchedEntityRole === 'creditor' ? 'Взыскатель' : 'Должник' }})
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td class="py-2.5 px-4 text-muted">ИИН/БИН</td>
                    <td
                      class="py-2.5 px-4 font-mono"
                      :class="
                        item.newClientIinBin === item.matchedEntityIinBin
                          ? 'bg-error/10 text-error-700 dark:text-error-300 font-semibold'
                          : 'text-default'
                      "
                    >
                      {{ item.newClientIinBin }}
                    </td>
                    <td
                      class="py-2.5 px-4 font-mono border-l border-default"
                      :class="
                        item.newClientIinBin === item.matchedEntityIinBin
                          ? 'bg-error/10 text-error-700 dark:text-error-300 font-semibold'
                          : 'text-default'
                      "
                    >
                      {{ item.matchedEntityIinBin }}
                    </td>
                  </tr>

                  <tr>
                    <td class="py-2.5 px-4 text-muted">Производство</td>
                    <td
                      class="py-2.5 px-4 font-mono"
                      :class="
                        item.newProceedingNumber === item.matchedProceedingNumber
                          ? 'bg-error/10 text-error-700 dark:text-error-300 font-semibold'
                          : 'text-default'
                      "
                    >
                      {{ item.newProceedingNumber }}
                    </td>
                    <td
                      class="py-2.5 px-4 font-mono border-l border-default"
                      :class="
                        item.newProceedingNumber === item.matchedProceedingNumber
                          ? 'bg-error/10 text-error-700 dark:text-error-300 font-semibold'
                          : 'text-default'
                      "
                    >
                      {{ item.matchedProceedingNumber }}
                    </td>
                  </tr>

                  <tr>
                    <td class="py-2.5 px-4 text-muted">Детали</td>
                    <td class="py-2.5 px-4 text-default">
                      <span class="font-mono font-medium text-highlighted">{{ formatKZT(item.newDebtAmount) }}</span>
                      <span class="text-muted"> · {{ item.assignedManagerName }}</span>
                    </td>
                    <td class="py-2.5 px-4 border-l border-default text-default">
                      <span class="font-medium text-highlighted">{{ item.matchedStageName }}</span>
                      <span class="text-muted"> · {{ item.matchedLawyerName }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Executive Decision Dock -->
            <div
              v-if="(item.status === 'pending' && authStore.canResolveConflicts) || item.status !== 'pending'"
              class="px-4 py-3 border-t border-default bg-elevated"
            >
              <div
                v-if="item.status === 'pending' && authStore.canResolveConflicts"
                class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <UInput
                  v-model="resolutionComments[item.id]"
                  size="sm"
                  placeholder="Комментарий к решению..."
                  class="flex-1"
                />
                <div class="flex items-center gap-2 shrink-0">
                  <UButton
                    color="error"
                    variant="outline"
                    size="sm"
                    label="Отклонить"
                    @click="handleResolve(item.id, 'rejected')"
                  />
                  <UButton
                    color="primary"
                    variant="solid"
                    size="sm"
                    label="Разрешить"
                    @click="handleResolve(item.id, 'approved')"
                  />
                </div>
              </div>

              <div v-else-if="item.status !== 'pending'" class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="text-muted">
                  <span class="font-medium text-highlighted">{{ item.resolvedBy }}</span>
                  <span class="ml-1.5">{{ item.resolvedAt }}</span>
                </div>
                <div class="text-default">
                  {{ item.resolutionComment }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
