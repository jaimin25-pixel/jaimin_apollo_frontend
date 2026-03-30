<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ isNew ? 'Add Medicine' : 'Edit Medicine' }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSave" class="modal-body">
        <div class="form-group">
          <label for="generic_name">Generic Name *</label>
          <input
            id="generic_name"
            v-model="form.generic_name"
            type="text"
            class="input"
            required
            placeholder="e.g., Paracetamol"
          />
          <span v-if="errors.generic_name" class="error-text">{{ errors.generic_name }}</span>
        </div>

        <div class="form-group">
          <label for="brand_name">Brand Name</label>
          <input
            id="brand_name"
            v-model="form.brand_name"
            type="text"
            class="input"
            placeholder="e.g., Crocin"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category *</label>
            <input
              id="category"
              v-model="form.category"
              type="text"
              class="input"
              required
              placeholder="e.g., Analgesic"
            />
            <span v-if="errors.category" class="error-text">{{ errors.category }}</span>
          </div>

          <div class="form-group">
            <label for="unit">Unit *</label>
            <select id="unit" v-model="form.unit" class="input" required>
              <option value="">Select unit</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup (mL)">Syrup (mL)</option>
              <option value="Injection (mL)">Injection (mL)</option>
              <option value="Vial (100 IU/mL)">Vial (100 IU/mL)</option>
              <option value="Ampoule (15 mg/mL)">Ampoule (mg/mL)</option>
              <option value="Inhaler (100 mcg/dose)">Inhaler (mcg/dose)</option>
              <option value="Cream (g)">Cream (g)</option>
              <option value="Ointment (g)">Ointment (g)</option>
              <option value="Drops (mL)">Drops (mL)</option>
              <option value="Powder (g)">Powder (g)</option>
              <option value="Sachet">Sachet</option>
              <option value="Patch">Patch</option>
              <option value="Strip">Strip</option>
            </select>
            <span v-if="errors.unit" class="error-text">{{ errors.unit }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="hsn_code">HSN Code</label>
            <input id="hsn_code" v-model="form.hsn_code" type="text" class="input" placeholder="HSN code" />
          </div>

          <div class="form-group">
            <label for="reorder_level">Reorder Level *</label>
            <input
              id="reorder_level"
              v-model.number="form.reorder_level"
              type="number"
              class="input"
              required
              placeholder="Minimum stock level"
              min="0"
            />
            <span v-if="errors.reorder_level" class="error-text">{{ errors.reorder_level }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="storage_conditions">Storage Conditions</label>
          <textarea
            id="storage_conditions"
            v-model="form.storage_conditions"
            class="input textarea"
            placeholder="e.g., Keep in cool, dry place"
          />
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
            {{ isSubmitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { pharmacyAPI } from '@/api/pharmacy'

const props = defineProps({
  medicine: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const isNew = computed(() => !props.medicine || !props.medicine.medicine_id)

const form = ref({
  generic_name: '',
  brand_name: '',
  category: '',
  unit: '',
  hsn_code: '',
  reorder_level: 0,
  storage_conditions: '',
})

const errors = ref({})
const isSubmitting = ref(false)

watch(
  () => props.medicine,
  (medicine) => {
    if (medicine) {
      form.value = {
        generic_name: medicine.generic_name || '',
        brand_name: medicine.brand_name || '',
        category: medicine.category || '',
        unit: medicine.unit || '',
        hsn_code: medicine.hsn_code || '',
        reorder_level: medicine.reorder_level || 0,
        storage_conditions: medicine.storage_conditions || '',
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const resetForm = () => {
  form.value = {
    generic_name: '',
    brand_name: '',
    category: '',
    unit: '',
    hsn_code: '',
    reorder_level: 0,
    storage_conditions: '',
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.generic_name.trim()) {
    errors.value.generic_name = 'Generic name is required'
  }
  if (!form.value.category.trim()) {
    errors.value.category = 'Category is required'
  }
  if (!form.value.unit) {
    errors.value.unit = 'Unit is required'
  }
  if (form.value.reorder_level < 0) {
    errors.value.reorder_level = 'Reorder level cannot be negative'
  }

  return Object.keys(errors.value).length === 0
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  try {
    if (isNew.value) {
      await pharmacyAPI.createMedicine(form.value)
    } else {
      await pharmacyAPI.updateMedicine(props.medicine.medicine_id, form.value)
    }
    emit('save')
    emit('close')
  } catch (error) {
    console.error('Failed to save medicine', error)
    alert('Failed to save medicine')
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

.textarea {
  resize: vertical;
  min-height: 80px;
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
