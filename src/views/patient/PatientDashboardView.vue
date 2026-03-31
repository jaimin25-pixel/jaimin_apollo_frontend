<template>
  <div class="dashboard">
    <h1>Patient Dashboard</h1>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-patients">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>Total Patients</h3>
            <p class="stat-value">{{ patients.length }}</p>
          </div>
        </div>
        <div class="stat-card stat-appointments">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>Recent Appointments</h3>
            <p class="stat-value">{{ recentAppointments.length }}</p>
          </div>
        </div>
        <div class="stat-card stat-admissions">
          <div class="stat-icon">🏨</div>
          <div class="stat-info">
            <h3>Active Admissions</h3>
            <p class="stat-value">{{ activeAdmissions }}</p>
          </div>
        </div>
        <div class="stat-card stat-invoices">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>Pending Invoices</h3>
            <p class="stat-value">{{ pendingInvoices }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Search -->
      <div class="search-section">
        <h2>Quick Patient Search</h2>
        <div class="search-bar">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search by name, phone, or PAT code..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">Search</button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/patient/list" class="action-card">
            <span class="action-icon">👤</span>
            <span>Register Patient</span>
          </router-link>
          <router-link to="/patient/appointments" class="action-card">
            <span class="action-icon">📋</span>
            <span>Book Appointment</span>
          </router-link>
          <router-link to="/patient/ehr" class="action-card">
            <span class="action-icon">📄</span>
            <span>View EHR</span>
          </router-link>
          <router-link to="/patient/billing" class="action-card">
            <span class="action-icon">🧾</span>
            <span>View Invoices</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Patients -->
      <div class="recent-section">
        <h2>Recent Patients</h2>
        <div v-if="patients.length === 0" class="no-data">
          <p>No patients found. Register a new patient to get started.</p>
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>PAT Code</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in patients.slice(0, 8)" :key="p.patient_id">
                <td><span class="pat-badge">{{ p.pat_code }}</span></td>
                <td class="name-cell">{{ p.full_name }}</td>
                <td><span class="gender-badge" :class="p.gender">{{ p.gender }}</span></td>
                <td><span class="blood-badge" v-if="p.blood_group">{{ p.blood_group }}</span></td>
                <td>{{ p.contact_number }}</td>
                <td>{{ formatDate(p.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePatientStore } from '@/stores/patient'

const store = usePatientStore()
const searchQuery = ref('')
const loading = ref(true)
const patients = computed(() => store.patients)
const recentAppointments = computed(() => store.appointments)
const activeAdmissions = ref(0)
const pendingInvoices = ref(0)

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function handleSearch() {
  await store.searchPatients(searchQuery.value)
}

onMounted(async () => {
  loading.value = true
  await store.searchPatients('')
  // Try to get stats — count from loaded data
  if (store.patients.length > 0) {
    // Load appointments and invoices for the first patient as sample data
    try {
      await store.fetchAppointments(store.patients[0].patient_id)
      await store.fetchInvoices(store.patients[0].patient_id)
      pendingInvoices.value = store.invoices.filter(i => i.status === 'draft' || i.status === 'finalized').length
      await store.fetchAdmissions(store.patients[0].patient_id)
      activeAdmissions.value = store.admissions.filter(a => a.status === 'admitted').length
    } catch {
      // ignore
    }
  }
  loading.value = false
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

h1 {
  color: #064e3b;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  font-weight: 700;
}
h2 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #64748b;
  gap: 1rem;
}
.spinner {
  width: 44px; height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border-left: 4px solid;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.stat-patients { border-color: #0d9488; }
.stat-appointments { border-color: #3b82f6; }
.stat-admissions { border-color: #f59e0b; }
.stat-invoices { border-color: #10b981; }
.stat-icon { font-size: 2.5rem; }
.stat-info h3 {
  color: #64748b; font-size: 0.85rem; margin: 0; text-transform: uppercase;
  letter-spacing: 0.5px; font-weight: 600;
}
.stat-value {
  font-size: 2.2rem; font-weight: 700; margin: 0.25rem 0 0; color: #1e293b;
}

/* Search */
.search-section { margin-bottom: 2rem; }
.search-bar { display: flex; gap: 0.75rem; }
.search-input {
  flex: 1; padding: 0.85rem 1.25rem; border: 2px solid #e2e8f0;
  border-radius: 12px; font-size: 0.95rem; background: white;
  transition: border-color 0.3s;
}
.search-input:focus { outline: none; border-color: #0d9488; }
.search-btn {
  padding: 0.85rem 2rem; background: linear-gradient(135deg, #0d9488, #065f46);
  color: white; border: none; border-radius: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.3s; font-size: 0.95rem;
}
.search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13,148,136,0.3); }

/* Quick Actions */
.quick-actions { margin-bottom: 2.5rem; }
.actions-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem;
}
.action-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 1.5rem; background: white; border-radius: 16px;
  text-decoration: none; color: #0d9488; font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06); transition: all 0.3s;
  gap: 0.75rem; cursor: pointer; font-size: 0.9rem;
}
.action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(13,148,136,0.15); }
.action-icon { font-size: 2.2rem; }

/* Table */
.table-container {
  background: white; border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: #f8fafc; padding: 1rem 1.25rem; text-align: left;
  font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
  color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;
}
.data-table td {
  padding: 0.9rem 1.25rem; border-bottom: 1px solid #f1f5f9;
  color: #334155; font-size: 0.9rem;
}
.data-table tbody tr:hover { background: #f0fdfa; }
.name-cell { font-weight: 600; color: #0f172a; }

.pat-badge {
  background: linear-gradient(135deg, #0d9488, #065f46);
  color: white; padding: 0.25rem 0.75rem; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600; letter-spacing: 0.3px;
}
.gender-badge {
  padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;
  font-weight: 500; text-transform: capitalize;
}
.gender-badge.male { background: #dbeafe; color: #1e40af; }
.gender-badge.female { background: #fce7f3; color: #be185d; }
.gender-badge.other { background: #e0e7ff; color: #4338ca; }

.blood-badge {
  background: #fef2f2; color: #dc2626; padding: 0.2rem 0.5rem;
  border-radius: 4px; font-size: 0.8rem; font-weight: 600;
}

.no-data {
  text-align: center; padding: 3rem; color: #64748b;
  background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
