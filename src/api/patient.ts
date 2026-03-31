import api from './axios'
import type {
  Patient,
  AppointmentFull,
  EHRData,
  InvoiceFull,
  AdmissionFull,
  PatientBookAppointmentInput,
  UpdatePatientInput,
} from '@/types'

// ── Patient CRUD ──────────────────────────────────────────────────────────────

export const searchPatients = (q?: string): Promise<Patient[]> =>
  api.get('/patient/search', { params: { q } }).then(r => r.data)

export const registerPatient = (data: {
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
}): Promise<{ patient: Patient; duplicate_warning?: string; duplicates?: Patient[] }> =>
  api.post('/patient/register', data).then(r => r.data)

export const getPatient = (id: number): Promise<Patient> =>
  api.get(`/patient/${id}`).then(r => r.data)

export const updatePatient = (id: number, data: UpdatePatientInput): Promise<void> =>
  api.put(`/patient/${id}`, data).then(r => r.data)

// ── Appointments ──────────────────────────────────────────────────────────────

export const listAppointments = (
  patientId: number,
  params?: { status?: string; from_date?: string }
): Promise<AppointmentFull[]> =>
  api.get(`/patient/${patientId}/appointments`, { params }).then(r => r.data)

export const bookAppointment = (
  patientId: number,
  data: PatientBookAppointmentInput
): Promise<AppointmentFull> =>
  api.post(`/patient/${patientId}/appointments`, data).then(r => r.data)

export const updateAppointment = (
  patientId: number,
  apptId: number,
  data: { status?: string; scheduled_at?: string }
): Promise<void> =>
  api.patch(`/patient/${patientId}/appointments/${apptId}`, data).then(r => r.data)

export const checkInAppointment = (
  patientId: number,
  apptId: number
): Promise<{ message: string; queue_token: string; appointment: AppointmentFull }> =>
  api.patch(`/patient/${patientId}/appointments/${apptId}/checkin`).then(r => r.data)

// ── Admissions ────────────────────────────────────────────────────────────────

export const listAdmissions = (
  patientId: number,
  params?: { status?: string }
): Promise<AdmissionFull[]> =>
  api.get(`/patient/${patientId}/admissions`, { params }).then(r => r.data)

export const getAdmission = (
  patientId: number,
  admId: number
): Promise<AdmissionFull> =>
  api.get(`/patient/${patientId}/admissions/${admId}`).then(r => r.data)

// ── EHR ───────────────────────────────────────────────────────────────────────

export const getEHR = (patientId: number): Promise<EHRData> =>
  api.get(`/patient/${patientId}/ehr`).then(r => r.data)

// ── Invoices ──────────────────────────────────────────────────────────────────

export const listInvoices = (
  patientId: number,
  params?: { status?: string }
): Promise<InvoiceFull[]> =>
  api.get(`/patient/${patientId}/invoices`, { params }).then(r => r.data)
