<script setup lang="ts">
const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

function toggleCollapse() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

provide('dashboardGroup', {
  isSidebarCollapsed,
  isMobileSidebarOpen,
  toggleCollapse,
  toggleMobileSidebar
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-default text-default">
    <slot />
  </div>
</template>
