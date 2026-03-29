<template>
  <div class="pharmacists-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <select v-model="statusFilter" class="filter-select" @change="loadPharmacists">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="btn-primary" @click="openAddModal">+ Add Pharmacist</button>
    </div>

    <div v-if="store.error" class="error-banner">
      {{ store.error }}
      <button class="error-close" @click="store.clearError">&times;</button>
    </div>

    <div v-if="store.isLoading" class="loading-state">Loading pharmacists...</div>

    <div v-else-if="store.pharmacists.length === 0" class="empty-state">
      No pharmacists found.
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>License Number</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.pharmacists" :key="p.pharmacist_id">
            <td class="cell-name">{{ p.full_name }}</td>
            <td>{{ p.email }}</td>
            <td><code class="license-code">{{ p.license_number }}</code></td>
            <td>{{ p.phone || '-' }}</td>
            <td>
              <span class="status-badge" :class="p.status">{{ p.status }}</span>
            </td>
            <td>
              <button class="btn-action" @click="openEditModal(p)">Edit</button>
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
            <h3>{{ isEditing ? 'Edit Pharmacist' : 'Add Pharmacist' }}</h3>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="ph-name">Full Name</label>
            <input id="ph-name" v-model="form.full_name" type="text" required />
          </div>
          <div class="form-group">
            <label for="ph-email">Email</label>
            <input id="ph-email" v-model="form.email" type="email" required />
          </div>
          <div v-if="!isEditing" class="form-group">
            <label for="ph-password">Password</label>
            <input id="ph-password" v-model="form.password" type="password" required minlength="6" />
          </div>
          <div class="form-group">
            <label for="ph-license">License Number</label>
            <input id="ph-license" v-model="form.license_number" type="text" required />
          </div>
          <div class="form-group">
            <label for="ph-phone">Phone</label>
            <input id="ph-phone" v-model="form.phone" type="text" />
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
import { encryptPassword } from '@/utils/crypto'
import type { Pharmacist } from '@/types'

const store = useAdminStore()

const statusFilter = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formError = ref('')

const form = ref({
  full_name: '',
  email: '',
  password: '',
  license_number: '',
  phone: '',
})

function resetForm() {
  form.value = { full_name: '', email: '', password: '', license_number: '', phone: '' }
  formError.value = ''
  isEditing.value = false
  editingId.value = null
}

function openAddModal() {
  resetForm()
  showModal.value = true
}

function openEditModal(p: Pharmacist) {
  resetForm()
  isEditing.value = true
  editingId.value = p.pharmacist_id
  form.value.full_name = p.full_name
  form.value.email = p.email
  form.value.license_number = p.license_number
  form.value.phone = p.phone || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

async function loadPharmacists() {
  const params: Record<string, string> = {}
  if (statusFilter.value) params.status = statusFilter.value
  await store.fetchPharmacists(params)
}

async function handleSubmit() {
  formError.value = ''

  const payload: Record<string, unknown> = {
    full_name: form.value.full_name,
    email: form.value.email,
    license_number: form.value.license_number,
    phone: form.value.phone || undefined,
  }

  if (!isEditing.value) {
    try {
      payload.password = await encryptPassword(form.value.password)
    } catch {
      formError.value = 'Failed to encrypt password. Please try again.'
      return
    }
  }

  let result: unknown
  if (isEditing.value && editingId.value !== null) {
    result = await store.updatePharmacist(editingId.value, payload)
  } else {
    result = await store.createPharmacist(payload)
  }

  if (result !== null) {
    closeModal()
    await loadPharmacists()
  } else {
    formError.value = store.error || 'Operation failed.'
  }
}

onMounted(() => {
  loadPharmacists()
})
</script>

<style scoped>
.pharmacists-page {
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
}
</style>
