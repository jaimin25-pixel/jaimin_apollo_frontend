import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as patientApi from '@/api/patient'
import type {
  Patient,
  AppointmentFull,
  AdmissionFull,
  EHRData,
  InvoiceFull,
  UpdatePatientInput,
  PatientBookAppointmentInput,
} from '@/types'

export const usePatientStore = defineStore('patient', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const patients = ref<Patient[]>([])
  const currentPatient = ref<Patient | null>(null)
  const appointments = ref<AppointmentFull[]>([])
  const admissions = ref<AdmissionFull[]>([])
  const ehr = ref<EHRData | null>(null)
  const invoices = ref<InvoiceFull[]>([])

  function clearError() {
    error.value = null
  }

  async function wrap<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string }
      error.value = err.response?.data?.error ?? err.message ?? 'Request failed'
      return null
    } finally {
      loading.value = false
    }
  }

  // ── Patient CRUD ──────────────────────────────────────────────────────

  async function searchPatients(q?: string) {
    const result = await wrap(() => patientApi.searchPatients(q))
    if (result) patients.value = result
  }

  async function registerPatient(data: {
    full_name: string
    date_of_birth: string
    gender: string
    blood_group?: string
    contact_number: string
    address?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    insurance_id?: string
    insurance_provider?: string
  }): Promise<{ patient: Patient; duplicates?: Patient[] } | null> {
    return wrap(() => patientApi.registerPatient(data))
  }

  async function fetchPatient(id: number) {
    currentPatient.value = await wrap(() => patientApi.getPatient(id))
  }

  async function updatePatient(id: number, data: UpdatePatientInput): Promise<boolean> {
    const result = await wrap(() => patientApi.updatePatient(id, data))
    return result !== null
  }

  // ── Appointments ──────────────────────────────────────────────────────

  async function fetchAppointments(patientId: number, params?: { status?: string; from_date?: string }) {
    const result = await wrap(() => patientApi.listAppointments(patientId, params))
    if (result) appointments.value = result
  }

  async function bookAppointment(
    patientId: number,
    data: PatientBookAppointmentInput
  ): Promise<AppointmentFull | null> {
    const appt = await wrap(() => patientApi.bookAppointment(patientId, data))
    if (appt) appointments.value.unshift(appt)
    return appt
  }

  async function updateAppointment(
    patientId: number,
    apptId: number,
    data: { status?: string; scheduled_at?: string }
  ): Promise<boolean> {
    const result = await wrap(() => patientApi.updateAppointment(patientId, apptId, data))
    return result !== null
  }

  async function checkInAppointment(patientId: number, apptId: number) {
    const result = await wrap(() => patientApi.checkInAppointment(patientId, apptId))
    if (result) {
      const idx = appointments.value.findIndex(a => a.appt_id === apptId)
      if (idx !== -1) {
        appointments.value[idx] = result.appointment
      }
    }
    return result
  }

  // ── Admissions ────────────────────────────────────────────────────────

  async function fetchAdmissions(patientId: number, params?: { status?: string }) {
    const result = await wrap(() => patientApi.listAdmissions(patientId, params))
    if (result) admissions.value = result
  }

  async function fetchAdmission(patientId: number, admId: number): Promise<AdmissionFull | null> {
    return wrap(() => patientApi.getAdmission(patientId, admId))
  }

  // ── EHR ───────────────────────────────────────────────────────────────

  async function fetchEHR(patientId: number) {
    ehr.value = await wrap(() => patientApi.getEHR(patientId))
  }

  // ── Invoices ──────────────────────────────────────────────────────────

  async function fetchInvoices(patientId: number, params?: { status?: string }) {
    const result = await wrap(() => patientApi.listInvoices(patientId, params))
    if (result) invoices.value = result
  }

  return {
    loading,
    error,
    clearError,
    patients,
    currentPatient,
    appointments,
    admissions,
    ehr,
    invoices,
    searchPatients,
    registerPatient,
    fetchPatient,
    updatePatient,
    fetchAppointments,
    bookAppointment,
    updateAppointment,
    checkInAppointment,
    fetchAdmissions,
    fetchAdmission,
    fetchEHR,
    fetchInvoices,
  }
})
