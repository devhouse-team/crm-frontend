<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <UTooltip :text="label ?? 'Заполнено ИИ'">
    <span class="inline-flex items-center">
      <UIcon
        name="i-lucide-bot"
        class="size-3.5 text-secondary shrink-0"
        :aria-label="label ?? 'Заполнено ИИ'"
        role="img"
      />
    </span>
  </UTooltip>
</template>
