<script setup lang="ts">
const group = inject<{
  isSidebarCollapsed: Ref<boolean>
  isMobileSidebarOpen: Ref<boolean>
  toggleCollapse: () => void
  toggleMobileSidebar: () => void
}>('dashboardGroup', {
  isSidebarCollapsed: ref(false),
  isMobileSidebarOpen: ref(false),
  toggleCollapse: () => {},
  toggleMobileSidebar: () => {}
})
</script>

<template>
  <div class="inline-flex items-center">
    <!-- Desktop Collapse Toggle -->
    <UButton
      color="neutral"
      variant="ghost"
      size="xs"
      :icon="group.isSidebarCollapsed.value ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
      class="hidden lg:inline-flex"
      aria-label="Свернуть или развернуть боковую панель"
      @click="group.toggleCollapse()"
    />
    <!-- Mobile Drawer Trigger -->
    <UButton
      color="neutral"
      variant="ghost"
      size="xs"
      icon="i-lucide-menu"
      class="lg:hidden"
      aria-label="Открыть меню"
      @click="group.toggleMobileSidebar()"
    />
  </div>
</template>
