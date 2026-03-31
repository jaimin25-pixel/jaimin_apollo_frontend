import api from './axios'

export default {
  // Dashboard
  getDashboard(wardId?: number) {
    const params = wardId ? { ward_id: wardId } : {}
    return api.get('/nursing/dashboard', { params })
  },

  // Wards & Beds
  getWards(deptId?: number) {
    const params = deptId ? { dept_id: deptId } : {}
    return api.get('/nursing/wards', { params })
  },
  getBeds(wardId: number, status?: string) {
    const params = status ? { status } : {}
    return api.get(`/nursing/wards/${wardId}/beds`, { params })
  },
  updateBedStatus(bedId: number, data: { status: string; notes?: string }) {
    return api.patch(`/nursing/beds/${bedId}/status`, data)
  },
  transferBedRequest(data: { patient_id: number; to_bed_id: number; reason: string }) {
    return api.post('/nursing/beds/transfer', data)
  },
  confirmBedTransfer(transferId: number, notes?: string) {
    return api.patch(`/nursing/beds/transfer/${transferId}/confirm`, { notes })
  },
  markBedClean(bedId: number) {
    return api.post(`/nursing/beds/${bedId}/housekeeping`)
  },

  // Patients (Vitals & MAR)
  getPatientVitals(patientId: number, fromDate?: string) {
    const params = fromDate ? { from_date: fromDate } : {}
    return api.get(`/nursing/patients/${patientId}/vitals`, { params })
  },
  recordVital(patientId: number, data: any) {
    return api.post(`/nursing/patients/${patientId}/vitals`, data)
  },
  getPatientMAR(patientId: number, date?: string) {
    const params = date ? { date } : {}
    return api.get(`/nursing/patients/${patientId}/mar`, { params })
  },
  updateMARStatus(patientId: number, marId: number, data: { status: string; reason?: string; notes?: string }) {
    return api.patch(`/nursing/patients/${patientId}/mar/${marId}`, data)
  },
  addNursingNote(patientId: number, data: { note_text: string }) {
    return api.post(`/nursing/patients/${patientId}/nursing-notes`, data)
  }
}
