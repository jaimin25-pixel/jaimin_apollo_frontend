<template>
  <div class="admin-layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <img :src="logoSvg" alt="Apollo" class="sidebar-logo" />
        <span v-if="!sidebarCollapsed" class="sidebar-title">Apollo Admin</span>
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
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/departments': 'Department Management',
    '/admin/doctors': 'Doctor Management',
    '/admin/staff': 'Staff Management',
    '/admin/pharmacists': 'Pharmacist Management',
    '/admin/config': 'Hospital Configuration',
    '/admin/reports': 'Reports & Analytics',
  }
  return titles[route.path] || 'Admin Panel'
})

const navItems = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.25" y="2.25" width="5.25" height="5.25" rx="1" /><rect x="10.5" y="2.25" width="5.25" height="5.25" rx="1" /><rect x="2.25" y="10.5" width="5.25" height="5.25" rx="1" /><rect x="10.5" y="10.5" width="5.25" height="5.25" rx="1" /></svg>',
  },
  {
    path: '/admin/departments',
    label: 'Departments',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 6.75L9 2.25l7.5 4.5v4.5L9 15.75l-7.5-4.5z" /></svg>',
  },
  {
    path: '/admin/doctors',
    label: 'Doctors',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5a3.75 3.75 0 100 7.5A3.75 3.75 0 009 1.5z"/><path d="M1.5 16.5a7.5 7.5 0 0115 0"/><path d="M12 11.25v3M10.5 12.75h3"/></svg>',
  },
  {
    path: '/admin/staff',
    label: 'Staff',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.75 15.75v-1.5a3 3 0 00-3-3h-4.5a3 3 0 00-3 3v1.5" /><circle cx="8" cy="5.25" r="3" /><path d="M15.75 15.75v-1.5a3 3 0 00-2.25-2.9" /><path d="M12 2.33a3 3 0 010 5.84" /></svg>',
  },
  {
    path: '/admin/pharmacists',
    label: 'Pharmacists',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="1.5" width="12" height="15" rx="1.5" /><path d="M6.75 6h4.5M9 3.75v4.5" /><path d="M6 10.5h6M6 13.5h6" /></svg>',
  },
  {
    path: '/admin/config',
    label: 'Configuration',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="2.25" /><path d="M14.85 11.25a1.2 1.2 0 00.24 1.32l.04.04a1.5 1.5 0 11-2.12 2.12l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.12a1.5 1.5 0 01-3 0v-.06a1.2 1.2 0 00-.78-1.1 1.2 1.2 0 00-1.32.24l-.04.04a1.5 1.5 0 11-2.12-2.12l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.73H3.42a1.5 1.5 0 010-3h.06a1.2 1.2 0 001.1-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.5 1.5 0 112.12-2.12l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.73-1.1V3.42a1.5 1.5 0 013 0v.06a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.04-.04a1.5 1.5 0 112.12 2.12l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.73h.12a1.5 1.5 0 010 3h-.06a1.2 1.2 0 00-1.1.73z" /></svg>',
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 15.75H4.5a1.5 1.5 0 01-1.5-1.5V3.75a1.5 1.5 0 011.5-1.5h5.69a1.5 1.5 0 011.06.44l3.56 3.56a1.5 1.5 0 01.44 1.06v6.94a1.5 1.5 0 01-1.5 1.5z" /><path d="M10.5 2.25v4.5h4.5" /><path d="M6.75 9.75h4.5M6.75 12.75h4.5" /></svg>',
  },
]

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.admin-layout {
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
