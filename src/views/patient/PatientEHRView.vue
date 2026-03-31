<template>
  <div class="ehr-view">
    <h1>Electronic Health Records</h1>

    <!-- Patient Search -->
    <div class="search-section">
      <div class="search-bar">
        <input v-model="searchQuery" @keyup.enter="searchPatient" type="text"
          placeholder="Search patient to view EHR..." class="search-input" />
        <button @click="searchPatient" class="search-btn">Search</button>
      </div>
    </div>

    <div v-if="patientResults.length > 0 && !selectedPatient" class="patient-chips">
      <button v-for="p in patientResults" :key="p.patient_id" @click="selectPatient(p)" class="patient-chip">
        <span class="chip-code">{{ p.pat_code }}</span> {{ p.full_name }}
      </button>
    </div>

    <div v-if="selectedPatient" class="selected-patient-bar">
      <div class="selected-info">
        <span class="pat-badge">{{ selectedPatient.pat_code }}</span>
        <span class="selected-name">{{ selectedPatient.full_name }}</span>
        <span class="patient-meta">{{ selectedPatient.gender }} · {{ selectedPatient.blood_group || '—' }} · {{ selectedPatient.contact_number }}</span>
      </div>
      <button @click="clearSelection" class="btn-outline-sm">Change Patient</button>
    </div>

    <div v-if="store.loading" class="loading-state"><div class="spinner"></div><p>Loading EHR...</p></div>
    <div v-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <!-- EHR Tabs -->
    <div v-if="selectedPatient && store.ehr" class="ehr-content">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key">
          {{ tab.label }} <span class="tab-count">{{ getCount(tab.key) }}</span>
        </button>
      </div>

      <!-- Visits -->
      <div v-if="activeTab === 'visits'" class="tab-content">
        <div v-if="store.ehr.visits.length === 0" class="empty-tab">No visit records found.</div>
        <div v-for="v in store.ehr.visits" :key="v.appt_id" class="ehr-card">
          <div class="ehr-card-header">
            <span class="ehr-date">{{ formatDate(v.scheduled_at) }}</span>
            <span class="status-badge" :class="v.status">{{ v.status.replace('_',' ') }}</span>
          </div>
          <div class="ehr-card-body">
            <div><strong>Doctor:</strong> {{ v.doctor?.full_name || '—' }}</div>
            <div><strong>Department:</strong> {{ v.department?.name || '—' }}</div>
            <div v-if="v.chief_complaint"><strong>Complaint:</strong> {{ v.chief_complaint }}</div>
          </div>
        </div>
      </div>

      <!-- Clinical Notes -->
      <div v-if="activeTab === 'notes'" class="tab-content">
        <div v-if="store.ehr.clinical_notes.length === 0" class="empty-tab">No clinical notes found.</div>
        <div v-for="n in store.ehr.clinical_notes" :key="n.note_id" class="ehr-card">
          <div class="ehr-card-header">
            <span class="ehr-date">{{ formatDate(n.created_at) }}</span>
            <span v-if="n.icd10_code" class="icd-badge">{{ n.icd10_code }}</span>
          </div>
          <div class="ehr-card-body">
            <div><strong>Doctor:</strong> {{ n.doctor?.full_name || '—' }}</div>
            <div class="note-text">{{ n.notes }}</div>
          </div>
        </div>
      </div>

      <!-- Prescriptions -->
      <div v-if="activeTab === 'prescriptions'" class="tab-content">
        <div v-if="store.ehr.prescriptions.length === 0" class="empty-tab">No prescriptions found.</div>
        <div v-for="rx in store.ehr.prescriptions" :key="rx.rx_id" class="ehr-card">
          <div class="ehr-card-header">
            <span class="ehr-date">{{ formatDate(rx.created_at) }}</span>
            <span class="status-badge" :class="rx.status">{{ rx.status.replace('_',' ') }}</span>
          </div>
          <div class="ehr-card-body">
            <div><strong>Doctor:</strong> {{ rx.doctor?.full_name || '—' }}</div>
            <div v-if="rx.diagnosis"><strong>Diagnosis:</strong> {{ rx.diagnosis }}</div>
            <div v-if="rx.items && rx.items.length" class="rx-items">
              <div v-for="item in rx.items" :key="item.item_id" class="rx-item">
                {{ item.dosage }} · {{ item.frequency }} · {{ item.duration }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lab Results -->
      <div v-if="activeTab === 'lab'" class="tab-content">
        <div v-if="store.ehr.lab_results.length === 0" class="empty-tab">No lab results found.</div>
        <div v-for="lab in store.ehr.lab_results" :key="lab.order_id" class="ehr-card">
          <div class="ehr-card-header">
            <span class="ehr-date">{{ formatDate(lab.ordered_at) }}</span>
            <span class="status-badge" :class="lab.status">{{ lab.status.replace('_',' ') }}</span>
          </div>
          <div class="ehr-card-body">
            <div><strong>Test:</strong> {{ lab.test?.test_name || `Test #${lab.test_id}` }}</div>
            <div><strong>Doctor:</strong> {{ lab.doctor?.full_name || '—' }}</div>
            <div v-if="lab.result_value"><strong>Result:</strong>
              <span :class="{ abnormal: lab.is_abnormal }">{{ lab.result_value }}</span>
              <span v-if="lab.is_abnormal" class="abnormal-flag">⚠️ Abnormal</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vitals -->
      <div v-if="activeTab === 'vitals'" class="tab-content">
        <div v-if="store.ehr.vitals.length === 0" class="empty-tab">No vital records found.</div>
        <div class="vitals-grid">
          <div v-for="v in store.ehr.vitals" :key="v.vital_id" class="vital-card" :class="{ critical: v.is_critical }">
            <div class="vital-header">
              <span class="ehr-date">{{ formatDate(v.recorded_at) }}</span>
              <span v-if="v.is_critical" class="critical-badge">⚠️ Critical</span>
            </div>
            <div class="vital-readings">
              <div v-if="v.temperature_c" class="vital-item">🌡️ {{ v.temperature_c }}°C</div>
              <div v-if="v.blood_pressure_systolic" class="vital-item">💉 {{ v.blood_pressure_systolic }}/{{ v.blood_pressure_diastolic }} mmHg</div>
              <div v-if="v.pulse_bpm" class="vital-item">❤️ {{ v.pulse_bpm }} bpm</div>
              <div v-if="v.spo2_percent" class="vital-item">🫁 SpO₂ {{ v.spo2_percent }}%</div>
              <div v-if="v.respiratory_rate" class="vital-item">💨 RR {{ v.respiratory_rate }}/min</div>
              <div v-if="v.blood_glucose_mgdl" class="vital-item">🩸 {{ v.blood_glucose_mgdl }} mg/dL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePatientStore } from '@/stores/patient'
import * as patientApi from '@/api/patient'
import type { Patient } from '@/types'

const store = usePatientStore()
const searchQuery = ref('')
const patientResults = ref<Patient[]>([])
const selectedPatient = ref<Patient | null>(null)
const activeTab = ref('visits')

const tabs = [
  { key: 'visits', label: 'Visits' },
  { key: 'notes', label: 'Clinical Notes' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'lab', label: 'Lab Results' },
  { key: 'vitals', label: 'Vitals' },
]

function getCount(key: string): number {
  if (!store.ehr) return 0
  switch (key) {
    case 'visits': return store.ehr.visits?.length || 0
    case 'notes': return store.ehr.clinical_notes?.length || 0
    case 'prescriptions': return store.ehr.prescriptions?.length || 0
    case 'lab': return store.ehr.lab_results?.length || 0
    case 'vitals': return store.ehr.vitals?.length || 0
    default: return 0
  }
}

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function searchPatient() {
  patientResults.value = await patientApi.searchPatients(searchQuery.value) || []
  selectedPatient.value = null
}

async function selectPatient(p: Patient) {
  selectedPatient.value = p
  patientResults.value = []
  await store.fetchEHR(p.patient_id)
}

function clearSelection() { selectedPatient.value = null; store.ehr = null }
</script>

<style scoped>
.ehr-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
h1 { color: #064e3b; font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; }

.search-section { margin-bottom: 1.5rem; }
.search-bar { display: flex; gap: 0.75rem; }
.search-input { flex: 1; padding: 0.8rem 1.2rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
.search-input:focus { outline: none; border-color: #0d9488; }
.search-btn { padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #0d9488, #065f46); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }

.patient-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.patient-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.3s; }
.patient-chip:hover { border-color: #0d9488; background: #f0fdfa; }
.chip-code { font-size: 0.75rem; font-weight: 700; color: #0d9488; }

.selected-patient-bar { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 1.5rem; border-left: 4px solid #0d9488; }
.selected-info { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.pat-badge { background: linear-gradient(135deg, #0d9488, #065f46); color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
.selected-name { font-weight: 700; color: #0f172a; }
.patient-meta { font-size: 0.85rem; color: #64748b; text-transform: capitalize; }
.btn-outline-sm { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #64748b; gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0d9488; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 0.8rem; border-radius: 10px; margin-bottom: 1rem; }

/* Tabs */
.tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; background: white; border-radius: 12px; padding: 0.4rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.tab-btn {
  padding: 0.6rem 1rem; border: none; background: transparent; border-radius: 8px;
  cursor: pointer; font-weight: 500; font-size: 0.88rem; color: #64748b;
  transition: all 0.3s; display: flex; align-items: center; gap: 0.4rem;
}
.tab-btn.active { background: linear-gradient(135deg, #0d9488, #065f46); color: white; }
.tab-btn:hover:not(.active) { background: #f0fdfa; color: #0d9488; }
.tab-count { font-size: 0.72rem; background: rgba(255,255,255,0.25); padding: 0.1rem 0.4rem; border-radius: 4px; }
.tab-btn.active .tab-count { background: rgba(255,255,255,0.3); }

/* EHR Cards */
.tab-content { animation: fadeIn 0.3s ease; }
.empty-tab { text-align: center; padding: 2rem; color: #94a3b8; background: white; border-radius: 12px; }

.ehr-card {
  background: white; border-radius: 12px; padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 0.75rem;
  border-left: 3px solid #0d9488; transition: all 0.2s;
}
.ehr-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.ehr-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.ehr-date { font-size: 0.82rem; color: #64748b; font-weight: 500; }
.ehr-card-body { font-size: 0.88rem; color: #475569; }
.ehr-card-body > div { padding: 0.15rem 0; }
.note-text { margin-top: 0.5rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; line-height: 1.5; }

.icd-badge { background: #e0e7ff; color: #4338ca; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; }

.rx-items { margin-top: 0.5rem; padding-left: 1rem; }
.rx-item { font-size: 0.83rem; color: #64748b; padding: 0.15rem 0; }

.abnormal { color: #dc2626; font-weight: 600; }
.abnormal-flag { font-size: 0.75rem; margin-left: 0.5rem; }

.status-badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; text-transform: capitalize; }
.status-badge.scheduled { background: #dbeafe; color: #1e40af; }
.status-badge.checked_in { background: #fef3c7; color: #92400e; }
.status-badge.in_consultation { background: #e0e7ff; color: #4338ca; }
.status-badge.completed { background: #dcfce7; color: #166534; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.ordered { background: #dbeafe; color: #1e40af; }
.status-badge.in_progress { background: #e0e7ff; color: #4338ca; }

/* Vitals */
.vitals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
.vital-card {
  background: white; border-radius: 12px; padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-left: 3px solid #10b981;
}
.vital-card.critical { border-color: #dc2626; background: #fef2f2; }
.vital-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.critical-badge { font-size: 0.75rem; color: #dc2626; font-weight: 600; }
.vital-readings { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; }
.vital-item { font-size: 0.85rem; color: #475569; }
</style>
