<template>
  <div class="create-prescription">
    <div class="header">
      <h1>Create Prescription</h1>
      <router-link to="/doctor/prescriptions" class="btn btn-secondary">← Back</router-link>
    </div>

    <div v-if="doctorStore.error" class="alert alert-error">
      {{ doctorStore.error }}
      <button @click="doctorStore.clearError">×</button>
    </div>

    <form @submit.prevent="handleSubmit" class="prescription-form">
      <div class="form-section">
        <h2>Patient Information</h2>
        <div class="form-group">
          <label>Patient ID *</label>
          <input
            v-model.number="form.patient_id"
            type="number"
            class="form-control"
            required
          />
          <small>Select or search patient</small>
        </div>

        <div v-if="selectedPatient" class="patient-preview">
          <p><strong>{{ selectedPatient.full_name }}</strong></p>
          <p>Age: {{ getAge(selectedPatient.date_of_birth) }} | Gender: {{ selectedPatient.gender }}</p>
        </div>

        <div class="form-group">
          <label>Appointment ID (optional)</label>
          <input
            v-model.number="form.appointment_id"
            type="number"
            class="form-control"
          />
        </div>
      </div>

      <div class="form-section">
        <h2>Diagnosis</h2>
        <div class="form-group">
          <label>Diagnosis *</label>
          <textarea
            v-model="form.diagnosis"
            class="form-control"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>ICD-10 Code (optional)</label>
          <input
            v-model="form.diagnosis_icd10"
            type="text"
            class="form-control"
            placeholder="e.g., J00"
          />
        </div>
      </div>

      <div class="form-section">
        <h2>Medicines</h2>
        <div v-for="(item, idx) in form.items" :key="idx" class="medicine-input-group">
          <div class="medicine-header">
            <h4>Medicine {{ idx + 1 }}</h4>
            <button
              v-if="form.items.length > 1"
              type="button"
              @click="removeMedicine(idx)"
              class="btn btn-danger btn-small"
            >
              Remove
            </button>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Medicine Name *</label>
              <input
                v-model="item.medicine_name"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label>Strength *</label>
              <input
                v-model="item.strength"
                type="text"
                class="form-control"
                placeholder="e.g., 500mg"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Frequency *</label>
              <input
                v-model="item.frequency"
                type="text"
                class="form-control"
                placeholder="e.g., twice daily"
                required
              />
            </div>

            <div class="form-group">
              <label>Duration (days) *</label>
              <input
                v-model.number="item.duration_days"
                type="number"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Special Instructions (optional)</label>
            <textarea
              v-model="item.instructions"
              class="form-control"
              rows="2"
              placeholder="e.g., Take with food, avoid dairy"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Quantity (optional)</label>
            <input
              v-model.number="item.quantity"
              type="number"
              class="form-control"
            />
          </div>
        </div>

        <button type="button" @click="addMedicine" class="btn btn-secondary btn-wide">
          + Add Another Medicine
        </button>
      </div>

      <div class="form-section">
        <h2>Additional Notes</h2>
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea
            v-model="form.notes"
            class="form-control"
            rows="4"
            placeholder="Any special instructions or follow-up notes"
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-large" :disabled="doctorStore.loading">
          {{ doctorStore.loading ? 'Creating...' : 'Create Prescription' }}
        </button>
        <router-link to="/doctor/prescriptions" class="btn btn-secondary btn-large">
          Cancel
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '@/stores/doctor'

const router = useRouter()
const doctorStore = useDoctorStore()

const selectedPatient = ref<any>(null)

const form = ref({
  patient_id: null,
  appointment_id: undefined,
  diagnosis: '',
  diagnosis_icd10: '',
  notes: '',
  items: [
    {
      medicine_name: '',
      strength: '',
      frequency: '',
      duration_days: 7,
      instructions: '',
      quantity: undefined,
    },
  ],
})

watch(
  () => form.value.patient_id,
  (patientId) => {
    if (patientId) {
      selectedPatient.value = doctorStore.patients.find(
        (p: any) => p.id === patientId
      )
    }
  }
)

const addMedicine = () => {
  form.value.items.push({
    medicine_name: '',
    strength: '',
    frequency: '',
    duration_days: 7,
    instructions: '',
    quantity: undefined,
  })
}

const removeMedicine = (idx: number) => {
  form.value.items.splice(idx, 1)
}

const getAge = (dob: string) => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  if (today.getMonth() < birthDate.getMonth()) age--
  return age
}

const handleSubmit = async () => {
  if (!form.value.patient_id || !form.value.diagnosis) {
    return
  }

  try {
    await doctorStore.createPrescription({
      patient_id: form.value.patient_id,
      appointment_id: form.value.appointment_id || undefined,
      diagnosis: form.value.diagnosis,
      diagnosis_icd10: form.value.diagnosis_icd10 || undefined,
      notes: form.value.notes || undefined,
      items: form.value.items,
    })

    router.push('/doctor/prescriptions')
  } catch (err) {
    console.error('Failed to create prescription:', err)
  }
}
</script>

<style scoped>
.create-prescription {
  animation: fadeIn 0.3s ease;
  max-width: 800px;
  margin: 0 auto;
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

.btn-primary:hover:not(:disabled) {
  background-color: #764ba2;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-large {
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

.btn-wide {
  width: 100%;
  margin-top: 1rem;
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

.prescription-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  color: #333;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
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

.form-control::placeholder {
  color: #999;
}

small {
  display: block;
  margin-top: 0.25rem;
  color: #999;
  font-size: 0.85rem;
}

.patient-preview {
  background: #f0f4ff;
  padding: 1rem;
  border-radius: 4px;
  border-left: 3px solid #667eea;
  margin-bottom: 1rem;
}

.patient-preview p {
  margin: 0.25rem 0;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.medicine-input-group {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border-left: 3px solid #667eea;
}

.medicine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.medicine-header h4 {
  margin: 0;
  color: #333;
}

.form-actions {
  padding: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  border-radius: 0 0 8px 8px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-large {
    width: 100%;
  }
}
</style>
