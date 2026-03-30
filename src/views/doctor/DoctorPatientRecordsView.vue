<template>
  <div class="patients">
    <div class="header">
      <h1>Patient Records</h1>
      <div class="filters">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by name or ID"
          class="filter-input"
        />
        <button @click="applyFilters" class="btn btn-primary">Search</button>
      </div>
    </div>

    <div v-if="doctorStore.error" class="alert alert-error">
      {{ doctorStore.error }}
      <button @click="doctorStore.clearError">×</button>
    </div>

    <div v-if="doctorStore.loading" class="loading">
      <span>Loading patient records...</span>
    </div>

    <div v-else-if="doctorStore.patients.length === 0" class="no-data">
      <p>No patients found</p>
    </div>

    <div v-else class="patients-grid">
      <div v-for="patient in doctorStore.patients" :key="patient.id" class="patient-card">
        <div class="card-header">
          <h3>{{ patient.full_name }}</h3>
          <span class="patient-id">#{{ patient.id }}</span>
        </div>
        <div class="card-details">
          <div class="detail">
            <span class="label">Age:</span>
            <span>{{ getAge(patient.date_of_birth) }}</span>
          </div>
          <div class="detail">
            <span class="label">Gender:</span>
            <span>{{ patient.gender }}</span>
          </div>
          <div class="detail">
            <span class="label">Blood Group:</span>
            <span>{{ patient.blood_group || 'N/A' }}</span>
          </div>
          <div class="detail">
            <span class="label">Contact:</span>
            <span>{{ patient.phone }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button @click="viewPatientEHR(patient.id)" class="btn btn-primary">
            View EHR
          </button>
          <button @click="openVitalModal(patient.id)" class="btn btn-info">Record Vital</button>
        </div>
      </div>
    </div>

    <!-- Patient EHR Modal -->
    <div v-if="selectedPatient" class="modal-overlay" @click="selectedPatient = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedPatient = null">×</button>
        <h2>{{ selectedPatient.full_name }} - EHR</h2>

        <div class="ehr-tabs">
          <button
            v-for="tab in ['vitals', 'notes', 'history']"
            :key="tab"
            @click="activeTab = tab"
            :class="['tab-btn', { active: activeTab === tab }]"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </div>

        <div v-if="activeTab === 'vitals'" class="tab-content">
          <div v-if="selectedPatient.vitals?.length > 0" class="vitals-list">
            <div v-for="vital in selectedPatient.vitals" :key="vital.id" class="vital-item">
              <p><strong>{{ formatDate(vital.recorded_at) }}</strong></p>
              <div class="vital-row">
                <span>BP: {{ vital.blood_pressure }}</span>
                <span>HR: {{ vital.heart_rate }} bpm</span>
                <span>Temp: {{ vital.temperature }}°C</span>
                <span>RR: {{ vital.respiratory_rate }}</span>
                <span>O₂: {{ vital.oxygen_saturation }}%</span>
              </div>
            </div>
          </div>
          <p v-else class="no-data">No vitals recorded</p>
          <button @click="openVitalModal(selectedPatient.id)" class="btn btn-primary">
            Add Vital
          </button>
        </div>

        <div v-if="activeTab === 'notes'" class="tab-content">
          <div v-if="selectedPatient.clinical_notes?.length > 0" class="notes-list">
            <div v-for="note in selectedPatient.clinical_notes" :key="note.id" class="note-item">
              <p class="note-date"><strong>{{ formatDate(note.created_at) }}</strong></p>
              <p><strong>Chief Complaint:</strong> {{ note.chief_complaint }}</p>
              <p><strong>Diagnosis:</strong> {{ note.diagnosis }}</p>
              <p><strong>Treatment Plan:</strong> {{ note.treatment_plan }}</p>
            </div>
          </div>
          <p v-else class="no-data">No clinical notes</p>
          <button @click="openNoteModal(selectedPatient.id)" class="btn btn-primary">
            Add Note
          </button>
        </div>

        <div v-if="activeTab === 'history'" class="tab-content">
          <p><strong>Medical History:</strong></p>
          <p>{{ selectedPatient.medical_history || 'No history recorded' }}</p>
        </div>
      </div>
    </div>

    <!-- Record Vital Modal -->
    <div v-if="recordingVital" class="modal-overlay" @click="recordingVital = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="recordingVital = false">×</button>
        <h2>Record Vital Signs</h2>
        <div class="form-group">
          <label>Blood Pressure (e.g., 120/80):</label>
          <input v-model="vitalForm.blood_pressure" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Heart Rate (bpm):</label>
          <input v-model.number="vitalForm.heart_rate" type="number" class="form-control" />
        </div>
        <div class="form-group">
          <label>Temperature (°C):</label>
          <input v-model.number="vitalForm.temperature" type="number" class="form-control" />
        </div>
        <div class="form-group">
          <label>Respiratory Rate:</label>
          <input
            v-model.number="vitalForm.respiratory_rate"
            type="number"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label>Oxygen Saturation (%):</label>
          <input
            v-model.number="vitalForm.oxygen_saturation"
            type="number"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label>Weight (kg, optional):</label>
          <input v-model.number="vitalForm.weight" type="number" class="form-control" />
        </div>
        <div class="form-group">
          <label>Notes (optional):</label>
          <textarea v-model="vitalForm.notes" class="form-control" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="handleRecordVital" class="btn btn-primary">Record</button>
          <button @click="recordingVital = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Add Clinical Note Modal -->
    <div v-if="addingNote" class="modal-overlay" @click="addingNote = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="addingNote = false">×</button>
        <h2>Add Clinical Note</h2>
        <div class="form-group">
          <label>Chief Complaint:</label>
          <input v-model="noteForm.chief_complaint" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Diagnosis:</label>
          <input v-model="noteForm.diagnosis" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>ICD-10 Code (optional):</label>
          <input v-model="noteForm.diagnosis_icd10" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label>Treatment Plan:</label>
          <textarea v-model="noteForm.treatment_plan" class="form-control" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>Follow-up Date (optional):</label>
          <input v-model="noteForm.follow_up_date" type="date" class="form-control" />
        </div>
        <div class="modal-actions">
          <button @click="handleAddNote" class="btn btn-primary">Save Note</button>
          <button @click="addingNote = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDoctorStore } from '@/stores/doctor'

const doctorStore = useDoctorStore()

const filters = ref({ search: '' })
const selectedPatient = ref<any>(null)
const activeTab = ref('vitals')
const recordingVital = ref(false)
const addingNote = ref(false)

const vitalForm = ref({
  blood_pressure: '',
  heart_rate: 0,
  temperature: 0,
  respiratory_rate: 0,
  oxygen_saturation: 0,
  weight: undefined,
  notes: '',
})

const noteForm = ref({
  chief_complaint: '',
  diagnosis: '',
  diagnosis_icd10: '',
  treatment_plan: '',
  follow_up_date: '',
  notes: '',
})

onMounted(async () => {
  await doctorStore.loadPatients()
})

const applyFilters = async () => {
  await doctorStore.loadPatients(filters.value)
}

const getAge = (dob: string) => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  if (today.getMonth() < birthDate.getMonth()) age--
  return age
}

const viewPatientEHR = async (patientId: number) => {
  await doctorStore.fetchPatientEHR(patientId)
  selectedPatient.value = doctorStore.currentPatient
  activeTab.value = 'vitals'
}

const openVitalModal = (patientId: number) => {
  selectedPatient.value = doctorStore.patients.find((p: any) => p.id === patientId) || null
  recordingVital.value = true
}

const openNoteModal = (patientId: number) => {
  selectedPatient.value = doctorStore.patients.find((p: any) => p.id === patientId) || null
  addingNote.value = true
}

const handleRecordVital = async () => {
  if (!selectedPatient.value) return
  try {
    await doctorStore.recordVital(selectedPatient.value.id, { ...vitalForm.value })
    recordingVital.value = false
    vitalForm.value = {
      blood_pressure: '',
      heart_rate: 0,
      temperature: 0,
      respiratory_rate: 0,
      oxygen_saturation: 0,
      weight: undefined,
      notes: '',
    }
    await viewPatientEHR(selectedPatient.value.id)
  } catch (err) {
    console.error('Failed to record vital:', err)
  }
}

const handleAddNote = async () => {
  if (!selectedPatient.value) return
  try {
    await doctorStore.createClinicalNote(selectedPatient.value.id, { ...noteForm.value })
    addingNote.value = false
    noteForm.value = {
      chief_complaint: '',
      diagnosis: '',
      diagnosis_icd10: '',
      treatment_plan: '',
      follow_up_date: '',
      notes: '',
    }
    await viewPatientEHR(selectedPatient.value.id)
  } catch (err) {
    console.error('Failed to add clinical note:', err)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.patients {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  margin-bottom: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
}

.patients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.patient-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.patient-card:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.patient-id {
  color: #999;
  font-size: 0.9rem;
}

.card-details {
  margin-bottom: 1rem;
}

.detail {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.detail .label {
  font-weight: 600;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #764ba2;
}

.btn-secondary {
  background-color: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
}

.ehr-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  margin-bottom: 1rem;
}

.vitals-list,
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vital-item,
.note-item {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.vital-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.note-date {
  color: #999;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .patients-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    min-width: auto;
    width: 95%;
  }
}
</style>
