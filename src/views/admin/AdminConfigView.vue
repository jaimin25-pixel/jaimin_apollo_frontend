<template>
  <div class="config-page">
    <div class="page-header">
      <div>
        <h1 class="page-heading">Hospital Configuration</h1>
        <p class="page-subtitle">Manage your hospital's general settings and contact information.</p>
      </div>
      <div v-if="store.hospitalConfig?.updated_at" class="last-updated">
        Last updated: {{ formatDate(store.hospitalConfig.updated_at) }}
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading configuration...</p>
    </div>

    <div v-else-if="fetchError" class="error-state">
      <p>{{ fetchError }}</p>
      <button class="btn btn-primary" @click="loadConfig">Retry</button>
    </div>

    <form v-else class="config-form" @submit.prevent="handleSave">
      <div class="form-card">
        <h2 class="card-title">General Information</h2>

        <div class="form-group">
          <label for="hospital_name" class="form-label">Hospital Name <span class="required">*</span></label>
          <input
            id="hospital_name"
            v-model="form.hospital_name"
            type="text"
            class="form-input"
            placeholder="Enter hospital name"
            required
          />
        </div>

        <div class="form-group">
          <label for="address" class="form-label">Address</label>
          <textarea
            id="address"
            v-model="form.address"
            class="form-input form-textarea"
            placeholder="Enter full address"
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="gst_number" class="form-label">GST Number</label>
            <input
              id="gst_number"
              v-model="form.gst_number"
              type="text"
              class="form-input"
              placeholder="e.g. 22AAAAA0000A1Z5"
            />
          </div>

          <div class="form-group">
            <label for="nabh_number" class="form-label">NABH Number</label>
            <input
              id="nabh_number"
              v-model="form.nabh_number"
              type="text"
              class="form-input"
              placeholder="e.g. NABH-H-1234"
            />
          </div>
        </div>
      </div>

      <div class="form-card">
        <h2 class="card-title">Contact Details</h2>

        <div class="form-row">
          <div class="form-group">
            <label for="contact_phone" class="form-label">Phone</label>
            <input
              id="contact_phone"
              v-model="form.contact_phone"
              type="tel"
              class="form-input"
              placeholder="e.g. +91 9876543210"
            />
          </div>

          <div class="form-group">
            <label for="contact_email" class="form-label">Email</label>
            <input
              id="contact_email"
              v-model="form.contact_email"
              type="email"
              class="form-input"
              placeholder="e.g. info@hospital.com"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="website" class="form-label">Website</label>
          <input
            id="website"
            v-model="form.website"
            type="url"
            class="form-input"
            placeholder="e.g. https://www.hospital.com"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="resetForm">Reset</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="btn-spinner"></span>
          {{ saving ? 'Saving...' : 'Save Configuration' }}
        </button>
      </div>

      <div v-if="successMessage" class="alert alert-success">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15.75 9a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
          <path d="M6.75 9l1.5 1.5 3-3" />
        </svg>
        {{ successMessage }}
      </div>

      <div v-if="saveError" class="alert alert-error">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="9" r="6.75" />
          <path d="M9 6v3.75M9 12h.008" />
        </svg>
        {{ saveError }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'

interface HospitalConfig {
  config_id: number
  hospital_name: string
  address: string
  gst_number?: string
  nabh_number?: string
  contact_phone?: string
  contact_email?: string
  website?: string
  updated_at: string
}

const store = useAdminStore()

const loading = ref(true)
const saving = ref(false)
const fetchError = ref('')
const saveError = ref('')
const successMessage = ref('')

const form = reactive({
  hospital_name: '',
  address: '',
  gst_number: '',
  nabh_number: '',
  contact_phone: '',
  contact_email: '',
  website: '',
})

function prefillForm() {
  const config = store.hospitalConfig as HospitalConfig | null
  if (config) {
    form.hospital_name = config.hospital_name || ''
    form.address = config.address || ''
    form.gst_number = config.gst_number || ''
    form.nabh_number = config.nabh_number || ''
    form.contact_phone = config.contact_phone || ''
    form.contact_email = config.contact_email || ''
    form.website = config.website || ''
  }
}

function resetForm() {
  prefillForm()
  successMessage.value = ''
  saveError.value = ''
}

async function loadConfig() {
  loading.value = true
  fetchError.value = ''
  try {
    await store.fetchConfig()
    prefillForm()
  } catch (err: any) {
    fetchError.value = err?.message || 'Failed to load configuration.'
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  saveError.value = ''
  successMessage.value = ''
  try {
    await store.saveConfig({ ...form })
    successMessage.value = 'Configuration saved successfully.'
    setTimeout(() => {
      successMessage.value = ''
    }, 4000)
  } catch (err: any) {
    saveError.value = err?.message || 'Failed to save configuration.'
  } finally {
    saving.value = false
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch(() => store.hospitalConfig, () => {
  prefillForm()
})

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.config-page {
  max-width: 800px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.last-updated {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 14px;
  white-space: nowrap;
}

/* Loading & Error */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--error);
}

.error-state p {
  margin-bottom: 16px;
}

/* Form */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.form-group {
  margin-bottom: 18px;
  flex: 1;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.required {
  color: var(--error);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg);
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.1);
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-light);
}

.btn-secondary {
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-light);
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.alert-success {
  background: rgba(16, 185, 129, 0.08);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.alert-error {
  background: rgba(239, 68, 68, 0.08);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .page-header {
    flex-direction: column;
  }

  .form-card {
    padding: 18px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
