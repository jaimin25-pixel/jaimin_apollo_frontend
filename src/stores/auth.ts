import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, getMe } from '@/api/auth'
import type { User, UserRole, RegisterRequest } from '@/types'
import { encryptPassword } from '@/utils/crypto'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('apollo_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('apollo_refresh_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string, role: UserRole) {
    isLoading.value = true
    error.value = null
    try {
      const encryptedPassword = await encryptPassword(password)
      const res = await apiLogin({ email, password: encryptedPassword, role })
      token.value = res.tokens.access_token
      refreshToken.value = res.tokens.refresh_token
      user.value = res.user
      localStorage.setItem('apollo_token', res.tokens.access_token)
      localStorage.setItem('apollo_refresh_token', res.tokens.refresh_token)
      localStorage.setItem('apollo_user', JSON.stringify(res.user))
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

  function logout() {
    user.value = null
    token.value = null
    refreshToken.value = null
    error.value = null
    localStorage.removeItem('apollo_token')
    localStorage.removeItem('apollo_refresh_token')
    localStorage.removeItem('apollo_user')
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      isLoading.value = true
      const stored = localStorage.getItem('apollo_user')
      if (stored) user.value = JSON.parse(stored)
      const me = await getMe()
      user.value = me
      localStorage.setItem('apollo_user', JSON.stringify(me))
      return true
    } catch {
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user, token, refreshToken, isLoading, error,
    isAuthenticated,
    login, register, logout, checkAuth,
  }
})
