import axios, { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Pharmacy API ───────────────────────────────────────────────────────

export const pharmacyAPI = {
  // Dashboard
  async getDashboard() {
    const response = await api.get('/pharmacy/dashboard')
    return response.data
  },

  // Prescriptions
  async listPrescriptions(filters?: any) {
    const response = await api.get('/pharmacy/prescriptions', { params: filters })
    return response.data
  },

  async getPrescription(rxId: number) {
    const response = await api.get(`/pharmacy/prescriptions/${rxId}`)
    return response.data
  },

  async dispensePrescription(rxId: number, items: any[]) {
    const response = await api.patch(`/pharmacy/prescriptions/${rxId}/dispense`, { items })
    return response.data
  },

  async cancelPrescription(rxId: number, reason: string) {
    const response = await api.patch(`/pharmacy/prescriptions/${rxId}/cancel`, { reason })
    return response.data
  },

  // Medicines
  async listMedicines(category?: string, search?: string) {
    const response = await api.get('/pharmacy/medicines', {
      params: { category, search },
    })
    return response.data
  },

  async getMedicine(medicineId: number) {
    const response = await api.get(`/pharmacy/medicines/${medicineId}`)
    return response.data
  },

  async createMedicine(data: any) {
    const response = await api.post('/pharmacy/medicines', data)
    return response.data
  },

  async updateMedicine(medicineId: number, data: any) {
    const response = await api.put(`/pharmacy/medicines/${medicineId}`, data)
    return response.data
  },

  // Medicine Batches
  async listBatches(medicineId: number) {
    const response = await api.get(`/pharmacy/medicines/${medicineId}/batches`)
    return response.data
  },

  async createBatch(medicineId: number, data: any) {
    const response = await api.post(`/pharmacy/medicines/${medicineId}/batches`, data)
    return response.data
  },

  // Stock Adjustments
  async adjustStock(medicineId: number, data: any) {
    const response = await api.post('/pharmacy/stock/adjust', {
      ...data,
      medicine_id: medicineId,
    })
    return response.data
  },

  // Alerts
  async getLowStockAlerts() {
    const response = await api.get('/pharmacy/alerts/low-stock')
    return response.data
  },

  async getExpiringAlerts(days?: number) {
    const response = await api.get('/pharmacy/alerts/expiring', {
      params: { days },
    })
    return response.data
  },

  // Partner Pharmacies
  async listPartnerPharmacies() {
    const response = await api.get('/pharmacy/partner-pharmacies')
    return response.data
  },

  // Transfer Requests
  async createTransferRequest(data: any) {
    const response = await api.post('/pharmacy/transfer-requests', data)
    return response.data
  },

  async listTransferRequests(status?: string) {
    const response = await api.get('/pharmacy/transfer-requests', {
      params: { status },
    })
    return response.data
  },

  async updateTransferRequest(transferId: number, status: string) {
    const response = await api.patch(`/pharmacy/transfer-requests/${transferId}`, { status })
    return response.data
  },
}
