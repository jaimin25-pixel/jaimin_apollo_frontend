import api from './axios'
import type {
  AdminDashboardData,
  Doctor,
  DoctorDetail,
  Department,
  Staff,
  Pharmacist,
  PartnerPharmacy,
  HospitalConfig,
  FinancialSummary,
  OccupancyReport,
  PrescriptionReport,
  ExportResult,
} from '@/types'

// Dashboard
export const getAdminDashboard = () =>
  api.get<AdminDashboardData>('/admin/dashboard').then(r => r.data)

// Doctors
export const listDoctors = (params?: { dept_id?: number; status?: string; search?: string }) =>
  api.get<Doctor[]>('/admin/doctors', { params }).then(r => r.data)

export const getDoctor = (id: number) =>
  api.get<DoctorDetail>(`/admin/doctors/${id}`).then(r => r.data)

export const createDoctor = (data: Record<string, unknown>) =>
  api.post<Doctor>('/admin/doctors', data).then(r => r.data)

export const updateDoctor = (id: number, data: Record<string, unknown>) =>
  api.put<Doctor>(`/admin/doctors/${id}`, data).then(r => r.data)

export const updateDoctorStatus = (id: number, status: string) =>
  api.patch(`/admin/doctors/${id}/status`, { status }).then(r => r.data)

export const deleteDoctor = (id: number) =>
  api.delete(`/admin/doctors/${id}`).then(r => r.data)

// Departments
export const listDepartments = () =>
  api.get<Department[]>('/admin/departments').then(r => r.data)

export const createDepartment = (data: Record<string, unknown>) =>
  api.post<Department>('/admin/departments', data).then(r => r.data)

export const updateDepartment = (id: number, data: Record<string, unknown>) =>
  api.put<Department>(`/admin/departments/${id}`, data).then(r => r.data)

export const updateDepartmentStatus = (id: number, status: string) =>
  api.patch(`/admin/departments/${id}/status`, { status }).then(r => r.data)

export const deleteDepartment = (id: number) =>
  api.delete(`/admin/departments/${id}`).then(r => r.data)

// Staff
export const listStaff = (params?: { role?: string; dept_id?: number; status?: string }) =>
  api.get<Staff[]>('/admin/staff', { params }).then(r => r.data)

export const getStaffMember = (id: number) =>
  api.get<Staff>(`/admin/staff/${id}`).then(r => r.data)

export const createStaff = (data: Record<string, unknown>) =>
  api.post<Staff>('/admin/staff', data).then(r => r.data)

export const updateStaff = (id: number, data: Record<string, unknown>) =>
  api.put<Staff>(`/admin/staff/${id}`, data).then(r => r.data)

export const updateStaffStatus = (id: number, status: string) =>
  api.patch(`/admin/staff/${id}/status`, { status }).then(r => r.data)

export const deleteStaff = (id: number) =>
  api.delete(`/admin/staff/${id}`).then(r => r.data)

// Pharmacists
export const listPharmacists = (params?: { status?: string }) =>
  api.get<Pharmacist[]>('/admin/pharmacists', { params }).then(r => r.data)

export const createPharmacist = (data: Record<string, unknown>) =>
  api.post<Pharmacist>('/admin/pharmacists', data).then(r => r.data)

export const updatePharmacist = (id: number, data: Record<string, unknown>) =>
  api.put<Pharmacist>(`/admin/pharmacists/${id}`, data).then(r => r.data)

// Partner Pharmacies
export const listPartnerPharmacies = (params?: { status?: string }) =>
  api.get<PartnerPharmacy[]>('/admin/partner-pharmacies', { params }).then(r => r.data)

export const createPartnerPharmacy = (data: Record<string, unknown>) =>
  api.post<PartnerPharmacy>('/admin/partner-pharmacies', data).then(r => r.data)

export const updatePartnerPharmacy = (id: number, data: Record<string, unknown>) =>
  api.put<PartnerPharmacy>(`/admin/partner-pharmacies/${id}`, data).then(r => r.data)

export const updatePartnerPharmacyStatus = (id: number, status: string) =>
  api.patch(`/admin/partner-pharmacies/${id}/status`, { status }).then(r => r.data)

// Config
export const getConfig = () =>
  api.get<HospitalConfig>('/admin/config').then(r => r.data)

export const updateConfig = (data: Record<string, unknown>) =>
  api.put<HospitalConfig>('/admin/config', data).then(r => r.data)

// Reports
export const getFinancialReport = (params: { from_date: string; to_date: string }) =>
  api.get<FinancialSummary>('/admin/reports/financial', { params }).then(r => r.data)

export const getOccupancyReport = (params: { from_date: string; to_date: string; dept_id?: number }) =>
  api.get<OccupancyReport[]>('/admin/reports/occupancy', { params }).then(r => r.data)

export const getPrescriptionReport = (params: { from_date: string; to_date: string }) =>
  api.get<PrescriptionReport[]>('/admin/reports/prescriptions', { params }).then(r => r.data)

// Export
export const exportData = (data: { entity: string; format: string; from_date?: string; to_date?: string }) =>
  api.post<ExportResult>('/admin/export', data).then(r => r.data)
