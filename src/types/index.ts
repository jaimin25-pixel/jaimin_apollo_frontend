export interface User {
  id: string
  email: string
  username: string
  full_name: string
  phone: string
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
  user: User
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
