<template>
  <div class="register-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="overlay"></div>
      <div class="left-content">
        <div class="logo">
          <img :src="logoSvg" alt="Apollo Hospital" class="logo-img" />
          <div class="logo-text-group">
            <span class="logo-title">Apollo Hospital</span>
            <span class="logo-subtitle">CLINICAL PRECISION</span>
          </div>
        </div>

        <div class="hero-text">
          <h1>Securing the future of <span class="accent">clinical operations.</span></h1>
          <p>
            Access the Apollo Administrative Portal to manage records, oversee
            registrations, and maintain hospital inventory with clinical precision.
          </p>
        </div>

        <div class="admin-community">
          <div class="avatar-group">
            <div class="avatar" style="background: #4dd0e1;"></div>
            <div class="avatar" style="background: #26a69a;"></div>
            <div class="avatar" style="background: #1a3a4a;"></div>
          </div>
          <span class="community-text">Join 2,400+ Apollo Administrators</span>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>Create Account</h2>
          <p>Register a new administrator profile within the clinical network.</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="register-form" novalidate>
          <!-- Admin Name -->
          <div class="form-group">
            <label for="fullName" class="field-label">Admin Name</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.fullName }">
              <input
                id="fullName"
                v-model="form.fullName"
                type="text"
                placeholder="Full Legal Name"
                @blur="validateField('fullName')"
              />
            </div>
            <span v-if="validationErrors.fullName" class="field-error">{{ validationErrors.fullName }}</span>
          </div>

          <!-- Employee ID + Department Row -->
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="employeeId" class="field-label">Employee ID</label>
              <div class="input-wrapper" :class="{ 'input-error': validationErrors.employeeId }">
                <input
                  id="employeeId"
                  v-model="form.employeeId"
                  type="text"
                  placeholder="AP-XXXXX"
                  @blur="validateField('employeeId')"
                />
              </div>
              <span v-if="validationErrors.employeeId" class="field-error">{{ validationErrors.employeeId }}</span>
            </div>
            <div class="form-group form-group-half">
              <label for="department" class="field-label">Department</label>
              <div class="input-wrapper select-wrapper" :class="{ 'input-error': validationErrors.department }">
                <select
                  id="department"
                  v-model="form.department"
                  @blur="validateField('department')"
                >
                  <option value="" disabled>Select Dept</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                </select>
                <svg class="select-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span v-if="validationErrors.department" class="field-error">{{ validationErrors.department }}</span>
            </div>
          </div>

          <!-- Access Key -->
          <div class="form-group">
            <label for="accessKey" class="field-label">Admin Access Key</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.accessKey }">
              <input
                id="accessKey"
                v-model="form.accessKey"
                type="text"
                placeholder="Enter Secure Token"
                @blur="validateField('accessKey')"
              />
              <svg class="input-icon-right" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11.25 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
                <path d="M10.5 10.5l5.25 5.25M13.5 13.5l2.25-2.25"/>
              </svg>
            </div>
            <span v-if="validationErrors.accessKey" class="field-error">{{ validationErrors.accessKey }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="field-label">Password</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.password }">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create strong password"
                @blur="validateField('password')"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1.5 9s3-5.25 7.5-5.25S16.5 9 16.5 9s-3 5.25-7.5 5.25S1.5 9 1.5 9z" stroke="#9CA3AF" stroke-width="1.3"/>
                  <circle cx="9" cy="9" r="2.25" stroke="#9CA3AF" stroke-width="1.3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2.25 2.25l13.5 13.5M7.23 7.23a2.25 2.25 0 003.04 3.04M4.05 5.55C2.85 6.75 1.5 9 1.5 9s3 5.25 7.5 5.25c1.35 0 2.55-.38 3.53-.97M14.4 12.15C15.45 11.1 16.5 9 16.5 9s-3-5.25-7.5-5.25c-.6 0-1.17.08-1.72.22" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
            <span class="field-hint">Must be at least 12 characters with symbols.</span>
          </div>

          <!-- Acknowledgment Checkbox -->
          <div class="form-group">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="form.acknowledged" />
              <span class="checkmark"></span>
              <span class="checkbox-label">
                I acknowledge that I am creating an administrative account subject to the
                Apollo Hospital Security Protocol and Privacy Policy.
              </span>
            </label>
            <span v-if="validationErrors.acknowledged" class="field-error">{{ validationErrors.acknowledged }}</span>
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Register Administrative Profile</span>
            <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9h10.5M10.5 5.25L14.25 9l-3.75 3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>

        <p class="login-link">
          Already have an account?
          <router-link to="/">Sign in to Apollo</router-link>
        </p>
      </div>

      <!-- Footer -->
      <footer class="register-footer">
        <div class="footer-badges">
          <div class="footer-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="6" width="8" height="6.5" rx="1.5"/>
              <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6"/>
            </svg>
            <span>AES-256</span>
          </div>
          <div class="footer-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 1.167L2.333 3.5v3.5c0 3.208 2 6.222 4.667 7 2.667-.778 4.667-3.792 4.667-7V3.5L7 1.167z"/>
              <path d="M5 7l1.5 1.5L9 5.5"/>
            </svg>
            <span>HIPAA COMPLIANT</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoSvg from '@/assets/images/logo.svg'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const departments = ['IT', 'HR', 'Finance', 'Operations', 'Medical Records', 'Administration']

const form = reactive({
  fullName: '',
  employeeId: '',
  department: '',
  accessKey: '',
  password: '',
  acknowledged: false,
})

const validationErrors = reactive({
  fullName: '',
  employeeId: '',
  department: '',
  accessKey: '',
  password: '',
  acknowledged: '',
})

function validateField(field: string): boolean {
  switch (field) {
    case 'fullName':
      if (!form.fullName.trim()) { validationErrors.fullName = 'Admin name is required'; return false }
      validationErrors.fullName = ''; return true
    case 'employeeId':
      if (!form.employeeId.trim()) { validationErrors.employeeId = 'Employee ID is required'; return false }
      validationErrors.employeeId = ''; return true
    case 'department':
      if (!form.department) { validationErrors.department = 'Please select a department'; return false }
      validationErrors.department = ''; return true
    case 'accessKey':
      if (!form.accessKey.trim()) { validationErrors.accessKey = 'Access key is required'; return false }
      validationErrors.accessKey = ''; return true
    case 'password':
      if (!form.password) { validationErrors.password = 'Password is required'; return false }
      if (form.password.length < 12) { validationErrors.password = 'Password must be at least 12 characters'; return false }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) { validationErrors.password = 'Password must contain at least one symbol'; return false }
      validationErrors.password = ''; return true
    case 'acknowledged':
      if (!form.acknowledged) { validationErrors.acknowledged = 'You must acknowledge the security protocol'; return false }
      validationErrors.acknowledged = ''; return true
    default: return true
  }
}

function validateAll(): boolean {
  const fields = ['fullName', 'employeeId', 'department', 'accessKey', 'password', 'acknowledged']
  return fields.map(f => validateField(f)).every(Boolean)
}

async function handleRegister() {
  errorMessage.value = ''
  if (!validateAll()) return

  isLoading.value = true
  try {
    await authStore.register({
      full_name: form.fullName,
      email: `${form.employeeId.toLowerCase()}@apollo.admin`,
      password: form.password,
      role: 'ADMIN',
      employee_id: form.employeeId,
      department: form.department,
      access_key: form.accessKey,
    })
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    errorMessage.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ─── Left Panel ─── */
.left-panel {
  position: relative;
  width: 50%;
  min-height: 100vh;
  background: url('/images/hospital-corridor.jpg') center/cover no-repeat;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 45, 58, 0.75) 0%,
    rgba(18, 50, 62, 0.80) 40%,
    rgba(12, 38, 50, 0.90) 100%
  );
  z-index: 2;
}

.left-content {
  position: relative;
  z-index: 3;
  color: #ffffff;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-img {
  width: 40px;
  height: 40px;
}

.logo-text-group {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hero-text {
  margin-bottom: 40px;
}

.hero-text h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.accent {
  color: #4dd0e1;
}

.hero-text p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

.admin-community {
  position: absolute;
  bottom: 60px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-group {
  display: flex;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-left: -8px;
}

.avatar:first-child {
  margin-left: 0;
}

.community-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

/* ─── Right Panel ─── */
.right-panel {
  width: 50%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 48px;
  overflow-y: auto;
}

.form-container {
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 28px;
}

.form-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-header p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* ─── Error Banner ─── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--error-bg, #fef2f2);
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--error, #dc2626);
  font-size: 0.85rem;
  margin-bottom: 20px;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* ─── Form ─── */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-half {
  flex: 1;
  min-width: 0;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 14px;
  height: 48px;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.08);
}

.input-wrapper.input-error {
  border-color: var(--error, #dc2626);
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  height: 100%;
  outline: none;
  font-family: 'Inter', sans-serif;
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.input-icon-right {
  flex-shrink: 0;
  margin-left: 8px;
}

/* Select */
.select-wrapper {
  position: relative;
  padding: 0;
}

.select-wrapper select {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  padding: 0 36px 0 14px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  outline: none;
  font-family: 'Inter', sans-serif;
}

.select-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.toggle-password {
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.field-error {
  font-size: 0.75rem;
  color: var(--error, #dc2626);
  padding-left: 2px;
}

.field-hint {
  font-size: 0.7rem;
  color: #9ca3af;
  padding-left: 2px;
}

/* ─── Checkbox ─── */
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: 1.5px solid #d1d5db;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #ffffff;
  margin-top: 1px;
}

.checkbox-wrapper input[type="checkbox"]:checked {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-wrapper input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 0.775rem;
  color: #6b7280;
  line-height: 1.5;
  user-select: none;
}

/* ─── Submit Button ─── */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  background: var(--primary);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  margin-top: 4px;
  font-family: 'Inter', sans-serif;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover, #15303d);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Login Link ─── */
.login-link {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 24px;
}

.login-link a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link a:hover {
  text-decoration: underline;
}

/* ─── Footer ─── */
.register-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid var(--border, #e5e7eb);
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}

.footer-badges {
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.03em;
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .left-panel {
    padding: 40px;
  }
  .right-panel {
    padding: 32px 36px;
  }
  .hero-text h1 {
    font-size: 1.875rem;
  }
  .admin-community {
    bottom: 40px;
  }
}

@media (max-width: 768px) {
  .register-page {
    flex-direction: column;
  }
  .left-panel {
    width: 100%;
    min-height: 320px;
    padding: 32px 24px;
  }
  .right-panel {
    width: 100%;
    min-height: auto;
    padding: 32px 24px;
  }
  .form-container {
    max-width: 100%;
  }
  .hero-text h1 {
    font-size: 1.5rem;
  }
  .register-footer {
    max-width: 100%;
  }
  .admin-community {
    position: relative;
    bottom: 0;
    margin-top: 32px;
  }
  .form-row {
    flex-direction: column;
    gap: 18px;
  }
}
</style>
