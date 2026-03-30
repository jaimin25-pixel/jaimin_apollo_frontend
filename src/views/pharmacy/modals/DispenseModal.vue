<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Dispense Prescription Item</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div v-if="!selectedPrescription" class="prescription-selector">
          <label>Select Prescription</label>
          <select v-model="selectedRxId" class="input">
            <option value="">Select a prescription</option>
            <option v-for="rx in prescriptions" :key="rx.rx_id" :value="rx.rx_id">
              Rx #{{ rx.rx_id }} - {{ rx.patient?.full_name }}
            </option>
          </select>
          <button v-if="selectedRxId" @click="loadPrescriptionDetails" class="btn btn-primary">
            Load Prescription
          </button>
        </div>

        <div v-else class="prescription-details">
          <div class="header-info">
            <h3>Rx #{{ selectedPrescription.rx_id }}</h3>
            <p>Patient: {{ selectedPrescription.patient?.full_name }}</p>
            <p>Doctor: {{ selectedPrescription.doctor?.doc_code }}</p>
            <p>Status: <span :class="['badge', selectedPrescription.status]">{{ selectedPrescription.status }}</span></p>
          </div>

          <div class="items-section">
            <h4>Prescription Items</h4>
            <div v-for="item in selectedPrescription.items" :key="item.item_id" class="item-card">
              <div class="item-info">
                <p class="medicine-name">{{ item.medicine?.generic_name }}</p>
                <p class="medicine-brand">{{ item.medicine?.brand_name }}</p>
                <p class="dosage">
                  {{ item.dose }} | {{ item.frequency }} | {{ item.duration_days }} days
                </p>
                <p class="progress">
                  Dispensed: {{ item.quantity_dispensed }} / {{ item.quantity_prescribed }} {{ item.medicine?.unit }}
                </p>
              </div>

              <div v-if="item.status !== 'fully_dispensed'" class="item-dispense">
                <!-- Dispense this item -->
                <div class="form-group">
                  <label>Quantity to Dispense</label>
                  <input
                    v-model.number="dispenseData[item.item_id].quantity"
                    type="number"
                    step="0.1"
                    :max="item.quantity_prescribed - item.quantity_dispensed"
                    class="input"
                    @change="validateQuantity(item)"
                  />
                </div>

                <div class="form-group">
                  <label>Select Batch</label>
                  <select
                    v-model="dispenseData[item.item_id].batch_id"
                    class="input"
                    @change="loadBatchDetails(item.item_id)"
                  >
                    <option value="">Select batch</option>
                    <option v-for="batch in batches[item.medicine_id]" :key="batch.batch_id" :value="batch.batch_id">
                      {{ batch.batch_number }} ({{ batch.quantity_remaining }}) Exp: {{ formatDate(batch.expiry_date) }}
                    </option>
                  </select>
                </div>

                <div v-if="dispenseData[item.item_id].batch_id" class="batch-info">
                  <p>Batch: {{ dispenseData[item.item_id].batch_number }}</p>
                  <p>Available: {{ dispenseData[item.item_id].available }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
        <button @click="handleDispense" :disabled="!canDispense" class="btn btn-primary">
          Dispense
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { pharmacyAPI } from '@/api/pharmacy'

const emit = defineEmits(['close', 'dispense'])

const prescriptions = ref([])
const selectedRxId = ref('')
const selectedPrescription = ref(null)
const batches = ref({})
const dispenseData = ref({})

onMounted(async () => {
  try {
    prescriptions.value = await pharmacyAPI.listPrescriptions({ status: 'pending' })
  } catch (error) {
    console.error('Failed to load prescriptions', error)
  }
})

const loadPrescriptionDetails = async () => {
  try {
    const rx = await pharmacyAPI.getPrescription(selectedRxId.value)
    selectedPrescription.value = rx

    // Initialize dispense data
    dispenseData.value = {}
    rx.items.forEach((item: any) => {
      if (item.status !== 'fully_dispensed') {
        dispenseData.value[item.item_id] = {
          quantity: 0,
          batch_id: '',
          batch_number: '',
          available: 0,
        }
        loadBatchesForMedicine(item.medicine_id)
      }
    })
  } catch (error) {
    console.error('Failed to load prescription', error)
  }
}

const loadBatchesForMedicine = async (medicineId: number) => {
  try {
    const batchList = await pharmacyAPI.listBatches(medicineId)
    batches.value[medicineId] = batchList
  } catch (error) {
    console.error('Failed to load batches', error)
  }
}

const loadBatchDetails = (itemId: number) => {
  const batchId = dispenseData.value[itemId].batch_id
  const batch = Object.values(batches.value)
    .flat()
    .find((b: any) => b.batch_id === batchId)

  if (batch) {
    dispenseData.value[itemId].batch_number = batch.batch_number
    dispenseData.value[itemId].available = batch.quantity_remaining
  }
}

const validateQuantity = (item: any) => {
  const max = item.quantity_prescribed - item.quantity_dispensed
  const qty = dispenseData.value[item.item_id].quantity

  if (qty > max) {
    dispenseData.value[item.item_id].quantity = max
  }
}

const canDispense = computed(() => {
  if (!selectedPrescription.value) return false

  return selectedPrescription.value.items.some((item: any) => {
    if (item.status === 'fully_dispensed') return false
    const data = dispenseData.value[item.item_id]
    return data && data.quantity > 0 && data.batch_id
  })
})

const handleDispense = async () => {
  try {
    const items = selectedPrescription.value.items
      .filter((item: any) => item.status !== 'fully_dispensed' && dispenseData.value[item.item_id].quantity > 0)
      .map((item: any) => ({
        item_id: item.item_id,
        quantity_dispensed: dispenseData.value[item.item_id].quantity,
        batch_id: dispenseData.value[item.item_id].batch_id,
      }))

    if (items.length === 0) {
      alert('Please dispense at least one item')
      return
    }

    await pharmacyAPI.dispensePrescription(selectedPrescription.value.rx_id, items)
    alert('Prescription dispensed successfully')
    emit('dispense')
    emit('close')
  } catch (error) {
    console.error('Failed to dispense', error)
    alert('Failed to dispense prescription')
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.prescription-selector,
.prescription-details {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.header-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.header-info h3 {
  margin: 0 0 0.5rem 0;
}

.header-info p {
  margin: 0.25rem 0;
}

.items-section {
  margin-top: 1.5rem;
}

.items-section h4 {
  margin-bottom: 1rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.item-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #007bff;
}

.item-info {
  margin-bottom: 1rem;
}

.medicine-name {
  font-weight: 600;
  margin: 0;
}

.medicine-brand {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.dosage {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.progress {
  color: #007bff;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.item-dispense {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.batch-info {
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.batch-info p {
  margin: 0.25rem 0;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge.pending {
  background: #ffc107;
  color: #333;
}

.badge.partially_dispensed {
  background: #17a2b8;
  color: white;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>
