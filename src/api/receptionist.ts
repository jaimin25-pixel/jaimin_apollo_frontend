import api from './axios'
import type {
  ReceptionistDashboard,
  Patient,
  AppointmentFull,
  AppointmentSlip,
  VisitorLog,
  RegisterPatientInput,
  BookAppointmentInput,
  WalkInInput,
  LogVisitorInput,
} from '@/types'

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const getDashboard = (): Promise<ReceptionistDashboard> =>
  api.get('/v1/receptionist/dashboard').then(r => r.data)

// ── Patient Management ─────────────────────────────────────────────────────────

export const registerPatient = (data: RegisterPatientInput): Promise<Patient> =>
  api.post('/v1/patient/register', data).then(r => r.data)

export const searchPatients = (params: {
  q?: string
  blood_group?: string
  insurance?: string
}): Promise<Patient[]> =>
  api.get('/v1/patient/search', { params }).then(r => r.data)

export const getPatient = (id: number): Promise<Patient> =>
  api.get(`/v1/patient/${id}`).then(r => r.data)

export const updatePatientContact = (
  id: number,
  data: {
    contact_number: string
    address?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
  }
): Promise<void> => api.patch(`/v1/patient/${id}/contact`, data).then(r => r.data)

export const getPatientRegistrationCard = (id: number): Promise<Patient> =>
  api.get(`/v1/patient/${id}/registration-card`).then(r => r.data)

// ── Appointment Management ─────────────────────────────────────────────────────

export const bookAppointment = (data: BookAppointmentInput): Promise<AppointmentFull> =>
  api.post('/v1/appointments', data).then(r => r.data)

export const listAppointments = (params: {
  status?: string
  dept_id?: number
  date?: string
  doctor_id?: number
}): Promise<AppointmentFull[]> =>
  api.get('/v1/appointments', { params }).then(r => r.data)

export const getAppointment = (id: number): Promise<AppointmentFull> =>
  api.get(`/v1/appointments/${id}`).then(r => r.data)

export const rescheduleAppointment = (
  id: number,
  scheduled_at: string
): Promise<void> =>
  api.patch(`/v1/appointments/${id}/reschedule`, { scheduled_at }).then(r => r.data)

export const cancelAppointment = (id: number): Promise<void> =>
  api.patch(`/v1/appointments/${id}/cancel`).then(r => r.data)

export const checkInAppointment = (id: number): Promise<AppointmentFull> =>
  api.post(`/v1/appointments/${id}/checkin`).then(r => r.data)

export const walkIn = (data: WalkInInput): Promise<AppointmentFull> =>
  api.post('/v1/appointments/walkin', data).then(r => r.data)

export const getAppointmentSlip = (id: number): Promise<AppointmentSlip> =>
  api.get(`/v1/appointments/${id}/slip`).then(r => r.data)

// ── Visitor Log ────────────────────────────────────────────────────────────────

export const logVisitor = (data: LogVisitorInput): Promise<VisitorLog> =>
  api.post('/v1/visitors', data).then(r => r.data)

export const listVisitors = (params: {
  date?: string
  patient_id?: number
}): Promise<VisitorLog[]> =>
  api.get('/v1/visitors', { params }).then(r => r.data)

export const checkoutVisitor = (id: number): Promise<void> =>
  api.patch(`/v1/visitors/${id}/checkout`).then(r => r.data)
