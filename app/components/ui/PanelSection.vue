<script setup lang="ts">
defineProps<{
  title: string
  bodyClass?: string
  noPadding?: boolean
}>()
</script>

<template>
  <section class="rounded-lg border border-default bg-elevated overflow-hidden flex flex-col">
    <header class="px-4 py-3 border-b border-default flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-highlighted truncate">
        {{ title }}
      </h2>
      <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </header>
    <div :class="bodyClass ?? (noPadding ? '' : 'p-4')">
      <slot />
    </div>
  </section>
</template>
