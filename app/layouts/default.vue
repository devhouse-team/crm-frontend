<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'

const pipelineStore = usePipelineStore()
const whatsappStore = useWhatsAppStore()

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Обзор',
      icon: 'i-lucide-layout-dashboard',
      to: '/'
    },
    {
      label: 'Продажи',
      icon: 'i-lucide-kanban',
      to: '/sales',
      badge: `${pipelineStore.salesDeals.length}`
    },
    {
      label: 'Дела',
      icon: 'i-lucide-scale',
      to: '/cases',
      badge:
        pipelineStore.overdueTasksCount > 0
          ? { label: `${pipelineStore.overdueTasksCount}`, color: 'error' as const, variant: 'subtle' as const }
          : `${pipelineStore.caseDeals.length}`
    },
    {
      label: 'Входящие',
      icon: 'i-lucide-message-square-text',
      to: '/inbox',
      badge:
        whatsappStore.waitingManagerCount > 0
          ? { label: `${whatsappStore.waitingManagerCount}`, color: 'warning' as const, variant: 'subtle' as const }
          : undefined
    }
  ],
  [
    {
      label: 'Конфликты',
      icon: 'i-lucide-shield-alert',
      to: '/conflicts',
      badge:
        pipelineStore.pendingConflictsCount > 0
          ? { label: `${pipelineStore.pendingConflictsCount}`, color: 'error' as const, variant: 'subtle' as const }
          : undefined
    },
    {
      label: 'Аналитика',
      icon: 'i-lucide-bar-chart-3',
      to: '/analytics'
    },
    {
      label: 'Сотрудники',
      icon: 'i-lucide-users',
      to: '/users'
    },
    {
      label: 'Настройки',
      icon: 'i-lucide-settings-2',
      to: '/settings'
    }
  ]
])
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <div class="flex items-center justify-between w-full gap-2 px-1">
          <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0">
            <div class="flex items-center justify-center size-7 rounded-md bg-primary text-inverted font-semibold text-xs shrink-0">
              ЮК
            </div>
            <span v-if="!collapsed" class="text-sm font-semibold text-highlighted truncate">
              ЮрКонтроль
            </span>
          </NuxtLink>
          <UColorModeButton v-if="!collapsed" size="xs" />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navItems"
          orientation="vertical"
          tooltip
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />

    <!-- Global Split-Pane Deal & WhatsApp Workspace Slide-over -->
    <DealSlideover />
  </UDashboardGroup>
</template>
