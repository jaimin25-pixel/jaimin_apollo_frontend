<template>
  <div class="patients-view">
    <div class="page-header">
      <h1>Patient Management</h1>
      <button class="btn-primary" @click="openRegisterModal()">+ Register New Patient</button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, phone, or PAT code..."
        class="search-input"
        @keyup.enter="doSearch"
      />
      <select v-model="bloodGroupFilter" class="filter-select">
        <option value="">Any Blood Group</option>
        <option v-for="bg in bloodGroups" :key="bg" :value="bg">{{ bg }}</option>
      </select>
      <button class="btn-primary" @click="doSearch" :disabled="store.loading">Search</button>
      <button class="btn-ghost" @click="clearSearch">Clear</button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="alert-danger">{{ store.error }}</div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Searching patients...</p>
    </div>

    <!-- Results -->
    <div v-else class="table-container">
      <div v-if="store.patients.length === 0 && hasSearched" class="no-data">
        No patients found. Try a different search term.
      </div>
      <div v-else-if="store.patients.length === 0" class="no-data hint">
        Search above to find patients, or register a new one.
      </div>
      <table v-else class="patients-table">
        <thead>
          <tr>
            <th>PAT Code</th>
            <th>Full Name</th>
            <th>Gender</th>
            <th>Blood Group</th>
            <th>Contact</th>
            <th>Insurance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.patients" :key="p.patient_id">
            <td><span class="pat-code-badge">{{ p.pat_code }}</span></td>
            <td>
              <div class="name-cell">
                <span class="full-name">{{ p.full_name }}</span>
                <span class="dob">{{ formatDOB(p.date_of_birth) }}</span>
              </div>
            </td>
            <td>{{ p.gender }}</td>
            <td>{{ p.blood_group || '—' }}</td>
            <td>{{ p.contact_number }}</td>
            <td>{{ p.insurance_provider || '—' }}</td>
            <td class="actions-cell">
              <button class="btn-sm btn-primary" @click="openEditModal(p)">Update Contact</button>
              <button class="btn-sm btn-ghost" @click="viewCard(p.patient_id)">Card</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Register Patient Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Register New Patient</h2>
          <button class="modal-close" @click="showRegisterModal = false">✕</button>
        </div>
        <form @submit.prevent="submitRegister" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="regForm.full_name" type="text" required class="form-control" />
            </div>
            <div class="form-group">
              <label>Date of Birth *</label>
              <input v-model="regForm.date_of_birth" type="date" required class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Gender *</label>
              <select v-model="regForm.gender" required class="form-control">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Blood Group</label>
              <select v-model="regForm.blood_group" class="form-control">
                <option value="">Unknown</option>
                <option v-for="bg in bloodGroups" :key="bg" :value="bg">{{ bg }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Contact Number *</label>
            <input v-model="regForm.contact_number" type="tel" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="regForm.address" rows="2" class="form-control"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <input v-model="regForm.emergency_contact_name" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <input v-model="regForm.emergency_contact_phone" type="tel" class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Insurance ID</label>
              <input v-model="regForm.insurance_id" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>Insurance Provider</label>
              <input v-model="regForm.insurance_provider" type="text" class="form-control" />
            </div>
          </div>
          <div v-if="store.error" class="alert-danger">{{ store.error }}</div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showRegisterModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Registering...' : 'Register Patient' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Update Contact Modal -->
    <div v-if="showEditModal && editTarget" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Update Contact — {{ editTarget.full_name }}</h2>
          <button class="modal-close" @click="showEditModal = false">✕</button>
        </div>
        <form @submit.prevent="submitEdit" class="modal-form">
          <div class="form-group">
            <label>Contact Number *</label>
            <input v-model="editForm.contact_number" type="tel" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="editForm.address" rows="2" class="form-control"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <input v-model="editForm.emergency_contact_name" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <input v-model="editForm.emergency_contact_phone" type="tel" class="form-control" />
            </div>
          </div>
          <div v-if="store.error" class="alert-danger">{{ store.error }}</div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Registration Card Modal -->
    <div v-if="cardData" class="modal-overlay" @click.self="cardData = null">
      <div class="modal card-modal">
        <div class="modal-header">
          <h2>Patient Registration Card</h2>
          <div class="header-btns">
            <button class="btn-primary btn-sm" onclick="window.print()">🖨 Print</button>
            <button class="modal-close" @click="cardData = null">✕</button>
          </div>
        </div>
        <div class="card-content printable">
          <div class="card-header-section">
            <h3>Apollo Hospital</h3>
            <p>Patient Registration Card</p>
          </div>
          <div class="card-body">
            <div class="card-code">{{ cardData.pat_code }}</div>
            <div class="card-grid">
              <div class="card-field"><span class="field-label">Name</span><span class="field-value">{{ cardData.full_name }}</span></div>
              <div class="card-field"><span class="field-label">DOB</span><span class="field-value">{{ formatDOB(cardData.date_of_birth) }}</span></div>
              <div class="card-field"><span class="field-label">Gender</span><span class="field-value">{{ cardData.gender }}</span></div>
              <div class="card-field"><span class="field-label">Blood Group</span><span class="field-value">{{ cardData.blood_group || '—' }}</span></div>
              <div class="card-field"><span class="field-label">Phone</span><span class="field-value">{{ cardData.contact_number }}</span></div>
              <div class="card-field"><span class="field-label">Address</span><span class="field-value">{{ cardData.address || '—' }}</span></div>
              <div class="card-field"><span class="field-label">Emergency Contact</span><span class="field-value">{{ cardData.emergency_contact_name || '—' }}</span></div>
              <div class="card-field"><span class="field-label">Emergency Phone</span><span class="field-value">{{ cardData.emergency_contact_phone || '—' }}</span></div>
              <div class="card-field"><span class="field-label">Insurance</span><span class="field-value">{{ cardData.insurance_provider || '—' }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useReceptionistStore } from '@/stores/receptionist'
import { getPatientRegistrationCard } from '@/api/receptionist'
import type { Patient } from '@/types'

const store = useReceptionistStore()

const searchQuery = ref('')
const bloodGroupFilter = ref('')
const hasSearched = ref(false)
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const showRegisterModal = ref(false)
const showEditModal = ref(false)
const editTarget = ref<Patient | null>(null)
const cardData = ref<Patient | null>(null)

const regForm = reactive({
  full_name: '', date_of_birth: '', gender: '', blood_group: '',
  contact_number: '', address: '', emergency_contact_name: '',
  emergency_contact_phone: '', insurance_id: '', insurance_provider: '',
})

const editForm = reactive({
  contact_number: '', address: '', emergency_contact_name: '', emergency_contact_phone: '',
})

async function doSearch() {
  hasSearched.value = true
  await store.fetchPatients(searchQuery.value || undefined, bloodGroupFilter.value || undefined)
}

function clearSearch() {
  searchQuery.value = ''
  bloodGroupFilter.value = ''
  hasSearched.value = false
  store.patients = []
  store.clearError()
}

function openRegisterModal() {
  store.clearError()
  Object.assign(regForm, {
    full_name: '', date_of_birth: '', gender: '', blood_group: '',
    contact_number: '', address: '', emergency_contact_name: '',
    emergency_contact_phone: '', insurance_id: '', insurance_provider: '',
  })
  showRegisterModal.value = true
}

function openEditModal(p: Patient) {
  store.clearError()
  editTarget.value = p
  Object.assign(editForm, {
    contact_number: p.contact_number,
    address: p.address ?? '',
    emergency_contact_name: p.emergency_contact_name ?? '',
    emergency_contact_phone: p.emergency_contact_phone ?? '',
  })
  showEditModal.value = true
}

async function submitRegister() {
  const result = await store.registerPatient({
    full_name: regForm.full_name,
    date_of_birth: new Date(regForm.date_of_birth).toISOString(),
    gender: regForm.gender,
    blood_group: regForm.blood_group || undefined,
    contact_number: regForm.contact_number,
    address: regForm.address || undefined,
    emergency_contact_name: regForm.emergency_contact_name || undefined,
    emergency_contact_phone: regForm.emergency_contact_phone || undefined,
    insurance_id: regForm.insurance_id || undefined,
    insurance_provider: regForm.insurance_provider || undefined,
  })
  if (result) {
    showRegisterModal.value = false
    store.patients.unshift(result)
  }
}

async function submitEdit() {
  if (!editTarget.value) return
  const ok = await store.updatePatientContact(editTarget.value.patient_id, {
    contact_number: editForm.contact_number,
    address: editForm.address || undefined,
    emergency_contact_name: editForm.emergency_contact_name || undefined,
    emergency_contact_phone: editForm.emergency_contact_phone || undefined,
  })
  if (ok) {
    showEditModal.value = false
    const idx = store.patients.findIndex(p => p.patient_id === editTarget.value!.patient_id)
    if (idx !== -1) {
      store.patients[idx].contact_number = editForm.contact_number
      store.patients[idx].address = editForm.address
    }
  }
}

async function viewCard(id: number) {
  try { cardData.value = await getPatientRegistrationCard(id) }
  catch { alert('Failed to load registration card') }
}

function formatDOB(dob: string) {
  if (!dob) return '—'
  return new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.patients-view { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { margin: 0; color: #333; font-size: 1.8rem; }

.search-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.search-input { flex: 1; min-width: 200px; padding: 0.55rem 0.9rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
.filter-select { padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; background: white; }

.alert-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #666; gap: 1rem; }
.spinner { width: 36px; height: 36px; border: 4px solid #f0f0f0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-container { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: auto; }
.no-data { text-align: center; padding: 3rem; color: #888; }
.no-data.hint { color: #aaa; font-style: italic; }
.patients-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.patients-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
.patients-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.patients-table tr:last-child td { border-bottom: none; }
.patients-table tr:hover td { background: #f9fafb; }

.pat-code-badge { background: #ede9fe; color: #6d28d9; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; }
.name-cell { display: flex; flex-direction: column; gap: 0.1rem; }
.full-name { font-weight: 600; color: #111; }
.dob { font-size: 0.78rem; color: #6b7280; }
.actions-cell { display: flex; gap: 0.4rem; }

.btn-primary  { background: #667eea; color: white; border: none; padding: 0.55rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:hover { background: #5a6fd6; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: white; color: #667eea; border: 1px solid #667eea; padding: 0.55rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-ghost { background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.55rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-sm { padding: 0.3rem 0.7rem; border-radius: 5px; font-size: 0.8rem; border: none; cursor: pointer; font-weight: 500; }
.btn-ghost.btn-sm { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 12px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.card-modal { max-width: 480px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { margin: 0; font-size: 1.1rem; color: #111; }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
.header-btns { display: flex; gap: 0.5rem; align-items: center; }
.modal-form { padding: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.4rem; }
.form-control { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
textarea.form-control { resize: vertical; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.card-content { padding: 1.5rem; }
.card-header-section { text-align: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem; }
.card-header-section h3 { margin: 0; color: #667eea; font-size: 1.3rem; }
.card-header-section p { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.9rem; }
.card-code { text-align: center; font-size: 1.5rem; font-weight: 700; color: #6d28d9; margin-bottom: 1rem; letter-spacing: 2px; }
.card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.card-field { display: flex; flex-direction: column; }
.field-label { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.field-value { font-size: 0.9rem; color: #111; font-weight: 500; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .card-grid  { grid-template-columns: 1fr; }
}
</style>
