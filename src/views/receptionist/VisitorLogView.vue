<template>
  <div class="visitors-view">
    <div class="page-header">
      <h1>Visitor Log</h1>
      <button class="btn-primary" @click="openLogModal()">+ Log Visitor</button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input v-model="dateFilter" type="date" class="filter-input" @change="loadVisitors" />
      <input
        v-model="patientIdFilter"
        type="number"
        class="filter-input narrow"
        placeholder="Patient ID"
        @keyup.enter="loadVisitors"
      />
      <button class="btn-ghost" @click="resetFilters">Reset</button>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="alert-danger">{{ store.error }}</div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading visitor log...</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <div v-if="store.visitors.length === 0" class="no-data">
        No visitor records found for the selected date.
      </div>
      <table v-else class="visitors-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Visitor</th>
            <th>Relation</th>
            <th>Patient</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, idx) in store.visitors" :key="v.visitor_id">
            <td class="idx-cell">{{ idx + 1 }}</td>
            <td>
              <span class="visitor-name">{{ v.visitor_name }}</span>
            </td>
            <td><span class="relation-badge">{{ v.relation }}</span></td>
            <td>
              <div class="patient-cell">
                <span class="patient-name">{{ v.patient?.full_name ?? '—' }}</span>
                <span class="pat-code">{{ v.patient?.pat_code }}</span>
              </div>
            </td>
            <td>{{ formatTime(v.time_in) }}</td>
            <td>
              <span v-if="v.time_out" class="time-out">{{ formatTime(v.time_out) }}</span>
              <span v-else class="still-inside">Still Inside</span>
            </td>
            <td>
              <span v-if="v.time_out" class="duration">{{ getDuration(v.time_in, v.time_out) }}</span>
              <span v-else class="duration ongoing">{{ getDuration(v.time_in) }}</span>
            </td>
            <td>
              <button
                v-if="!v.time_out"
                class="btn-sm btn-warning"
                @click="handleCheckout(v.visitor_id)"
                :disabled="store.loading"
              >Check Out</button>
              <span v-else class="checked-out-label">Checked Out</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Log Visitor Modal -->
    <div v-if="showLogModal" class="modal-overlay" @click.self="showLogModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Log Visitor</h2>
          <button class="modal-close" @click="showLogModal = false">✕</button>
        </div>
        <form @submit.prevent="submitLog" class="modal-form">
          <div class="form-group">
            <label>Patient ID *</label>
            <input v-model.number="logForm.patient_id" type="number" min="1" required class="form-control" placeholder="Enter patient ID" />
          </div>
          <div class="form-group">
            <label>Visitor Name *</label>
            <input v-model="logForm.visitor_name" type="text" required class="form-control" placeholder="Full name of visitor" />
          </div>
          <div class="form-group">
            <label>Relation to Patient *</label>
            <select v-model="logForm.relation" required class="form-control">
              <option value="">Select relation</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Relative">Relative</option>
              <option value="Friend">Friend</option>
              <option value="Guardian">Guardian</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div v-if="store.error" class="alert-danger">{{ store.error }}</div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showLogModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Logging...' : 'Log Visitor' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useReceptionistStore } from '@/stores/receptionist'

const store = useReceptionistStore()

const dateFilter = ref(new Date().toISOString().split('T')[0])
const patientIdFilter = ref<number | ''>('')
const showLogModal = ref(false)

const logForm = reactive({ patient_id: 0, visitor_name: '', relation: '' })

function loadVisitors() {
  store.fetchVisitors(
    dateFilter.value || undefined,
    patientIdFilter.value ? Number(patientIdFilter.value) : undefined
  )
}

function resetFilters() {
  dateFilter.value = new Date().toISOString().split('T')[0]
  patientIdFilter.value = ''
  loadVisitors()
}

function openLogModal() {
  store.clearError()
  Object.assign(logForm, { patient_id: 0, visitor_name: '', relation: '' })
  showLogModal.value = true
}

async function submitLog() {
  const result = await store.logVisitor({
    patient_id: logForm.patient_id,
    visitor_name: logForm.visitor_name,
    relation: logForm.relation,
  })
  if (result) showLogModal.value = false
}

async function handleCheckout(id: number) {
  if (!confirm('Mark this visitor as checked out?')) return
  await store.checkoutVisitor(id)
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getDuration(timeIn: string, timeOut?: string): string {
  const start = new Date(timeIn).getTime()
  const end = timeOut ? new Date(timeOut).getTime() : Date.now()
  const diffMs = end - start
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

onMounted(loadVisitors)
</script>

<style scoped>
.visitors-view { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 { margin: 0; color: #333; font-size: 1.8rem; }

.filters-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.filter-input { padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; background: white; }
.filter-input.narrow { width: 130px; }

.alert-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #666; gap: 1rem; }
.spinner { width: 36px; height: 36px; border: 4px solid #f0f0f0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-container { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: auto; }
.no-data { text-align: center; padding: 3rem; color: #888; }
.visitors-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.visitors-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
.visitors-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.visitors-table tr:last-child td { border-bottom: none; }
.visitors-table tr:hover td { background: #f9fafb; }

.idx-cell { color: #9ca3af; font-size: 0.85rem; }
.visitor-name { font-weight: 600; color: #111; }
.relation-badge { background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.55rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
.patient-cell { display: flex; flex-direction: column; gap: 0.1rem; }
.patient-name { font-weight: 600; color: #111; }
.pat-code { font-size: 0.78rem; color: #6b7280; }
.time-out { color: #374151; }
.still-inside { color: #16a34a; font-weight: 600; font-size: 0.85rem; }
.duration { color: #6b7280; font-size: 0.85rem; }
.duration.ongoing { color: #d97706; }
.checked-out-label { color: #9ca3af; font-size: 0.82rem; }

.btn-primary  { background: #667eea; color: white; border: none; padding: 0.55rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:hover { background: #5a6fd6; }
.btn-secondary { background: white; color: #667eea; border: 1px solid #667eea; padding: 0.55rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-ghost { background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.55rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-sm { padding: 0.3rem 0.7rem; border-radius: 5px; font-size: 0.8rem; border: none; cursor: pointer; font-weight: 500; }
.btn-sm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-warning { background: #d97706; color: white; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 12px; width: 90%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { margin: 0; font-size: 1.2rem; color: #111; }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280; }
.modal-form { padding: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.4rem; }
.form-control { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
</style>
