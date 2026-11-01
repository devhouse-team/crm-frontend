<script setup lang="ts">
defineProps<{
  collapsible?: boolean
  resizable?: boolean
}>()

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

const collapsed = computed(() => group.isSidebarCollapsed.value)
const isMobileOpen = computed({
  get: () => group.isMobileSidebarOpen.value,
  set: (val: boolean) => {
    group.isMobileSidebarOpen.value = val
  }
})
</script>

<template>
  <!-- Desktop Persistent Sidebar -->
  <aside
    class="hidden lg:flex flex-col shrink-0 h-full border-r border-default bg-elevated transition-[width] duration-200 select-none"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <div class="h-14 px-3 border-b border-default flex items-center shrink-0">
      <slot name="header" :collapsed="collapsed" />
    </div>

    <div class="flex-1 overflow-y-auto p-2.5">
      <slot :collapsed="collapsed" />
    </div>

    <div v-if="$slots.footer" class="p-2.5 border-t border-default shrink-0">
      <slot name="footer" :collapsed="collapsed" />
    </div>
  </aside>

  <!-- Mobile Slideover Sidebar -->
  <USlideover
    v-model:open="isMobileOpen"
    side="left"
    title="Навигация"
    description="Разделы системы"
  >
    <template #content>
      <div class="flex flex-col h-full bg-elevated">
        <div class="h-14 px-4 border-b border-default flex items-center justify-between">
          <slot name="header" :collapsed="false" />
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-x"
            aria-label="Закрыть меню"
            @click="isMobileOpen = false"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-4" @click="isMobileOpen = false">
          <slot :collapsed="false" />
        </div>
        <div v-if="$slots.footer" class="p-4 border-t border-default">
          <slot name="footer" :collapsed="false" />
        </div>
      </div>
    </template>
  </USlideover>
</template>
