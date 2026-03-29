import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: (_to) => {
        const stored = localStorage.getItem('apollo_user')
        try {
          if (stored) {
            const user = JSON.parse(stored)
            if (user.role === 'admin') {
              return '/admin'
            }
          }
        } catch (e) {
          // ignore
        }
        return '/admin'
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
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
    // Admin Module
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'departments',
          name: 'admin-departments',
          component: () => import('@/views/admin/AdminDepartmentsView.vue'),
        },
        {
          path: 'doctors',
          name: 'admin-doctors',
          component: () => import('@/views/admin/AdminDoctorsView.vue'),
        },
        {
          path: 'staff',
          name: 'admin-staff',
          component: () => import('@/views/admin/AdminStaffView.vue'),
        },
        {
          path: 'pharmacists',
          name: 'admin-pharmacists',
          component: () => import('@/views/admin/AdminPharmacistsView.vue'),
        },
        {
          path: 'config',
          name: 'admin-config',
          component: () => import('@/views/admin/AdminConfigView.vue'),
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('@/views/admin/AdminReportsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('apollo_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'admin-dashboard' })
  } else if (to.meta.requiresAdmin && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role !== 'admin') {
          next({ name: 'admin-dashboard' })
          return
        }
      }
    } catch {
      // ignore parse errors
    }
    next()
  } else {
    next()
  }
})

export default router
