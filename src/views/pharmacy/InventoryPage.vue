<template>
  <div class="inventory-page">
    <div class="header">
      <h1>Medicine Inventory</h1>
      <button class="btn btn-primary" @click="showAddMedicineModal = true">
        + Add Medicine
      </button>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat-chip">
        <span class="stat-num">{{ store.medicines.length }}</span>
        <span class="stat-lbl">Total Medicines</span>
      </div>
      <div class="stat-chip warning">
        <span class="stat-num">{{ store.lowStockMedicines.length }}</span>
        <span class="stat-lbl">Low / Out of Stock</span>
      </div>
      <div class="stat-chip">
        <span class="stat-num">{{ store.categories.length }}</span>
        <span class="stat-lbl">Categories</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search by name…"
        class="input"
        @input="debouncedLoad"
      />
      <select v-model="filters.category" class="input select" @change="loadMedicines">
        <option value="">All Categories</option>
        <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <button class="btn btn-secondary" @click="resetFilters">Reset</button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">Loading…</div>

    <!-- Table -->
    <table v-else-if="store.medicines.length" class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Generic Name</th>
          <th>Brand Name</th>
          <th>Category</th>
          <th>Unit</th>
          <th>Current Stock</th>
          <th>Reorder Level</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="med in store.medicines"
          :key="med.medicine_id"
          :class="{ 'row-low': isLowStock(med), 'row-out': isOutOfStock(med) }"
        >
          <td class="id-cell">{{ med.medicine_id }}</td>
          <td><strong>{{ med.generic_name }}</strong></td>
          <td class="brand-cell">{{ med.brand_name || '—' }}</td>
          <td><span class="category-tag">{{ med.category }}</span></td>
          <td>{{ med.unit }}</td>
          <td>
            <span :class="['stock-num', stockClass(med)]">{{ med.current_stock }}</span>
          </td>
          <td>{{ med.reorder_level }}</td>
          <td>
            <span v-if="isOutOfStock(med)" class="badge out">Out of Stock</span>
            <span v-else-if="isLowStock(med)" class="badge low">Low Stock</span>
            <span v-else class="badge ok">In Stock</span>
          </td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-view" @click="viewMedicine(med)">View</button>
            <button class="btn btn-sm btn-edit" @click="editMedicine(med)">Edit</button>
            <button class="btn btn-sm btn-batch" @click="addBatch(med.medicine_id)">+ Batch</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty-state">No medicines found</div>

    <!-- Add Medicine Modal -->
    <medicine-modal
      v-if="showAddMedicineModal"
      @close="showAddMedicineModal = false"
      @save="handleSaveMedicine"
    />

    <!-- Edit Medicine Modal -->
    <medicine-modal
      v-if="showEditMedicineModal"
      :medicine="selectedMedicine"
      @close="showEditMedicineModal = false"
      @save="handleSaveMedicine"
    />

    <!-- Add Batch Modal -->
    <batch-modal
      v-if="showBatchModal"
      :medicine-id="selectedMedicineId"
      @close="showBatchModal = false"
      @save="handleAddBatch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePharmacyStore } from '@/stores/pharmacy'
import MedicineModal from './modals/MedicineModal.vue'
import BatchModal from './modals/BatchModal.vue'

const router = useRouter()
const store = usePharmacyStore()

const filters = ref({ search: '', category: '' })

const showAddMedicineModal = ref(false)
const showEditMedicineModal = ref(false)
const showBatchModal = ref(false)
const selectedMedicine = ref<any>(null)
const selectedMedicineId = ref(0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedLoad = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadMedicines, 300)
}

onMounted(() => loadMedicines())

const loadMedicines = () => {
  store.loadMedicines(
    filters.value.category || undefined,
    filters.value.search || undefined,
  )
}

const resetFilters = () => {
  filters.value = { search: '', category: '' }
  loadMedicines()
}

const isOutOfStock = (m: any) => m.current_stock === 0
const isLowStock = (m: any) => m.current_stock > 0 && m.current_stock <= m.reorder_level

const stockClass = (m: any) => {
  if (isOutOfStock(m)) return 'out'
  if (isLowStock(m)) return 'low'
  return 'ok'
}

const viewMedicine = (med: any) => {
  router.push({ name: 'pharmacist-medicine-detail', params: { id: med.medicine_id } })
}

const editMedicine = (med: any) => {
  selectedMedicine.value = med
  showEditMedicineModal.value = true
}

const addBatch = (medicineId: number) => {
  selectedMedicineId.value = medicineId
  showBatchModal.value = true
}

const handleSaveMedicine = () => {
  showAddMedicineModal.value = false
  showEditMedicineModal.value = false
  loadMedicines()
}

const handleAddBatch = () => {
  showBatchModal.value = false
  loadMedicines()
}
</script>

<style scoped>
.inventory-page {
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

/* Stats row */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-chip {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-left: 4px solid #007bff;
}

.stat-chip.warning { border-left-color: #ffc107; }

.stat-num {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
}

.stat-lbl {
  font-size: 0.85rem;
  color: #666;
}

/* Filters */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  min-width: 160px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
}

.select { cursor: pointer; }

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.table thead { background: #f0f4ff; }

.table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #444;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  color: #333;
}

.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: #f8faff; }

.row-low td { background: #fffbea; }
.row-out td { background: #fff0f0; }

.id-cell { color: #aaa; font-size: 0.85rem; }
.brand-cell { color: #555; }

.category-tag {
  background: #e8f0fe;
  color: #1967d2;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
}

/* Stock colours */
.stock-num { font-weight: 700; font-size: 1rem; }
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

.badge.ok { background: #d4edda; color: #155724; }
.badge.low { background: #fff3cd; color: #856404; }
.badge.out { background: #f8d7da; color: #721c24; }

/* Action buttons */
.actions-cell { white-space: nowrap; }

.btn {
  padding: 0.45rem 0.9rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary { background: #007bff; color: white; }
.btn-primary:hover { background: #0056b3; }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #ccc; }

.btn-sm { padding: 0.25rem 0.65rem; font-size: 0.82rem; margin-right: 0.25rem; }
.btn-view { background: #e8f0fe; color: #1967d2; }
.btn-view:hover { background: #c6d8fb; }
.btn-edit { background: #e8f5e9; color: #2e7d32; }
.btn-edit:hover { background: #c8e6c9; }
.btn-batch { background: #fff3e0; color: #e65100; }
.btn-batch:hover { background: #ffe0b2; }

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>
