<script setup lang="ts">
defineProps<{
  size?: 'xs' | 'sm' | 'md'
}>()

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <UButton
      color="neutral"
      variant="ghost"
      :size="size || 'xs'"
      :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
      :aria-label="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
      @click="toggleTheme"
    />
    <template #fallback>
      <div class="size-7" />
    </template>
  </ClientOnly>
</template>
