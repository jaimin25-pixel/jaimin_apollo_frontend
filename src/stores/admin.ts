import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as adminApi from '@/api/admin'
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
} from '@/types'

export const useAdminStore = defineStore('admin', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Dashboard
  const dashboard = ref<AdminDashboardData | null>(null)

  // Lists
  const doctors = ref<Doctor[]>([])
  const departments = ref<Department[]>([])
  const staffList = ref<Staff[]>([])
  const pharmacists = ref<Pharmacist[]>([])
  const partnerPharmacies = ref<PartnerPharmacy[]>([])

  // Detail
  const doctorDetail = ref<DoctorDetail | null>(null)
  const staffDetail = ref<Staff | null>(null)

  // Config
  const hospitalConfig = ref<HospitalConfig | null>(null)

  // Reports
  const financialReport = ref<FinancialSummary | null>(null)
  const occupancyReport = ref<OccupancyReport[]>([])
  const prescriptionReport = ref<PrescriptionReport[]>([])

  function clearError() { error.value = null }

  async function wrap<T>(fn: () => Promise<T>): Promise<T | null> {
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Operation failed'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ── Dashboard ────────────────────────────────────────────────────

  async function fetchDashboard() {
    const data = await wrap(() => adminApi.getAdminDashboard())
    if (data) dashboard.value = data
  }

  // ── Doctors ──────────────────────────────────────────────────────

  async function fetchDoctors(params?: { dept_id?: number; status?: string; search?: string }) {
    const data = await wrap(() => adminApi.listDoctors(params))
    if (data) doctors.value = data
  }

  async function fetchDoctor(id: number) {
    const data = await wrap(() => adminApi.getDoctor(id))
    if (data) doctorDetail.value = data
  }

  async function createDoctor(data: Record<string, unknown>) {
    return wrap(() => adminApi.createDoctor(data))
  }

  async function updateDoctor(id: number, data: Record<string, unknown>) {
    return wrap(() => adminApi.updateDoctor(id, data))
  }

  async function updateDoctorStatus(id: number, status: string) {
    return wrap(() => adminApi.updateDoctorStatus(id, status))
  }

  async function deleteDoctor(id: number) {
    return wrap(() => adminApi.deleteDoctor(id))
  }

  // ── Departments ──────────────────────────────────────────────────

  const REQUIRED_DEPARTMENTS = [
    { name: 'Clinical Department',        status: 'active', bed_count: 0 },
    { name: 'Administration Department',  status: 'active', bed_count: 0 },
    { name: 'Support Services Department',status: 'active', bed_count: 0 },
  ]

  async function fetchDepartments() {
    const data = await wrap(() => adminApi.listDepartments())
    if (!data) return
    departments.value = data

    // Auto-create the 3 role-based departments if they don't exist yet
    const existing = new Set(data.map((d: Department) => d.name))
    const missing = REQUIRED_DEPARTMENTS.filter(d => !existing.has(d.name))
    for (const dept of missing) {
      const created = await adminApi.createDepartment(dept).catch(() => null)
      if (created) departments.value.push(created)
    }
  }

  async function createDepartment(data: Record<string, unknown>) {
    return wrap(() => adminApi.createDepartment(data))
  }

  async function updateDepartment(id: number, data: Record<string, unknown>) {
    return wrap(() => adminApi.updateDepartment(id, data))
  }

  async function updateDepartmentStatus(id: number, status: string) {
    return wrap(() => adminApi.updateDepartmentStatus(id, status))
  }

  async function deleteDepartment(id: number) {
    return wrap(() => adminApi.deleteDepartment(id))
  }

  // ── Staff ────────────────────────────────────────────────────────

  async function fetchStaff(params?: { role?: string; dept_id?: number; status?: string }) {
    const data = await wrap(() => adminApi.listStaff(params))
    if (data) staffList.value = data
  }

  async function fetchStaffMember(id: number) {
    const data = await wrap(() => adminApi.getStaffMember(id))
    if (data) staffDetail.value = data
  }

  async function createStaff(data: Record<string, unknown>) {
    return wrap(() => adminApi.createStaff(data))
  }

  async function updateStaff(id: number, data: Record<string, unknown>) {
    return wrap(() => adminApi.updateStaff(id, data))
  }

  async function updateStaffStatus(id: number, status: string) {
    return wrap(() => adminApi.updateStaffStatus(id, status))
  }

  async function deleteStaff(id: number) {
    return wrap(() => adminApi.deleteStaff(id))
  }

  // ── Pharmacists ──────────────────────────────────────────────────

  async function fetchPharmacists(params?: { status?: string }) {
    const data = await wrap(() => adminApi.listPharmacists(params))
    if (data) pharmacists.value = data
  }

  async function createPharmacist(data: Record<string, unknown>) {
    return wrap(() => adminApi.createPharmacist(data))
  }

  async function updatePharmacist(id: number, data: Record<string, unknown>) {
    return wrap(() => adminApi.updatePharmacist(id, data))
  }

  // ── Partner Pharmacies ───────────────────────────────────────────

  async function fetchPartnerPharmacies(params?: { status?: string }) {
    const data = await wrap(() => adminApi.listPartnerPharmacies(params))
    if (data) partnerPharmacies.value = data
  }

  async function createPartnerPharmacy(data: Record<string, unknown>) {
    return wrap(() => adminApi.createPartnerPharmacy(data))
  }

  async function updatePartnerPharmacy(id: number, data: Record<string, unknown>) {
    return wrap(() => adminApi.updatePartnerPharmacy(id, data))
  }

  async function updatePartnerPharmacyStatus(id: number, status: string) {
    return wrap(() => adminApi.updatePartnerPharmacyStatus(id, status))
  }

  // ── Config ───────────────────────────────────────────────────────

  async function fetchConfig() {
    const data = await wrap(() => adminApi.getConfig())
    if (data) hospitalConfig.value = data
  }

  async function saveConfig(data: Record<string, unknown>) {
    const result = await wrap(() => adminApi.updateConfig(data))
    if (result) hospitalConfig.value = result
    return result
  }

  // ── Reports ──────────────────────────────────────────────────────

  async function fetchFinancialReport(from: string, to: string) {
    const data = await wrap(() => adminApi.getFinancialReport({ from_date: from, to_date: to }))
    if (data) financialReport.value = data
  }

  async function fetchOccupancyReport(from: string, to: string, deptId?: number) {
    const data = await wrap(() => adminApi.getOccupancyReport({ from_date: from, to_date: to, dept_id: deptId }))
    if (data) occupancyReport.value = data
  }

  async function fetchPrescriptionReport(from: string, to: string) {
    const data = await wrap(() => adminApi.getPrescriptionReport({ from_date: from, to_date: to }))
    if (data) prescriptionReport.value = data
  }

  // ── Export ───────────────────────────────────────────────────────

  async function exportData(entity: string, format: string, fromDate?: string, toDate?: string) {
    return wrap(() => adminApi.exportData({ entity, format, from_date: fromDate, to_date: toDate }))
  }

  return {
    isLoading, error, clearError,
    // Dashboard
    dashboard, fetchDashboard,
    // Doctors
    doctors, doctorDetail, fetchDoctors, fetchDoctor, createDoctor, updateDoctor, updateDoctorStatus, deleteDoctor,
    // Departments
    departments, fetchDepartments, createDepartment, updateDepartment, updateDepartmentStatus, deleteDepartment,
    // Staff
    staffList, staffDetail, fetchStaff, fetchStaffMember, createStaff, updateStaff, updateStaffStatus, deleteStaff,
    // Pharmacists
    pharmacists, fetchPharmacists, createPharmacist, updatePharmacist,
    // Partner Pharmacies
    partnerPharmacies, fetchPartnerPharmacies, createPartnerPharmacy, updatePartnerPharmacy, updatePartnerPharmacyStatus,
    // Config
    hospitalConfig, fetchConfig, saveConfig,
    // Reports
    financialReport, occupancyReport, prescriptionReport,
    fetchFinancialReport, fetchOccupancyReport, fetchPrescriptionReport,
    // Export
    exportData,
  }
})
