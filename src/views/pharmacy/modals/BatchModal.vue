<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Add Stock Batch</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSave" class="modal-body">
        <div class="form-group">
          <label for="batch_number">Batch Number *</label>
          <input
            id="batch_number"
            v-model="form.batch_number"
            type="text"
            class="input"
            required
            placeholder="e.g., BATCH001"
          />
          <span v-if="errors.batch_number" class="error-text">{{ errors.batch_number }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="quantity">Quantity *</label>
            <input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              class="input"
              required
              placeholder="0"
              min="0"
              step="0.01"
            />
            <span v-if="errors.quantity" class="error-text">{{ errors.quantity }}</span>
          </div>

          <div class="form-group">
            <label for="purchase_date">Purchase Date *</label>
            <input id="purchase_date" v-model="form.purchase_date" type="date" class="input" required />
            <span v-if="errors.purchase_date" class="error-text">{{ errors.purchase_date }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expiry_date">Expiry Date *</label>
            <input id="expiry_date" v-model="form.expiry_date" type="date" class="input" required />
            <span v-if="errors.expiry_date" class="error-text">{{ errors.expiry_date }}</span>
          </div>

          <div class="form-group">
            <label for="purchase_price">Purchase Price (per unit)</label>
            <input
              id="purchase_price"
              v-model.number="form.purchase_price"
              type="number"
              class="input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="supplier">Supplier</label>
          <input id="supplier" v-model="form.supplier" type="text" class="input" placeholder="Supplier name" />
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
            {{ isSubmitting ? 'Saving...' : 'Add Batch' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { pharmacyAPI } from '@/api/pharmacy'

const props = defineProps({
  medicineId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  batch_number: '',
  quantity: 0,
  purchase_date: new Date().toISOString().split('T')[0],
  expiry_date: '',
  purchase_price: null,
  supplier: '',
})

const errors = ref({})
const isSubmitting = ref(false)

const validateForm = () => {
  errors.value = {}

  if (!form.value.batch_number.trim()) {
    errors.value.batch_number = 'Batch number is required'
  }
  if (form.value.quantity <= 0) {
    errors.value.quantity = 'Quantity must be greater than 0'
  }
  if (!form.value.purchase_date) {
    errors.value.purchase_date = 'Purchase date is required'
  }
  if (!form.value.expiry_date) {
    errors.value.expiry_date = 'Expiry date is required'
  }

  const purchaseDate = new Date(form.value.purchase_date)
  const expiryDate = new Date(form.value.expiry_date)

  if (expiryDate <= purchaseDate) {
    errors.value.expiry_date = 'Expiry date must be after purchase date'
  }

  return Object.keys(errors.value).length === 0
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  try {
    await pharmacyAPI.createBatch(props.medicineId, form.value)
    emit('save')
    emit('close')
  } catch (error) {
    console.error('Failed to add batch', error)
    alert('Failed to add batch')
  } finally {
    isSubmitting.value = false
  }
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.error-text {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
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
