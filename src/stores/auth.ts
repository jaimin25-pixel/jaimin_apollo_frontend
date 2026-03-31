import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '@/api/auth'
import type { User, Doctor, RegisterRequest } from '@/types'
import { encryptPassword } from '@/utils/crypto'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const doctor = ref<Doctor | null>(null)
  const token = ref<string | null>(localStorage.getItem('apollo_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('apollo_refresh_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isDoctorUser = computed(() => user.value?.role?.toLowerCase() === 'doctor')

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      const encryptedPassword = await encryptPassword(password)
      const res = await apiLogin({ email, password: encryptedPassword })
      token.value = res.tokens.access_token
      refreshToken.value = res.tokens.refresh_token

      if (res.user) {
        user.value = res.user
      }
      if (res.doctor) {
        doctor.value = res.doctor
      }

      localStorage.setItem('apollo_token', res.tokens.access_token)
      localStorage.setItem('apollo_refresh_token', res.tokens.refresh_token)
      localStorage.setItem('apollo_user', JSON.stringify(user.value))
      if (res.doctor) {
        localStorage.setItem('apollo_doctor', JSON.stringify(res.doctor))
      }
      return res
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login failed'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    isLoading.value = true
    error.value = null
    try {
      const encryptedData = { ...data, password: await encryptPassword(data.password) }
      const res = await apiRegister(encryptedData)
      token.value = res.tokens.access_token
      refreshToken.value = res.tokens.refresh_token
      user.value = res.user
      localStorage.setItem('apollo_token', res.tokens.access_token)
      localStorage.setItem('apollo_refresh_token', res.tokens.refresh_token)
      localStorage.setItem('apollo_user', JSON.stringify(res.user))
      return res
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Registration failed'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    user.value = null
    doctor.value = null
    token.value = null
    refreshToken.value = null
    error.value = null
    localStorage.removeItem('apollo_token')
    localStorage.removeItem('apollo_refresh_token')
    localStorage.removeItem('apollo_user')
    localStorage.removeItem('apollo_doctor')
    try {
      await apiLogout()
    } catch {
      // ignore
    }
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      isLoading.value = true
      const storedUser = localStorage.getItem('apollo_user')
      const storedDoctor = localStorage.getItem('apollo_doctor')
      if (storedUser) user.value = JSON.parse(storedUser)
      if (storedDoctor) doctor.value = JSON.parse(storedDoctor)
      
      const me = await getMe()
      if (me.user) user.value = me.user
      if (me.doctor) doctor.value = me.doctor
      
      localStorage.setItem('apollo_user', JSON.stringify(user.value))
      if (me.doctor) {
        localStorage.setItem('apollo_doctor', JSON.stringify(me.doctor))
      }
      return true
    } catch {
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  function getLoginRedirectRoute(): string {
    if (!user.value) return '/login'
    
    const role = user.value.role?.toLowerCase()
    
    switch (role) {
      case 'admin':
        return '/admin'
      case 'doctor':
        return '/doctor'
      case 'receptionist': 
      case 'reception':
        return '/receptionist'
      case 'pharmacist':
        return '/pharmacist'
      case 'nurse':
        return '/nurse'
      case 'staff':
        return '/staff'
      case 'patient':
        return '/patient'
      default:
        logout()
        return '/login'
    }
  }

  return {
    user, doctor, token, refreshToken, isLoading, error,
    isAuthenticated, isDoctorUser,
    login, register, logout, checkAuth, getLoginRedirectRoute,
  }
})
