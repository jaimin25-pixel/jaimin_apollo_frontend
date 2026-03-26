import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/LoginView.vue'), // placeholder
      meta: { requiresAuth: true },
    },
    {
      path: '/register/doctor',
      name: 'register-doctor',
      component: () => import('@/views/RegisterDoctorView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register/patient',
      name: 'register-patient',
      component: () => import('@/views/RegisterPatientView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register/pharmacist',
      name: 'register-pharmacist',
      component: () => import('@/views/RegisterPharmacistView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register/admin',
      name: 'register-admin',
      component: () => import('@/views/RegisterAdminView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/verify-code',
      name: 'verify-code',
      component: () => import('@/views/VerifyCodeView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { requiresGuest: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('apollo_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
