<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const store = useAdminStore()

onMounted(() => {
  store.fetchDashboard()
})

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="admin-dashboard">
    <!-- Loading State -->
    <div v-if="store.isLoading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Loading dashboard...</p>
    </div>

    <template v-else-if="store.dashboard">
      <!-- Bed Summary -->
      <section class="section">
        <h2 class="section-title">Bed Summary</h2>
        <div class="bed-cards">
          <div class="stat-card bed-total">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ store.dashboard.beds.total }}</span>
          </div>
          <div class="stat-card bed-occupied">
            <span class="stat-label">Occupied</span>
            <span class="stat-value">{{ store.dashboard.beds.occupied }}</span>
          </div>
          <div class="stat-card bed-available">
            <span class="stat-label">Available</span>
            <span class="stat-value">{{ store.dashboard.beds.available }}</span>
          </div>
          <div class="stat-card bed-icu">
            <span class="stat-label">ICU</span>
            <span class="stat-value">{{ store.dashboard.beds.icu }}</span>
          </div>
          <div class="stat-card bed-emergency">
            <span class="stat-label">Emergency</span>
            <span class="stat-value">{{ store.dashboard.beds.emergency }}</span>
          </div>
        </div>
      </section>

      <!-- Today's Stats -->
      <section class="section">
        <h2 class="section-title">Today's Stats</h2>
        <div class="today-cards">
          <div class="stat-card today-opd">
            <span class="stat-label">OPD Appointments</span>
            <span class="stat-value">{{ store.dashboard.opd_appointments }}</span>
          </div>
          <div class="stat-card today-ipd">
            <span class="stat-label">IPD Admissions</span>
            <span class="stat-value">{{ store.dashboard.ipd_admissions }}</span>
          </div>
          <div class="stat-card today-discharge">
            <span class="stat-label">Discharges</span>
            <span class="stat-value">{{ store.dashboard.discharges }}</span>
          </div>
        </div>
      </section>

      <!-- Department-wise Doctor Availability -->
      <section class="section">
        <h2 class="section-title">Department-wise Doctor Availability</h2>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Doctors</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in store.dashboard.dept_doctors" :key="dept.dept_id">
                <td>{{ dept.dept_name }}</td>
                <td>{{ dept.doctor_count }}</td>
                <td>
                  <span class="active-badge">{{ dept.active_count }}</span>
                </td>
              </tr>
              <tr v-if="store.dashboard.dept_doctors.length === 0">
                <td colspan="3" class="empty-row">No department data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Bottom Grid: Stock Alerts + Emergency Admissions -->
      <div class="bottom-grid">
        <!-- Stock Alerts -->
        <section class="section">
          <h2 class="section-title">Stock Alerts</h2>
          <div class="card-body">
            <div
              v-for="item in store.dashboard.stock_alerts"
              :key="item.medicine_id"
              class="stock-alert-item"
            >
              <div class="stock-info">
                <span class="stock-name">{{ item.generic_name }}</span>
                <span class="stock-levels">
                  Current: <strong :class="{ 'text-error': item.current_stock < item.reorder_level }">{{ item.current_stock }}</strong>
                  &nbsp;/&nbsp;Reorder Level: <strong>{{ item.reorder_level }}</strong>
                </span>
              </div>
              <div class="stock-bar-track">
                <div
                  class="stock-bar-fill"
                  :style="{ width: Math.min((item.current_stock / item.reorder_level) * 100, 100) + '%' }"
                ></div>
              </div>
            </div>
            <p v-if="store.dashboard.stock_alerts.length === 0" class="empty-text">
              No stock alerts at this time.
            </p>
          </div>
        </section>

        <!-- Emergency Admissions (24h) -->
        <section class="section">
          <h2 class="section-title">Emergency Admissions (24h)</h2>
          <div class="card-body">
            <div
              v-for="admission in store.dashboard.emergency_admissions"
              :key="admission.admission_id"
              class="emergency-item"
            >
              <div class="emergency-indicator"></div>
              <div class="emergency-details">
                <span class="emergency-patient">
                  {{ admission.patient?.full_name || 'Unknown Patient' }}
                </span>
                <span class="emergency-meta">
                  {{ admission.department?.name || 'N/A' }}
                  &mdash;
                  {{ formatTime(admission.admitted_at) }}
                </span>
              </div>
            </div>
            <p v-if="store.dashboard.emergency_admissions.length === 0" class="empty-text">
              No emergency admissions in the last 24 hours.
            </p>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border, #e5e7eb);
  border-top-color: var(--primary, #1a3a4a);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
}

/* Sections */
.section {
  margin-bottom: 28px;
  background: var(--bg, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
  margin: 0 0 16px 0;
}

/* Bed Cards */
.bed-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.stat-card {
  border-radius: 10px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.bed-total {
  background: #eef2ff;
  color: #3730a3;
}

.bed-occupied {
  background: #fef3c7;
  color: #92400e;
}

.bed-available {
  background: #d1fae5;
  color: #065f46;
}

.bed-icu {
  background: #fce7f3;
  color: #9d174d;
}

.bed-emergency {
  background: #fee2e2;
  color: #991b1b;
}

/* Today Cards */
.today-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.today-opd {
  background: #eff6ff;
  color: #1e40af;
}

.today-ipd {
  background: #f0fdf4;
  color: #166534;
}

.today-discharge {
  background: #faf5ff;
  color: #6b21a8;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  padding: 10px 14px;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border, #e5e7eb);
  background: var(--bg-light, #f9fafb);
}

.data-table td {
  padding: 10px 14px;
  color: var(--text-primary, #1a1a2e);
  border-bottom: 1px solid var(--border, #e5e7eb);
}

.data-table tbody tr:hover {
  background: var(--bg-light, #f9fafb);
}

.active-badge {
  display: inline-block;
  background: #d1fae5;
  color: #065f46;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.empty-row {
  text-align: center;
  color: var(--text-secondary, #6b7280);
  padding: 24px 14px !important;
}

/* Bottom Grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Stock Alerts */
.stock-alert-item {
  padding: 12px 14px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-light, #f9fafb);
}

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 4px;
}

.stock-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary, #1a1a2e);
}

.stock-levels {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.text-error {
  color: var(--error, #ef4444);
}

.stock-bar-track {
  height: 6px;
  background: var(--border, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.stock-bar-fill {
  height: 100%;
  background: var(--error, #ef4444);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Emergency Admissions */
.emergency-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-light, #f9fafb);
}

.emergency-indicator {
  width: 10px;
  height: 10px;
  min-width: 10px;
  border-radius: 50%;
  background: var(--error, #ef4444);
  margin-top: 4px;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.emergency-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.emergency-patient {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary, #1a1a2e);
}

.emergency-meta {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.empty-text {
  text-align: center;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
  padding: 20px 0;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .bed-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-dashboard {
    padding: 16px;
  }

  .bed-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .today-cards {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
