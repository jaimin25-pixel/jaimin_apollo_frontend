<template>
  <div class="dashboard-page">
    <!-- Top Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <img :src="logoSvg" alt="Apollo Hospital" class="header-logo" />
        <span class="header-title">Apollo Hospital</span>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-details">
            <span class="user-name">{{ authStore.user?.full_name }}</span>
            <span class="user-email">{{ authStore.user?.email }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.75 15.75H3.75a1.5 1.5 0 01-1.5-1.5V3.75a1.5 1.5 0 011.5-1.5h3" />
            <path d="M12 12.75L15.75 9 12 5.25" />
            <path d="M15.75 9H6.75" />
          </svg>
          Logout
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <!-- Greeting -->
      <div class="greeting-section">
        <h1>{{ greeting }}, {{ firstName }}</h1>
        <p>{{ formattedDate }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="dashboardStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="dashboardStore.error" class="error-state">
        <p>{{ dashboardStore.error }}</p>
        <button @click="dashboardStore.fetchDashboard()">Retry</button>
      </div>

      <!-- Dashboard Content -->
      <template v-else-if="dashboardStore.stats">
        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStore.stats.total_users }}</span>
              <span class="stat-label">Total Staff</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon patients-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStore.stats.total_patients }}</span>
              <span class="stat-label">Total Patients</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon appointments-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStore.stats.appointments_today }}</span>
              <span class="stat-label">Appointments Today</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon beds-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 17h22M6 8v9" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStore.stats.available_beds }}</span>
              <span class="stat-label">Available Beds</span>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <h2>Recent Activity</h2>
          <div v-if="dashboardStore.recentActivity.length === 0" class="empty-activity">
            <p>No recent activity</p>
          </div>
          <div v-else class="activity-list">
            <div
              v-for="log in dashboardStore.recentActivity"
              :key="log.id"
              class="activity-item"
            >
              <div class="activity-dot"></div>
              <div class="activity-info">
                <span class="activity-action">{{ formatAction(log.action) }}</span>
                <span class="activity-meta">{{ log.ip_address }} &middot; {{ formatDate(log.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import logoSvg from '@/assets/images/logo.svg'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const firstName = computed(() => authStore.user?.full_name?.split(' ')[0] || 'User')

const userInitials = computed(() => {
  const name = authStore.user?.full_name || 'U'
  const parts = name.split(' ')
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase()
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await authStore.checkAuth()
  dashboardStore.fetchDashboard()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--bg-light);
}

/* ─── Header ─── */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-logo {
  width: 36px;
  height: 36px;
}

.header-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-email {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  border-color: var(--error);
  color: var(--error);
  background: var(--error-bg);
}

/* ─── Main Content ─── */
.dashboard-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* ─── Greeting ─── */
.greeting-section {
  margin-bottom: 32px;
}

.greeting-section h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.greeting-section p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* ─── Loading / Error ─── */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button {
  padding: 8px 20px;
  background: var(--primary);
  color: #fff;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* ─── Stat Cards ─── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 36px;
}

.stat-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.users-icon {
  background: #eef2ff;
  color: #4f46e5;
}

.patients-icon {
  background: #ecfdf5;
  color: #059669;
}

.appointments-icon {
  background: #fff7ed;
  color: #ea580c;
}

.beds-icon {
  background: #fdf2f8;
  color: #db2777;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* ─── Activity Section ─── */
.activity-section {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.activity-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.empty-activity {
  text-align: center;
  padding: 32px 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-action {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.activity-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 12px 16px;
  }

  .user-details {
    display: none;
  }

  .dashboard-content {
    padding: 24px 16px;
  }

  .greeting-section h1 {
    font-size: 1.35rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
