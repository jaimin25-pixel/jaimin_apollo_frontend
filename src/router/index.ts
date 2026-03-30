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
            const role = user.role?.toLowerCase()
            switch (role) {
              case 'admin': return '/admin'
              case 'doctor': return '/doctor'
              case 'receptionist':
              case 'reception': return '/receptionist'
              case 'pharmacist': return '/pharmacist'
              case 'nurse': return '/nurse'
              case 'staff': return '/staff'
              default: return '/login'
            }
          }
        } catch (e) {
          // ignore
        }
        return '/login'
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
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/views/AccessDeniedView.vue'),
      meta: { requiresAuth: true },
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
    // Doctor Module
    {
      path: '/doctor',
      component: () => import('@/views/doctor/DoctorLayout.vue'),
      meta: { requiresAuth: true, requiresDoctor: true },
      children: [
        {
          path: '',
          name: 'doctor-dashboard',
          component: () => import('@/views/doctor/DoctorDashboardView.vue'),
        },
        {
          path: 'profile',
          name: 'doctor-profile',
          component: () => import('@/views/doctor/DoctorProfileView.vue'),
        },
        {
          path: 'appointments',
          name: 'doctor-appointments',
          component: () => import('@/views/doctor/DoctorAppointmentsView.vue'),
        },
        {
          path: 'appointments/:id',
          name: 'doctor-appointment-detail',
          component: () => import('@/views/doctor/DoctorAppointmentsView.vue'),
        },
        {
          path: 'patients',
          name: 'doctor-patients',
          component: () => import('@/views/doctor/DoctorPatientRecordsView.vue'),
        },
        {
          path: 'patients/:id',
          name: 'doctor-patient-detail',
          component: () => import('@/views/doctor/DoctorPatientRecordsView.vue'),
        },
        {
          path: 'prescriptions',
          name: 'doctor-prescriptions',
          component: () => import('@/views/doctor/DoctorPrescriptionsView.vue'),
        },
        {
          path: 'prescriptions/create',
          name: 'doctor-create-prescription',
          component: () => import('@/views/doctor/DoctorCreatePrescriptionView.vue'),
        },
        {
          path: 'lab-orders',
          name: 'doctor-lab-orders',
          component: () => import('@/views/doctor/DoctorLabOrdersView.vue'),
        },
        {
          path: 'radiology-orders',
          name: 'doctor-radiology-orders',
          component: () => import('@/views/doctor/DoctorRadiologyOrdersView.vue'),
        },
      ],
    },
    // Receptionist Module
    {
      path: '/receptionist',
      component: () => import('@/views/receptionist/ReceptionistLayout.vue'),
      meta: { requiresAuth: true, requiresReceptionist: true },
      children: [
        {
          path: '',
          name: 'receptionist-dashboard',
          component: () => import('@/views/receptionist/ReceptionistDashboardView.vue'),
        },
        {
          path: 'appointments',
          name: 'receptionist-appointments',
          component: () => import('@/views/receptionist/ReceptionistAppointmentsView.vue'),
        },
        {
          path: 'patients',
          name: 'receptionist-patients',
          component: () => import('@/views/receptionist/ReceptionistPatientCheckInView.vue'),
        },
        {
          path: 'billing',
          name: 'receptionist-billing',
          component: () => import('@/views/receptionist/ReceptionistBillingView.vue'),
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
    // Redirect authenticated users to their role-specific dashboard
    const stored = localStorage.getItem('apollo_user')
    try {
      if (stored) {
        const user = JSON.parse(stored)
        const role = user.role?.toLowerCase()
        switch (role) {
          case 'admin': return next({ name: 'admin-dashboard' })
          case 'doctor': return next({ name: 'doctor-dashboard' })
          case 'receptionist':
          case 'reception': return next({ name: 'receptionist-dashboard' })
          case 'pharmacist': return next({ name: 'pharmacist' })
          case 'nurse': return next({ name: 'nurse' })
          case 'staff': return next({ name: 'staff' })
          default: return next({ name: 'login' })
        }
      }
    } catch {
      // ignore parse errors
    }
    next({ name: 'admin-dashboard' })
  } else if (to.meta.requiresAdmin && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role !== 'admin') {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore parse errors
    }
    next()
  } else if (to.meta.requiresDoctor && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role !== 'doctor') {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore parse errors
    }
    next()
  } else if (to.meta.requiresReceptionist && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        const role = user.role?.toLowerCase()
        if (role !== 'receptionist' && role !== 'reception') {
          next({ name: 'access-denied' })
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
