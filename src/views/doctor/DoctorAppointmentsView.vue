<template>
  <div class="appointments">
    <div class="header">
      <h1>Appointments</h1>
      <div class="filters">
        <input
          v-model="filters.status"
          type="text"
          placeholder="Filter by status (e.g., pending, confirmed)"
          class="filter-input"
        />
        <input
          v-model="filters.date"
          type="date"
          placeholder="Filter by date"
          class="filter-input"
        />
        <button @click="applyFilters" class="btn btn-primary">Filter</button>
        <button @click="resetFilters" class="btn btn-secondary">Reset</button>
      </div>
    </div>

    <div v-if="doctorStore.error" class="alert alert-error">
      {{ doctorStore.error }}
      <button @click="doctorStore.clearError">×</button>
    </div>

    <div v-if="doctorStore.loading" class="loading">
      <span>Loading appointments...</span>
    </div>

    <div v-else-if="doctorStore.appointments.length === 0" class="no-data">
      <p>No appointments found</p>
    </div>

    <div v-else class="appointments-list">
      <div v-for="appt in doctorStore.appointments" :key="appt.id" class="appointment-card">
        <div class="appointment-header">
          <div>
            <h3>{{ appt.patient_name || 'Unknown Patient' }}</h3>
            <p class="patient-id">ID: {{ appt.patient_id }}</p>
          </div>
          <span :class="`badge badge-${appt.status}`">{{ appt.status }}</span>
        </div>
        <div class="appointment-details">
          <div class="detail-row">
            <span class="label">Date & Time:</span>
            <span>{{ formatDate(appt.appointment_time) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Chief Complaint:</span>
            <span>{{ appt.chief_complaint || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Last Visit:</span>
            <span>{{ appt.last_visit_summary || 'No previous visits' }}</span>
          </div>
        </div>
        <div class="appointment-actions">
          <router-link :to="`/doctor/appointments/${appt.id}`" class="btn btn-primary">
            View Details
          </router-link>
          <button @click="updateStatusModal(appt)" class="btn btn-info">Update Status</button>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="selectedAppointment" class="modal-overlay" @click="selectedAppointment = null">
      <div class="modal-content" @click.stop>
        <h2>Update Appointment Status</h2>
        <div class="form-group">
          <label>New Status:</label>
          <select v-model="newStatus" class="form-control">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notes (optional):</label>
          <textarea v-model="statusNotes" class="form-control" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="handleStatusUpdate" class="btn btn-primary">Update</button>
          <button @click="selectedAppointment = null" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDoctorStore } from '@/stores/doctor'

const doctorStore = useDoctorStore()

const filters = ref({
  status: '',
  date: '',
  patient: '',
})

const selectedAppointment = ref<any>(null)
const newStatus = ref('')
const statusNotes = ref('')

onMounted(async () => {
  await doctorStore.loadAppointments()
})

const applyFilters = async () => {
  await doctorStore.loadAppointments(filters.value)
}

const resetFilters = async () => {
  filters.value = { status: '', date: '', patient: '' }
  await doctorStore.loadAppointments()
}

const updateStatusModal = (appt: any) => {
  selectedAppointment.value = appt
  newStatus.value = appt.status
  statusNotes.value = ''
}

const handleStatusUpdate = async () => {
  if (!selectedAppointment.value || !newStatus.value) return

  try {
    await doctorStore.updateAppointmentStatus(selectedAppointment.value.id, {
      status: newStatus.value,
      notes: statusNotes.value,
    })
    selectedAppointment.value = null
  } catch (err) {
    console.error('Failed to update appointment status:', err)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.appointments {
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
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.filter-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  flex: 1;
  min-width: 150px;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
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

.appointments-list {
  display: grid;
  gap: 1.5rem;
}

.appointment-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.appointment-card:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.appointment-header h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
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

.badge-confirmed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-completed {
  background-color: #d4edda;
  color: #155724;
}

.badge-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.appointment-details {
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
  min-width: 150px;
}

.appointment-actions {
  display: flex;
  gap: 1rem;
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
  display: inline-block;
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
  min-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
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

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .filter-input {
    width: 100%;
  }

  .appointment-header {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content {
    min-width: auto;
    width: 90%;
  }
}
</style>
