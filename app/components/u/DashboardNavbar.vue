<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="min-h-14 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-2.5 min-w-0">
      <slot name="leading" />
      <h1 v-if="title" class="text-base sm:text-lg font-semibold text-highlighted truncate">
        {{ title }}
      </h1>
      <slot name="left" />
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <slot />
      <slot name="right" />
    </div>
  </div>
</template>
