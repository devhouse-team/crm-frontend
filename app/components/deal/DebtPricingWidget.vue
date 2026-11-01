<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { usePipelineStore } from '~/stores/usePipelineStore'
import { formatKZT } from '~/utils/formatters'
import type { Deal } from '~/types/crm'

const props = defineProps<{
  deal: Deal
}>()

const settingsStore = useSettingsStore()
const pipelineStore = usePipelineStore()
const toast = useToast()

const calc = computed(() => {
  return settingsStore.calculatePricing(props.deal.debtAmount)
})

const localDebtInput = ref<number>(props.deal.debtAmount ?? 0)

watch(
  () => props.deal.debtAmount,
  (val) => {
    localDebtInput.value = val ?? 0
  }
)

function handleUpdateDebt() {
  if (localDebtInput.value > 0) {
    pipelineStore.updateDealDebtAmount(props.deal.id, Number(localDebtInput.value))
    toast.add({
      title: 'Тариф пересчитан',
      description: `${formatKZT(calc.value.recommendedFixedFee)} (${calc.value.feePercentOfDebt}% от долга)`,
      color: 'success',
      icon: 'i-lucide-calculator'
    })
  }
}

function selectTariff(mode: 'fixed' | 'success_fee') {
  props.deal.selectedTariffMode = mode
  toast.add({
    title: mode === 'fixed' ? 'Тариф: фиксированный' : 'Тариф: оплата по результату',
    description:
      mode === 'fixed'
        ? formatKZT(calc.value.recommendedFixedFee)
        : `${formatKZT(calc.value.alternativeFixedFee)} + ${calc.value.alternativeSuccessPercent}%`,
    color: 'primary',
    icon: 'i-lucide-check'
  })
}
</script>

<template>
  <div class="rounded-lg border border-default bg-elevated p-4 space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-highlighted">
        Тариф
      </h3>

      <UBadge
        :color="calc.isHighRatioWarning ? 'warning' : 'neutral'"
        class="font-mono"
        :label="`${calc.feePercentOfDebt}% от долга`"
      />
    </div>

    <!-- Debt Input & Matched Bracket -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
      <div>
        <label for="pricing-debt-input" class="text-xs text-muted mb-1 flex items-center gap-1.5">
          <span>Сумма долга (₸)</span>
          <AiMarker v-if="deal.aiPopulatedFields.includes('debtAmount')" />
        </label>
        <div class="flex items-center gap-1.5">
          <UInput
            id="pricing-debt-input"
            v-model.number="localDebtInput"
            type="number"
            size="sm"
            placeholder="4500000"
            class="font-mono flex-1"
          />
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            label="Пересчитать"
            @click="handleUpdateDebt"
          />
        </div>
      </div>

      <div class="px-3 py-2 rounded-md bg-muted/50 border border-default text-xs">
        <div class="font-medium text-highlighted truncate">{{ calc.bracket.label }}</div>
        <div class="text-muted truncate">{{ calc.bracket.recommendedPackageName }}</div>
      </div>
    </div>

    <!-- High Fee Ratio Alert Banner -->
    <UAlert
      v-if="calc.isHighRatioWarning"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="`Тариф превышает порог ${calc.thresholdPercent}% (${calc.feePercentOfDebt}% от долга)`"
      description="Рекомендуется предложить оплату по результату."
    />

    <!-- Tariff Comparison Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <button
        type="button"
        class="p-3 rounded-md border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
        :class="
          deal.selectedTariffMode === 'fixed'
            ? 'border-primary bg-primary/5'
            : 'border-default bg-default hover:border-accented'
        "
        @click="selectTariff('fixed')"
      >
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-medium text-highlighted">Фиксированный</span>
          <UBadge
            v-if="deal.selectedTariffMode === 'fixed'"
            color="primary"
            label="Выбран"
          />
        </div>
        <div class="text-base font-semibold font-mono text-highlighted tabular-nums">
          {{ formatKZT(calc.recommendedFixedFee) }}
        </div>
        <div class="text-xs text-muted mt-0.5">
          {{ calc.feePercentOfDebt }}% от суммы долга
        </div>
      </button>

      <button
        type="button"
        class="p-3 rounded-md border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
        :class="
          deal.selectedTariffMode === 'success_fee'
            ? 'border-primary bg-primary/5'
            : 'border-default bg-default hover:border-accented'
        "
        @click="selectTariff('success_fee')"
      >
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-medium text-highlighted">По результату</span>
          <UBadge
            v-if="deal.selectedTariffMode === 'success_fee'"
            color="primary"
            label="Выбран"
          />
          <UBadge
            v-else-if="calc.isHighRatioWarning"
            color="warning"
            label="Рекомендован"
          />
        </div>
        <div class="text-base font-semibold font-mono text-highlighted tabular-nums">
          {{ formatKZT(calc.alternativeFixedFee) }} + {{ calc.alternativeSuccessPercent }}%
        </div>
        <div class="text-xs text-muted mt-0.5">
          Бонус ~{{ formatKZT(calc.estimatedSuccessBonus) }}
        </div>
      </button>
    </div>
  </div>
</template>
