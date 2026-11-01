<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { formatKZT, formatCompactKZT } from '~/utils/formatters'

const pipelineStore = usePipelineStore()
const authStore = useAuthStore()

const viewMode = ref<'kanban' | 'table'>('kanban')
const slaFilter = ref<'all' | 'overdue' | 'due_tomorrow' | 'awaiting_reply'>('all')
const selectedLawyerId = ref<string>('all')

const lawyers = computed(() =>
  authStore.teamMembers.filter(m => m.role === 'lawyer' || m.role === 'executive')
)

const filteredCases = computed(() => {
  return pipelineStore.caseDeals.filter((d) => {
    if (selectedLawyerId.value !== 'all' && d.assignedLawyerId !== selectedLawyerId.value) {
      return false
    }
    if (slaFilter.value === 'overdue') {
      return d.tasks.some(t => t.status === 'overdue')
    }
    if (slaFilter.value === 'due_tomorrow') {
      return d.tasks.some(t => t.status === 'due_tomorrow')
    }
    if (slaFilter.value === 'awaiting_reply') {
      return d.stageId === 'awaiting_reply' || d.stageId === 'sent'
    }
    return true
  })
})

const totalCaseDebt = computed(() =>
  pipelineStore.caseDeals.reduce((sum, d) => sum + (d.debtAmount || 0), 0)
)

const totalCaseRecovered = computed(() =>
  pipelineStore.caseDeals.reduce((sum, d) => sum + (d.recoveredAmount || 0), 0)
)

const dueTomorrowCount = computed(() =>
  pipelineStore.caseDeals.filter(d => d.tasks.some(t => t.status === 'due_tomorrow')).length
)
</script>

<template>
  <UDashboardPanel id="case-pipeline-panel">
    <template #header>
      <UDashboardNavbar title="Дела">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <span class="text-xs font-mono text-muted tabular-nums">
            Взыскано <strong class="font-medium text-highlighted">{{ formatCompactKZT(totalCaseRecovered) }}</strong> из {{ formatCompactKZT(totalCaseDebt) }}
          </span>
        </template>
      </UDashboardNavbar>

      <!-- Top SLA Triage & Lawyer Filter Toolbar -->
      <UDashboardToolbar>
        <template #left>
          <div class="flex items-center gap-1.5 flex-wrap">
            <UButton
              :color="slaFilter === 'all' ? 'primary' : 'neutral'"
              :variant="slaFilter === 'all' ? 'solid' : 'outline'"
              size="xs"
              :label="`Все (${pipelineStore.caseDeals.length})`"
              @click="slaFilter = 'all'"
            />
            <UButton
              :color="slaFilter === 'overdue' ? 'error' : 'neutral'"
              :variant="slaFilter === 'overdue' ? 'solid' : 'outline'"
              size="xs"
              :label="`Просрочено (${pipelineStore.overdueTasksCount})`"
              @click="slaFilter = slaFilter === 'overdue' ? 'all' : 'overdue'"
            />
            <UButton
              :color="slaFilter === 'due_tomorrow' ? 'warning' : 'neutral'"
              :variant="slaFilter === 'due_tomorrow' ? 'solid' : 'outline'"
              size="xs"
              :label="`Завтра (${dueTomorrowCount})`"
              @click="slaFilter = slaFilter === 'due_tomorrow' ? 'all' : 'due_tomorrow'"
            />
            <UButton
              :color="slaFilter === 'awaiting_reply' ? 'primary' : 'neutral'"
              :variant="slaFilter === 'awaiting_reply' ? 'solid' : 'outline'"
              size="xs"
              label="Ожидают ответа"
              @click="slaFilter = slaFilter === 'awaiting_reply' ? 'all' : 'awaiting_reply'"
            />

            <select
              v-model="selectedLawyerId"
              aria-label="Фильтр по юристу"
              class="text-xs rounded-md border border-default bg-default px-2.5 py-1 text-default focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="all">Все юристы</option>
              <option v-for="l in lawyers" :key="l.id" :value="l.id">
                {{ l.name }}
              </option>
            </select>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-1">
            <UButton
              :color="viewMode === 'kanban' ? 'primary' : 'neutral'"
              :variant="viewMode === 'kanban' ? 'soft' : 'ghost'"
              size="xs"
              icon="i-lucide-columns-3"
              label="Канбан"
              @click="viewMode = 'kanban'"
            />
            <UButton
              :color="viewMode === 'table' ? 'primary' : 'neutral'"
              :variant="viewMode === 'table' ? 'soft' : 'ghost'"
              size="xs"
              icon="i-lucide-table"
              label="Таблица"
              @click="viewMode = 'table'"
            />
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="p-4 h-full flex flex-col">
        <!-- 8-Stage Legal Case Kanban -->
        <KanbanBoard
          v-if="viewMode === 'kanban'"
          mode="cases"
          :stages="pipelineStore.caseStages"
          :deals="filteredCases"
        />

        <!-- Dense Legal SLA Table -->
        <div v-else class="rounded-lg border border-default bg-elevated overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="border-b border-default bg-muted/50 text-xs font-medium text-muted">
                  <th class="py-2.5 px-3">Взыскатель / Должник</th>
                  <th class="py-2.5 px-3">№ ИП и ЧСИ</th>
                  <th class="py-2.5 px-3">Этап</th>
                  <th class="py-2.5 px-3">Контрольный срок</th>
                  <th class="py-2.5 px-3 text-right">Взыскано / Долг</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="deal in filteredCases"
                  :key="deal.id"
                  tabindex="0"
                  class="hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  @click="pipelineStore.openDealWorkspace(deal.id, 'deadlines')"
                  @keydown.enter.prevent="pipelineStore.openDealWorkspace(deal.id, 'deadlines')"
                >
                  <td class="py-2.5 px-3">
                    <div class="font-mono text-xs text-muted">{{ deal.code }}</div>
                    <div class="font-medium text-highlighted">{{ deal.clientName }}</div>
                    <div class="text-xs text-muted">Должник: {{ deal.opposingPartyName }}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="font-mono text-xs font-medium text-toned">{{ deal.proceedingNumber }}</div>
                    <div class="text-xs text-muted">{{ deal.bailiffName }}</div>
                  </td>
                  <td class="py-2.5 px-3 text-default">
                    {{ pipelineStore.getStageName(deal.stageId) }}
                  </td>
                  <td class="py-2.5 px-3">
                    <div v-if="deal.tasks[0]" class="space-y-0.5">
                      <UBadge
                        :color="
                          deal.tasks[0].status === 'overdue'
                            ? 'error'
                            : deal.tasks[0].status === 'due_tomorrow'
                              ? 'warning'
                              : 'neutral'
                        "
                        :label="
                          deal.tasks[0].status === 'overdue'
                            ? `Просрочено ${Math.abs(deal.tasks[0].workingDaysRemaining)} раб. дн.`
                            : deal.tasks[0].status === 'due_tomorrow'
                              ? `Завтра · ${deal.tasks[0].dueDate}`
                              : `До ${deal.tasks[0].dueDate} · ${deal.tasks[0].workingDaysRemaining} раб. дн.`
                        "
                      />
                      <div class="text-xs text-muted truncate max-w-xs">
                        {{ deal.tasks[0].title }}
                      </div>
                    </div>
                    <span v-else class="text-xs text-muted">Нет активного срока</span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono tabular-nums">
                    <div class="font-medium text-highlighted">
                      {{ formatKZT(deal.recoveredAmount) }}
                    </div>
                    <div class="text-xs text-muted">
                      из {{ formatKZT(deal.debtAmount) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
