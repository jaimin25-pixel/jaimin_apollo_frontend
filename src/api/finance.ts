import api from './axios'

export default {
  // Dashboard
  getDashboard() {
    return api.get('/finance/dashboard')
  },

  // Invoices
  getInvoices(status?: string, patientId?: number) {
    const params: any = {}
    if (status) params.status = status
    if (patientId) params.patient_id = patientId
    return api.get('/finance/invoices', { params })
  },
  getInvoice(id: number) {
    return api.get(`/finance/invoices/${id}`)
  },
  createInvoice(data: any) {
    return api.post('/finance/invoices', data)
  },
  updateInvoiceStatus(id: number, data: { status: string; payment_method?: string; reference?: string }) {
    return api.patch(`/finance/invoices/${id}/status`, data)
  },

  // Insurance Claims
  getClaims(status?: string, patientId?: number) {
    const params: any = {}
    if (status) params.status = status
    if (patientId) params.patient_id = patientId
    return api.get('/finance/insurance-claims', { params })
  },
  createClaim(data: any) {
    return api.post('/finance/insurance-claims', data)
  },
  updateClaimStatus(id: number, data: { status: string; notes?: string }) {
    return api.patch(`/finance/insurance-claims/${id}/status`, data)
  },

  // Ledger
  getLedger(transactionType?: string) {
    const params = transactionType ? { transaction_type: transactionType } : {}
    return api.get('/finance/ledger', { params })
  }
}
