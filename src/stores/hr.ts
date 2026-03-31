import { defineStore } from 'pinia'
import hrApi from '@/api/hr'

export const useHRStore = defineStore('hr', {
  state: () => ({
    dashboardStats: null as any,
    staffList: [] as any[],
    attendance: [] as any[],
    leaves: [] as any[],
    payroll: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const { data } = await hrApi.getDashboard()
        this.dashboardStats = data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error'
      } finally {
        this.loading = false
      }
    },
    async fetchStaff() {
      this.loading = true
      try {
        const { data } = await hrApi.getStaff()
        this.staffList = data.staff || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error'
      } finally {
        this.loading = false
      }
    },
    async fetchLeaves() {
      this.loading = true
      try {
        const { data } = await hrApi.getLeaves()
        this.leaves = data.leaves || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error'
      } finally {
        this.loading = false
      }
    }
  }
})
