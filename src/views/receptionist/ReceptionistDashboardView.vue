<template>
  <div class="dashboard">
    <h1>Reception Dashboard</h1>

    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <div v-else-if="store.error" class="alert alert-danger">
      {{ store.error }}
      <button @click="store.fetchDashboard()" class="btn-retry">Retry</button>
    </div>

    <div v-else class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Today's Appointments</h3>
          <p class="stat-value">{{ store.dashboard?.total_today ?? 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Checked In</h3>
          <p class="stat-value checked-in">{{ store.dashboard?.checked_in_count ?? 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Waiting Patients</h3>
          <p class="stat-value waiting">{{ totalWaiting }}</p>
        </div>
        <div class="stat-card">
          <h3>Depts with Queue</h3>
          <p class="stat-value">{{ store.dashboard?.waiting_by_dept?.length ?? 0 }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/receptionist/appointments" class="action-card">
            <span class="action-icon">📅</span>
            <span>Schedule Appointment</span>
          </router-link>
          <router-link to="/receptionist/patients" class="action-card">
            <span class="action-icon">👥</span>
            <span>Manage Patients</span>
          </router-link>
          <router-link to="/receptionist/visitors" class="action-card">
            <span class="action-icon">🪪</span>
            <span>Visitor Log</span>
          </router-link>
          <router-link to="/receptionist/appointments" class="action-card">
            <span class="action-icon">✅</span>
            <span>Check-In Patient</span>
          </router-link>
        </div>
      </div>

      <!-- Department Queue -->
      <div class="queue-section">
        <h2>Waiting Queue by Department</h2>
        <div v-if="!store.dashboard?.waiting_by_dept?.length" class="no-data">
          <p>No patients currently waiting</p>
        </div>
        <div v-else class="dept-queue-grid">
          <div
            v-for="dept in store.dashboard.waiting_by_dept"
            :key="dept.dept_id"
            class="dept-card"
          >
            <h4>{{ dept.dept_name }}</h4>
            <p class="queue-count">{{ dept.waiting }}</p>
            <span class="queue-label">waiting</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useReceptionistStore } from '@/stores/receptionist'

const store = useReceptionistStore()

const totalWaiting = computed(() =>
  store.dashboard?.waiting_by_dept?.reduce((sum, d) => sum + d.waiting, 0) ?? 0
)

onMounted(() => store.fetchDashboard())
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #666;
  gap: 1rem;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.alert-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.btn-retry {
  background: #991b1b;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}
.stat-card h3 {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}
.stat-value.checked-in { color: #16a34a; }
.stat-value.waiting    { color: #d97706; }

/* Quick Actions */
.quick-actions { margin-bottom: 2rem; }
.quick-actions h2 { color: #333; margin-bottom: 1rem; }
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(102,126,234,0.3);
}
.action-icon { font-size: 2rem; }

/* Dept Queue */
.queue-section { margin-bottom: 2rem; }
.queue-section h2 { color: #333; margin-bottom: 1rem; }
.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.dept-queue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
.dept-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  border-top: 3px solid #667eea;
}
.dept-card h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}
.queue-count {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}
.queue-label {
  font-size: 0.8rem;
  color: #888;
}

@media (max-width: 768px) {
  .stats-grid   { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
