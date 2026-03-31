<template>
  <div class="patient-list-view">
    <div class="page-header">
      <h1>Patient Management</h1>
      <button @click="showRegisterModal = true" class="btn-primary">+ Register Patient</button>
    </div>

    <!-- Search -->
    <div class="search-section">
      <div class="search-bar">
        <input v-model="searchQuery" @keyup.enter="handleSearch" type="text"
          placeholder="Search by name, phone, or PAT code..." class="search-input" />
        <button @click="handleSearch" class="search-btn">Search</button>
      </div>
    </div>

    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div><p>Loading patients...</p>
    </div>

    <div v-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <!-- Patient Table -->
    <div v-if="store.patients.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>PAT Code</th>
            <th>Full Name</th>
            <th>DOB</th>
            <th>Gender</th>
            <th>Blood Group</th>
            <th>Contact</th>
            <th>Insurance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.patients" :key="p.patient_id">
            <td><span class="pat-badge">{{ p.pat_code }}</span></td>
            <td class="name-cell">{{ p.full_name }}</td>
            <td>{{ formatDate(p.date_of_birth) }}</td>
            <td><span class="gender-badge" :class="p.gender">{{ p.gender }}</span></td>
            <td><span class="blood-badge" v-if="p.blood_group">{{ p.blood_group }}</span><span v-else>—</span></td>
            <td>{{ p.contact_number }}</td>
            <td>{{ p.insurance_provider || '—' }}</td>
            <td class="actions-cell">
              <button @click="openEditModal(p)" class="btn-sm btn-outline" title="Edit Contact">✏️</button>
              <button @click="viewPatientCard(p)" class="btn-sm btn-outline" title="View Card">🪪</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!store.loading" class="no-data">
      <p>No patients found. Try a different search or register a new patient.</p>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Register New Patient</h2>
          <button @click="showRegisterModal = false" class="modal-close">&times;</button>
        </div>
        <div v-if="duplicateWarning" class="alert alert-warning">
          ⚠️ {{ duplicateWarning }}
        </div>
        <form @submit.prevent="handleRegister" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="regForm.full_name" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Date of Birth *</label>
              <input v-model="regForm.date_of_birth" type="date" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Gender *</label>
              <select v-model="regForm.gender" required class="form-input">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Blood Group</label>
              <select v-model="regForm.blood_group" class="form-input">
                <option value="">Select...</option>
                <option v-for="bg in bloodGroups" :key="bg" :value="bg">{{ bg }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Contact Number *</label>
              <input v-model="regForm.contact_number" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Address</label>
              <input v-model="regForm.address" class="form-input" />
            </div>
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <input v-model="regForm.emergency_contact_name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <input v-model="regForm.emergency_contact_phone" class="form-input" />
            </div>
            <div class="form-group">
              <label>Insurance ID</label>
              <input v-model="regForm.insurance_id" class="form-input" />
            </div>
            <div class="form-group">
              <label>Insurance Provider</label>
              <input v-model="regForm.insurance_provider" class="form-input" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showRegisterModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">Register</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Contact Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Edit Contact — {{ editPatient?.full_name }}</h2>
          <button @click="showEditModal = false" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="handleUpdateContact" class="modal-body">
          <div class="form-group">
            <label>Contact Number</label>
            <input v-model="editForm.contact_number" class="form-input" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <input v-model="editForm.address" class="form-input" />
          </div>
          <div class="form-group">
            <label>Emergency Contact Name</label>
            <input v-model="editForm.emergency_contact_name" class="form-input" />
          </div>
          <div class="form-group">
            <label>Emergency Contact Phone</label>
            <input v-model="editForm.emergency_contact_phone" class="form-input" />
          </div>
          <div class="form-group">
            <label>Insurance ID</label>
            <input v-model="editForm.insurance_id" class="form-input" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="showEditModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">Update</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Registration Card Modal -->
    <div v-if="showCardModal" class="modal-overlay" @click.self="showCardModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Patient Registration Card</h2>
          <button @click="showCardModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body" v-if="cardPatient">
          <div class="reg-card">
            <div class="card-header-section">
              <h3>Apollo Hospital</h3>
              <span class="pat-badge-lg">{{ cardPatient.pat_code }}</span>
            </div>
            <div class="card-details">
              <div class="card-row"><strong>Name:</strong> {{ cardPatient.full_name }}</div>
              <div class="card-row"><strong>DOB:</strong> {{ formatDate(cardPatient.date_of_birth) }}</div>
              <div class="card-row"><strong>Gender:</strong> {{ cardPatient.gender }}</div>
              <div class="card-row"><strong>Blood Group:</strong> {{ cardPatient.blood_group || '—' }}</div>
              <div class="card-row"><strong>Contact:</strong> {{ cardPatient.contact_number }}</div>
              <div class="card-row"><strong>Address:</strong> {{ cardPatient.address || '—' }}</div>
              <div class="card-row"><strong>Emergency:</strong> {{ cardPatient.emergency_contact_name }} — {{ cardPatient.emergency_contact_phone }}</div>
              <div class="card-row"><strong>Insurance:</strong> {{ cardPatient.insurance_provider || 'None' }} {{ cardPatient.insurance_id ? `(${cardPatient.insurance_id})` : '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { usePatientStore } from '@/stores/patient'
import type { Patient } from '@/types'

const store = usePatientStore()
const searchQuery = ref('')
const showRegisterModal = ref(false)
const showEditModal = ref(false)
const showCardModal = ref(false)
const editPatient = ref<Patient | null>(null)
const cardPatient = ref<Patient | null>(null)
const duplicateWarning = ref('')
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const regForm = reactive({
  full_name: '', date_of_birth: '', gender: '', blood_group: '',
  contact_number: '', address: '', emergency_contact_name: '',
  emergency_contact_phone: '', insurance_id: '', insurance_provider: '',
})

const editForm = reactive({
  contact_number: '', address: '', emergency_contact_name: '',
  emergency_contact_phone: '', insurance_id: '',
})

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function handleSearch() {
  await store.searchPatients(searchQuery.value)
}

async function handleRegister() {
  duplicateWarning.value = ''
  const result = await store.registerPatient(regForm)
  if (result) {
    if (result.duplicates && result.duplicates.length > 0) {
      duplicateWarning.value = `Potential duplicates found: ${result.duplicates.map(d => d.full_name).join(', ')}`
    }
    showRegisterModal.value = false
    Object.assign(regForm, { full_name: '', date_of_birth: '', gender: '', blood_group: '',
      contact_number: '', address: '', emergency_contact_name: '',
      emergency_contact_phone: '', insurance_id: '', insurance_provider: '' })
    await store.searchPatients(searchQuery.value)
  }
}

function openEditModal(p: Patient) {
  editPatient.value = p
  Object.assign(editForm, {
    contact_number: p.contact_number, address: p.address || '',
    emergency_contact_name: p.emergency_contact_name || '',
    emergency_contact_phone: p.emergency_contact_phone || '',
    insurance_id: p.insurance_id || '',
  })
  showEditModal.value = true
}

async function handleUpdateContact() {
  if (!editPatient.value) return
  const ok = await store.updatePatient(editPatient.value.patient_id, editForm)
  if (ok) {
    showEditModal.value = false
    await store.searchPatients(searchQuery.value)
  }
}

function viewPatientCard(p: Patient) {
  cardPatient.value = p
  showCardModal.value = true
}

onMounted(() => store.searchPatients(''))
</script>

<style scoped>
.patient-list-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
}
.page-header h1 { color: #064e3b; font-size: 2rem; font-weight: 700; margin: 0; }

.btn-primary {
  background: linear-gradient(135deg, #0d9488, #065f46); color: white; border: none;
  padding: 0.7rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer;
  transition: all 0.3s; font-size: 0.9rem;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13,148,136,0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f1f5f9; color: #475569; border: none; padding: 0.7rem 1.5rem;
  border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s;
}
.btn-secondary:hover { background: #e2e8f0; }

.btn-sm { padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-outline { background: transparent; border: 1px solid #e2e8f0; transition: all 0.2s; }
.btn-outline:hover { background: #f0fdfa; border-color: #0d9488; }

.search-section { margin-bottom: 1.5rem; }
.search-bar { display: flex; gap: 0.75rem; }
.search-input {
  flex: 1; padding: 0.8rem 1.2rem; border: 2px solid #e2e8f0; border-radius: 10px;
  font-size: 0.9rem; background: white; transition: border-color 0.3s;
}
.search-input:focus { outline: none; border-color: #0d9488; }
.search-btn {
  padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #0d9488, #065f46);
  color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
}

.loading-state {
  display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #64748b; gap: 1rem;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0d9488;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.alert { padding: 0.8rem 1.2rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.alert-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

.table-container {
  background: white; border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: #f8fafc; padding: 0.9rem 1.2rem; text-align: left;
  font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;
  color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;
}
.data-table td {
  padding: 0.8rem 1.2rem; border-bottom: 1px solid #f1f5f9;
  color: #334155; font-size: 0.88rem;
}
.data-table tbody tr:hover { background: #f0fdfa; }
.name-cell { font-weight: 600; color: #0f172a; }
.actions-cell { display: flex; gap: 0.4rem; }

.pat-badge {
  background: linear-gradient(135deg, #0d9488, #065f46); color: white;
  padding: 0.2rem 0.65rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600;
}
.gender-badge {
  padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.78rem;
  font-weight: 500; text-transform: capitalize;
}
.gender-badge.male { background: #dbeafe; color: #1e40af; }
.gender-badge.female { background: #fce7f3; color: #be185d; }
.gender-badge.other { background: #e0e7ff; color: #4338ca; }
.blood-badge {
  background: #fef2f2; color: #dc2626; padding: 0.15rem 0.4rem;
  border-radius: 4px; font-size: 0.78rem; font-weight: 600;
}

.no-data {
  text-align: center; padding: 3rem; color: #64748b;
  background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

/* Modals */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center;
  align-items: center; z-index: 1000; animation: fadeIn 0.2s ease;
}
.modal {
  background: white; border-radius: 20px; width: 90%; max-width: 700px;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-sm { max-width: 500px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem; border-bottom: 1px solid #f1f5f9;
}
.modal-header h2 { margin: 0; color: #064e3b; font-size: 1.3rem; }
.modal-close {
  background: none; border: none; font-size: 1.5rem; color: #94a3b8;
  cursor: pointer; padding: 0.25rem; line-height: 1;
}
.modal-body { padding: 1.5rem; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.5rem;
}

.form-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-group label { font-size: 0.82rem; font-weight: 600; color: #475569; }
.form-input {
  padding: 0.65rem 0.9rem; border: 2px solid #e2e8f0; border-radius: 8px;
  font-size: 0.9rem; transition: border-color 0.3s;
}
.form-input:focus { outline: none; border-color: #0d9488; }

/* Registration Card */
.reg-card {
  background: linear-gradient(135deg, #f0fdfa, #ecfdf5); border: 2px solid #99f6e4;
  border-radius: 16px; padding: 1.5rem; text-align: center;
}
.card-header-section { margin-bottom: 1rem; }
.card-header-section h3 { color: #064e3b; margin: 0 0 0.5rem; }
.pat-badge-lg {
  background: linear-gradient(135deg, #0d9488, #065f46); color: white;
  padding: 0.4rem 1rem; border-radius: 8px; font-size: 1.1rem; font-weight: 700;
}
.card-details { text-align: left; }
.card-row { padding: 0.4rem 0; font-size: 0.9rem; color: #334155; border-bottom: 1px dashed #d1fae5; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 1rem; }
}
</style>
