<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import { useAuthStore } from '~/stores/useAuthStore'
import { formatKZT, formatCompactKZT, pluralizeRu, READINESS_TAG_META } from '~/utils/formatters'

const pipelineStore = usePipelineStore()
const whatsappStore = useWhatsAppStore()
const authStore = useAuthStore()

const totalSalesDebt = computed(() =>
  pipelineStore.salesDeals.reduce((sum, d) => sum + (d.debtAmount || 0), 0)
)

const totalCasesDebt = computed(() =>
  pipelineStore.caseDeals.reduce((sum, d) => sum + (d.debtAmount || 0), 0)
)

const totalRecovered = computed(() =>
  pipelineStore.caseDeals.reduce((sum, d) => sum + (d.recoveredAmount || 0), 0)
)

const urgentDeals = computed(() =>
  pipelineStore.deals.filter(
    d =>
      d.readinessTag === 'A' ||
      d.conflictStatus === 'flagged' ||
      d.tasks.some(t => t.status === 'overdue' || t.status === 'due_tomorrow')
  )
)
</script>

<template>
  <UDashboardPanel id="executive-overview">
    <template #header>
      <UDashboardNavbar title="Обзор">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
        <!-- KPI Strip -->
        <div class="rounded-lg border border-default bg-elevated overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-default">
          <NuxtLink
            to="/sales"
            class="p-4 hover:bg-muted/50 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary space-y-1"
          >
            <div class="text-xs text-muted">Продажи</div>
            <div class="text-2xl font-bold font-mono text-highlighted tabular-nums">
              {{ formatCompactKZT(totalSalesDebt) }}
            </div>
            <div class="text-xs text-muted">
              {{ pluralizeRu(pipelineStore.salesDeals.length, 'сделка', 'сделки', 'сделок') }}
            </div>
          </NuxtLink>

          <NuxtLink
            to="/cases"
            class="p-4 hover:bg-muted/50 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary space-y-1"
          >
            <div class="text-xs text-muted">Взыскано</div>
            <div class="text-2xl font-bold font-mono text-highlighted tabular-nums">
              {{ formatCompactKZT(totalRecovered) }}
            </div>
            <div class="text-xs text-muted">
              из {{ formatCompactKZT(totalCasesDebt) }} · {{ pluralizeRu(pipelineStore.caseDeals.length, 'дело', 'дела', 'дел') }}
            </div>
          </NuxtLink>

          <NuxtLink
            to="/inbox"
            class="p-4 hover:bg-muted/50 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary space-y-1"
          >
            <div class="text-xs text-muted">Ждут ответа</div>
            <div
              class="text-2xl font-bold font-mono tabular-nums"
              :class="whatsappStore.waitingManagerCount > 0 ? 'text-warning-700 dark:text-warning-400' : 'text-highlighted'"
            >
              {{ whatsappStore.waitingManagerCount }}
            </div>
            <div class="text-xs text-muted">
              в WhatsApp
            </div>
          </NuxtLink>

          <NuxtLink
            to="/conflicts"
            class="p-4 hover:bg-muted/50 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary space-y-1"
          >
            <div class="text-xs text-muted">Просрочено</div>
            <div
              class="text-2xl font-bold font-mono tabular-nums"
              :class="pipelineStore.overdueTasksCount > 0 ? 'text-error-600 dark:text-error-400' : 'text-highlighted'"
            >
              {{ pipelineStore.overdueTasksCount }}
            </div>
            <div class="text-xs text-muted">
              {{ pluralizeRu(pipelineStore.pendingConflictsCount, 'конфликт', 'конфликта', 'конфликтов') }} · {{ urgentDeals.length }} срочных
            </div>
          </NuxtLink>
        </div>

        <!-- Two-Column Workspace: Urgent Queue + Team Workload -->
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <PanelSection
            title="Требуют решения"
            class="xl:col-span-7"
            body-class="divide-y divide-default"
          >
            <div v-if="urgentDeals.length === 0" class="p-6 text-sm text-muted text-center">
              Нет срочных задач и конфликтов
            </div>

            <button
              v-for="deal in urgentDeals"
              :key="deal.id"
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary space-y-1"
              @click="pipelineStore.openDealWorkspace(deal.id, 'main')"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-mono text-xs text-muted shrink-0">{{ deal.code }}</span>
                  <span class="text-sm font-medium text-highlighted truncate">{{ deal.clientName }}</span>
                </div>
                <UBadge
                  v-if="deal.conflictStatus === 'flagged'"
                  color="error"
                  label="Конфликт"
                  class="shrink-0"
                />
                <UBadge
                  v-else
                  :color="READINESS_TAG_META[deal.readinessTag].color"
                  :label="READINESS_TAG_META[deal.readinessTag].shortLabel"
                  class="shrink-0"
                />
              </div>

              <div class="flex items-center justify-between gap-3 text-xs text-muted">
                <span class="truncate">
                  {{ deal.scenarioLabel }} · <span class="font-mono text-toned tabular-nums">{{ formatKZT(deal.debtAmount) }}</span>
                </span>
                <span class="font-mono shrink-0">{{ deal.proceedingNumber }}</span>
              </div>

              <div
                v-if="deal.tasks[0]"
                class="text-xs flex items-center gap-1.5"
                :class="
                  deal.tasks[0].status === 'overdue'
                    ? 'text-error-700 dark:text-error-400'
                    : deal.tasks[0].status === 'due_tomorrow'
                      ? 'text-warning-800 dark:text-warning-400'
                      : 'text-muted'
                "
              >
                <UIcon name="i-lucide-clock" class="size-3.5 shrink-0" aria-hidden="true" />
                <span class="truncate">{{ deal.tasks[0].title }}</span>
              </div>
            </button>
          </PanelSection>

          <PanelSection
            title="Команда"
            class="xl:col-span-5"
            body-class="divide-y divide-default"
          >
            <template #actions>
              <UButton
                to="/users"
                color="neutral"
                variant="ghost"
                size="xs"
                label="Все"
                trailing-icon="i-lucide-arrow-right"
              />
            </template>

            <div
              v-for="member in authStore.teamMembers"
              :key="member.id"
              class="px-4 py-2.5 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="flex items-center justify-center size-7 rounded-full bg-muted text-toned font-medium text-xs shrink-0">
                  {{ member.avatarText }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-highlighted truncate">{{ member.name }}</div>
                  <div class="text-xs text-muted truncate">{{ member.roleLabel }}</div>
                </div>
              </div>
              <div class="text-right font-mono shrink-0 tabular-nums">
                <div class="text-sm font-medium text-highlighted">
                  {{ formatCompactKZT(member.recoveredTotal) }}
                </div>
                <div class="text-xs text-muted">
                  {{ member.activeDealsCount }} сд. · {{ member.activeCasesCount }} дел
                </div>
              </div>
            </div>
          </PanelSection>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
