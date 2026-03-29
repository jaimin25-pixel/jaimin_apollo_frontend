<template>
  <div class="partner-pharmacies-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <select v-model="statusFilter" class="filter-select" @change="loadPartnerPharmacies">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="btn-primary" @click="openAddModal">+ Add Partner Pharmacy</button>
    </div>

    <div v-if="store.error" class="error-banner">
      {{ store.error }}
      <button class="error-close" @click="store.clearError">&times;</button>
    </div>

    <div v-if="store.isLoading" class="loading-state">Loading partner pharmacies...</div>

    <div v-else-if="store.partnerPharmacies.length === 0" class="empty-state">
      No partner pharmacies found.
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>License Number</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pp in store.partnerPharmacies" :key="pp.partner_id">
            <td class="cell-name">{{ pp.name }}</td>
            <td><code class="license-code">{{ pp.license_number }}</code></td>
            <td class="cell-address">{{ pp.address }}</td>
            <td>{{ pp.contact_phone || '-' }}</td>
            <td>{{ pp.contact_email || '-' }}</td>
            <td>
              <span class="status-badge" :class="pp.status">{{ pp.status }}</span>
            </td>
            <td class="cell-actions">
              <button class="btn-action" @click="openEditModal(pp)">Edit</button>
              <button
                class="btn-action"
                :class="pp.status === 'active' ? 'btn-deactivate' : 'btn-activate'"
                @click="toggleStatus(pp)"
              >
                {{ pp.status === 'active' ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Partner' : 'Add Partner' }}</h3>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="pp-name">Name</label>
            <input id="pp-name" v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label for="pp-license">License Number</label>
            <input id="pp-license" v-model="form.license_number" type="text" required />
          </div>
          <div class="form-group">
            <label for="pp-address">Address</label>
            <input id="pp-address" v-model="form.address" type="text" required />
          </div>
          <div class="form-group">
            <label for="pp-phone">Contact Phone</label>
            <input id="pp-phone" v-model="form.contact_phone" type="text" />
          </div>
          <div class="form-group">
            <label for="pp-email">Contact Email</label>
            <input id="pp-email" v-model="form.contact_email" type="email" />
          </div>
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.isLoading">
              {{ store.isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { PartnerPharmacy } from '@/types'

const store = useAdminStore()

const statusFilter = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formError = ref('')

const form = ref({
  name: '',
  license_number: '',
  address: '',
  contact_phone: '',
  contact_email: '',
})

function resetForm() {
  form.value = { name: '', license_number: '', address: '', contact_phone: '', contact_email: '' }
  formError.value = ''
  isEditing.value = false
  editingId.value = null
}

function openAddModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(pp: PartnerPharmacy) {
  resetForm()
  isEditing.value = true
  editingId.value = pp.partner_id
  form.value.name = pp.name
  form.value.license_number = pp.license_number
  form.value.address = pp.address
  form.value.contact_phone = pp.contact_phone || ''
  form.value.contact_email = pp.contact_email || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

async function loadPartnerPharmacies() {
  const params: Record<string, string> = {}
  if (statusFilter.value) params.status = statusFilter.value
  await store.fetchPartnerPharmacies(params)
}

async function toggleStatus(pp: PartnerPharmacy) {
  const newStatus = pp.status === 'active' ? 'inactive' : 'active'
  const result = await store.updatePartnerPharmacyStatus(pp.partner_id, newStatus)
  if (result !== null) {
    await loadPartnerPharmacies()
  }
}

async function handleSubmit() {
  formError.value = ''

  const payload: Record<string, unknown> = {
    name: form.value.name,
    license_number: form.value.license_number,
    address: form.value.address,
    contact_phone: form.value.contact_phone || undefined,
    contact_email: form.value.contact_email || undefined,
  }

  let result: unknown
  if (isEditing.value && editingId.value !== null) {
    result = await store.updatePartnerPharmacy(editingId.value, payload)
  } else {
    result = await store.createPartnerPharmacy(payload)
  }

  if (result !== null) {
    closeModal()
    await loadPartnerPharmacies()
  } else {
    formError.value = store.error || 'Operation failed.'
  }
}

onMounted(() => {
  loadPartnerPharmacies()
})
</script>

<style scoped>
.partner-pharmacies-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Toolbar ─────────────────────────────────────────── */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--primary);
}

/* ── Buttons ─────────────────────────────────────────── */

.btn-primary {
  padding: 8px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: var(--primary-light);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 20px;
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: var(--bg-light);
}

.btn-action {
  padding: 5px 14px;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action:hover {
  background: var(--primary);
  color: #fff;
}

.btn-deactivate {
  color: var(--error);
  border-color: var(--error);
}

.btn-deactivate:hover {
  background: var(--error);
  color: #fff;
}

.btn-activate {
  color: var(--success);
  border-color: var(--success);
}

.btn-activate:hover {
  background: var(--success);
  color: #fff;
}

/* ── Error Banner ────────────────────────────────────── */

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--error);
  font-size: 14px;
}

.error-close {
  background: none;
  border: none;
  color: var(--error);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

/* ── Loading & Empty ─────────────────────────────────── */

.loading-state,
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
  font-size: 15px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
}

/* ── Table ───────────────────────────────────────────── */

.table-wrapper {
  overflow-x: auto;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
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

.cell-name {
  font-weight: 500;
}

.cell-address {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.license-code {
  background: var(--bg-light);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-primary);
}

/* ── Status Badge ────────────────────────────────────── */

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* ── Modal ───────────────────────────────────────────── */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: var(--bg);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 4px;
}

.modal-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus {
  border-color: var(--primary);
}

.form-error {
  color: var(--error);
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

/* ── Responsive ──────────────────────────────────────── */

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .btn-primary {
    width: 100%;
    text-align: center;
  }

  .modal {
    margin: 16px;
    max-width: none;
  }

  .cell-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
