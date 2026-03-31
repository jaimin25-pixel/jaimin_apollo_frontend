import api from './axios'

export default {
  getDashboard() { return api.get('/hr/dashboard') },
  getStaff(deptId?: number, role?: string) {
    const params: any = {}
    if (deptId) params.dept_id = deptId
    if (role) params.role = role
    return api.get('/hr/staff', { params })
  },
  createStaff(data: any) { return api.post('/hr/staff', data) },
  updateStaff(id: number, data: any) { return api.put(`/hr/staff/${id}`, data) },
  getAttendance(date?: string, staffId?: number) {
    const params: any = {}
    if (date) params.date = date
    if (staffId) params.staff_id = staffId
    return api.get('/hr/attendance', { params })
  },
  clockIn(staffId: number) { return api.post('/hr/attendance/clock-in', { staff_id: staffId }) },
  clockOut(staffId: number) { return api.post('/hr/attendance/clock-out', { staff_id: staffId }) },
  getLeaves(status?: string, staffId?: number) {
    const params: any = {}
    if (status) params.status = status
    if (staffId) params.staff_id = staffId
    return api.get('/hr/leaves', { params })
  },
  applyLeave(data: any) { return api.post('/hr/leaves', data) },
  processLeave(id: number, data: { status: string; notes?: string }) { return api.patch(`/hr/leaves/${id}/status`, data) },
  getPayroll(month?: number, year?: number, staffId?: number) {
    const params: any = {}
    if (month) params.month = month
    if (year) params.year = year
    if (staffId) params.staff_id = staffId
    return api.get('/hr/payroll', { params })
  },
  generatePayroll(data: { month: number; year: number }) { return api.post('/hr/payroll/generate', data) }
}
