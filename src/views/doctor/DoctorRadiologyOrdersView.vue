<template>
  <div class="radiology-orders">
    <div class="header">
      <h1>Radiology Orders</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Create Radiology Order
      </button>
    </div>

    <div v-if="doctorStore.error" class="alert alert-error">
      {{ doctorStore.error }}
      <button @click="doctorStore.clearError">×</button>
    </div>

    <div v-if="doctorStore.loading" class="loading">
      <span>Loading radiology orders...</span>
    </div>

    <div v-else-if="doctorStore.radiologyOrders.length === 0" class="no-data">
      <p>No radiology orders yet</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in doctorStore.radiologyOrders" :key="order.id" class="order-card">
        <div class="card-header">
          <div>
            <h3>{{ order.patient_name }}</h3>
            <p class="patient-id">Patient ID: {{ order.patient_id }}</p>
          </div>
          <span :class="`badge badge-${order.status}`">{{ order.status }}</span>
        </div>

        <div class="card-body">
          <div class="detail-row">
            <span class="label">Order Date:</span>
            <span>{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Modality:</span>
            <span>{{ order.modality }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Body Part:</span>
            <span>{{ order.body_part }}</span>
          </div>
          <div v-if="order.instructions" class="detail-row">
            <span class="label">Instructions:</span>
            <span>{{ order.instructions }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Urgent:</span>
            <span>{{ order.urgent ? 'Yes' : 'No' }}</span>
          </div>
          <div v-if="order.report_date" class="detail-row">
            <span class="label">Report Date:</span>
            <span>{{ formatDate(order.report_date) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button @click="viewOrder(order.id)" class="btn btn-primary">View Details</button>
        </div>
      </div>
    </div>

    <!-- Create Radiology Order Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showCreateModal = false">×</button>
        <h2>Create Radiology Order</h2>

        <div class="form-group">
          <label>Patient ID *</label>
          <input
            v-model.number="createForm.patient_id"
            type="number"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label>Appointment ID (optional)</label>
          <input
            v-model.number="createForm.appointment_id"
            type="number"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label>Modality *</label>
          <select v-model="createForm.modality" class="form-control" required>
            <option value="">Select modality</option>
            <option value="X-Ray">X-Ray</option>
            <option value="CT">CT Scan</option>
            <option value="MRI">MRI</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="PET">PET Scan</option>
            <option value="Mammography">Mammography</option>
            <option value="Fluoroscopy">Fluoroscopy</option>
          </select>
        </div>

        <div class="form-group">
          <label>Body Part *</label>
          <input
            v-model="createForm.body_part"
            type="text"
            class="form-control"
            placeholder="e.g., Chest, Abdomen"
            required
          />
        </div>

        <div class="form-group">
          <label>Instructions (optional)</label>
          <textarea v-model="createForm.instructions" class="form-control" rows="2"></textarea>
        </div>

        <div class="form-group">
          <label>
            <input v-model="createForm.urgent" type="checkbox" />
            Mark as Urgent
          </label>
        </div>

        <div class="modal-actions">
          <button @click="handleCreateOrder" class="btn btn-primary">Create Order</button>
          <button @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedOrder = null">×</button>
        <h2>Radiology Order Details</h2>

        <div class="detail-section">
          <h4>Patient Information</h4>
          <p><strong>Name:</strong> {{ selectedOrder.patient_name }}</p>
          <p><strong>ID:</strong> {{ selectedOrder.patient_id }}</p>
        </div>

        <div class="detail-section">
          <h4>Order Information</h4>
          <p><strong>Order ID:</strong> {{ selectedOrder.id }}</p>
          <p><strong>Order Date:</strong> {{ formatDate(selectedOrder.created_at) }}</p>
          <p><strong>Status:</strong> <span :class="`badge badge-${selectedOrder.status}`">{{ selectedOrder.status }}</span></p>
          <p><strong>Urgent:</strong> {{ selectedOrder.urgent ? 'Yes' : 'No' }}</p>
        </div>

        <div class="detail-section">
          <h4>Imaging Details</h4>
          <p><strong>Modality:</strong> {{ selectedOrder.modality }}</p>
          <p><strong>Body Part:</strong> {{ selectedOrder.body_part }}</p>
        </div>

        <div v-if="selectedOrder.instructions" class="detail-section">
          <h4>Instructions</h4>
          <p>{{ selectedOrder.instructions }}</p>
        </div>

        <div v-if="selectedOrder.report_date" class="detail-section">
          <h4>Report</h4>
          <p><strong>Report Date:</strong> {{ formatDate(selectedOrder.report_date) }}</p>
        </div>

        <div class="modal-actions">
          <button @click="selectedOrder = null" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDoctorStore } from '@/stores/doctor'

const doctorStore = useDoctorStore()

const showCreateModal = ref(false)
const selectedOrder = ref<any>(null)

const createForm = ref({
  patient_id: null,
  appointment_id: undefined,
  modality: '',
  body_part: '',
  instructions: '',
  urgent: false,
})

onMounted(async () => {
  await doctorStore.loadRadiologyOrders()
})

const viewOrder = async (orderId: number) => {
  selectedOrder.value = await doctorStore.fetchRadiologyOrder(orderId)
}

const handleCreateOrder = async () => {
  if (
    !createForm.value.patient_id ||
    !createForm.value.modality ||
    !createForm.value.body_part
  ) {
    return
  }

  try {
    await doctorStore.createRadiologyOrder({
      patient_id: createForm.value.patient_id,
      appointment_id: createForm.value.appointment_id,
      modality: createForm.value.modality,
      body_part: createForm.value.body_part,
      instructions: createForm.value.instructions || undefined,
      urgent: createForm.value.urgent,
    })

    showCreateModal.value = false
    createForm.value = {
      patient_id: null,
      appointment_id: undefined,
      modality: '',
      body_part: '',
      instructions: '',
      urgent: false,
    }
  } catch (err) {
    console.error('Failed to create radiology order:', err)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.radiology-orders {
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

.orders-list {
  display: grid;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.order-card:hover {
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

.badge-completed {
  background-color: #d4edda;
  color: #155724;
}

.badge-inprogress {
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

.form-group {
  margin-bottom: 1rem;
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

input[type='checkbox'] {
  margin-right: 0.5rem;
}

.detail-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.detail-section h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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

  .detail-row {
    flex-direction: column;
  }
}
</style>
