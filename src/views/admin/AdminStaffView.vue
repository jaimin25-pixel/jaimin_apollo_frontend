<template>
  <div class="staff-view">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filters">
        <select v-model="filters.role" class="filter-select">
          <option value="">All Roles</option>
          <option v-for="role in roleOptions" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>

        <select v-model="filters.dept_id" class="filter-select" @change="applyFilters">
          <option value="">All Departments</option>
          <option v-for="dept in filteredDeptsByFilterRole" :key="dept.dept_id" :value="dept.dept_id">
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
        Add Staff
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading staff...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn-secondary" @click="applyFilters">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.staffList.length === 0" class="empty-state">
      <p>No staff members found.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Employment Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in store.staffList" :key="member.staff_id">
            <td class="cell-name">{{ member.full_name }}</td>
            <td class="cell-email">{{ member.email }}</td>
            <td>
              <span class="role-badge">{{ formatRole(member.role) }}</span>
            </td>
            <td>{{ member.department?.name || '-' }}</td>
            <td>{{ formatEmploymentType(member.employment_type) }}</td>
            <td>
              <span class="status-badge" :class="member.status">
                {{ member.status }}
              </span>
            </td>
            <td class="cell-actions">
              <button class="action-btn edit" title="Edit" @click="openEditModal(member)">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6.875 2.5H2.5a1.25 1.25 0 00-1.25 1.25v8.75A1.25 1.25 0 002.5 13.75h8.75a1.25 1.25 0 001.25-1.25V9.375" />
                  <path d="M11.25 1.25a1.326 1.326 0 011.875 1.875L7.5 8.75 5 9.375l.625-2.5 5.625-5.625z" />
                </svg>
              </button>
              <button
                class="action-btn"
                :class="member.status === 'active' ? 'deactivate' : 'activate'"
                :title="member.status === 'active' ? 'Deactivate' : 'Activate'"
                @click="toggleStatus(member)"
              >
                <svg v-if="member.status === 'active'" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="7.5" cy="7.5" r="6.25" />
                  <path d="M4.375 4.375l6.25 6.25M10.625 4.375l-6.25 6.25" />
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 5L6.25 9.375 5 7.813" />
                  <circle cx="7.5" cy="7.5" r="6.25" />
                </svg>
              </button>
              <button class="action-btn delete" title="Delete" @click="confirmDelete(member)">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3.5h11M5 3.5V2.25a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75V3.5M11.5 3.5l-.75 8.5a1 1 0 01-1 .9H5.25a1 1 0 01-1-.9L3.5 3.5" />
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
            <h3>Delete Staff</h3>
            <button class="modal-close" @click="showDeleteConfirm = false">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
              </svg>
            </button>
          </div>
          <div class="modal-body confirm-body">
            <p>Are you sure you want to delete <strong>{{ staffToDelete?.full_name }}</strong>? This cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn-danger" :disabled="submitting" @click="handleDelete">
              {{ submitting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Staff' : 'Add Staff' }}</h3>
            <button class="modal-close" @click="closeModal">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
              </svg>
            </button>
          </div>

          <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input
              id="full_name"
              v-model="form.full_name"
              type="text"
              placeholder="Enter full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter email address"
              required
            />
          </div>

          <div v-if="!isEditing" class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Enter password"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="role">Role</label>
              <select id="role" v-model="form.role" required>
                <option value="" disabled>Select role</option>
                <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="dept_id">Department</label>
              <select id="dept_id" v-model="form.dept_id" :disabled="!form.role">
                <option value="">{{ form.role ? 'Select department' : 'Select role first' }}</option>
                <option v-for="dept in filteredDepartments" :key="dept.dept_id" :value="dept.dept_id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="qualification">Qualification</label>
            <input
              id="qualification"
              v-model="form.qualification"
              type="text"
              placeholder="Enter qualification"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="employment_type">Employment Type</label>
              <select id="employment_type" v-model="form.employment_type" required>
                <option value="" disabled>Select type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div class="form-group">
              <label for="joining_date">Joining Date</label>
              <input
                id="joining_date"
                v-model="form.joining_date"
                type="date"
                required
              />
            </div>
          </div>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { encryptPassword } from '@/utils/crypto'

interface Staff {
  staff_id: number
  full_name: string
  email: string
  role: string
  dept_id?: number
  qualification?: string
  employment_type: string
  joining_date: string
  status: string
  department?: { dept_id: number; name: string }
}

const store = useAdminStore()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formError = ref('')
const showDeleteConfirm = ref(false)
const staffToDelete = ref<Staff | null>(null)

const filters = reactive({
  role: '',
  dept_id: '' as string | number,
  status: '',
})

const form = reactive({
  full_name: '',
  email: '',
  password: '',
  role: '',
  dept_id: '' as string | number,
  qualification: '',
  employment_type: '',
  joining_date: '',
})

const roleOptions = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'radiologist', label: 'Radiologist' },
  { value: 'billing_staff', label: 'Billing Staff' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'ward_boy', label: 'Ward Boy' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'security', label: 'Security' },
  { value: 'paramedic', label: 'Paramedic' },
]

// The 3 role-based umbrella departments — excluded from doctor's view
const ROLE_DEPTS = ['Clinical Department', 'Administration Department', 'Support Services Department']

// Maps each role to which department names it should see
const roleDeptNames: Record<string, string[]> = {
  nurse:          ['Clinical Department'],
  receptionist:   ['Administration Department'],
  lab_technician: ['Clinical Department'],
  radiologist:    ['Clinical Department'],
  billing_staff:  ['Administration Department'],
  hr_manager:     ['Administration Department'],
  ward_boy:       ['Support Services Department'],
  housekeeping:   ['Support Services Department'],
  security:       ['Support Services Department'],
  paramedic:      ['Clinical Department'],
}

function getDeptsByRole(role: string) {
  if (!role) return store.departments
  if (role === 'doctor') {
    return store.departments.filter(d => !ROLE_DEPTS.includes(d.name))
  }
  const allowed = roleDeptNames[role]
  if (!allowed) return store.departments
  return store.departments.filter(d => allowed.includes(d.name))
}

// For the Add/Edit form modal
const filteredDepartments = computed(() => {
  if (!form.role) return []
  return getDeptsByRole(form.role)
})

// For the toolbar filter bar
const filteredDeptsByFilterRole = computed(() => getDeptsByRole(filters.role))

watch(() => form.role, () => {
  form.dept_id = ''
})

watch(() => filters.role, () => {
  filters.dept_id = ''
  applyFilters()
})

onMounted(() => {
  store.fetchStaff()
  store.fetchDepartments()
})

function applyFilters() {
  const params: Record<string, string | number> = {}
  if (filters.role) params.role = filters.role
  if (filters.dept_id) params.dept_id = filters.dept_id
  if (filters.status) params.status = filters.status
  store.fetchStaff(params)
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatEmploymentType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function resetForm() {
  form.full_name = ''
  form.email = ''
  form.password = ''
  form.role = ''
  form.dept_id = ''
  form.qualification = ''
  form.employment_type = ''
  form.joining_date = ''
  formError.value = ''
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  resetForm()
  if (store.departments.length === 0) {
    store.fetchDepartments()
  }
  showModal.value = true
}

function openEditModal(member: Staff) {
  isEditing.value = true
  editingId.value = member.staff_id
  form.full_name = member.full_name
  form.email = member.email
  form.password = ''
  form.role = member.role
  form.dept_id = member.dept_id || ''
  form.qualification = member.qualification || ''
  form.employment_type = member.employment_type
  form.joining_date = member.joining_date
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

async function handleSubmit() {
  submitting.value = true
  formError.value = ''

  try {
    const payload: Record<string, unknown> = {
      full_name: form.full_name,
      email: form.email,
      role: form.role,
      dept_id: form.dept_id ? Number(form.dept_id) : undefined,
      qualification: form.qualification || undefined,
      employment_type: form.employment_type,
      joining_date: form.joining_date,
    }

    if (isEditing.value && editingId.value !== null) {
      await store.updateStaff(editingId.value, payload)
    } else {
      if (!form.password) {
        formError.value = 'Password is required.'
        submitting.value = false
        return
      }
      payload.password = await encryptPassword(form.password)
      await store.createStaff(payload)
    }

    closeModal()
    applyFilters()
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : 'An error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}

function confirmDelete(member: Staff) {
  staffToDelete.value = member
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!staffToDelete.value) return
  submitting.value = true
  try {
    await store.deleteStaff(staffToDelete.value.staff_id)
    showDeleteConfirm.value = false
    staffToDelete.value = null
    applyFilters()
  } finally {
    submitting.value = false
  }
}

async function toggleStatus(member: Staff) {
  const newStatus = member.status === 'active' ? 'inactive' : 'active'
  try {
    await store.updateStaffStatus(member.staff_id, newStatus)
    applyFilters()
  } catch {
    // error handled by store
  }
}
</script>

<style scoped>
.staff-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg);
  min-width: 150px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.filter-select:focus {
  border-color: var(--primary-light);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--primary-light);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: var(--bg-light);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: var(--text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 12px;
  color: var(--error);
  text-align: center;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Table */
.table-container {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: var(--bg-light);
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
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

.cell-email {
  color: var(--text-secondary);
}

/* Badges */
.role-badge {
  display: inline-block;
  padding: 3px 10px;
  background: #eef2ff;
  color: #4338ca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: #ecfdf5;
  color: var(--success);
}

.status-badge.inactive {
  background: #fef2f2;
  color: var(--error);
}

/* Actions */
.cell-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--bg-light);
}

.action-btn.edit:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.action-btn.deactivate:hover {
  color: var(--error);
  border-color: var(--error);
}

.action-btn.activate:hover {
  color: var(--success);
  border-color: var(--success);
}

.action-btn.delete:hover {
  color: var(--error, #ef4444);
  border-color: var(--error, #ef4444);
  background: #fef2f2;
}

.modal-sm {
  max-width: 420px;
}

.confirm-body {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--error, #ef4444);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--bg);
  border-radius: 12px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--bg-light);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg);
  outline: none;
  transition: border-color 0.15s;
}

.form-group input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary-light);
}

.form-error {
  padding: 10px 14px;
  background: #fef2f2;
  color: var(--error);
  border-radius: 8px;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    min-width: unset;
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
  }
}
</style>
