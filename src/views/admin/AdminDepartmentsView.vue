<template>
  <div class="departments-page">
    <!-- Error Banner -->
    <div v-if="store.error" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="error-dismiss" @click="store.clearError()">Dismiss</button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h3 class="section-title">Departments</h3>
        <span class="record-count">{{ store.departments.length }} total</span>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3.5v9M3.5 8h9" />
        </svg>
        Add Department
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading departments...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.departments.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 18L24 6l20 12v12L24 42 4 30z" />
      </svg>
      <p>No departments found</p>
      <button class="btn btn-primary" @click="openAddModal">Add First Department</button>
    </div>

    <!-- Data Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>HOD Doctor</th>
            <th>Bed Count</th>
            <th>OT Count</th>
            <th>Has ICU</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dept in store.departments" :key="dept.dept_id">
            <td class="cell-name">{{ dept.name }}</td>
            <td>{{ dept.hod_doctor?.full_name || '-' }}</td>
            <td class="cell-number">{{ dept.bed_count }}</td>
            <td class="cell-number">{{ dept.ot_count }}</td>
            <td>
              <span class="icu-badge" :class="dept.has_icu ? 'icu-yes' : 'icu-no'">
                {{ dept.has_icu ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="dept.status === 'active' ? 'status-active' : 'status-inactive'">
                {{ dept.status }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-icon" title="Edit" @click="openEditModal(dept)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11.33 2a2 2 0 012.83 2.83L5.83 13.17 2 14l.83-3.83L11.33 2z" />
                </svg>
              </button>
              <button
                class="btn-icon"
                :class="dept.status === 'active' ? 'btn-icon-deactivate' : 'btn-icon-activate'"
                :title="dept.status === 'active' ? 'Deactivate' : 'Activate'"
                @click="toggleStatus(dept)"
              >
                <svg v-if="dept.status === 'active'" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M5 5l6 6M11 5l-6 6" />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M5.5 8l2 2 3.5-3.5" />
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Delete" @click="confirmDelete(dept)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 4h12M5 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4M12.5 4l-.9 9a1 1 0 01-1 .9H5.4a1 1 0 01-1-.9L3.5 4" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>Delete Department</h3>
            <button class="modal-close" @click="showDeleteConfirm = false">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
              </svg>
            </button>
          </div>
          <div class="modal-body confirm-body">
            <p>Are you sure you want to delete <strong>{{ deptToDelete?.name }}</strong>? This cannot be undone.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn btn-danger" :disabled="submitting" @click="handleDelete">
              {{ submitting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Overlay -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Department' : 'Add Department' }}</h3>
            <button class="modal-close" @click="closeModal">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
              </svg>
            </button>
          </div>

          <form class="modal-body" @submit.prevent="handleSubmit">
            <!-- Name -->
            <div class="form-group">
              <label for="dept-name">Department Name</label>
              <input
                id="dept-name"
                v-model="form.name"
                type="text"
                placeholder="e.g. Cardiology"
                required
              />
            </div>

            <!-- HOD Doctor -->
            <div class="form-group">
              <label for="dept-hod">HOD Doctor</label>
              <select id="dept-hod" v-model="form.hod_doctor_id">
                <option :value="undefined">-- None --</option>
                <option
                  v-for="doc in activeDoctors"
                  :key="doc.doctor_id"
                  :value="doc.doctor_id"
                >
                  {{ doc.full_name }} ({{ doc.specialization }})
                </option>
              </select>
            </div>

            <!-- Bed Count -->
            <div class="form-row">
              <div class="form-group">
                <label for="dept-beds">Bed Count</label>
                <input
                  id="dept-beds"
                  v-model.number="form.bed_count"
                  type="number"
                  min="0"
                  required
                />
              </div>

              <!-- OT Count -->
              <div class="form-group">
                <label for="dept-ot">OT Count</label>
                <input
                  id="dept-ot"
                  v-model.number="form.ot_count"
                  type="number"
                  min="0"
                  required
                />
              </div>
            </div>

            <!-- Has ICU -->
            <div class="form-group form-checkbox">
              <label>
                <input
                  v-model="form.has_icu"
                  type="checkbox"
                />
                <span>Has ICU</span>
              </label>
            </div>

            <!-- Status (edit only) -->
            <div v-if="isEditing" class="form-group">
              <label for="dept-status">Status</label>
              <select id="dept-status" v-model="form.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="btn-spinner"></span>
                {{ isEditing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Department } from '@/types'

const store = useAdminStore()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const showDeleteConfirm = ref(false)
const deptToDelete = ref<Department | null>(null)

const form = ref({
  name: '',
  hod_doctor_id: undefined as number | undefined,
  bed_count: 0,
  ot_count: 0,
  has_icu: false,
  status: 'active',
})

const activeDoctors = computed(() =>
  store.doctors.filter(d => d.status === 'active')
)

onMounted(() => {
  store.fetchDepartments()
  store.fetchDoctors()
})

function resetForm() {
  form.value = {
    name: '',
    hod_doctor_id: undefined,
    bed_count: 0,
    ot_count: 0,
    has_icu: false,
    status: 'active',
  }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(dept: Department) {
  isEditing.value = true
  editingId.value = dept.dept_id
  form.value = {
    name: dept.name,
    hod_doctor_id: dept.hod_doctor_id,
    bed_count: dept.bed_count,
    ot_count: dept.ot_count,
    has_icu: dept.has_icu,
    status: dept.status,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function toggleStatus(dept: Department) {
  const newStatus = dept.status === 'active' ? 'inactive' : 'active'
  await store.updateDepartmentStatus(dept.dept_id, newStatus)
  await store.fetchDepartments()
}

function confirmDelete(dept: Department) {
  deptToDelete.value = dept
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deptToDelete.value) return
  submitting.value = true
  try {
    await store.deleteDepartment(deptToDelete.value.dept_id)
    showDeleteConfirm.value = false
    deptToDelete.value = null
    await store.fetchDepartments()
  } finally {
    submitting.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload: Record<string, unknown> = {
      name: form.value.name,
      hod_doctor_id: form.value.hod_doctor_id || null,
      bed_count: form.value.bed_count,
      ot_count: form.value.ot_count,
      has_icu: form.value.has_icu,
    }

    if (isEditing.value && editingId.value !== null) {
      payload.status = form.value.status
      await store.updateDepartment(editingId.value, payload)
    } else {
      await store.createDepartment(payload)
    }

    if (!store.error) {
      closeModal()
      await store.fetchDepartments()
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.departments-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Error Banner ─────────────────────────────────────────────── */

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--error, #ef4444);
  font-size: 14px;
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--error, #ef4444);
  font-weight: 500;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
}
.error-dismiss:hover {
  background: #fee2e2;
}

/* ── Toolbar ──────────────────────────────────────────────────── */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
  margin: 0;
}

.record-count {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

/* ── Buttons ──────────────────────────────────────────────────── */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--primary, #1a3a4a);
  color: #fff;
}
.btn-primary:hover {
  background: var(--primary-light, #2a5a6a);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg, #ffffff);
  color: var(--text-primary, #1a1a2e);
  border: 1px solid var(--border, #e5e7eb);
}
.btn-secondary:hover {
  background: var(--bg-light, #f9fafb);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border, #e5e7eb);
  background: var(--bg, #ffffff);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-icon:hover {
  border-color: var(--primary, #1a3a4a);
  color: var(--primary, #1a3a4a);
  background: #f0f7fa;
}

.btn-icon-deactivate:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: #fffbeb;
}

.btn-icon-activate:hover {
  border-color: var(--success, #10b981);
  color: var(--success, #10b981);
  background: #ecfdf5;
}

.btn-icon-danger:hover {
  border-color: var(--error, #ef4444);
  color: var(--error, #ef4444);
  background: #fef2f2;
}

.actions-cell {
  display: flex;
  gap: 6px;
}

.btn-danger {
  background: var(--error, #ef4444);
  color: #fff;
  border: none;
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-sm {
  max-width: 420px;
}

.confirm-body {
  font-size: 14px;
  color: var(--text-primary, #1a1a2e);
  line-height: 1.6;
}

/* ── Loading & Empty ──────────────────────────────────────────── */

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 16px;
  color: var(--text-secondary, #6b7280);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border, #e5e7eb);
  border-top-color: var(--primary, #1a3a4a);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state p {
  font-size: 15px;
  margin: 0;
}

/* ── Table ────────────────────────────────────────────────────── */

.table-container {
  background: var(--bg, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead {
  background: var(--bg-light, #f9fafb);
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border, #e5e7eb);
  white-space: nowrap;
}

.data-table td {
  padding: 14px 16px;
  color: var(--text-primary, #1a1a2e);
  border-bottom: 1px solid var(--border, #e5e7eb);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.cell-name {
  font-weight: 500;
}

.cell-number {
  font-variant-numeric: tabular-nums;
}

/* ── Badges ───────────────────────────────────────────────────── */

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  background: #ecfdf5;
  color: var(--success, #10b981);
}

.status-inactive {
  background: #fef2f2;
  color: var(--error, #ef4444);
}

.icu-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.icu-yes {
  background: #ecfdf5;
  color: var(--success, #10b981);
}

.icu-no {
  background: var(--bg-light, #f9fafb);
  color: var(--text-secondary, #6b7280);
}

/* ── Modal ────────────────────────────────────────────────────── */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal {
  background: var(--bg, #ffffff);
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #e5e7eb);
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: none;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
}
.modal-close:hover {
  background: var(--bg-light, #f9fafb);
  color: var(--text-primary, #1a1a2e);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Form Controls ────────────────────────────────────────────── */

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #1a1a2e);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  padding: 9px 12px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary, #1a1a2e);
  background: var(--bg, #ffffff);
  outline: none;
  transition: border-color 0.15s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary, #1a3a4a);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.1);
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-checkbox label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary, #1a1a2e);
  cursor: pointer;
}

.form-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary, #1a3a4a);
  cursor: pointer;
}

/* ── Modal Actions ────────────────────────────────────────────── */

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ── Responsive ───────────────────────────────────────────────── */

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row {
    flex-direction: column;
    gap: 18px;
  }

  .modal {
    max-width: 100%;
    margin: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
  }
}
</style>
