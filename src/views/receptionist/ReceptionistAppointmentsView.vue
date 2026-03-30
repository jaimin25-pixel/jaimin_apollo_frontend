<template>
  <div class="appointments-view">
    <!-- Header -->
    <div class="page-header">
      <h1>Appointments</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="openBookModal()">+ Book Appointment</button>
        <button class="btn-secondary" @click="openWalkInModal()">Walk-In</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <select v-model="filters.status" @change="loadAppointments" class="filter-select">
        <option value="">All Statuses</option>
        <option value="scheduled">Scheduled</option>
        <option value="checked_in">Checked In</option>
        <option value="in_consultation">In Consultation</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input v-model="filters.date" type="date" class="filter-input" @change="loadAppointments" />
      <button class="btn-ghost" @click="resetFilters">Reset</button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="alert-danger">{{ store.error }}</div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading appointments...</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <div v-if="store.appointments.length === 0" class="no-data">
        No appointments found for the selected filters.
      </div>
      <table v-else class="appt-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in store.appointments" :key="appt.appt_id">
            <td class="token-cell">
              <span v-if="appt.queue_token" class="queue-token">{{ appt.queue_token }}</span>
              <span v-else class="no-token">—</span>
            </td>
            <td>{{ formatTime(appt.scheduled_at) }}</td>
            <td>
              <div class="patient-info">
                <span class="patient-name">{{ appt.patient?.full_name ?? '—' }}</span>
                <span class="pat-code">{{ appt.patient?.pat_code }}</span>
              </div>
            </td>
            <td>{{ appt.doctor?.full_name ?? '—' }}</td>
            <td>{{ appt.department?.name ?? '—' }}</td>
            <td>
              <span :class="['status-badge', `status-${appt.status}`]">
                {{ formatStatus(appt.status) }}
              </span>
            </td>
            <td class="actions-cell">
              <button
                v-if="appt.status === 'scheduled'"
                class="btn-sm btn-success"
                @click="handleCheckIn(appt.appt_id)"
                :disabled="store.loading"
              >Check In</button>
              <button
                v-if="appt.status === 'scheduled'"
                class="btn-sm btn-warning"
                @click="openRescheduleModal(appt)"
              >Reschedule</button>
              <button
                v-if="appt.status === 'scheduled' || appt.status === 'checked_in'"
                class="btn-sm btn-danger"
                @click="handleCancel(appt.appt_id)"
                :disabled="store.loading"
              >Cancel</button>
              <button class="btn-sm btn-ghost" @click="printSlip(appt.appt_id)">Slip</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Book Appointment Modal -->
    <div v-if="showBookModal" class="modal-overlay" @click.self="showBookModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Book Appointment</h2>
          <button class="modal-close" @click="showBookModal = false">✕</button>
        </div>
        <form @submit.prevent="submitBook" class="modal-form">
          <div class="form-group">
            <label>Patient ID *</label>
            <input v-model.number="bookForm.patient_id" type="number" min="1" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Doctor ID *</label>
            <input v-model.number="bookForm.doctor_id" type="number" min="1" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Department ID *</label>
            <input v-model.number="bookForm.dept_id" type="number" min="1" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Scheduled At *</label>
            <input v-model="bookForm.scheduled_at" type="datetime-local" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Chief Complaint</label>
            <textarea v-model="bookForm.chief_complaint" rows="2" class="form-control" placeholder="Reason for visit"></textarea>
          </div>
          <div v-if="store.error" class="alert-danger">{{ store.error }}</div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showBookModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Booking...' : 'Book Appointment' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Walk-In Modal -->
    <div v-if="showWalkInModal" class="modal-overlay" @click.self="showWalkInModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Walk-In Registration</h2>
          <button class="modal-close" @click="showWalkInModal = false">✕</button>
        </div>
        <form @submit.prevent="submitWalkIn" class="modal-form">
          <div class="form-group">
            <label>Patient ID *</label>
            <input v-model.number="walkInForm.patient_id" type="number" min="1" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Doctor ID *</label>
            <input v-model.number="walkInForm.doctor_id" type="number" min="1" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Department ID *</label>
            <input v-model.number="walkInForm.dept_id" type="number" min="1" required class="form-control" />
          </div>
          <div class="form-group">
            <label>Chief Complaint</label>
            <textarea v-model="walkInForm.chief_complaint" rows="2" class="form-control" placeholder="Reason for visit"></textarea>
          </div>
          <div v-if="store.error" class="alert-danger">{{ store.error }}</div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showWalkInModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Processing...' : 'Register Walk-In' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="showRescheduleModal" class="modal-overlay" @click.self="showRescheduleModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Reschedule Appointment</h2>
          <button class="modal-close" @click="showRescheduleModal = false">✕</button>
        </div>
        <form @submit.prevent="submitReschedule" class="modal-form">
          <p class="reschedule-info">
            Patient: <strong>{{ selectedAppt?.patient?.full_name }}</strong>
          </p>
          <div class="form-group">
            <label>New Date & Time *</label>
            <input v-model="rescheduleTime" type="datetime-local" required class="form-control" />
          </div>
          <div v-if="store.error" class="alert-danger">{{ store.error }}</div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showRescheduleModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Saving...' : 'Reschedule' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Appointment Slip Modal -->
    <div v-if="slipData" class="modal-overlay" @click.self="slipData = null">
      <div class="modal slip-modal">
        <div class="modal-header">
          <h2>Appointment Slip</h2>
          <div class="header-btns">
            <button class="btn-primary btn-sm" onclick="window.print()">🖨 Print</button>
            <button class="modal-close" @click="slipData = null">✕</button>
          </div>
        </div>
        <div class="slip-content printable">
          <div class="slip-header-card">
            <h3>Apollo Hospital</h3>
            <p>Appointment Slip</p>
          </div>
          <div class="slip-body">
            <div class="slip-row">
              <span class="slip-label">Queue Token</span>
              <span class="slip-value token-large">{{ slipData.queue_token || 'N/A' }}</span>
            </div>
            <div class="slip-row">
              <span class="slip-label">Patient</span>
              <span class="slip-value">{{ slipData.patient?.full_name }} ({{ slipData.patient?.pat_code }})</span>
            </div>
            <div class="slip-row">
              <span class="slip-label">Doctor</span>
              <span class="slip-value">{{ slipData.doctor?.full_name }}</span>
            </div>
            <div class="slip-row">
              <span class="slip-label">Department</span>
              <span class="slip-value">{{ slipData.department?.name }}</span>
            </div>
            <div class="slip-row">
              <span class="slip-label">Scheduled At</span>
              <span class="slip-value">{{ formatDateTime(slipData.scheduled_at) }}</span>
            </div>
            <div v-if="slipData.chief_complaint" class="slip-row">
              <span class="slip-label">Chief Complaint</span>
              <span class="slip-value">{{ slipData.chief_complaint }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useReceptionistStore } from '@/stores/receptionist'
import { getAppointmentSlip } from '@/api/receptionist'
import type { AppointmentFull, AppointmentSlip } from '@/types'

const store = useReceptionistStore()

const filters = reactive({ status: '', date: new Date().toISOString().split('T')[0] })

const showBookModal = ref(false)
const showWalkInModal = ref(false)
const showRescheduleModal = ref(false)
const selectedAppt = ref<AppointmentFull | null>(null)
const rescheduleTime = ref('')
const slipData = ref<AppointmentSlip | null>(null)

const bookForm = reactive({ patient_id: 0, doctor_id: 0, dept_id: 0, scheduled_at: '', chief_complaint: '' })
const walkInForm = reactive({ patient_id: 0, doctor_id: 0, dept_id: 0, chief_complaint: '' })

function loadAppointments() {
  store.fetchAppointments({ status: filters.status || undefined, date: filters.date || undefined })
}

function resetFilters() {
  filters.status = ''
  filters.date = new Date().toISOString().split('T')[0]
  loadAppointments()
}

function openBookModal() {
  store.clearError()
  Object.assign(bookForm, { patient_id: 0, doctor_id: 0, dept_id: 0, scheduled_at: '', chief_complaint: '' })
  showBookModal.value = true
}

function openWalkInModal() {
  store.clearError()
  Object.assign(walkInForm, { patient_id: 0, doctor_id: 0, dept_id: 0, chief_complaint: '' })
  showWalkInModal.value = true
}

function openRescheduleModal(appt: AppointmentFull) {
  store.clearError()
  selectedAppt.value = appt
  rescheduleTime.value = new Date(appt.scheduled_at).toISOString().slice(0, 16)
  showRescheduleModal.value = true
}

async function submitBook() {
  const result = await store.bookAppointment({
    patient_id: bookForm.patient_id,
    doctor_id: bookForm.doctor_id,
    dept_id: bookForm.dept_id,
    scheduled_at: new Date(bookForm.scheduled_at).toISOString(),
    chief_complaint: bookForm.chief_complaint,
  })
  if (result) showBookModal.value = false
}

async function submitWalkIn() {
  const result = await store.walkIn({
    patient_id: walkInForm.patient_id,
    doctor_id: walkInForm.doctor_id,
    dept_id: walkInForm.dept_id,
    chief_complaint: walkInForm.chief_complaint,
  })
  if (result) showWalkInModal.value = false
}

async function submitReschedule() {
  if (!selectedAppt.value) return
  const ok = await store.reschedule(selectedAppt.value.appt_id, new Date(rescheduleTime.value).toISOString())
  if (ok) { showRescheduleModal.value = false; loadAppointments() }
}

async function handleCheckIn(id: number) { await store.checkIn(id) }

async function handleCancel(id: number) {
  if (!confirm('Cancel this appointment?')) return
  await store.cancelAppt(id)
}

async function printSlip(id: number) {
  try { slipData.value = await getAppointmentSlip(id) }
  catch { alert('Failed to load appointment slip') }
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}
function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

onMounted(loadAppointments)
</script>

<style scoped>
.appointments-view { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { margin: 0; color: #333; font-size: 1.8rem; }
.header-actions { display: flex; gap: 0.75rem; }

.filters-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.filter-select, .filter-input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; background: white; }

.alert-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #666; gap: 1rem; }
.spinner { width: 36px; height: 36px; border: 4px solid #f0f0f0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-container { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: auto; }
.no-data { text-align: center; padding: 3rem; color: #888; }
.appt-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.appt-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
.appt-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.appt-table tr:last-child td { border-bottom: none; }
.appt-table tr:hover td { background: #f9fafb; }

.queue-token { background: #667eea; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; }
.no-token { color: #ccc; }
.patient-info { display: flex; flex-direction: column; gap: 0.1rem; }
.patient-name { font-weight: 600; color: #111; }
.pat-code { font-size: 0.78rem; color: #6b7280; }

.status-badge { padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
.status-scheduled       { background: #dbeafe; color: #1e40af; }
.status-checked_in      { background: #fef9c3; color: #854d0e; }
.status-in_consultation { background: #fce7f3; color: #9d174d; }
.status-completed       { background: #dcfce7; color: #166534; }
.status-cancelled       { background: #f3f4f6; color: #6b7280; }

.actions-cell { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.btn-primary  { background: #667eea; color: white; border: none; padding: 0.55rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:hover { background: #5a6fd6; }
.btn-secondary { background: white; color: #667eea; border: 1px solid #667eea; padding: 0.55rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-ghost { background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.55rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-sm { padding: 0.3rem 0.7rem; border-radius: 5px; font-size: 0.8rem; border: none; cursor: pointer; font-weight: 500; }
.btn-sm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-success { background: #16a34a; color: white; }
.btn-warning { background: #d97706; color: white; }
.btn-danger  { background: #dc2626; color: white; }
.btn-ghost.btn-sm { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 12px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.slip-modal { max-width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { margin: 0; font-size: 1.2rem; color: #111; }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
.header-btns { display: flex; gap: 0.5rem; align-items: center; }
.modal-form { padding: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.4rem; }
.form-control { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
textarea.form-control { resize: vertical; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
.reschedule-info { color: #374151; margin-bottom: 1rem; }

.slip-content { padding: 1.5rem; }
.slip-header-card { text-align: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem; }
.slip-header-card h3 { margin: 0; font-size: 1.3rem; color: #667eea; }
.slip-header-card p { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.9rem; }
.slip-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; }
.slip-label { font-size: 0.85rem; color: #6b7280; }
.slip-value { font-weight: 500; color: #111; text-align: right; max-width: 60%; }
.token-large { font-size: 1.3rem; font-weight: 700; color: #667eea; }
</style>
