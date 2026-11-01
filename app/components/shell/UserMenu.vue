<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuthStore } from '~/stores/useAuthStore'
import { usePipelineStore } from '~/stores/usePipelineStore'
import { useWhatsAppStore } from '~/stores/useWhatsAppStore'
import type { UserRole } from '~/types/crm'

defineProps<{
  collapsed?: boolean
}>()

const authStore = useAuthStore()
const pipelineStore = usePipelineStore()
const whatsappStore = useWhatsAppStore()
const colorMode = useColorMode()
const toast = useToast()

const isDark = computed(() => colorMode.value === 'dark')

function handleSimulateWhatsApp() {
  const deal = whatsappStore.simulateIncomingWhatsAppLead()
  toast.add({
    title: 'Новый лид WhatsApp',
    description: `${deal.code} · ${deal.clientName}`,
    color: 'success',
    icon: 'i-lucide-message-square-plus'
  })
  pipelineStore.openDealWorkspace(deal.id, 'main')
}

const roles: { role: UserRole; label: string }[] = [
  { role: 'executive', label: 'Руководитель' },
  { role: 'lawyer', label: 'Юрист' },
  { role: 'manager', label: 'Менеджер' }
]

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Роль (RBAC)',
      type: 'label'
    },
    ...roles.map(r => ({
      label: r.label,
      type: 'checkbox' as const,
      checked: authStore.currentRole === r.role,
      onSelect() {
        authStore.switchRoleDemo(r.role)
      }
    })),
    {
      label: 'Сменить сотрудника',
      icon: 'i-lucide-users',
      children: authStore.teamMembers.map(member => ({
        label: `${member.name} · ${member.roleLabel}`,
        type: 'checkbox' as const,
        checked: authStore.currentUserId === member.id,
        onSelect() {
          authStore.switchUserById(member.id)
        }
      }))
    }
  ],
  [
    {
      label: 'Демо',
      type: 'label'
    },
    {
      label: 'Входящий лид WhatsApp',
      icon: 'i-lucide-message-square-plus',
      onSelect() {
        handleSimulateWhatsApp()
      }
    }
  ],
  [
    {
      label: isDark.value ? 'Светлая тема' : 'Тёмная тема',
      icon: isDark.value ? 'i-lucide-sun' : 'i-lucide-moon',
      onSelect() {
        colorMode.preference = isDark.value ? 'light' : 'dark'
      }
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="menuItems"
    :content="{ side: collapsed ? 'right' : 'top', align: 'start' }"
  >
    <button
      type="button"
      class="w-full flex items-center gap-2.5 rounded-md p-1.5 hover:bg-accented/60 transition-colors text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      :class="collapsed ? 'justify-center' : ''"
      aria-label="Меню профиля и демо"
    >
      <span class="flex items-center justify-center size-7 rounded-full bg-accented text-highlighted font-medium text-xs shrink-0">
        {{ authStore.currentUser.avatarText }}
      </span>
      <template v-if="!collapsed">
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-medium text-highlighted truncate leading-tight">
            {{ authStore.currentUser.name }}
          </span>
          <span class="block text-xs text-muted truncate leading-tight mt-0.5">
            {{ authStore.currentUser.roleLabel }}
          </span>
        </span>
        <UIcon name="i-lucide-chevrons-up-down" class="size-4 text-muted shrink-0" aria-hidden="true" />
      </template>
    </button>
  </UDropdownMenu>
</template>
