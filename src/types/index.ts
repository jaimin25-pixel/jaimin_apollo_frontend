export interface User {
  id: string
  email: string
  username: string
  full_name: string
  phone: string
  role: UserRole
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  doctor_profile?: DoctorProfile
  patient_profile?: PatientProfile
  pharmacist_profile?: PharmacistProfile
  admin_profile?: AdminProfile
}

export type UserRole = 'doctor' | 'patient' | 'pharmacist' | 'admin'

export interface DoctorProfile {
  id: string
  license_number: string
  specialization: string
  qualification?: string
  experience_years: number
  consultation_fee: number
  bio?: string
  is_available: boolean
}

export interface PatientProfile {
  id: string
  date_of_birth?: string
  gender?: string
  blood_group?: string
  insurance_id?: string
  insurance_provider?: string
  emergency_contact?: string
  emergency_phone?: string
  address?: string
  allergies?: string
}

export interface PharmacistProfile {
  id: string
  license_number: string
  branch_location?: string
  shift?: string
  is_on_duty: boolean
}

export interface AdminProfile {
  id: string
  employee_id: string
  department: string
  access_level: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface LoginRequest {
  email: string
  password: string
  role: UserRole
}

export interface LoginResponse {
  user: User
  tokens: TokenPair
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  license_number?: string
  specialization?: string
  branch_location?: string
  employee_id?: string
  department?: string
  access_key?: string
  date_of_birth?: string
  insurance_id?: string
  gender?: string
}

export interface RegisterResponse {
  user: User
  tokens: TokenPair
}

export interface ApiError {
  error: string
}
