<template>
  <div class="pharmacy-dashboard">
    <div class="header">
      <h1>Pharmacy Dashboard</h1>
      <div class="quick-actions">
        <button class="btn btn-primary" @click="showDispenseModal = true">+ Dispense Prescription</button>
        <button class="btn btn-secondary" @click="showAddMedicineModal = true">+ Add Medicine</button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ store.dashboardStats.pending_prescriptions }}</h3>
        <p>Pending Prescriptions</p>
      </div>
      <div class="stat-card warning">
        <h3>{{ store.dashboardStats.low_stock_medicines }}</h3>
        <p>Low Stock Medicines</p>
      </div>
      <div class="stat-card danger">
        <h3>{{ store.dashboardStats.expiring_medicines }}</h3>
        <p>Expiring Soon</p>
      </div>
      <div class="stat-card">
        <h3>{{ store.dashboardStats.total_medicines }}</h3>
        <p>Total Medicines</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: activeTab === tab }]"
        @click="onTabChange(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Pending Prescriptions -->
    <div v-if="activeTab === 'Prescriptions'" class="content-section">
      <div class="filters">
        <input v-model="rxFilters.date" type="date" class="input" @change="store.loadPrescriptions(rxFilters)" />
        <input v-model="rxFilters.doctor_id" type="number" placeholder="Doctor ID" class="input" @change="store.loadPrescriptions(rxFilters)" />
        <select v-model="rxFilters.status" class="input" @change="store.loadPrescriptions(rxFilters)">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="partially_dispensed">Partially Dispensed</option>
          <option value="fully_dispensed">Fully Dispensed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table v-if="store.prescriptions.length" class="table">
        <thead>
          <tr>
            <th>Rx ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rx in store.prescriptions" :key="rx.rx_id">
            <td><strong>#{{ rx.rx_id }}</strong></td>
            <td>{{ rx.patient?.full_name || '—' }}</td>
            <td>{{ rx.doctor?.doc_code || '—' }}</td>
            <td><span :class="['badge', rx.status]">{{ rx.status?.replace('_', ' ') }}</span></td>
            <td>{{ formatDate(rx.created_at) }}</td>
            <td>
              <button v-if="rx.status !== 'fully_dispensed' && rx.status !== 'cancelled'" @click="showDispenseModal = true" class="btn btn-sm btn-success">Dispense</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">No prescriptions found</div>
    </div>

    <!-- Stock Alerts -->
    <div v-if="activeTab === 'Stock Alerts'" class="content-section">
      <div class="alert-tabs">
        <button :class="['tab-small', { active: alertType === 'low' }]" @click="switchAlert('low')">
          Low Stock
        </button>
        <button :class="['tab-small', { active: alertType === 'expiring' }]" @click="switchAlert('expiring')">
          Expiring Soon
        </button>
      </div>

      <table v-if="store.alerts.length" class="table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Details</th>
            <th>Triggered</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alert in store.alerts" :key="alert.alert_id">
            <td>{{ alert.medicine?.generic_name }}</td>
            <td>{{ alert.alert_type }}</td>
            <td><span :class="['badge', alert.severity]">{{ alert.severity }}</span></td>
            <td>{{ alert.description }}</td>
            <td>{{ formatDate(alert.triggered_at) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">No alerts</div>
    </div>

    <!-- Inventory Quick View -->
    <div v-if="activeTab === 'Inventory'" class="content-section">
      <div class="filters">
        <input v-model="medicineSearch" type="text" placeholder="Search medicines…" class="input" @input="debouncedMedSearch" />
        <select v-model="selectedCategory" class="input" @change="store.loadMedicines(selectedCategory || undefined)">
          <option value="">All Categories</option>
          <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <router-link to="/pharmacist/inventory" class="btn btn-secondary">Full Inventory</router-link>
      </div>

      <table v-if="store.medicines.length" class="table">
        <thead>
          <tr>
            <th>Generic Name</th>
            <th>Brand Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Reorder Level</th>
            <th>Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="med in store.medicines" :key="med.medicine_id" :class="{ 'row-low': med.current_stock <= med.reorder_level }">
            <td><strong>{{ med.generic_name }}</strong></td>
            <td>{{ med.brand_name || '—' }}</td>
            <td><span class="category-tag">{{ med.category }}</span></td>
            <td>
              <span :class="['stock-num', med.current_stock === 0 ? 'out' : med.current_stock <= med.reorder_level ? 'low' : 'ok']">
                {{ med.current_stock }}
              </span>
            </td>
            <td>{{ med.reorder_level }}</td>
            <td>{{ med.unit }}</td>
            <td>
              <button @click="goToMedicine(med.medicine_id)" class="btn btn-sm btn-view">View</button>
              <button @click="openAddBatch(med.medicine_id)" class="btn btn-sm btn-batch">+ Batch</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">No medicines found</div>
    </div>

    <!-- Transfers -->
    <div v-if="activeTab === 'Transfers'" class="content-section">
      <table v-if="store.transfers.length" class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Medicine</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in store.transfers" :key="t.transfer_id">
            <td>#{{ t.transfer_id }}</td>
            <td>{{ t.medicine?.generic_name }}</td>
            <td>{{ t.quantity }}</td>
            <td><span :class="['badge', t.status]">{{ t.status }}</span></td>
            <td>{{ t.reason || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">No transfer requests</div>
    </div>

    <!-- Modals -->
    <dispense-modal
      v-if="showDispenseModal"
      @close="showDispenseModal = false"
      @dispense="handleDispense"
    />

    <medicine-modal
      v-if="showAddMedicineModal"
      @close="showAddMedicineModal = false"
      @save="handleSaveMedicine"
    />

    <batch-modal
      v-if="showBatchModal"
      :medicine-id="batchMedicineId"
      @close="showBatchModal = false"
      @save="handleBatchAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePharmacyStore } from '@/stores/pharmacy'
import DispenseModal from './modals/DispenseModal.vue'
import MedicineModal from './modals/MedicineModal.vue'
import BatchModal from './modals/BatchModal.vue'

const router = useRouter()
const store = usePharmacyStore()

const activeTab = ref('Prescriptions')
const alertType = ref('low')
const tabs = ['Prescriptions', 'Stock Alerts', 'Inventory', 'Transfers']

const rxFilters = ref({ status: 'pending', doctor_id: '', date: '' })
const medicineSearch = ref('')
const selectedCategory = ref('')

const showDispenseModal = ref(false)
const showAddMedicineModal = ref(false)
const showBatchModal = ref(false)
const batchMedicineId = ref(0)

onMounted(async () => {
  await store.loadDashboard()
  await store.loadMedicines()
})

const onTabChange = async (tab: string) => {
  activeTab.value = tab
  if (tab === 'Stock Alerts') await store.loadLowStockAlerts()
  if (tab === 'Transfers') await store.loadTransferRequests()
}

const switchAlert = async (type: string) => {
  alertType.value = type
  if (type === 'low') await store.loadLowStockAlerts()
  else await store.loadExpiringAlerts()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedMedSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.loadMedicines(selectedCategory.value || undefined, medicineSearch.value || undefined)
  }, 300)
}

const goToMedicine = (id: number) => {
  router.push({ name: 'pharmacist-medicine-detail', params: { id } })
}

const openAddBatch = (medicineId: number) => {
  batchMedicineId.value = medicineId
  showBatchModal.value = true
}

const handleDispense = async () => {
  await store.loadDashboard()
  showDispenseModal.value = false
}

const handleSaveMedicine = async () => {
  showAddMedicineModal.value = false
  await store.loadMedicines()
}

const handleBatchAdded = async () => {
  showBatchModal.value = false
  await store.loadMedicines()
}

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.pharmacy-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
}

.quick-actions { display: flex; gap: 1rem; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid #007bff;
}

.stat-card.warning { border-left-color: #ffc107; }
.stat-card.danger  { border-left-color: #dc3545; }

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}

.stat-card p { color: #666; margin: 0; font-size: 0.9rem; }

/* Tabs */
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
}

.tab {
  padding: 0.65rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab.active { border-bottom-color: #007bff; color: #007bff; font-weight: 600; }
.tab:hover { color: #007bff; }

/* Content */
.content-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
}

.input {
  flex: 1;
  min-width: 140px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead { background: #f8f9fa; }

.table th {
  padding: 0.65rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #444;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.93rem;
}

.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: #f8faff; }
.row-low td { background: #fffbea; }

.category-tag {
  background: #e8f0fe;
  color: #1967d2;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
}

/* Stock colours */
.stock-num { font-weight: 700; }
.stock-num.ok { color: #28a745; }
.stock-num.low { color: #856404; }
.stock-num.out { color: #dc3545; }

/* Badges */
.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.pending { background: #fff3cd; color: #856404; }
.badge.partially_dispensed { background: #cce5ff; color: #004085; }
.badge.fully_dispensed { background: #d4edda; color: #155724; }
.badge.cancelled { background: #f8d7da; color: #721c24; }
.badge.critical { background: #f8d7da; color: #721c24; }
.badge.warning { background: #fff3cd; color: #856404; }
.badge.pending { background: #fff3cd; color: #856404; }
.badge.accepted { background: #d4edda; color: #155724; }
.badge.completed { background: #cce5ff; color: #004085; }
.badge.rejected { background: #f8d7da; color: #721c24; }

/* Alert tabs */
.alert-tabs { display: flex; gap: 0.75rem; margin-bottom: 1rem; }

.tab-small {
  padding: 0.4rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tab-small.active { background: #007bff; color: white; }

/* Buttons */
.btn {
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary { background: #007bff; color: white; }
.btn-primary:hover { background: #0056b3; }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #ccc; }
.btn-success { background: #28a745; color: white; }
.btn-success:hover { background: #218838; }

.btn-sm { padding: 0.22rem 0.6rem; font-size: 0.8rem; margin-right: 0.2rem; }
.btn-view { background: #e8f0fe; color: #1967d2; }
.btn-view:hover { background: #c6d8fb; }
.btn-batch { background: #fff3e0; color: #e65100; }
.btn-batch:hover { background: #ffe0b2; }

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
}
</style>
