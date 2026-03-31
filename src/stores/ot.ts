import { defineStore } from 'pinia'
import otApi from '@/api/ot'

export const useOTStore = defineStore('ot', {
  state: () => ({
    dashboardStats: null as any,
    schedules: [] as any[],
    rooms: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const { data } = await otApi.getDashboard()
        this.dashboardStats = data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error'
      } finally {
        this.loading = false
      }
    },
    async fetchSchedules(roomId?: number, status?: string) {
      this.loading = true
      try {
        const { data } = await otApi.getSchedules(roomId, status)
        this.schedules = data.schedules || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error'
      } finally {
        this.loading = false
      }
    },
    async fetchRooms() {
      this.loading = true
      try {
        const { data } = await otApi.getRooms()
        this.rooms = data.rooms || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error'
      } finally {
        this.loading = false
      }
    }
  }
})
