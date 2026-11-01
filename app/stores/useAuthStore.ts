import { defineStore } from 'pinia'
import type { TeamMember, UserRole } from '~/types/crm'

export const useAuthStore = defineStore('auth', () => {
  const teamMembers = ref<TeamMember[]>([
    {
      id: 'u-1',
      name: 'Нурлан Сатпаев',
      role: 'executive',
      roleLabel: 'Руководитель',
      email: 'n.satpayev@yurkontrol.kz',
      phone: '+7 (701) 210-44-01',
      avatarText: 'НС',
      activeDealsCount: 8,
      activeCasesCount: 12,
      recoveredTotal: 48_500_000,
      online: true
    },
    {
      id: 'u-2',
      name: 'Алия Касымова',
      role: 'lawyer',
      roleLabel: 'Старший юрист',
      email: 'a.kassymova@yurkontrol.kz',
      phone: '+7 (702) 845-19-20',
      avatarText: 'АК',
      activeDealsCount: 3,
      activeCasesCount: 9,
      recoveredTotal: 31_200_000,
      online: true
    },
    {
      id: 'u-3',
      name: 'Данияр Ахметов',
      role: 'lawyer',
      roleLabel: 'Юрист по исполнительному производству',
      email: 'd.akhmetov@yurkontrol.kz',
      phone: '+7 (707) 391-55-82',
      avatarText: 'ДА',
      activeDealsCount: 2,
      activeCasesCount: 7,
      recoveredTotal: 19_400_000,
      online: true
    },
    {
      id: 'u-4',
      name: 'Айгерим Оспанова',
      role: 'manager',
      roleLabel: 'Менеджер по продажам',
      email: 'a.ospanova@yurkontrol.kz',
      phone: '+7 (705) 612-88-34',
      avatarText: 'АО',
      activeDealsCount: 14,
      activeCasesCount: 0,
      recoveredTotal: 14_800_000,
      online: true
    },
    {
      id: 'u-5',
      name: 'Тимур Жумабаев',
      role: 'manager',
      roleLabel: 'Менеджер по продажам (WhatsApp)',
      email: 't.zhumabayev@yurkontrol.kz',
      phone: '+7 (777) 901-23-11',
      avatarText: 'ТЖ',
      activeDealsCount: 11,
      activeCasesCount: 0,
      recoveredTotal: 11_150_000,
      online: true
    },
    {
      id: 'u-6',
      name: 'Мадина Ержанова',
      role: 'lawyer',
      roleLabel: 'Юрист судебной практики',
      email: 'm.yerzhanova@yurkontrol.kz',
      phone: '+7 (701) 442-10-99',
      avatarText: 'МЕ',
      activeDealsCount: 1,
      activeCasesCount: 6,
      recoveredTotal: 22_700_000,
      online: false
    }
  ])

  const currentUserId = ref<string>('u-1')

  const currentUser = computed<TeamMember>(() => {
    return teamMembers.value.find(m => m.id === currentUserId.value) ?? teamMembers.value[0]!
  })

  const currentRole = computed<UserRole>(() => currentUser.value.role)

  const canResolveConflicts = computed(() => currentRole.value === 'executive')
  const canEditSettings = computed(() => currentRole.value === 'executive')
  const canManageTeam = computed(() => currentRole.value === 'executive')

  function switchUserById(userId: string) {
    if (teamMembers.value.some(m => m.id === userId)) {
      currentUserId.value = userId
    }
  }

  function switchRoleDemo(role: UserRole) {
    const found = teamMembers.value.find(m => m.role === role)
    if (found) {
      currentUserId.value = found.id
    }
  }

  function addTeamMember(payload: {
    name: string
    role: UserRole
    email: string
    phone: string
  }) {
    const roleLabelMap: Record<UserRole, string> = {
      executive: 'Руководитель',
      lawyer: 'Юрист',
      manager: 'Менеджер по продажам'
    }
    const parts = payload.name.trim().split(/\s+/)
    const initials = parts.map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2) || 'СК'
    const newMember: TeamMember = {
      id: `u-${Date.now()}`,
      name: payload.name.trim(),
      role: payload.role,
      roleLabel: roleLabelMap[payload.role],
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      avatarText: initials,
      activeDealsCount: 0,
      activeCasesCount: 0,
      recoveredTotal: 0,
      online: true
    }
    teamMembers.value.push(newMember)
    return newMember
  }

  return {
    teamMembers,
    currentUserId,
    currentUser,
    currentRole,
    canResolveConflicts,
    canEditSettings,
    canManageTeam,
    switchUserById,
    switchRoleDemo,
    addTeamMember
  }
})
