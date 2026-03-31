import { defineStore } from 'pinia'
import labApi from '@/api/lab'

export const useLabStore = defineStore('lab', {
  state: () => ({
    dashboardStats: null as any,
    tests: [] as any[],
    labOrders: [] as any[],
    radiologyOrders: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = null
      try {
        const { data } = await labApi.getDashboard()
        this.dashboardStats = data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load dashboard'
      } finally {
        this.loading = false
      }
    },

    async fetchTests(category?: string) {
      this.loading = true
      try {
        const { data } = await labApi.getTests(category)
        this.tests = data.tests || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load tests'
      } finally {
        this.loading = false
      }
    },

    async fetchLabOrders(status?: string, patientId?: number) {
      this.loading = true
      try {
        const { data } = await labApi.getLabOrders(status, patientId)
        this.labOrders = data.orders || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load orders'
      } finally {
        this.loading = false
      }
    },

    async fetchRadiologyOrders(status?: string, patientId?: number) {
        this.loading = true
        try {
          const { data } = await labApi.getRadiologyOrders(status, patientId)
          this.radiologyOrders = data.orders || []
        } catch (err: any) {
          this.error = err.response?.data?.error || 'Failed to load radiology orders'
        } finally {
          this.loading = false
        }
    }
  }
})
