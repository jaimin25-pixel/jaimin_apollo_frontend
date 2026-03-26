import api from './axios'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/auth/register', data)
  return res.data
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ user: User }>('/auth/me')
  return res.data.user
}

export async function forgotPassword(email: string): Promise<{ message: string; code?: string }> {
  const res = await api.post<{ message: string; code?: string }>('/auth/forgot-password', { email })
  return res.data
}

export async function verifyCode(email: string, code: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/verify-code', { email, code })
  return res.data
}

export async function resetPassword(email: string, code: string, new_password: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/reset-password', { email, code, new_password })
  return res.data
}
