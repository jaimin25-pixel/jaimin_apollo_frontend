<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1>OT Dashboard</h1>
        <p class="welcome-text" v-if="authStore.user">Welcome, {{ authStore.user.full_name }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Today's Surgeries</h3>
          <p class="stat-value">0</p>
          <p class="stat-subtitle">Scheduled for today</p>
        </div>
        <div class="stat-card">
          <h3>Completed</h3>
          <p class="stat-value">0</p>
          <p class="stat-subtitle">Operations finished</p>
        </div>
        <div class="stat-card">
          <h3>Upcoming</h3>
          <p class="stat-value">0</p>
          <p class="stat-subtitle">Next 7 days</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/ot/schedules" class="action-card">
            <span class="action-icon">📅</span>
            <span>View Schedules</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
  min-height: calc(100vh - 80px);
  background: #f5f5f5;
  padding: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-header h1 {
  color: #333;
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.welcome-text {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary, #667eea);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-card h3 {
  margin: 0 0 0.5rem;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  margin: 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
}

.stat-subtitle {
  margin: 0.5rem 0 0;
  color: #999;
  font-size: 0.875rem;
}

.quick-actions h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.35rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.action-card:hover {
  border-color: var(--primary, #667eea);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.action-icon {
  font-size: 2.5rem;
}
</style>
