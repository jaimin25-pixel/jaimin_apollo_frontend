<template>
  <div class="doctor-layout">
    <!-- Left Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo-section">
          <h3>Apollo HMS</h3>
          <p>Doctor Portal</p>
        </div>
      </div>

      <ul class="sidebar-menu">
        <li>
          <router-link to="/doctor" class="menu-item" active-class="active">
            <span class="menu-icon">📊</span>
            <span class="menu-label">Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/doctor/appointments" class="menu-item" active-class="active">
            <span class="menu-icon">📅</span>
            <span class="menu-label">Appointments</span>
          </router-link>
        </li>
        <li>
          <router-link to="/doctor/patients" class="menu-item" active-class="active">
            <span class="menu-icon">👥</span>
            <span class="menu-label">Patients</span>
          </router-link>
        </li>
        <li>
          <router-link to="/doctor/prescriptions" class="menu-item" active-class="active">
            <span class="menu-icon">💊</span>
            <span class="menu-label">Prescriptions</span>
          </router-link>
        </li>
        <li>
          <router-link to="/doctor/lab-orders" class="menu-item" active-class="active">
            <span class="menu-icon">🔬</span>
            <span class="menu-label">Lab Orders</span>
          </router-link>
        </li>
        <li>
          <router-link to="/doctor/radiology-orders" class="menu-item" active-class="active">
            <span class="menu-icon">📸</span>
            <span class="menu-label">Radiology</span>
          </router-link>
        </li>
      </ul>

      <div class="sidebar-footer">
        <router-link to="/doctor/profile" class="menu-item profile-menu" active-class="active">
          <span class="menu-icon">👤</span>
          <span class="menu-label">My Profile</span>
        </router-link>
        <button @click="handleLogout" class="menu-item logout-menu">
          <span class="menu-icon">🚪</span>
          <span class="menu-label">Logout</span>
        </button>
      </div>
    </nav>

    <!-- Top Navigation Bar -->
    <div class="layout-wrapper">
      <nav class="navbar">
        <div class="navbar-container">
          <div class="navbar-brand">
            <h2>Apollo HMS - Doctor Portal</h2>
          </div>
          <div class="navbar-user">
            <span class="user-avatar">{{ getInitials }}</span>
            <span class="user-name">{{ authStore.user?.full_name }}</span>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="doctor-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const getInitials = computed(() => {
  const name = authStore.user?.full_name
  if (!name) return 'D'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.doctor-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.logo-section h3 {
  color: white;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.logo-section p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 1rem 0;
  flex: 1;
}

.sidebar-menu li {
  margin: 0;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding-left: 1.8rem;
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
  padding-left: 1.8rem;
}

.menu-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.profile-menu,
.logout-menu {
  margin: 0;
}

/* ── Layout Wrapper ──────────────────────────────────────────────── */
.layout-wrapper {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

/* ── Top Navigation ──────────────────────────────────────────────── */
.navbar {
  background: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 100%;
}

.navbar-brand h2 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-name {
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

/* ── Main Container ──────────────────────────────────────────────– */
.doctor-container {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  overflow-y: auto;
}

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }

  .layout-wrapper {
    margin-left: 220px;
  }

  .navbar-container {
    padding: 1rem;
  }

  .navbar-brand h2 {
    font-size: 1.2rem;
  }

  .doctor-container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    flex-direction: row;
    padding: 1rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .layout-wrapper {
    margin-left: 0;
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-menu {
    display: flex;
    padding: 0;
    flex: 0;
    gap: 0;
    overflow-x: auto;
  }

  .sidebar-menu li {
    flex-shrink: 0;
  }

  .menu-item {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.25rem;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .menu-item:hover {
    padding-left: 1rem;
    border-bottom-color: white;
  }

  .menu-item.active {
    border-left: none;
    border-bottom-color: white;
    padding-left: 1rem;
  }

  .menu-icon {
    font-size: 1rem;
  }

  .menu-label {
    font-size: 0.7rem;
    text-align: center;
  }

  .sidebar-footer {
    display: none;
  }

  .navbar-brand h2 {
    font-size: 1rem;
  }

  .user-name {
    display: none;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }

  .doctor-container {
    padding: 1rem;
  }
}

/* Scrollbar Styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
