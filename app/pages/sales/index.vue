<script setup lang="ts">
import { usePipelineStore } from '~/stores/usePipelineStore'
import {
  formatKZT,
  READINESS_TAG_META,
  SCENARIO_LABELS
} from '~/utils/formatters'
import type { ReadinessTag, Deal } from '~/types/crm'

const pipelineStore = usePipelineStore()
const toast = useToast()

const viewMode = ref<'kanban' | 'table'>('kanban')
const searchQuery = ref('')
const selectedTagFilter = ref<ReadinessTag | 'ALL'>('ALL')
const onlyWaitingManager = ref(false)

// New Deal Modal State
const isNewDealModalOpen = ref(false)
const newDealForm = reactive({
  clientName: '',
  clientPhone: '+7 (701) ',
  iinBin: '',
  debtAmount: 3_200_000,
  scenario: 'bailiff_inaction' as Deal['scenario'],
  proceedingNumber: '№ 3104/26-75-1102',
  bailiffName: 'ЧСИ Сапаров К.М. (г. Алматы)',
  region: 'г. Алматы'
})

const filteredDeals = computed(() => {
  return pipelineStore.salesDeals.filter((d) => {
    if (selectedTagFilter.value !== 'ALL' && d.readinessTag !== selectedTagFilter.value) {
      return false
    }
    if (onlyWaitingManager.value && d.whatsappStatus !== 'waiting_manager') {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      return (
        d.clientName.toLowerCase().includes(q) ||
        d.iinBin.toLowerCase().includes(q) ||
        d.clientPhone.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.proceedingNumber.toLowerCase().includes(q)
      )
    }
    return true
  })
})

function handleCreateNewDeal() {
  if (!newDealForm.clientName.trim()) return
  const created = pipelineStore.createNewDeal({
    clientName: newDealForm.clientName,
    clientPhone: newDealForm.clientPhone,
    iinBin: newDealForm.iinBin,
    debtAmount: newDealForm.debtAmount,
    scenario: newDealForm.scenario,
    scenarioLabel: SCENARIO_LABELS[newDealForm.scenario] || 'Взыскание задолженности',
    proceedingNumber: newDealForm.proceedingNumber,
    bailiffName: newDealForm.bailiffName,
    region: newDealForm.region
  })
  isNewDealModalOpen.value = false
  newDealForm.clientName = ''

  if (created.conflictStatus === 'flagged') {
    toast.add({
      title: 'Конфликт интересов',
      description: `${created.code} создана, отправка КП заблокирована.`,
      color: 'error',
      icon: 'i-lucide-shield-alert'
    })
  } else {
    toast.add({
      title: `Сделка ${created.code} создана`,
      color: 'success',
      icon: 'i-lucide-check'
    })
  }
  pipelineStore.openDealWorkspace(created.id, 'main')
}
</script>

<template>
  <UDashboardPanel id="sales-pipeline-panel">
    <template #header>
      <UDashboardNavbar title="Продажи">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-lucide-plus"
            label="Новая сделка"
            @click="isNewDealModalOpen = true"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <div class="flex items-center gap-2 flex-wrap">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              size="xs"
              placeholder="Поиск по клиенту, ИИН/БИН, № ИП"
              class="w-60"
            />

            <!-- Readiness Tag Filter Chips (A / B / C / D — ТЗ §5) -->
            <div class="flex items-center gap-1">
              <UButton
                :color="selectedTagFilter === 'ALL' ? 'primary' : 'neutral'"
                :variant="selectedTagFilter === 'ALL' ? 'solid' : 'outline'"
                size="xs"
                label="Все"
                @click="selectedTagFilter = 'ALL'"
              />
              <UButton
                v-for="tag in (['A', 'B', 'C', 'D'] as ReadinessTag[])"
                :key="tag"
                :color="selectedTagFilter === tag ? READINESS_TAG_META[tag].color : 'neutral'"
                :variant="selectedTagFilter === tag ? 'solid' : 'outline'"
                size="xs"
                :label="READINESS_TAG_META[tag].shortLabel"
                @click="selectedTagFilter = selectedTagFilter === tag ? 'ALL' : tag"
              />
            </div>

            <UButton
              :color="onlyWaitingManager ? 'warning' : 'neutral'"
              :variant="onlyWaitingManager ? 'solid' : 'outline'"
              size="xs"
              label="Ждут ответа"
              @click="onlyWaitingManager = !onlyWaitingManager"
            />
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
        <!-- Kanban Mode -->
        <KanbanBoard
          v-if="viewMode === 'kanban'"
          mode="sales"
          :stages="pipelineStore.salesStages"
          :deals="filteredDeals"
        />

        <!-- Dense Table Mode -->
        <div v-else class="rounded-lg border border-default bg-elevated overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="border-b border-default bg-muted/50 text-xs font-medium text-muted">
                  <th class="py-2.5 px-3">Клиент</th>
                  <th class="py-2.5 px-3">ИИН/БИН · № ИП</th>
                  <th class="py-2.5 px-3">Тег</th>
                  <th class="py-2.5 px-3">Этап</th>
                  <th class="py-2.5 px-3 text-right">Долг</th>
                  <th class="py-2.5 px-3 text-right">Тариф</th>
                  <th class="py-2.5 px-3">Статус</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="deal in filteredDeals"
                  :key="deal.id"
                  tabindex="0"
                  class="hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  @click="pipelineStore.openDealWorkspace(deal.id, 'main')"
                  @keydown.enter.prevent="pipelineStore.openDealWorkspace(deal.id, 'main')"
                >
                  <td class="py-2.5 px-3">
                    <div class="font-mono text-xs text-muted">{{ deal.code }}</div>
                    <div class="font-medium text-highlighted">{{ deal.clientName }}</div>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-xs">
                    <div class="text-toned">{{ deal.iinBin }}</div>
                    <div class="text-muted">{{ deal.proceedingNumber }}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <UBadge
                      :color="READINESS_TAG_META[deal.readinessTag].color"
                      :label="READINESS_TAG_META[deal.readinessTag].shortLabel"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-default">
                    {{ pipelineStore.getStageName(deal.stageId) }}
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-medium text-highlighted tabular-nums">
                    {{ formatKZT(deal.debtAmount) }}
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono text-toned tabular-nums">
                    {{ formatKZT(deal.recommendedFee) }}
                    <span v-if="deal.debtAmount" class="text-xs text-muted">
                      ({{ Math.round((deal.recommendedFee / deal.debtAmount) * 100) }}%)
                    </span>
                  </td>
                  <td class="py-2.5 px-3">
                    <UBadge
                      v-if="deal.conflictStatus === 'flagged'"
                      color="error"
                      label="Конфликт"
                    />
                    <UBadge
                      v-else-if="deal.whatsappStatus === 'waiting_manager'"
                      color="warning"
                      label="Ждёт ответа"
                    />
                    <span v-else class="text-xs text-muted">Проверено</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create New Deal Modal -->
      <UModal
        v-model:open="isNewDealModalOpen"
        title="Новая сделка"
        description="Проверка конфликта по ИИН/БИН и расчёт тарифа выполняются автоматически."
      >
        <template #body>
          <form class="space-y-3 text-sm" @submit.prevent="handleCreateNewDeal">
            <div>
              <label for="new-deal-client" class="block text-xs font-medium text-highlighted mb-1">Клиент *</label>
              <UInput id="new-deal-client" v-model="newDealForm.clientName" required placeholder="ФИО или наименование ТОО" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="new-deal-phone" class="block text-xs font-medium text-highlighted mb-1">Телефон</label>
                <UInput id="new-deal-phone" v-model="newDealForm.clientPhone" class="font-mono" />
              </div>
              <div>
                <label for="new-deal-iin" class="block text-xs font-medium text-highlighted mb-1">ИИН / БИН</label>
                <UInput
                  id="new-deal-iin"
                  v-model="newDealForm.iinBin"
                  class="font-mono"
                  placeholder="12 цифр"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="new-deal-debt" class="block text-xs font-medium text-highlighted mb-1">Сумма долга (₸)</label>
                <UInput id="new-deal-debt" v-model.number="newDealForm.debtAmount" type="number" class="font-mono" />
              </div>
              <div>
                <label for="new-deal-proc" class="block text-xs font-medium text-highlighted mb-1">Номер ИП</label>
                <UInput id="new-deal-proc" v-model="newDealForm.proceedingNumber" class="font-mono" />
              </div>
            </div>

            <div>
              <label for="new-deal-scenario" class="block text-xs font-medium text-highlighted mb-1">Ситуация</label>
              <select
                id="new-deal-scenario"
                v-model="newDealForm.scenario"
                class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
              >
                <option
                  v-for="(label, key) in SCENARIO_LABELS"
                  :key="key"
                  :value="key"
                >
                  {{ label }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <UButton color="neutral" variant="outline" label="Отмена" @click="isNewDealModalOpen = false" />
              <UButton type="submit" color="primary" variant="solid" icon="i-lucide-check" label="Создать сделку" />
            </div>
          </form>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
