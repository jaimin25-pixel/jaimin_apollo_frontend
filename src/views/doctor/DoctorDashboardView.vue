<template>
  <div class="dashboard">
    <div style="background: #fff3cd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; color: #856404;">
      ✓ Dashboard component loaded successfully
    </div>

    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1>Doctor Dashboard</h1>
        <p class="welcome-text" v-if="authStore.user">Welcome, {{ authStore.user.full_name }}</p>
      </div>
      <div class="doctor-info-badge" v-if="authStore.doctor">
        <div class="badge-item">
          <span class="label">Specialization:</span>
          <span class="value">{{ authStore.doctor.specialization }}</span>
        </div>
        <div class="badge-item">
          <span class="label">Department:</span>
          <span class="value">{{ authStore.doctor.department?.name || 'N/A' }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="doctorStore.loading && !dashboard" class="loading">
      <div class="spinner"></div>
      <span>Loading dashboard...</span>
    </div>

    <!-- Main Content -->
    <div v-else class="dashboard-content">
      <!-- Fallback: Show empty stats if no data -->
      <div v-if="!dashboard" class="fallback-notice">
        <p>Dashboard initialized. Loading data...</p>
      </div>
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Appointments Today</h3>
          <p class="stat-value">{{ dashboard?.today_appointments_count ?? 0 }}</p>
          <p class="stat-subtitle">{{ dashboard?.today_appointments?.length ?? 0 }} scheduled</p>
        </div>
        <div class="stat-card">
          <h3>All Appointments</h3>
          <p class="stat-value">{{ doctorStore.appointmentCount ?? 0 }}</p>
          <p class="stat-subtitle">Total in system</p>
        </div>
        <div class="stat-card">
          <h3>Pending Prescriptions</h3>
          <p class="stat-value">{{ dashboard?.pending_prescriptions ?? 0 }}</p>
          <p class="stat-subtitle">Awaiting fulfillment</p>
        </div>
        <div class="stat-card">
          <h3>Lab Orders</h3>
          <p class="stat-value">{{ doctorStore.pendingLabOrders?.length ?? 0 }}</p>
          <p class="stat-subtitle">Pending results</p>
        </div>
        <div class="stat-card">
          <h3>Radiology Orders</h3>
          <p class="stat-value">{{ doctorStore.pendingRadiologyOrders?.length ?? 0 }}</p>
          <p class="stat-subtitle">Pending results</p>
        </div>
        <div class="stat-card">
          <h3>All Prescriptions</h3>
          <p class="stat-value">{{ doctorStore.prescriptionCount ?? 0 }}</p>
          <p class="stat-subtitle">Total issued</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/doctor/appointments" class="action-card">
            <span class="action-icon">📅</span>
            <span>View Appointments</span>
          </router-link>
          <router-link to="/doctor/patients" class="action-card">
            <span class="action-icon">👥</span>
            <span>Manage Patients</span>
          </router-link>
          <router-link to="/doctor/prescriptions" class="action-card">
            <span class="action-icon">💊</span>
            <span>Create Prescription</span>
          </router-link>
          <router-link to="/doctor/lab-orders" class="action-card">
            <span class="action-icon">🔬</span>
            <span>Lab Orders</span>
          </router-link>
          <router-link to="/doctor/radiology-orders" class="action-card">
            <span class="action-icon">📸</span>
            <span>Radiology Orders</span>
          </router-link>
          <router-link to="/doctor/profile" class="action-card">
            <span class="action-icon">👤</span>
            <span>My Profile</span>
          </router-link>
        </div>
      </div>

      <!-- Today's Appointments Section -->
      <div v-if="dashboard?.today_appointments?.length > 0" class="recent-section">
        <h2>Today's Appointments</h2>
        <div class="appointments-list">
          <div
            v-for="appt in dashboard.today_appointments.slice(0, 5)"
            :key="appt.appt_id"
            class="appointment-item"
          >
            <div class="appt-time">{{ formatTime(appt.scheduled_at) }}</div>
            <div class="appt-details">
              <p class="patient-name">{{ appt.patient?.full_name || 'Unknown' }}</p>
              <p class="patient-code">{{ appt.patient?.pat_code || 'N/A' }}</p>
            </div>
            <span :class="`badge badge-${appt.status}`">{{ appt.status }}</span>
            <router-link :to="`/doctor/appointments/${appt.appt_id}`" class="link-btn">
              View
            </router-link>
          </div>
        </div>
      </div>

      <!-- Completed Lab Orders -->
      <div v-if="dashboard?.completed_lab_orders?.length > 0" class="recent-section">
        <h2>Recent Lab Results</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Completed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in dashboard.completed_lab_orders.slice(0, 5)" :key="order.lab_order_id">
              <td>{{ order.patient?.full_name || 'N/A' }}</td>
              <td>{{ order.test_ref?.test_name || 'N/A' }}</td>
              <td>{{ formatDate(order.result_uploaded_at) }}</td>
              <td>
                <button class="link-btn">View Results</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDoctorStore } from '@/stores/doctor'
import { useAuthStore } from '@/stores/auth'

const doctorStore = useDoctorStore()
const authStore = useAuthStore()

const dashboard = computed(() => doctorStore.dashboard)

const reloadDashboard = async () => {
  doctorStore.clearError()
  await doctorStore.loadDashboard()
  await Promise.all([
    doctorStore.loadAppointments(),
    doctorStore.loadPrescriptions(),
    doctorStore.loadLabOrders(),
    doctorStore.loadRadiologyOrders(),
  ])
}

onMounted(async () => {
  await reloadDashboard()
})

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (datetime: string) => {
  if (!datetime) return '--:--'
  return new Date(datetime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
  min-height: calc(100vh - 80px);
  background: #f5f5f5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.doctor-info-badge {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 2rem;
}

.badge-item {
  display: flex;
  flex-direction: column;
}

.badge-item .label {
  color: #666;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-item .value {
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.alert-close:hover {
  opacity: 0.7;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
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

.quick-actions h2,
.recent-section h2 {
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
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.action-icon {
  font-size: 2rem;
}

.recent-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.appt-time {
  font-weight: 600;
  color: #667eea;
  min-width: 60px;
}

.appt-details {
  flex: 1;
}

.patient-name {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.patient-code {
  margin: 0.25rem 0 0;
  color: #999;
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.badge-checked_in {
  background: #fef08a;
  color: #b45309;
}

.badge-in_consultation {
  background: #ddd6fe;
  color: #6d28d9;
}

.badge-completed {
  background: #dcfce7;
  color: #166534;
}

.badge-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.link-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
  font-size: 0.85rem;
}

.link-btn:hover {
  opacity: 0.8;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table thead {
  background: #f3f4f6;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #666;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 8px;
  color: #999;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.fallback-notice {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.btn-reload {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-reload:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.btn-reload:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
  }

  .doctor-info-badge {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem;
  }
}
</style>
