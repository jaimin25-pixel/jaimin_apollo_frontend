export interface User {
  id: string
  email: string
  username: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user?: User
  doctor?: Doctor
  tokens: TokenPair
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  phone?: string
}

export interface RegisterResponse {
  user: User
  tokens: TokenPair
}

export interface ApiError {
  error: string
}

export interface DashboardStats {
  total_users: number
  total_patients: number
  appointments_today: number
  available_beds: number
}

export interface AuditLogEntry {
  id: string
  action: string
  ip_address: string
  created_at: string
}

export interface DashboardData {
  stats: DashboardStats
  recent_activity: AuditLogEntry[]
}

// ── Admin Module Types ──────────────────────────────────────────────

export interface Department {
  dept_id: number
  name: string
  hod_doctor_id?: number
  bed_count: number
  ot_count: number
  has_icu: boolean
  status: string
  created_at: string
  hod_doctor?: Doctor
}

export interface Doctor {
  doctor_id: number
  doc_code: string
  full_name: string
  email: string
  dept_id: number
  specialization: string
  qualification: string
  phone?: string
  joining_date: string
  status: string
  created_at: string
  updated_at: string
  department?: Department
}

export interface Staff {
  staff_id: number
  full_name: string
  email: string
  role: string
  dept_id?: number
  qualification?: string
  employment_type: string
  joining_date: string
  status: string
  created_at: string
  updated_at: string
  department?: Department
}

export interface Pharmacist {
  pharmacist_id: number
  full_name: string
  email: string
  license_number: string
  phone?: string
  status: string
  created_at: string
}

export interface PartnerPharmacy {
  partner_id: number
  name: string
  license_number: string
  address: string
  contact_phone?: string
  contact_email?: string
  status: string
  created_at: string
}

export interface Medicine {
  medicine_id: number
  generic_name: string
  brand_name?: string
  category: string
  unit: string
  reorder_level: number
  current_stock: number
  status: string
}

export interface Admission {
  admission_id: number
  patient_id: number
  admitting_doctor_id: number
  admitted_at: string
  status: string
  patient?: { full_name: string; pat_code: string }
  admitting_doctor?: { full_name: string }
  department?: { name: string }
}

export interface Appointment {
  appt_id: number
  patient_id: number
  doctor_id: number
  scheduled_at: string
  status: string
  chief_complaint?: string
  patient?: { full_name: string; pat_code: string }
}

export interface Prescription {
  rx_id: number
  doctor_id: number
  patient_id: number
  diagnosis?: string
  status: string
  created_at: string
  patient?: { full_name: string; pat_code: string }
}

export interface HospitalConfig {
  config_id: number
  hospital_name: string
  address: string
  gst_number?: string
  nabh_number?: string
  contact_phone?: string
  contact_email?: string
  website?: string
  updated_at: string
}

export interface BedSummary {
  total: number
  occupied: number
  available: number
  icu: number
  emergency: number
}

export interface DeptDoctorStat {
  dept_id: number
  dept_name: string
  doctor_count: number
  active_count: number
}

export interface AdminDashboardData {
  beds: BedSummary
  dept_doctors: DeptDoctorStat[]
  opd_appointments: number
  ipd_admissions: number
  discharges: number
  stock_alerts: Medicine[]
  emergency_admissions: Admission[]
}

export interface FinancialSummary {
  total_invoices: number
  total_revenue: number
  total_paid: number
  total_outstanding: number
}

export interface OccupancyReport {
  dept_id: number
  dept_name: string
  total_beds: number
  occupied: number
}

export interface PrescriptionReport {
  doctor_id: number
  doctor_name: string
  dept_name: string
  rx_count: number
}

export interface ExportResult {
  entity: string
  format: string
  count: number
  data: unknown
}

export interface DoctorDetail {
  doctor: Doctor
  appointments: Appointment[]
  prescriptions: Prescription[]
}

// ── Receptionist Module Types ───────────────────────────────────────

export interface Patient {
  patient_id: number
  pat_code: string
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
  created_at: string
  updated_at: string
}

export interface AppointmentFull {
  appt_id: number
  patient_id: number
  doctor_id: number
  dept_id: number
  scheduled_at: string
  queue_token?: string
  status: 'scheduled' | 'checked_in' | 'in_consultation' | 'completed' | 'cancelled'
  chief_complaint?: string
  created_by_staff_id?: number
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Doctor
  department?: Department
}

export interface VisitorLog {
  visitor_id: number
  patient_id: number
  visitor_name: string
  relation: string
  time_in: string
  time_out?: string
  logged_by_staff_id: number
  created_at: string
  patient?: Patient
  logged_by_staff?: Staff
}

export interface DeptQueueStat {
  dept_id: number
  dept_name: string
  waiting: number
}

export interface ReceptionistDashboard {
  total_today: number
  checked_in_count: number
  waiting_by_dept: DeptQueueStat[]
}

export interface AppointmentSlip {
  appt_id: number
  queue_token: string
  scheduled_at: string
  status: string
  chief_complaint?: string
  patient: {
    patient_id: number
    pat_code: string
    full_name: string
    contact_number: string
    blood_group?: string
  }
  doctor: { full_name: string }
  department: { name: string }
}

export interface RegisterPatientInput {
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
}

export interface BookAppointmentInput {
  patient_id: number
  doctor_id: number
  dept_id: number
  scheduled_at: string
  chief_complaint?: string
}

export interface WalkInInput {
  patient_id: number
  doctor_id: number
  dept_id: number
  chief_complaint?: string
}

export interface LogVisitorInput {
  patient_id: number
  visitor_name: string
  relation: string
}
