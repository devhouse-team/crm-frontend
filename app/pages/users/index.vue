<script setup lang="ts">
import { useAuthStore } from '~/stores/useAuthStore'
import { formatKZT } from '~/utils/formatters'
import type { UserRole } from '~/types/crm'

const authStore = useAuthStore()
const toast = useToast()

const isAddModalOpen = ref(false)
const newMemberForm = reactive({
  name: '',
  role: 'lawyer' as UserRole,
  email: '',
  phone: '+7 (701) '
})

function handleAddMember() {
  if (!newMemberForm.name.trim()) return
  const added = authStore.addTeamMember({
    name: newMemberForm.name,
    role: newMemberForm.role,
    email: newMemberForm.email || 'staff@yurkontrol.kz',
    phone: newMemberForm.phone
  })
  isAddModalOpen.value = false
  newMemberForm.name = ''
  newMemberForm.email = ''

  toast.add({
    title: 'Сотрудник добавлен',
    description: `${added.name} · ${added.roleLabel}`,
    color: 'success',
    icon: 'i-lucide-user-plus'
  })
}
</script>

<template>
  <UDashboardPanel id="users-rbac-panel">
    <template #header>
      <UDashboardNavbar title="Сотрудники">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-lucide-plus"
            label="Добавить"
            @click="isAddModalOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6 max-w-[1440px] mx-auto">
        <!-- Team Directory Table -->
        <PanelSection title="Команда" no-padding>
          <template #actions>
            <span class="text-xs font-mono text-muted">{{ authStore.teamMembers.length }}</span>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-default bg-default text-xs font-medium text-muted">
                  <th class="py-2.5 px-4">Сотрудник</th>
                  <th class="py-2.5 px-4">Роль</th>
                  <th class="py-2.5 px-4">Контакты</th>
                  <th class="py-2.5 px-4 text-right">Продажи</th>
                  <th class="py-2.5 px-4 text-right">Дела</th>
                  <th class="py-2.5 px-4 text-right">Взыскано</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="member in authStore.teamMembers"
                  :key="member.id"
                  class="hover:bg-accented/30 transition-colors"
                  :class="authStore.currentUserId === member.id ? 'bg-primary/5' : ''"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="flex items-center justify-center size-7 rounded-full bg-accented text-highlighted font-semibold text-xs shrink-0">
                        {{ member.avatarText }}
                      </div>
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-sm font-medium text-highlighted truncate">{{ member.name }}</span>
                        <UBadge
                          v-if="authStore.currentUserId === member.id"
                          color="primary"
                          label="Текущий"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <UBadge
                      :color="
                        member.role === 'executive'
                          ? 'primary'
                          : member.role === 'lawyer'
                            ? 'secondary'
                            : 'neutral'
                      "
                      :label="member.roleLabel"
                    />
                  </td>
                  <td class="py-3 px-4 font-mono text-xs">
                    <div class="text-default">{{ member.phone }}</div>
                    <div class="text-muted">{{ member.email }}</div>
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-default tabular-nums">
                    {{ member.activeDealsCount }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-default tabular-nums">
                    {{ member.activeCasesCount }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-semibold text-highlighted tabular-nums">
                    {{ formatKZT(member.recoveredTotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </PanelSection>

        <!-- Role Permission Matrix -->
        <PanelSection title="Права ролей" no-padding>
          <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-default text-xs">
            <div class="p-4 space-y-2">
              <div class="font-semibold text-sm text-highlighted">Руководитель</div>
              <ul class="space-y-1.5 text-muted">
                <li>Полный доступ к сделкам, делам и аналитике</li>
                <li>Решения по конфликтам интересов</li>
                <li>Настройка тарифной сетки и календаря</li>
                <li>Контроль просроченных процессуальных сроков</li>
              </ul>
            </div>

            <div class="p-4 space-y-2">
              <div class="font-semibold text-sm text-highlighted">Юрист</div>
              <ul class="space-y-1.5 text-muted">
                <li>Ведение назначенных дел</li>
                <li>Подготовка процессуальных документов по шаблонам</li>
                <li>Контроль сроков в рабочих днях и учёт взысканий</li>
                <li>Переписка с доверителями в WhatsApp</li>
              </ul>
            </div>

            <div class="p-4 space-y-2">
              <div class="font-semibold text-sm text-highlighted">Менеджер по продажам</div>
              <ul class="space-y-1.5 text-muted">
                <li>Обработка входящих диалогов и перехват у ИИ</li>
                <li>Сбор первичных документов и данных должника</li>
                <li>Расчёт тарифа и отправка коммерческого предложения</li>
                <li>Сопровождение до подписания договора и оплаты</li>
              </ul>
            </div>
          </div>
        </PanelSection>
      </div>

      <!-- Add Team Member Modal -->
      <UModal
        v-model:open="isAddModalOpen"
        title="Новый сотрудник"
        description="Укажите контактные данные и роль доступа"
      >
        <template #body>
          <form class="space-y-3 text-xs" @submit.prevent="handleAddMember">
            <div>
              <label class="block font-medium text-highlighted mb-1">ФИО</label>
              <UInput v-model="newMemberForm.name" required placeholder="Сейдахметов Бахытжан" class="w-full" />
            </div>
            <div>
              <label class="block font-medium text-highlighted mb-1">Роль</label>
              <select
                v-model="newMemberForm.role"
                aria-label="Роль"
                class="w-full rounded-md border border-default bg-default px-3 py-2 text-xs text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
              >
                <option value="lawyer">Юрист</option>
                <option value="manager">Менеджер по продажам</option>
                <option value="executive">Руководитель</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-highlighted mb-1">Email</label>
                <UInput v-model="newMemberForm.email" placeholder="user@yurkontrol.kz" class="w-full" />
              </div>
              <div>
                <label class="block font-medium text-highlighted mb-1">Телефон</label>
                <UInput v-model="newMemberForm.phone" class="w-full font-mono" />
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <UButton color="neutral" variant="outline" label="Отмена" @click="isAddModalOpen = false" />
              <UButton type="submit" color="primary" variant="solid" label="Добавить" />
            </div>
          </form>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
