<template>
  <div class="appointments-view">
    <h1>OPD Appointments</h1>

    <!-- Patient Search -->
    <div class="search-section">
      <div class="search-bar">
        <input v-model="searchQuery" @keyup.enter="searchPatient" type="text"
          placeholder="Search patient by name, phone, or PAT code first..." class="search-input" />
        <button @click="searchPatient" class="search-btn">Search Patient</button>
      </div>
    </div>

    <!-- Patient Selector -->
    <div v-if="patientResults.length > 0 && !selectedPatient" class="patient-selector">
      <h3>Select a Patient</h3>
      <div class="patient-chips">
        <button v-for="p in patientResults" :key="p.patient_id"
          @click="selectPatient(p)" class="patient-chip">
          <span class="chip-code">{{ p.pat_code }}</span>
          <span>{{ p.full_name }}</span>
        </button>
      </div>
    </div>

    <div v-if="selectedPatient" class="selected-patient-bar">
      <div class="selected-info">
        <span class="pat-badge">{{ selectedPatient.pat_code }}</span>
        <span class="selected-name">{{ selectedPatient.full_name }}</span>
      </div>
      <div class="selected-actions">
        <button @click="showBookModal = true" class="btn-primary">+ Book Appointment</button>
        <button @click="clearSelection" class="btn-outline-sm">Change Patient</button>
      </div>
    </div>

    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div><p>Loading...</p>
    </div>
    <div v-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <!-- Appointments Table -->
    <div v-if="selectedPatient && store.appointments.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Scheduled At</th>
            <th>Status</th>
            <th>Queue Token</th>
            <th>Complaint</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in store.appointments" :key="a.appt_id">
            <td>#{{ a.appt_id }}</td>
            <td>{{ a.doctor?.full_name || '—' }}</td>
            <td>{{ a.department?.name || '—' }}</td>
            <td>{{ formatDateTime(a.scheduled_at) }}</td>
            <td><span class="status-badge" :class="a.status">{{ a.status.replace('_', ' ') }}</span></td>
            <td>
              <span v-if="a.queue_token" class="token-badge">{{ a.queue_token }}</span>
              <span v-else>—</span>
            </td>
            <td>{{ a.chief_complaint || '—' }}</td>
            <td class="actions-cell">
              <button v-if="a.status === 'scheduled'" @click="handleCheckIn(a.appt_id)" class="btn-sm btn-success" title="Check In">✅</button>
              <button v-if="a.status === 'scheduled'" @click="openReschedule(a)" class="btn-sm btn-outline" title="Reschedule">📅</button>
              <button v-if="a.status === 'scheduled' || a.status === 'checked_in'" @click="handleCancel(a)" class="btn-sm btn-danger" title="Cancel">❌</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="selectedPatient && !store.loading" class="no-data">
      <p>No appointments found for this patient.</p>
    </div>

    <!-- Book Appointment Modal -->
    <div v-if="showBookModal" class="modal-overlay" @click.self="showBookModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Book Appointment</h2>
          <button @click="showBookModal = false" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="handleBook" class="modal-body">
          <div class="form-group">
            <label>Doctor ID *</label>
            <input v-model.number="bookForm.doctor_id" type="number" required class="form-input" placeholder="Enter doctor ID" />
          </div>
          <div class="form-group">
            <label>Department ID *</label>
            <input v-model.number="bookForm.dept_id" type="number" required class="form-input" placeholder="Enter department ID" />
          </div>
          <div class="form-group">
            <label>Scheduled At *</label>
            <input v-model="bookForm.scheduled_at" type="datetime-local" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Chief Complaint</label>
            <textarea v-model="bookForm.chief_complaint" class="form-input" rows="3" placeholder="Describe symptoms..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showBookModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">Book</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="showRescheduleModal" class="modal-overlay" @click.self="showRescheduleModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Reschedule Appointment #{{ rescheduleAppt?.appt_id }}</h2>
          <button @click="showRescheduleModal = false" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="handleReschedule" class="modal-body">
          <div class="form-group">
            <label>New Date/Time *</label>
            <input v-model="rescheduleDate" type="datetime-local" required class="form-input" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="showRescheduleModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Reschedule</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Check-in Success Toast -->
    <div v-if="checkinToken" class="toast-success">
      ✅ Checked in! Queue Token: <strong>{{ checkinToken }}</strong>
      <button @click="checkinToken = ''" class="toast-close">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePatientStore } from '@/stores/patient'
import * as patientApi from '@/api/patient'
import type { Patient, AppointmentFull } from '@/types'

const store = usePatientStore()
const searchQuery = ref('')
const patientResults = ref<Patient[]>([])
const selectedPatient = ref<Patient | null>(null)
const showBookModal = ref(false)
const showRescheduleModal = ref(false)
const rescheduleAppt = ref<AppointmentFull | null>(null)
const rescheduleDate = ref('')
const checkinToken = ref('')

const bookForm = reactive({ doctor_id: 0, dept_id: 0, scheduled_at: '', chief_complaint: '' })

function formatDateTime(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function searchPatient() {
  const results = await patientApi.searchPatients(searchQuery.value)
  patientResults.value = results || []
  selectedPatient.value = null
}

async function selectPatient(p: Patient) {
  selectedPatient.value = p
  patientResults.value = []
  await store.fetchAppointments(p.patient_id)
}

function clearSelection() {
  selectedPatient.value = null
  store.appointments = []
}

async function handleBook() {
  if (!selectedPatient.value) return
  const data = {
    doctor_id: bookForm.doctor_id,
    dept_id: bookForm.dept_id,
    scheduled_at: new Date(bookForm.scheduled_at).toISOString(),
    chief_complaint: bookForm.chief_complaint,
  }
  const appt = await store.bookAppointment(selectedPatient.value.patient_id, data)
  if (appt) {
    showBookModal.value = false
    Object.assign(bookForm, { doctor_id: 0, dept_id: 0, scheduled_at: '', chief_complaint: '' })
    await store.fetchAppointments(selectedPatient.value.patient_id)
  }
}

async function handleCheckIn(apptId: number) {
  if (!selectedPatient.value) return
  const result = await store.checkInAppointment(selectedPatient.value.patient_id, apptId)
  if (result) {
    checkinToken.value = result.queue_token
    await store.fetchAppointments(selectedPatient.value.patient_id)
    setTimeout(() => { checkinToken.value = '' }, 8000)
  }
}

function openReschedule(a: AppointmentFull) {
  rescheduleAppt.value = a
  rescheduleDate.value = ''
  showRescheduleModal.value = true
}

async function handleReschedule() {
  if (!selectedPatient.value || !rescheduleAppt.value) return
  const ok = await store.updateAppointment(
    selectedPatient.value.patient_id,
    rescheduleAppt.value.appt_id,
    { scheduled_at: new Date(rescheduleDate.value).toISOString() }
  )
  if (ok) {
    showRescheduleModal.value = false
    await store.fetchAppointments(selectedPatient.value.patient_id)
  }
}

async function handleCancel(a: AppointmentFull) {
  if (!selectedPatient.value) return
  if (!confirm('Cancel this appointment?')) return
  const ok = await store.updateAppointment(
    selectedPatient.value.patient_id, a.appt_id, { status: 'cancelled' }
  )
  if (ok) await store.fetchAppointments(selectedPatient.value.patient_id)
}
</script>

<style scoped>
.appointments-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

h1 { color: #064e3b; font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; }

.search-section { margin-bottom: 1.5rem; }
.search-bar { display: flex; gap: 0.75rem; }
.search-input { flex: 1; padding: 0.8rem 1.2rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
.search-input:focus { outline: none; border-color: #0d9488; }
.search-btn { padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #0d9488, #065f46); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }

.patient-selector { margin-bottom: 1.5rem; }
.patient-selector h3 { color: #334155; font-size: 1rem; margin-bottom: 0.75rem; }
.patient-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.patient-chip {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
  background: white; border: 2px solid #e2e8f0; border-radius: 10px;
  cursor: pointer; transition: all 0.3s; font-size: 0.9rem;
}
.patient-chip:hover { border-color: #0d9488; background: #f0fdfa; }
.chip-code { font-size: 0.75rem; font-weight: 700; color: #0d9488; }

.selected-patient-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 1rem 1.5rem; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 1.5rem;
  border-left: 4px solid #0d9488;
}
.selected-info { display: flex; align-items: center; gap: 0.75rem; }
.pat-badge { background: linear-gradient(135deg, #0d9488, #065f46); color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
.selected-name { font-weight: 700; color: #0f172a; font-size: 1.1rem; }
.selected-actions { display: flex; gap: 0.75rem; }
.btn-primary { background: linear-gradient(135deg, #0d9488, #065f46); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.3s; }
.btn-primary:hover { box-shadow: 0 4px 12px rgba(13,148,136,0.3); }
.btn-primary:disabled { opacity: 0.6; }
.btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-outline-sm { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
.btn-outline-sm:hover { border-color: #0d9488; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #64748b; gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0d9488; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.alert { padding: 0.8rem 1.2rem; border-radius: 10px; margin-bottom: 1rem; }
.alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.table-container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f8fafc; padding: 0.85rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.85rem; }
.data-table tbody tr:hover { background: #f0fdfa; }
.actions-cell { display: flex; gap: 0.3rem; }

.status-badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-badge.scheduled { background: #dbeafe; color: #1e40af; }
.status-badge.checked_in { background: #fef3c7; color: #92400e; }
.status-badge.in_consultation { background: #e0e7ff; color: #4338ca; }
.status-badge.completed { background: #dcfce7; color: #166534; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }
.token-badge { background: #0d9488; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; }

.btn-sm { padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.82rem; cursor: pointer; border: 1px solid #e2e8f0; background: transparent; }
.btn-success { background: #dcfce7; border-color: #86efac; }
.btn-danger { background: #fef2f2; border-color: #fecaca; }
.btn-outline { background: transparent; }

.no-data { text-align: center; padding: 3rem; color: #64748b; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-sm { max-width: 450px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
.modal-header h2 { margin: 0; color: #064e3b; font-size: 1.2rem; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
.form-group label { font-size: 0.82rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.65rem 0.9rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; }
.form-input:focus { outline: none; border-color: #0d9488; }

.toast-success {
  position: fixed; bottom: 2rem; right: 2rem; background: #dcfce7; color: #166534;
  padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem;
  animation: slideUp 0.4s ease; z-index: 2000;
}
.toast-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #166534; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
