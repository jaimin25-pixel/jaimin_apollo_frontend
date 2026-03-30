<template>
  <div class="prescriptions">
    <div class="header">
      <h1>Prescriptions</h1>
      <router-link to="/doctor/prescriptions/create" class="btn btn-primary">
        Create Prescription
      </router-link>
    </div>

    <div v-if="doctorStore.error" class="alert alert-error">
      {{ doctorStore.error }}
      <button @click="doctorStore.clearError">×</button>
    </div>

    <div v-if="doctorStore.loading" class="loading">
      <span>Loading prescriptions...</span>
    </div>

    <div v-else-if="doctorStore.prescriptions.length === 0" class="no-data">
      <p>No prescriptions yet. Create one to get started.</p>
    </div>

    <div v-else class="prescriptions-list">
      <div v-for="rx in doctorStore.prescriptions" :key="rx.id" class="prescription-card">
        <div class="card-header">
          <div>
            <h3>{{ rx.patient_name }}</h3>
            <p class="patient-id">Patient ID: {{ rx.patient_id }}</p>
          </div>
          <span :class="`badge badge-${rx.status}`">{{ rx.status }}</span>
        </div>

        <div class="card-body">
          <div class="detail-row">
            <span class="label">Date Issued:</span>
            <span>{{ formatDate(rx.issued_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Diagnosis:</span>
            <span>{{ rx.diagnosis }}</span>
          </div>
          <div v-if="rx.diagnosis_icd10" class="detail-row">
            <span class="label">ICD-10:</span>
            <span>{{ rx.diagnosis_icd10 }}</span>
          </div>

          <div class="medicines-section">
            <h4>Medicines</h4>
            <div v-if="rx.items?.length > 0" class="medicines-list">
              <div v-for="(item, idx) in rx.items" :key="idx" class="medicine-item">
                <p>
                  <strong>{{ item.medicine_name }}</strong> - {{ item.strength }}
                </p>
                <p>
                  {{ item.frequency }} for {{ item.duration_days }} days
                </p>
                <p v-if="item.instructions" class="instructions">
                  {{ item.instructions }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="rx.notes" class="notes-section">
            <h4>Notes</h4>
            <p>{{ rx.notes }}</p>
          </div>

          <div class="status-info">
            <div class="status-row">
              <span>Dispensing Status:</span>
              <span class="status-badge">{{ rx.dispensing_status || 'pending' }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button @click="viewPrescriptionDetails(rx.id)" class="btn btn-primary">
            View Full Details
          </button>
          <button @click="downloadPrescription(rx)" class="btn btn-secondary">
            Download
          </button>
        </div>
      </div>
    </div>

    <!-- Prescription Details Modal -->
    <div v-if="selectedPrescription" class="modal-overlay" @click="selectedPrescription = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedPrescription = null">×</button>
        <div class="prescription-print">
          <h2>Prescription Details</h2>

          <div class="prescription-header">
            <h3>Apollo Hospital</h3>
            <p>Medical Prescription</p>
          </div>

          <div class="prescription-body">
            <div class="row">
              <div class="col">
                <p><strong>Date:</strong> {{ formatDate(selectedPrescription.issued_date) }}</p>
              </div>
              <div class="col">
                <p><strong>Prescription ID:</strong> {{ selectedPrescription.id }}</p>
              </div>
            </div>

            <div class="patient-info">
              <h4>Patient Information</h4>
              <p><strong>Name:</strong> {{ selectedPrescription.patient_name }}</p>
              <p><strong>ID:</strong> {{ selectedPrescription.patient_id }}</p>
            </div>

            <div class="diagnosis-info">
              <h4>Diagnosis</h4>
              <p>{{ selectedPrescription.diagnosis }}</p>
              <p v-if="selectedPrescription.diagnosis_icd10">
                ICD-10: {{ selectedPrescription.diagnosis_icd10 }}
              </p>
            </div>

            <div class="medicines-section">
              <h4>Prescribed Medicines</h4>
              <table class="medicines-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Strength</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in selectedPrescription.items" :key="idx">
                    <td>{{ item.medicine_name }}</td>
                    <td>{{ item.strength }}</td>
                    <td>{{ item.frequency }}</td>
                    <td>{{ item.duration_days }} days</td>
                    <td>{{ item.instructions || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="selectedPrescription.notes" class="notes-section">
              <h4>Additional Notes</h4>
              <p>{{ selectedPrescription.notes }}</p>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="downloadPrescription(selectedPrescription)" class="btn btn-primary">
            Download PDF
          </button>
          <button @click="printPrescription" class="btn btn-secondary">Print</button>
          <button @click="selectedPrescription = null" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDoctorStore } from '@/stores/doctor'

const doctorStore = useDoctorStore()
const selectedPrescription = ref<any>(null)

onMounted(async () => {
  await doctorStore.loadPrescriptions()
})

const viewPrescriptionDetails = async (rxId: number) => {
  await doctorStore.fetchPrescription(rxId)
  selectedPrescription.value = doctorStore.currentPrescription
}

const downloadPrescription = (rx: any) => {
  const element = document.createElement('a')
  const text = formatPrescriptionForDownload(rx)
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  )
  element.setAttribute('download', `prescription-${rx.id}.txt`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const printPrescription = () => {
  window.print()
}

const formatPrescriptionForDownload = (rx: any) => {
  let text = 'APOLLO HOSPITAL - PRESCRIPTION\n'
  text += '================================\n\n'
  text += `Date: ${formatDate(rx.issued_date)}\n`
  text += `Prescription ID: ${rx.id}\n\n`
  text += `PATIENT INFORMATION\n`
  text += `Name: ${rx.patient_name}\n`
  text += `ID: ${rx.patient_id}\n\n`
  text += `DIAGNOSIS\n`
  text += `${rx.diagnosis}\n`
  if (rx.diagnosis_icd10) text += `ICD-10: ${rx.diagnosis_icd10}\n`
  text += '\nPRESCRIBED MEDICINES\n'
  if (rx.items && rx.items.length > 0) {
    rx.items.forEach((item: any, idx: number) => {
      text += `\n${idx + 1}. ${item.medicine_name} - ${item.strength}\n`
      text += `   Frequency: ${item.frequency}\n`
      text += `   Duration: ${item.duration_days} days\n`
      if (item.instructions) text += `   Instructions: ${item.instructions}\n`
    })
  }
  if (rx.notes) text += `\nNOTES\n${rx.notes}\n`
  return text
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.prescriptions {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: #333;
  margin: 0;
  font-size: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.prescriptions-list {
  display: grid;
  gap: 1.5rem;
}

.prescription-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.prescription-card:hover {
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
  margin: 0 0 0.5rem 0;
  color: #333;
}

.patient-id {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-pending {
  background-color: #fff3cd;
  color: #856404;
}

.badge-dispensed {
  background-color: #d4edda;
  color: #155724;
}

.badge-partial {
  background-color: #d1ecf1;
  color: #0c5460;
}

.card-body {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.label {
  font-weight: 600;
  color: #666;
  min-width: 120px;
}

.medicines-section,
.notes-section {
  margin: 1rem 0;
}

.medicines-section h4,
.notes-section h4 {
  color: #333;
  margin: 0.5rem 0;
}

.medicines-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.medicine-item {
  background: #f9f9f9;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.medicine-item p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.instructions {
  color: #666;
  font-style: italic;
}

.status-info {
  background: #f9f9f9;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.status-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.status-badge {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 1rem;
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
  min-width: 600px;
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

.prescription-print h2 {
  margin-top: 0;
  color: #333;
}

.prescription-header {
  text-align: center;
  margin: 2rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #666;
}

.prescription-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.prescription-body {
  margin: 1.5rem 0;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.col {
  font-size: 0.95rem;
}

.patient-info,
.diagnosis-info {
  margin: 1rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 3px solid #667eea;
}

.medicines-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.medicines-table th {
  background-color: #f5f5f5;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.medicines-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@print {
  .modal-close,
  .modal-actions {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content {
    min-width: auto;
    width: 95%;
  }

  .row {
    grid-template-columns: 1fr;
  }
}
</style>
