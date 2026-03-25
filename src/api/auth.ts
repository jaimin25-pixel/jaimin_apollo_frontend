import api from './axios'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types'

export async function login(email: string, password: string, role: string): Promise<LoginResponse> {
  const payload: LoginRequest = { email, password, role: role as LoginRequest['role'] }
  const response = await api.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('/auth/register', data)
  return response.data
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me')
  return response.data
}
