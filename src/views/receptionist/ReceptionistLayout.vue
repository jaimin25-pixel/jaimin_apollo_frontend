<template>
  <div class="receptionist-layout">
    <!-- Top Navigation -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <h2>Apollo HMS - Reception Portal</h2>
        </div>
        <div class="navbar-menu">
          <ul class="nav-links">
            <li><router-link to="/receptionist/dashboard" class="nav-link">Dashboard</router-link></li>
            <li><router-link to="/receptionist/appointments" class="nav-link">Appointments</router-link></li>
            <li><router-link to="/receptionist/patients" class="nav-link">Patients</router-link></li>
            <li><router-link to="/receptionist/visitors" class="nav-link">Visitors</router-link></li>
            <li><router-link to="/receptionist/billing" class="nav-link">Billing</router-link></li>
          </ul>
          <div class="navbar-right">
            <span class="user-info">{{ authStore.user?.full_name || 'Reception' }}</span>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="receptionist-container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.receptionist-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-brand h2 {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;
  font-size: 0.95rem;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-link.router-link-active {
  border-bottom: 2px solid white;
  padding-bottom: 0.5rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: white;
  color: #667eea;
}

.receptionist-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .receptionist-container {
    padding: 1rem;
  }

  .navbar-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
