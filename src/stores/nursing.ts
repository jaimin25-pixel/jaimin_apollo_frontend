import { defineStore } from 'pinia'
import nursingApi from '@/api/nursing'

export const useNursingStore = defineStore('nursing', {
  state: () => ({
    dashboardStats: null as any,
    wards: [] as any[],
    beds: [] as any[],
    patientVitals: [] as any[],
    patientMAR: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDashboard(wardId?: number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await nursingApi.getDashboard(wardId)
        this.dashboardStats = data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load dashboard'
      } finally {
        this.loading = false
      }
    },

    async fetchWards(deptId?: number) {
      this.loading = true
      try {
        const { data } = await nursingApi.getWards(deptId)
        this.wards = data.wards || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load wards'
      } finally {
        this.loading = false
      }
    },

    async fetchBeds(wardId: number, status?: string) {
      this.loading = true
      try {
        const { data } = await nursingApi.getBeds(wardId, status)
        this.beds = data.beds || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load beds'
      } finally {
        this.loading = false
      }
    },

    async fetchPatientVitals(patientId: number) {
      this.loading = true
      try {
        const { data } = await nursingApi.getPatientVitals(patientId)
        this.patientVitals = data.vitals || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load vitals'
      } finally {
        this.loading = false
      }
    },

    async fetchPatientMAR(patientId: number) {
        this.loading = true
        try {
          const { data } = await nursingApi.getPatientMAR(patientId)
          this.patientMAR = data.mar || []
        } catch (err: any) {
          this.error = err.response?.data?.error || 'Failed to load MAR'
        } finally {
          this.loading = false
        }
    }
  }
})
