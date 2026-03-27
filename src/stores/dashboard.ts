import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDashboard } from '@/api/dashboard'
import type { DashboardStats, AuditLogEntry } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const recentActivity = ref<AuditLogEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard() {
    isLoading.value = true
    error.value = null
    try {
      const data = await getDashboard()
      stats.value = data.stats
      recentActivity.value = data.recent_activity
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to load dashboard'
    } finally {
      isLoading.value = false
    }
  }

  return { stats, recentActivity, isLoading, error, fetchDashboard }
})
