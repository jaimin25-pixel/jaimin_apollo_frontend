export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  fullName: string
  phone: string
  isActive: boolean
}

export type UserRole = 'DOCTOR' | 'PATIENT' | 'PHARMACIST' | 'ADMIN'

export interface LoginRequest {
  email: string
  password: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  user: User
  message: string
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  license_number?: string
  specialization?: string
  employee_id?: string
  department?: string
  access_key?: string
  date_of_birth?: string
  insurance_id?: string
}

export interface RegisterResponse {
  token: string
  user: User
  message: string
}

export interface ApiError {
  message: string
  status: number
}
