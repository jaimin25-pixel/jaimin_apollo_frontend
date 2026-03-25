import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, getMe } from '@/api/auth'
import type { User, UserRole, RegisterRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('apollo_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string, role: UserRole) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiLogin(email, password, role)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('apollo_token', response.token)
      localStorage.setItem('apollo_user', JSON.stringify(response.user))
      return response
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Login failed. Please try again.'
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
      const response = await apiRegister(data)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('apollo_token', response.token)
      localStorage.setItem('apollo_user', JSON.stringify(response.user))
      return response
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('apollo_token')
    localStorage.removeItem('apollo_user')
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      isLoading.value = true
      const storedUser = localStorage.getItem('apollo_user')
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
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
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  }
})
