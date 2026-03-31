<template>
  <div class="admissions-view">
    <h1>IPD Admissions</h1>

    <!-- Patient Search -->
    <div class="search-section">
      <div class="search-bar">
        <input v-model="searchQuery" @keyup.enter="searchPatient" type="text"
          placeholder="Search patient to view admissions..." class="search-input" />
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
      </div>
      <button @click="clearSelection" class="btn-outline-sm">Change Patient</button>
    </div>

    <div v-if="store.loading" class="loading-state"><div class="spinner"></div><p>Loading...</p></div>
    <div v-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <!-- Admissions List -->
    <div v-if="selectedPatient && store.admissions.length > 0" class="admissions-grid">
      <div v-for="a in store.admissions" :key="a.admission_id" class="admission-card"
           @click="selectedAdmission = a">
        <div class="adm-header">
          <span class="adm-id">#{{ a.admission_id }}</span>
          <span class="status-badge" :class="a.status">{{ a.status }}</span>
        </div>
        <div class="adm-body">
          <div class="adm-row"><strong>Doctor:</strong> {{ a.admitting_doctor?.full_name || '—' }}</div>
          <div class="adm-row"><strong>Ward:</strong> {{ a.ward?.name || '—' }} ({{ a.ward?.ward_type || '' }})</div>
          <div class="adm-row"><strong>Bed:</strong> {{ a.bed?.bed_number || '—' }}</div>
          <div class="adm-row"><strong>Department:</strong> {{ a.department?.name || '—' }}</div>
          <div class="adm-row"><strong>Admitted:</strong> {{ formatDate(a.admitted_at) }}</div>
          <div v-if="a.discharged_at" class="adm-row"><strong>Discharged:</strong> {{ formatDate(a.discharged_at) }}</div>
        </div>
        <div v-if="a.diagnosis" class="adm-diagnosis">
          <strong>Diagnosis:</strong> {{ a.diagnosis }}
        </div>
      </div>
    </div>

    <div v-else-if="selectedPatient && !store.loading" class="no-data">
      <p>No admissions found for this patient.</p>
    </div>

    <!-- Admission Detail Modal -->
    <div v-if="selectedAdmission" class="modal-overlay" @click.self="selectedAdmission = null">
      <div class="modal">
        <div class="modal-header">
          <h2>Admission Detail #{{ selectedAdmission.admission_id }}</h2>
          <button @click="selectedAdmission = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item"><label>Status</label><span class="status-badge" :class="selectedAdmission.status">{{ selectedAdmission.status }}</span></div>
            <div class="detail-item"><label>Patient</label><span>{{ selectedAdmission.patient?.full_name }}</span></div>
            <div class="detail-item"><label>Doctor</label><span>{{ selectedAdmission.admitting_doctor?.full_name }}</span></div>
            <div class="detail-item"><label>Department</label><span>{{ selectedAdmission.department?.name }}</span></div>
            <div class="detail-item"><label>Ward</label><span>{{ selectedAdmission.ward?.name }} ({{ selectedAdmission.ward?.ward_type }})</span></div>
            <div class="detail-item"><label>Bed</label><span>{{ selectedAdmission.bed?.bed_number }} — {{ selectedAdmission.bed?.bed_type }}</span></div>
            <div class="detail-item"><label>Admitted At</label><span>{{ formatDate(selectedAdmission.admitted_at) }}</span></div>
            <div class="detail-item" v-if="selectedAdmission.discharged_at"><label>Discharged At</label><span>{{ formatDate(selectedAdmission.discharged_at) }}</span></div>
          </div>
          <div v-if="selectedAdmission.diagnosis" class="detail-section">
            <h3>Diagnosis</h3>
            <p>{{ selectedAdmission.diagnosis }}</p>
          </div>
          <div v-if="selectedAdmission.treatment_plan" class="detail-section">
            <h3>Treatment Plan</h3>
            <p>{{ selectedAdmission.treatment_plan }}</p>
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
import type { Patient, AdmissionFull } from '@/types'

const store = usePatientStore()
const searchQuery = ref('')
const patientResults = ref<Patient[]>([])
const selectedPatient = ref<Patient | null>(null)
const selectedAdmission = ref<AdmissionFull | null>(null)

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
  await store.fetchAdmissions(p.patient_id)
}

function clearSelection() { selectedPatient.value = null; store.admissions = [] }
</script>

<style scoped>
.admissions-view { animation: fadeIn 0.4s ease; }
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
.selected-info { display: flex; align-items: center; gap: 0.75rem; }
.pat-badge { background: linear-gradient(135deg, #0d9488, #065f46); color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
.selected-name { font-weight: 700; color: #0f172a; }
.btn-outline-sm { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #64748b; gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0d9488; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 0.8rem; border-radius: 10px; margin-bottom: 1rem; }

.admissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }
.admission-card { background: white; border-radius: 16px; padding: 1.25rem; box-shadow: 0 4px 16px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.3s; border-left: 4px solid #f59e0b; }
.admission-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.adm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.adm-id { font-weight: 700; color: #0f172a; }
.adm-body { margin-bottom: 0.5rem; }
.adm-row { font-size: 0.88rem; color: #475569; padding: 0.2rem 0; }
.adm-diagnosis { font-size: 0.85rem; color: #64748b; padding-top: 0.5rem; border-top: 1px solid #f1f5f9; }

.status-badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-badge.admitted { background: #fef3c7; color: #92400e; }
.status-badge.discharged { background: #dcfce7; color: #166534; }
.status-badge.transferred { background: #dbeafe; color: #1e40af; }

.no-data { text-align: center; padding: 3rem; color: #64748b; background: white; border-radius: 16px; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
.modal-header h2 { margin: 0; color: #064e3b; font-size: 1.2rem; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 1.5rem; }

.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
.detail-item { display: flex; flex-direction: column; gap: 0.2rem; }
.detail-item label { font-size: 0.78rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
.detail-item span { font-size: 0.9rem; color: #1e293b; }
.detail-section { margin-bottom: 1rem; }
.detail-section h3 { color: #064e3b; font-size: 1rem; margin-bottom: 0.5rem; }
.detail-section p { color: #475569; font-size: 0.9rem; line-height: 1.5; }
</style>
