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
              case 'nurse': return '/nursing'
              case 'hr_manager':
              case 'staff': return '/hr'
              case 'billing_staff': return '/finance'
              case 'lab_technician':
              case 'radiologist': return '/lab'
              case 'ot_technician': return '/ot'
              case 'patient': return '/patient'
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
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('@/views/shared/SharedProfileView.vue'),
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
          component: () => import('@/views/shared/SharedProfileView.vue'),
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
          path: 'visitors',
          name: 'receptionist-visitors',
          component: () => import('@/views/receptionist/VisitorLogView.vue'),
        },
        {
          path: 'billing',
          name: 'receptionist-billing',
          component: () => import('@/views/receptionist/ReceptionistBillingView.vue'),
        },
        {
          path: 'profile',
          name: 'receptionist-profile',
          component: () => import('@/views/shared/SharedProfileView.vue'),
        },
      ],
    },
    // Pharmacist Module
    {
      path: '/pharmacist',
      component: () => import('@/views/pharmacy/PharmacyLayout.vue'),
      meta: { requiresAuth: true, requiresPharmacist: true },
      children: [
        {
          path: '',
          name: 'pharmacist-dashboard',
          component: () => import('@/views/pharmacy/PharmacyDashboard.vue'),
        },
        {
          path: 'inventory',
          name: 'pharmacist-inventory',
          component: () => import('@/views/pharmacy/InventoryPage.vue'),
        },
        {
          path: 'inventory/:id',
          name: 'pharmacist-medicine-detail',
          component: () => import('@/views/pharmacy/MedicineDetailView.vue'),
        },
        {
          path: 'partner-pharmacies',
          name: 'pharmacist-partners',
          component: () => import('@/views/pharmacy/PartnerPharmaciesPage.vue'),
        },
        {
          path: 'profile',
          name: 'pharmacist-profile',
          component: () => import('@/views/shared/SharedProfileView.vue'),
        },
      ],
    },
    // Nursing Module
    {
      path: '/nursing',
      component: () => import('@/views/nursing/NursingLayout.vue'),
      meta: { requiresAuth: true, requiresNurse: true },
      children: [
        {
          path: '',
          redirect: '/nursing/dashboard'
        },
        {
          path: 'dashboard',
          name: 'nursing-dashboard',
          component: () => import('@/views/nursing/NursingDashboardView.vue'),
        },
        {
          path: 'wards',
          name: 'nursing-wards',
          component: () => import('@/views/nursing/NursingWardsView.vue'),
        },
        {
          path: 'patients',
          name: 'nursing-patients',
          component: () => import('@/views/nursing/NursingPatientsView.vue'),
        },
        {
          path: 'profile',
          name: 'nursing-profile',
          component: () => import('@/views/shared/SharedProfileView.vue'),
        },
      ],
    },
    // Lab & Radiology Module
    {
      path: '/lab',
      component: () => import('@/views/lab/LabLayout.vue'),
      meta: { requiresAuth: true, requiresLabModule: true },
      children: [
        { path: '', redirect: '/lab/dashboard' },
        { path: 'dashboard', name: 'lab-dashboard', component: () => import('@/views/lab/LabDashboardView.vue') },
        { path: 'orders', name: 'lab-orders', component: () => import('@/views/lab/LabOrdersView.vue') },
        { path: 'radiology', name: 'lab-radiology-orders', component: () => import('@/views/lab/RadiologyOrdersView.vue') },
        { path: 'profile', name: 'lab-profile', component: () => import('@/views/shared/SharedProfileView.vue') },
      ],
    },
    // Operation Theatre Module
    {
      path: '/ot',
      component: () => import('@/views/ot/OTLayout.vue'),
      meta: { requiresAuth: true, requiresOTModule: true },
      children: [
        { path: '', redirect: '/ot/dashboard' },
        { path: 'dashboard', name: 'ot-dashboard', component: () => import('@/views/ot/OTDashboardView.vue') },
        { path: 'schedules', name: 'ot-schedules', component: () => import('@/views/ot/OTSchedulesView.vue') },
        { path: 'profile', name: 'ot-profile', component: () => import('@/views/shared/SharedProfileView.vue') },
      ],
    },
    // HR & Staff Module
    {
      path: '/hr',
      component: () => import('@/views/hr/HRLayout.vue'),
      meta: { requiresAuth: true, requiresHRModule: true },
      children: [
        { path: '', redirect: '/hr/dashboard' },
        { path: 'dashboard', name: 'hr-dashboard', component: () => import('@/views/hr/HRDashboardView.vue') },
        { path: 'staff', name: 'hr-staff', component: () => import('@/views/hr/HRStaffView.vue') },
        { path: 'profile', name: 'hr-profile', component: () => import('@/views/shared/SharedProfileView.vue') },
      ],
    },
    // Finance & Insurance Module
    {
      path: '/finance',
      component: () => import('@/views/finance/FinanceLayout.vue'),
      meta: { requiresAuth: true, requiresFinanceModule: true },
      children: [
        { path: '', redirect: '/finance/dashboard' },
        { path: 'dashboard', name: 'finance-dashboard', component: () => import('@/views/finance/FinanceDashboardView.vue') },
        { path: 'invoices', name: 'finance-invoices', component: () => import('@/views/finance/FinanceInvoicesView.vue') },
        { path: 'profile', name: 'finance-profile', component: () => import('@/views/shared/SharedProfileView.vue') },
      ],
    },
    // Patient Module
    {
      path: '/patient',
      component: () => import('@/views/patient/PatientLayout.vue'),
      meta: { requiresAuth: true, requiresPatientModule: true },
      children: [
        {
          path: '',
          name: 'patient-dashboard',
          component: () => import('@/views/patient/PatientDashboardView.vue'),
        },
        {
          path: 'list',
          name: 'patient-list',
          component: () => import('@/views/patient/PatientListView.vue'),
        },
        {
          path: 'appointments',
          name: 'patient-appointments',
          component: () => import('@/views/patient/PatientAppointmentsView.vue'),
        },
        {
          path: 'admissions',
          name: 'patient-admissions',
          component: () => import('@/views/patient/PatientAdmissionsView.vue'),
        },
        {
          path: 'ehr',
          name: 'patient-ehr',
          component: () => import('@/views/patient/PatientEHRView.vue'),
        },
        {
          path: 'billing',
          name: 'patient-billing',
          component: () => import('@/views/patient/PatientBillingView.vue'),
        },
        {
          path: 'profile',
          name: 'patient-profile',
          component: () => import('@/views/shared/SharedProfileView.vue'),
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
          case 'pharmacist': return next({ name: 'pharmacist-dashboard' })
          case 'nurse': return next({ name: 'nursing-dashboard' })
          case 'hr_manager':
          case 'staff': return next({ name: 'hr-dashboard' })
          case 'billing_staff': return next({ name: 'finance-dashboard' })
          case 'lab_technician':
          case 'radiologist': return next({ name: 'lab-dashboard' })
          case 'ot_technician': return next({ name: 'ot-dashboard' })
          case 'patient': return next({ name: 'patient-dashboard' })
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
  } else if (to.meta.requiresPharmacist && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role?.toLowerCase() !== 'pharmacist') {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore parse errors
    }
    next()
  } else if (to.meta.requiresNurse && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.role?.toLowerCase() !== 'nurse') {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore parse errors
    }
    next()
  } else if (to.meta.requiresLabModule && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        const allowed = ['lab_technician', 'radiologist', 'admin']
        if (!allowed.includes(user.role?.toLowerCase())) {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore
    }
    next()
  } else if (to.meta.requiresOTModule && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        const allowed = ['doctor', 'nurse', 'admin']
        if (!allowed.includes(user.role?.toLowerCase())) {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore
    }
    next()
  } else if (to.meta.requiresHRModule && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        const allowed = ['hr_manager', 'admin', 'staff']
        if (!allowed.includes(user.role?.toLowerCase())) {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore
    }
    next()
  } else if (to.meta.requiresFinanceModule && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        const allowed = ['billing_staff', 'admin']
        if (!allowed.includes(user.role?.toLowerCase())) {
          next({ name: 'access-denied' })
          return
        }
      }
    } catch {
      // ignore
    }
    next()
  } else if (to.meta.requiresPatientModule && isAuthenticated) {
    try {
      const stored = localStorage.getItem('apollo_user')
      if (stored) {
        const user = JSON.parse(stored)
        const role = user.role?.toLowerCase()
        const allowed = ['receptionist', 'reception', 'doctor', 'nurse', 'admin', 'patient']
        if (!allowed.includes(role)) {
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
