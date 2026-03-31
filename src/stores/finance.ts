import { defineStore } from 'pinia'
import financeApi from '@/api/finance'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    dashboardStats: null as any,
    invoices: [] as any[],
    claims: [] as any[],
    ledger: [] as any[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const { data } = await financeApi.getDashboard()
        this.dashboardStats = data
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load dashboard'
      } finally {
        this.loading = false
      }
    },

    async fetchInvoices(status?: string, patientId?: number) {
      this.loading = true
      try {
        const { data } = await financeApi.getInvoices(status, patientId)
        this.invoices = data.invoices || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load invoices'
      } finally {
        this.loading = false
      }
    },

    async fetchClaims(status?: string, patientId?: number) {
      this.loading = true
      try {
        const { data } = await financeApi.getClaims(status, patientId)
        this.claims = data.claims || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load claims'
      } finally {
        this.loading = false
      }
    },

    async fetchLedger(transactionType?: string) {
      this.loading = true
      try {
        const { data } = await financeApi.getLedger(transactionType)
        this.ledger = data.ledger || []
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to load ledger'
      } finally {
        this.loading = false
      }
    }
  }
})
