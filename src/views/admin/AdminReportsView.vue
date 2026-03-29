<template>
  <div class="reports-page">
    <div class="page-header">
      <h1 class="page-heading">Reports & Analytics</h1>
      <p class="page-subtitle">Generate financial, occupancy, and prescription reports.</p>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Financial Report -->
    <div v-if="activeTab === 'financial'" class="report-section">
      <div class="filter-bar">
        <div class="date-group">
          <label class="filter-label">From</label>
          <input v-model="financial.from" type="date" class="form-input date-input" />
        </div>
        <div class="date-group">
          <label class="filter-label">To</label>
          <input v-model="financial.to" type="date" class="form-input date-input" />
        </div>
        <button class="btn btn-primary" :disabled="financial.loading" @click="fetchFinancial">
          <span v-if="financial.loading" class="btn-spinner"></span>
          {{ financial.loading ? 'Fetching...' : 'Fetch Report' }}
        </button>
      </div>

      <div v-if="financial.error" class="alert alert-error">{{ financial.error }}</div>

      <div v-if="store.financialReport" class="stat-cards">
        <div class="stat-card">
          <span class="stat-label">Total Invoices</span>
          <span class="stat-value">{{ store.financialReport.total_invoices.toLocaleString() }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Revenue</span>
          <span class="stat-value currency">{{ formatCurrency(store.financialReport.total_revenue) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Paid</span>
          <span class="stat-value currency success">{{ formatCurrency(store.financialReport.total_paid) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Outstanding</span>
          <span class="stat-value currency error">{{ formatCurrency(store.financialReport.total_outstanding) }}</span>
        </div>
      </div>

      <div v-else-if="!financial.loading" class="empty-state">
        <p>Select a date range and click "Fetch Report" to view financial data.</p>
      </div>
    </div>

    <!-- Occupancy Report -->
    <div v-if="activeTab === 'occupancy'" class="report-section">
      <div class="filter-bar">
        <div class="date-group">
          <label class="filter-label">From</label>
          <input v-model="occupancy.from" type="date" class="form-input date-input" />
        </div>
        <div class="date-group">
          <label class="filter-label">To</label>
          <input v-model="occupancy.to" type="date" class="form-input date-input" />
        </div>
        <div class="date-group">
          <label class="filter-label">Department ID (optional)</label>
          <input v-model="occupancy.deptId" type="number" class="form-input date-input" placeholder="All" />
        </div>
        <button class="btn btn-primary" :disabled="occupancy.loading" @click="fetchOccupancy">
          <span v-if="occupancy.loading" class="btn-spinner"></span>
          {{ occupancy.loading ? 'Fetching...' : 'Fetch Report' }}
        </button>
      </div>

      <div v-if="occupancy.error" class="alert alert-error">{{ occupancy.error }}</div>

      <div v-if="store.occupancyReport && store.occupancyReport.length > 0" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Beds</th>
              <th>Occupied</th>
              <th>Occupancy %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in store.occupancyReport" :key="row.dept_id">
              <td>{{ row.dept_name }}</td>
              <td>{{ row.total_beds }}</td>
              <td>{{ row.occupied }}</td>
              <td>
                <div class="occupancy-cell">
                  <div class="occupancy-bar">
                    <div
                      class="occupancy-fill"
                      :style="{ width: occupancyPercent(row) + '%' }"
                      :class="occupancyColor(row)"
                    ></div>
                  </div>
                  <span class="occupancy-text">{{ occupancyPercent(row) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!occupancy.loading" class="empty-state">
        <p>Select a date range and click "Fetch Report" to view occupancy data.</p>
      </div>
    </div>

    <!-- Prescription Report -->
    <div v-if="activeTab === 'prescriptions'" class="report-section">
      <div class="filter-bar">
        <div class="date-group">
          <label class="filter-label">From</label>
          <input v-model="prescriptions.from" type="date" class="form-input date-input" />
        </div>
        <div class="date-group">
          <label class="filter-label">To</label>
          <input v-model="prescriptions.to" type="date" class="form-input date-input" />
        </div>
        <button class="btn btn-primary" :disabled="prescriptions.loading" @click="fetchPrescriptions">
          <span v-if="prescriptions.loading" class="btn-spinner"></span>
          {{ prescriptions.loading ? 'Fetching...' : 'Fetch Report' }}
        </button>
      </div>

      <div v-if="prescriptions.error" class="alert alert-error">{{ prescriptions.error }}</div>

      <div v-if="store.prescriptionReport && store.prescriptionReport.length > 0" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Department</th>
              <th>Prescription Count</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in store.prescriptionReport" :key="row.doctor_id">
              <td>{{ row.doctor_name }}</td>
              <td>{{ row.dept_name }}</td>
              <td>
                <span class="rx-badge">{{ row.rx_count.toLocaleString() }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!prescriptions.loading" class="empty-state">
        <p>Select a date range and click "Fetch Report" to view prescription data.</p>
      </div>
    </div>

    <!-- Export Section -->
    <div class="export-section">
      <h2 class="section-title">Export Data</h2>
      <div class="export-bar">
        <div class="date-group">
          <label class="filter-label">Entity</label>
          <select v-model="exportEntity" class="form-input select-input">
            <option value="doctors">Doctors</option>
            <option value="staff">Staff</option>
            <option value="departments">Departments</option>
            <option value="pharmacists">Pharmacists</option>
            <option value="partner_pharmacies">Partner Pharmacies</option>
          </select>
        </div>
        <div class="date-group">
          <label class="filter-label">Format</label>
          <select v-model="exportFormat" class="form-input select-input">
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <button class="btn btn-primary" :disabled="exporting" @click="handleExport">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 10v2.667A1.334 1.334 0 0112.667 14H3.333A1.334 1.334 0 012 12.667V10" />
            <path d="M4.667 6.667L8 10l3.333-3.333" />
            <path d="M8 10V2" />
          </svg>
          {{ exporting ? 'Exporting...' : 'Export' }}
        </button>
      </div>
      <div v-if="exportSuccess" class="alert alert-success" style="margin-top: 12px;">{{ exportSuccess }}</div>
      <div v-if="exportError" class="alert alert-error" style="margin-top: 12px;">{{ exportError }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAdminStore } from '@/stores/admin'

const store = useAdminStore()

const activeTab = ref<'financial' | 'occupancy' | 'prescriptions'>('financial')

const tabs = [
  {
    key: 'financial' as const,
    label: 'Financial',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.333v13.334M11.333 3.333H6.333a2 2 0 100 4h3.334a2 2 0 010 4H4.667" /></svg>',
  },
  {
    key: 'occupancy' as const,
    label: 'Occupancy',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1.5" /><path d="M2 6h12M6 2v12" /></svg>',
  },
  {
    key: 'prescriptions' as const,
    label: 'Prescriptions',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="1.333" width="10" height="13.334" rx="1.5" /><path d="M6 5.333h4M6 8h4M6 10.667h2.667" /></svg>',
  },
]

// Financial
const financial = reactive({ from: '', to: '', loading: false, error: '' })

async function fetchFinancial() {
  if (!financial.from || !financial.to) {
    financial.error = 'Please select both from and to dates.'
    return
  }
  financial.loading = true
  financial.error = ''
  try {
    await store.fetchFinancialReport(financial.from, financial.to)
  } catch (err: any) {
    financial.error = err?.message || 'Failed to fetch financial report.'
  } finally {
    financial.loading = false
  }
}

// Occupancy
const occupancy = reactive({ from: '', to: '', deptId: '' as string | number, loading: false, error: '' })

async function fetchOccupancy() {
  if (!occupancy.from || !occupancy.to) {
    occupancy.error = 'Please select both from and to dates.'
    return
  }
  occupancy.loading = true
  occupancy.error = ''
  try {
    const deptId = occupancy.deptId ? Number(occupancy.deptId) : undefined
    await store.fetchOccupancyReport(occupancy.from, occupancy.to, deptId)
  } catch (err: any) {
    occupancy.error = err?.message || 'Failed to fetch occupancy report.'
  } finally {
    occupancy.loading = false
  }
}

function occupancyPercent(row: { total_beds: number; occupied: number }): number {
  if (row.total_beds === 0) return 0
  return Math.round((row.occupied / row.total_beds) * 100)
}

function occupancyColor(row: { total_beds: number; occupied: number }): string {
  const pct = occupancyPercent(row)
  if (pct >= 90) return 'fill-critical'
  if (pct >= 70) return 'fill-warning'
  return 'fill-normal'
}

// Prescriptions
const prescriptions = reactive({ from: '', to: '', loading: false, error: '' })

async function fetchPrescriptions() {
  if (!prescriptions.from || !prescriptions.to) {
    prescriptions.error = 'Please select both from and to dates.'
    return
  }
  prescriptions.loading = true
  prescriptions.error = ''
  try {
    await store.fetchPrescriptionReport(prescriptions.from, prescriptions.to)
  } catch (err: any) {
    prescriptions.error = err?.message || 'Failed to fetch prescription report.'
  } finally {
    prescriptions.loading = false
  }
}

// Export
const exportEntity = ref('doctors')
const exportFormat = ref('csv')
const exporting = ref(false)
const exportSuccess = ref('')
const exportError = ref('')

async function handleExport() {
  exporting.value = true
  exportSuccess.value = ''
  exportError.value = ''
  try {
    await store.exportData(exportEntity.value, exportFormat.value)
    exportSuccess.value = `Successfully exported ${exportEntity.value.replace('_', ' ')} as ${exportFormat.value.toUpperCase()}.`
    setTimeout(() => {
      exportSuccess.value = ''
    }, 4000)
  } catch (err: any) {
    exportError.value = err?.message || 'Failed to export data.'
  } finally {
    exporting.value = false
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<style scoped>
.reports-page {
  max-width: 960px;
}

.page-header {
  margin-bottom: 24px;
}

.page-heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-light);
}

.tab-btn.active {
  color: #fff;
  background: var(--primary);
}

.tab-icon {
  display: flex;
  align-items: center;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg);
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.1);
}

.date-input {
  min-width: 150px;
}

.select-input {
  min-width: 170px;
  cursor: pointer;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  font-family: inherit;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-light);
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stat Cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.success {
  color: var(--success);
}

.stat-value.error {
  color: var(--error);
}

/* Tables */
.table-wrapper {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--bg-light);
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: var(--bg-light);
}

/* Occupancy Bar */
.occupancy-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.occupancy-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-light);
  border-radius: 4px;
  overflow: hidden;
  max-width: 120px;
}

.occupancy-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.fill-normal {
  background: var(--success);
}

.fill-warning {
  background: #f59e0b;
}

.fill-critical {
  background: var(--error);
}

.occupancy-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 36px;
}

/* Rx Badge */
.rx-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  background: rgba(26, 58, 74, 0.08);
  color: var(--primary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.empty-state p {
  margin: 0;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.alert-success {
  background: rgba(16, 185, 129, 0.08);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.alert-error {
  background: rgba(239, 68, 68, 0.08);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Export Section */
.export-section {
  margin-top: 32px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.export-bar {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

/* Report Section */
.report-section {
  min-height: 200px;
}

@media (max-width: 640px) {
  .tab-bar {
    flex-direction: column;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .export-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-cards {
    grid-template-columns: 1fr 1fr;
  }

  .date-input,
  .select-input {
    min-width: unset;
    width: 100%;
  }

  .btn {
    width: 100%;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
