import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as receptionistApi from '@/api/receptionist'
import type {
  ReceptionistDashboard,
  Patient,
  AppointmentFull,
  VisitorLog,
  RegisterPatientInput,
  BookAppointmentInput,
  WalkInInput,
  LogVisitorInput,
} from '@/types'

export const useReceptionistStore = defineStore('receptionist', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const dashboard = ref<ReceptionistDashboard | null>(null)
  const patients = ref<Patient[]>([])
  const currentPatient = ref<Patient | null>(null)
  const appointments = ref<AppointmentFull[]>([])
  const currentAppointment = ref<AppointmentFull | null>(null)
  const visitors = ref<VisitorLog[]>([])

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

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async function fetchDashboard() {
    dashboard.value = await wrap(() => receptionistApi.getDashboard())
  }

  // ── Patient ──────────────────────────────────────────────────────────────────

  async function fetchPatients(q?: string, bloodGroup?: string, insurance?: string) {
    const result = await wrap(() =>
      receptionistApi.searchPatients({ q, blood_group: bloodGroup, insurance })
    )
    if (result) patients.value = result
  }

  async function registerPatient(data: RegisterPatientInput): Promise<Patient | null> {
    return wrap(() => receptionistApi.registerPatient(data))
  }

  async function fetchPatient(id: number) {
    currentPatient.value = await wrap(() => receptionistApi.getPatient(id))
  }

  async function updatePatientContact(
    id: number,
    data: {
      contact_number: string
      address?: string
      emergency_contact_name?: string
      emergency_contact_phone?: string
    }
  ): Promise<boolean> {
    const result = await wrap(() => receptionistApi.updatePatientContact(id, data))
    return result !== null
  }

  // ── Appointment ──────────────────────────────────────────────────────────────

  async function fetchAppointments(params: {
    status?: string
    dept_id?: number
    date?: string
    doctor_id?: number
  }) {
    const result = await wrap(() => receptionistApi.listAppointments(params))
    if (result) appointments.value = result
  }

  async function bookAppointment(data: BookAppointmentInput): Promise<AppointmentFull | null> {
    const appt = await wrap(() => receptionistApi.bookAppointment(data))
    if (appt) appointments.value.unshift(appt)
    return appt
  }

  async function fetchAppointment(id: number) {
    currentAppointment.value = await wrap(() => receptionistApi.getAppointment(id))
  }

  async function reschedule(id: number, scheduledAt: string): Promise<boolean> {
    const result = await wrap(() => receptionistApi.rescheduleAppointment(id, scheduledAt))
    return result !== null
  }

  async function cancelAppt(id: number): Promise<boolean> {
    const result = await wrap(() => receptionistApi.cancelAppointment(id))
    if (result !== null) {
      const idx = appointments.value.findIndex(a => a.appt_id === id)
      if (idx !== -1) appointments.value[idx].status = 'cancelled'
    }
    return result !== null
  }

  async function checkIn(id: number): Promise<AppointmentFull | null> {
    const appt = await wrap(() => receptionistApi.checkInAppointment(id))
    if (appt) {
      const idx = appointments.value.findIndex(a => a.appt_id === id)
      if (idx !== -1) appointments.value[idx] = appt
    }
    return appt
  }

  async function walkIn(data: WalkInInput): Promise<AppointmentFull | null> {
    const appt = await wrap(() => receptionistApi.walkIn(data))
    if (appt) appointments.value.unshift(appt)
    return appt
  }

  // ── Visitor ──────────────────────────────────────────────────────────────────

  async function fetchVisitors(date?: string, patientId?: number) {
    const result = await wrap(() =>
      receptionistApi.listVisitors({ date, patient_id: patientId })
    )
    if (result) visitors.value = result
  }

  async function logVisitor(data: LogVisitorInput): Promise<VisitorLog | null> {
    const v = await wrap(() => receptionistApi.logVisitor(data))
    if (v) visitors.value.unshift(v)
    return v
  }

  async function checkoutVisitor(id: number): Promise<boolean> {
    const result = await wrap(() => receptionistApi.checkoutVisitor(id))
    if (result !== null) {
      const idx = visitors.value.findIndex(v => v.visitor_id === id)
      if (idx !== -1) visitors.value[idx].time_out = new Date().toISOString()
    }
    return result !== null
  }

  return {
    loading,
    error,
    clearError,
    dashboard,
    patients,
    currentPatient,
    appointments,
    currentAppointment,
    visitors,
    fetchDashboard,
    fetchPatients,
    registerPatient,
    fetchPatient,
    updatePatientContact,
    fetchAppointments,
    bookAppointment,
    fetchAppointment,
    reschedule,
    cancelAppt,
    checkIn,
    walkIn,
    fetchVisitors,
    logVisitor,
    checkoutVisitor,
  }
})
