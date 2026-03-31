import api from './axios'

export default {
  // Dashboard
  getDashboard() {
    return api.get('/lab/dashboard')
  },

  // Catalogs
  getTests(category?: string) {
    const params = category ? { category } : {}
    return api.get('/lab/tests', { params })
  },
  createTest(data: any) {
    return api.post('/lab/tests', data)
  },
  updateTest(id: number, data: any) {
    return api.put(`/lab/tests/${id}`, data)
  },

  // Lab Orders (Pathology)
  getLabOrders(status?: string, patientId?: number) {
    const params: any = {}
    if (status) params.status = status
    if (patientId) params.patient_id = patientId
    return api.get('/lab/orders', { params })
  },
  getLabOrder(id: number) {
    return api.get(`/lab/orders/${id}`)
  },
  collectSample(id: number, data: { sample_collected_by: number; notes?: string }) {
    return api.patch(`/lab/orders/${id}/collect`, data)
  },
  uploadResult(id: number, data: { result_value: string; remarks?: string; generated_by: number }) {
    return api.patch(`/lab/orders/${id}/result`, data)
  },

  // Radiology Orders
  getRadiologyOrders(status?: string, patientId?: number) {
    const params: any = {}
    if (status) params.status = status
    if (patientId) params.patient_id = patientId
    return api.get('/lab/radiology-orders', { params })
  },
  getRadiologyOrder(id: number) {
    return api.get(`/lab/radiology-orders/${id}`)
  },
  uploadReport(id: number, data: { report_text?: string; generated_by: number }) {
    return api.post(`/lab/radiology-orders/${id}/report`, data)
  },
  attachImage(id: number, data: { file_url: string; dicom_path?: string }) {
    return api.patch(`/lab/radiology-orders/${id}/images`, data)
  }
}
