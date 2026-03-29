<template>
  <div class="doctors-page">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filters">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search name, email, code…"
          class="filter-input"
          @input="applyFilters"
        />
        <select v-model="filters.dept_id" class="filter-select" @change="applyFilters">
          <option value="">All Departments</option>
          <option v-for="dept in store.departments" :key="dept.dept_id" :value="dept.dept_id">
            {{ dept.name }}
          </option>
        </select>
        <select v-model="filters.status" class="filter-select" @change="applyFilters">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add Doctor
      </button>
    </div>

    <!-- Error Banner -->
    <div v-if="store.error" class="error-banner">
      {{ store.error }}
      <button class="error-close" @click="store.clearError">&times;</button>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading doctors…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="store.doctors.length === 0" class="empty-state">
      <p>No doctors found.</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Specialization</th>
            <th>Qualification</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in store.doctors" :key="doc.doctor_id">
            <td><code class="doc-code">{{ doc.doc_code }}</code></td>
            <td class="cell-name">{{ doc.full_name }}</td>
            <td class="cell-email">{{ doc.email }}</td>
            <td>{{ doc.department?.name || '-' }}</td>
            <td>{{ doc.specialization }}</td>
            <td class="cell-qual">{{ doc.qualification }}</td>
            <td>
              <span class="status-badge" :class="doc.status">{{ doc.status }}</span>
            </td>
            <td class="cell-actions">
              <button class="action-btn edit" title="Edit" @click="openEditModal(doc)">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6.875 2.5H2.5a1.25 1.25 0 00-1.25 1.25v8.75A1.25 1.25 0 002.5 13.75h8.75a1.25 1.25 0 001.25-1.25V9.375" />
                  <path d="M11.25 1.25a1.326 1.326 0 011.875 1.875L7.5 8.75 5 9.375l.625-2.5 5.625-5.625z" />
                </svg>
              </button>
              <button
                class="action-btn"
                :class="doc.status === 'active' ? 'deactivate' : 'activate'"
                :title="doc.status === 'active' ? 'Deactivate' : 'Activate'"
                @click="toggleStatus(doc)"
              >
                <svg v-if="doc.status === 'active'" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="7.5" cy="7.5" r="6.25" />
                  <path d="M4.375 4.375l6.25 6.25M10.625 4.375l-6.25 6.25" />
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 5L6.25 9.375 5 7.813" />
                  <circle cx="7.5" cy="7.5" r="6.25" />
                </svg>
              </button>
              <button class="action-btn delete" title="Delete" @click="openDeleteModal(doc)">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1.875 3.75h11.25M6.25 3.75V2.5h2.5v1.25M12.5 3.75l-.625 8.75a1.25 1.25 0 01-1.25 1.25H4.375a1.25 1.25 0 01-1.25-1.25L2.5 3.75" />
                </svg>
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
            <h3>{{ isEditing ? 'Edit Doctor' : 'Add Doctor' }}</h3>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <form class="modal-body" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input v-model="form.full_name" type="text" required placeholder="Dr. First Last" />
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input v-model="form.email" type="email" required placeholder="dr.name@apollo.health" />
              </div>
            </div>
            <div v-if="!isEditing" class="form-group">
              <label>Password *</label>
              <input v-model="form.password" type="password" required minlength="6" placeholder="Min. 6 characters" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Department *</label>
                <select v-model="form.dept_id" required>
                  <option value="">Select Department</option>
                  <option v-for="dept in clinicalDepts" :key="dept.dept_id" :value="dept.dept_id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="form.phone" type="text" placeholder="+91-XXXXXXXXXX" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Specialization *</label>
                <input v-model="form.specialization" type="text" required placeholder="e.g. Cardiology" />
              </div>
              <div class="form-group">
                <label>Joining Date *</label>
                <input v-model="form.joining_date" type="date" required />
              </div>
            </div>
            <div class="form-group">
              <label>Qualification *</label>
              <input v-model="form.qualification" type="text" required placeholder="e.g. MBBS, MD, DM" />
            </div>
            <div v-if="isEditing" class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div v-if="formError" class="form-error">{{ formError }}</div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="store.isLoading">
                {{ store.isLoading ? 'Saving…' : (isEditing ? 'Update' : 'Add Doctor') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>Delete Doctor</h3>
            <button class="modal-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ selectedDoc?.full_name }}</strong>?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button class="btn-danger" :disabled="store.isLoading" @click="confirmDelete">
              {{ store.isLoading ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Doctor } from '@/types'

const store = useAdminStore()

const filters = ref({ search: '', dept_id: '' as number | '', status: '' })
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const selectedDoc = ref<Doctor | null>(null)
const formError = ref('')

const form = ref({
  full_name: '',
  email: '',
  password: '',
  dept_id: '' as number | '',
  specialization: '',
  qualification: '',
  phone: '',
  joining_date: '',
  status: 'active',
})

const nonClinicalNames = new Set([
  'Clinical Department',
  'Administration Department',
  'Support Services Department',
])

const clinicalDepts = computed(() =>
  store.departments.filter(d => !nonClinicalNames.has(d.name))
)

function resetForm() {
  form.value = {
    full_name: '',
    email: '',
    password: '',
    dept_id: '',
    specialization: '',
    qualification: '',
    phone: '',
    joining_date: new Date().toISOString().slice(0, 10),
    status: 'active',
  }
  formError.value = ''
}

function openAddModal() {
  isEditing.value = false
  selectedDoc.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(doc: Doctor) {
  isEditing.value = true
  selectedDoc.value = doc
  form.value = {
    full_name: doc.full_name,
    email: doc.email,
    password: '',
    dept_id: doc.dept_id,
    specialization: doc.specialization,
    qualification: doc.qualification,
    phone: doc.phone || '',
    joining_date: doc.joining_date.slice(0, 10),
    status: doc.status,
  }
  formError.value = ''
  showModal.value = true
}

function openDeleteModal(doc: Doctor) {
  selectedDoc.value = doc
  showDeleteModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  formError.value = ''
  const payload: Record<string, unknown> = {
    full_name: form.value.full_name,
    email: form.value.email,
    dept_id: Number(form.value.dept_id),
    specialization: form.value.specialization,
    qualification: form.value.qualification,
    phone: form.value.phone,
    joining_date: form.value.joining_date,
  }
  if (!isEditing.value) {
    payload.password = form.value.password
  } else {
    payload.status = form.value.status
  }

  let result
  if (isEditing.value && selectedDoc.value) {
    result = await store.updateDoctor(selectedDoc.value.doctor_id, payload)
  } else {
    result = await store.createDoctor(payload)
  }

  if (result) {
    closeModal()
    await applyFilters()
  } else {
    formError.value = store.error || 'Operation failed'
  }
}

async function toggleStatus(doc: Doctor) {
  const newStatus = doc.status === 'active' ? 'inactive' : 'active'
  await store.updateDoctorStatus(doc.doctor_id, newStatus)
  await applyFilters()
}

async function confirmDelete() {
  if (!selectedDoc.value) return
  await store.deleteDoctor(selectedDoc.value.doctor_id)
  showDeleteModal.value = false
  await applyFilters()
}

async function applyFilters() {
  await store.fetchDoctors({
    dept_id: filters.value.dept_id ? Number(filters.value.dept_id) : undefined,
    status: filters.value.status || undefined,
    search: filters.value.search || undefined,
  })
}

onMounted(async () => {
  await store.fetchDepartments()
  await applyFilters()
})
</script>

<style scoped>
.doctors-page { display: flex; flex-direction: column; gap: 20px; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filters { display: flex; gap: 10px; flex-wrap: wrap; flex: 1; }

.filter-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
  background: #fff;
}
.filter-input:focus { outline: none; border-color: var(--primary); }

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  min-width: 160px;
}
.filter-select:focus { outline: none; border-color: var(--primary); }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}
.error-close { background: none; border: none; cursor: pointer; font-size: 18px; color: #dc2626; }

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px;
  justify-content: center;
  color: var(--text-secondary);
}
.spinner {
  width: 24px; height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.table-wrapper {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: auto;
}

.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--bg-light);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--bg-light); }

.doc-code {
  font-family: monospace;
  font-size: 12px;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--primary);
}

.cell-name { font-weight: 500; }
.cell-email { color: var(--text-secondary); font-size: 13px; }
.cell-qual { font-size: 12px; color: var(--text-secondary); max-width: 180px; }

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}
.status-badge.active { background: #dcfce7; color: #16a34a; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }

.cell-actions { display: flex; gap: 6px; align-items: center; }

.action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-secondary);
}
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.action-btn.deactivate:hover { border-color: #f59e0b; color: #f59e0b; }
.action-btn.activate:hover { border-color: #16a34a; color: #16a34a; }
.action-btn.delete:hover { border-color: #dc2626; color: #dc2626; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 24px;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
  max-height: 90vh; overflow-y: auto;
}
.modal-sm { max-width: 400px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0;
}
.modal-header h3 { font-size: 18px; font-weight: 600; color: var(--text-primary); }
.modal-close {
  background: none; border: none; cursor: pointer;
  font-size: 22px; color: var(--text-secondary); line-height: 1;
}
.modal-close:hover { color: var(--text-primary); }

.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 540px) { .form-row { grid-template-columns: 1fr; } }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.form-group input,
.form-group select {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: #fff;
}
.form-group input:focus,
.form-group select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1); }

.form-error {
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 12px 24px 20px;
}

.btn-secondary {
  padding: 9px 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-primary);
}
.btn-secondary:hover { background: var(--bg-light); }

.btn-danger {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-danger:hover { opacity: 0.9; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.text-muted { color: var(--text-secondary); font-size: 13px; margin: 4px 0 0; }
</style>
