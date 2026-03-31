<template>
  <div class="patient-layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <img :src="logoSvg" alt="Apollo" class="sidebar-logo" />
        <span v-if="!sidebarCollapsed" class="sidebar-title">Apollo Patient</span>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="sidebarCollapsed" d="M6 4.5L11.25 9 6 13.5" />
            <path v-else d="M11.25 4.5L6 9 11.25 13.5" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.75 15.75H3.75a1.5 1.5 0 01-1.5-1.5V3.75a1.5 1.5 0 011.5-1.5h3" />
              <path d="M12 12.75L15.75 9 12 5.25" />
              <path d="M15.75 9H6.75" />
            </svg>
          </span>
          <span v-if="!sidebarCollapsed" class="nav-label">Logout</span>
        </button>
      </div>
    </aside>

    <div class="main-area">
      <header class="top-bar">
        <h2 class="page-title">{{ pageTitle }}</h2>
        <div class="top-bar-right">
          <div class="user-badge">
            <div class="user-avatar">{{ userInitials }}</div>
            <span class="user-name">{{ authStore.user?.full_name }}</span>
          </div>
        </div>
      </header>

      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoSvg from '@/assets/images/logo.svg'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)

const userInitials = computed(() => {
  const name = authStore.user?.full_name || ''
  if (!name) return 'PT'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/patient': 'Dashboard',
    '/patient/list': 'Patients',
    '/patient/appointments': 'Appointments',
    '/patient/admissions': 'Admissions',
    '/patient/ehr': 'Electronic Health Records',
    '/patient/billing': 'Billing & Payments',
  }
  return titles[route.path] || 'Patient Portal'
})

const navItems = [
  {
    path: '/patient',
    label: 'Dashboard',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.25" y="2.25" width="5.25" height="5.25" rx="1" /><rect x="10.5" y="2.25" width="5.25" height="5.25" rx="1" /><rect x="2.25" y="10.5" width="5.25" height="5.25" rx="1" /><rect x="10.5" y="10.5" width="5.25" height="5.25" rx="1" /></svg>',
  },
  {
    path: '/patient/list',
    label: 'Patients',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.75 15.75v-1.5a3 3 0 00-3-3h-4.5a3 3 0 00-3 3v1.5" /><circle cx="8" cy="5.25" r="3" /><path d="M15.75 15.75v-1.5a3 3 0 00-2.25-2.9" /><path d="M12 2.33a3 3 0 010 5.84" /></svg>',
  },
  {
    path: '/patient/appointments',
    label: 'Appointments',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="13" height="12" rx="1.5"/><path d="M12 2v3M6 2v3M2.5 7.5h13"/></svg>',
  },
  {
    path: '/patient/admissions',
    label: 'Admissions',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15.5h12M4.5 9v6.5M13.5 9v6.5M4.5 3h9M4.5 3L2 9M13.5 3L16 9" /></svg>',
  },
  {
    path: '/patient/ehr',
    label: 'EHR',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2h-11a1 1 0 00-1 1v12a1 1 0 001 1h11a1 1 0 001-1V3a1 1 0 00-1-1zM5.5 5.5h7M5.5 8.5h7M5.5 11.5h4" /></svg>',
  },
  {
    path: '/patient/billing',
    label: 'Billing',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="13" height="9" rx="1.5" /><path d="M2.5 7.5h13M6.5 10.5h2" /></svg>',
  },
  {
    path: '/patient/profile',
    label: 'My Profile',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8.5a3 3 0 100-6 3 3 0 000 6z"/><path d="M3 15.5a6 6 0 0112 0"/></svg>',
  },
]

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.patient-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-light);
}

.sidebar {
  width: 260px;
  background: var(--primary);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.collapse-btn {
  margin-left: auto;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 4px;
  color: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  border: none;
}
.collapse-btn:hover { background: rgba(255,255,255,0.2); }

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  transition: all 0.15s;
  text-decoration: none;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 500; }

.nav-icon { display: flex; align-items: center; flex-shrink: 0; }
.nav-label { white-space: nowrap; }

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.7);
  width: 100%;
}

.main-area {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.sidebar.collapsed + .main-area { margin-left: 64px; }

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.top-bar-right { display: flex; align-items: center; gap: 16px; }

.user-badge { display: flex; align-items: center; gap: 10px; }

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.user-name { font-size: 14px; font-weight: 500; color: var(--text-primary); }

.page-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar { width: 64px; }
  .sidebar .sidebar-title,
  .sidebar .nav-label { display: none; }
  .main-area { margin-left: 64px; }
  .page-content { padding: 16px; }
  .top-bar { padding: 12px 16px; }
}
</style>
