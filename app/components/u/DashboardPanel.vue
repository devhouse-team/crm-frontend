<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>

<template>
  <main :id="id" class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-default">
    <header v-if="$slots.header" class="shrink-0 bg-elevated border-b border-default">
      <slot name="header" />
    </header>

    <div v-if="$slots.body" class="flex-1 overflow-y-auto min-h-0">
      <slot name="body" />
    </div>

    <slot />

    <footer v-if="$slots.footer" class="shrink-0 bg-elevated border-t border-default">
      <slot name="footer" />
    </footer>
  </main>
</template>
