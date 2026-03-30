<template>
  <div class="medicine-detail">
    <!-- Back button -->
    <div class="back-bar">
      <button class="btn btn-back" @click="router.push('/pharmacist/inventory')">
        &#8592; Back to Inventory
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="store.loading" class="loading-state">Loading medicine details…</div>
    <div v-else-if="store.error" class="error-state">{{ store.error }}</div>

    <template v-else-if="store.currentMedicine">
      <!-- Medicine Info Card -->
      <div class="info-card">
        <div class="info-card-header">
          <div>
            <h1>{{ store.currentMedicine.generic_name }}</h1>
            <p class="brand-name">{{ store.currentMedicine.brand_name }}</p>
          </div>
          <div class="header-actions">
            <span :class="['stock-badge', stockStatus]">{{ stockLabel }}</span>
            <button class="btn btn-primary" @click="showEditModal = true">Edit</button>
            <button class="btn btn-secondary" @click="showBatchModal = true">+ Add Batch</button>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Category</span>
            <span class="value">{{ store.currentMedicine.category }}</span>
          </div>
          <div class="info-item">
            <span class="label">Unit</span>
            <span class="value">{{ store.currentMedicine.unit }}</span>
          </div>
          <div class="info-item">
            <span class="label">HSN Code</span>
            <span class="value">{{ store.currentMedicine.hsn_code || '—' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Current Stock</span>
            <span :class="['value', 'stock-num', stockStatus]">
              {{ store.currentMedicine.current_stock }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Reorder Level</span>
            <span class="value">{{ store.currentMedicine.reorder_level }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status</span>
            <span :class="['badge', store.currentMedicine.status]">
              {{ store.currentMedicine.status }}
            </span>
          </div>
          <div class="info-item full-width" v-if="store.currentMedicine.storage_conditions">
            <span class="label">Storage Conditions</span>
            <span class="value">{{ store.currentMedicine.storage_conditions }}</span>
          </div>
        </div>
      </div>

      <!-- Batches Section -->
      <div class="section">
        <div class="section-header">
          <h2>Stock Batches</h2>
          <span class="batch-count">{{ store.currentBatches.length }} batch(es)</span>
        </div>

        <table v-if="store.currentBatches.length" class="table">
          <thead>
            <tr>
              <th>Batch No.</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
              <th>Expiry Date</th>
              <th>Qty Purchased</th>
              <th>Qty Remaining</th>
              <th>Price/Unit (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="batch in sortedBatches"
              :key="batch.batch_id"
              :class="batchRowClass(batch)"
            >
              <td><strong>{{ batch.batch_number }}</strong></td>
              <td>{{ batch.supplier || '—' }}</td>
              <td>{{ formatDate(batch.purchase_date) }}</td>
              <td>{{ formatDate(batch.expiry_date) }}</td>
              <td>{{ batch.quantity }}</td>
              <td>
                <span :class="['qty-remaining', remainingClass(batch)]">
                  {{ batch.quantity_remaining }}
                </span>
              </td>
              <td>{{ batch.purchase_price != null ? '₹' + batch.purchase_price : '—' }}</td>
              <td>
                <span :class="['badge', batchStatusClass(batch)]">
                  {{ batchStatusLabel(batch) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No batches found. Add the first batch to start tracking stock.</div>
      </div>
    </template>

    <!-- Edit Medicine Modal -->
    <medicine-modal
      v-if="showEditModal"
      :medicine="store.currentMedicine"
      @close="showEditModal = false"
      @save="handleMedicineSaved"
    />

    <!-- Add Batch Modal -->
    <batch-modal
      v-if="showBatchModal"
      :medicine-id="medicineId"
      @close="showBatchModal = false"
      @save="handleBatchAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePharmacyStore } from '@/stores/pharmacy'
import MedicineModal from './modals/MedicineModal.vue'
import BatchModal from './modals/BatchModal.vue'

const route = useRoute()
const router = useRouter()
const store = usePharmacyStore()

const medicineId = computed(() => Number(route.params.id))
const showEditModal = ref(false)
const showBatchModal = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchMedicine(medicineId.value),
    store.loadBatches(medicineId.value),
  ])
})

const stockStatus = computed(() => {
  const m = store.currentMedicine
  if (!m) return ''
  if (m.current_stock === 0) return 'out'
  if (m.current_stock <= m.reorder_level) return 'low'
  return 'ok'
})

const stockLabel = computed(() => {
  if (stockStatus.value === 'out') return 'Out of Stock'
  if (stockStatus.value === 'low') return 'Low Stock'
  return 'In Stock'
})

const sortedBatches = computed(() =>
  [...store.currentBatches].sort(
    (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  )
)

const isExpired = (batch: any) => new Date(batch.expiry_date) < new Date()
const isExpiringSoon = (batch: any) => {
  const days = (new Date(batch.expiry_date).getTime() - Date.now()) / 86400000
  return days >= 0 && days <= 90
}

const batchRowClass = (batch: any) => {
  if (isExpired(batch)) return 'row-expired'
  if (isExpiringSoon(batch)) return 'row-expiring'
  return ''
}

const remainingClass = (batch: any) => {
  if (batch.quantity_remaining === 0) return 'exhausted'
  if (batch.quantity_remaining < batch.quantity * 0.2) return 'critical'
  return ''
}

const batchStatusClass = (batch: any) => {
  if (isExpired(batch)) return 'expired'
  if (batch.quantity_remaining === 0) return 'exhausted'
  if (isExpiringSoon(batch)) return 'expiring'
  return 'active'
}

const batchStatusLabel = (batch: any) => {
  if (isExpired(batch)) return 'Expired'
  if (batch.quantity_remaining === 0) return 'Exhausted'
  if (isExpiringSoon(batch)) return 'Expiring Soon'
  return 'Active'
}

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const handleMedicineSaved = async () => {
  showEditModal.value = false
  await store.fetchMedicine(medicineId.value)
}

const handleBatchAdded = async () => {
  showBatchModal.value = false
  await Promise.all([
    store.fetchMedicine(medicineId.value),
    store.loadBatches(medicineId.value),
  ])
}
</script>

<style scoped>
.medicine-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.back-bar {
  margin-bottom: 1.5rem;
}

.btn-back {
  background: none;
  border: 1px solid #ddd;
  color: #333;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f0f0f0;
}

/* Info Card */
.info-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-card-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.brand-name {
  color: #666;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.value {
  font-size: 1rem;
  color: #222;
}

.stock-num {
  font-size: 1.2rem;
  font-weight: 700;
}

/* Stock status colours */
.stock-badge {
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stock-badge.ok, .stock-num.ok { color: #28a745; }
.stock-badge.ok { background: #d4edda; }
.stock-badge.low, .stock-num.low { color: #856404; }
.stock-badge.low { background: #fff3cd; }
.stock-badge.out, .stock-num.out { color: #dc3545; }
.stock-badge.out { background: #f8d7da; }

/* Section */
.section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 1.5rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.batch-count {
  font-size: 0.9rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f8f9fa;
}

.table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #444;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}

.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: #fafafa; }

.row-expired td { background: #fff0f0; }
.row-expiring td { background: #fffbea; }

/* Qty remaining colours */
.qty-remaining { font-weight: 600; }
.qty-remaining.exhausted { color: #dc3545; }
.qty-remaining.critical { color: #fd7e14; }

/* Badge */
.badge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.active { background: #d4edda; color: #155724; }
.badge.expiring { background: #fff3cd; color: #856404; }
.badge.expired { background: #f8d7da; color: #721c24; }
.badge.exhausted { background: #e2e3e5; color: #383d41; }
.badge.active-status { background: #d4edda; color: #155724; }

/* Buttons */
.btn {
  padding: 0.5rem 1.1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary { background: #007bff; color: white; }
.btn-primary:hover { background: #0056b3; }
.btn-secondary { background: #6c757d; color: white; }
.btn-secondary:hover { background: #545b62; }

.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.error-state { color: #dc3545; }
</style>
