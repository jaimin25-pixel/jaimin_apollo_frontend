<template>
  <div class="register-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="overlay"></div>
      <div class="left-content">
        <div class="logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="white" stroke-width="1.5"/>
              <path d="M7 10h6M10 7v6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="logo-title">Apollo Hospital</span>
        </div>

        <div class="hero-text">
          <h1>Precision in care,<br />integrity in <span class="accent">medicine</span>.</h1>
          <div class="underline-accent"></div>
          <p>
            Join the elite pharmaceutical network of Apollo
            Hospital. Manage clinical records and inventory with
            state-of-the-art tools designed for professionals.
          </p>
        </div>

        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">24/7</span>
            <span class="stat-label">CLINICAL SUPPORT</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">100%</span>
            <span class="stat-label">SECURE ACCESS</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="form-wrapper">
        <div class="form-card">
          <div class="form-header">
            <span class="form-tag">HEALTHCARE PROFESSIONALS</span>
            <h2>Create Pharmacist Account</h2>
            <p>Enter your clinical credentials to access the pharmacy portal.</p>
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
            <!-- Full Name -->
            <div class="form-group">
              <label for="fullName" class="field-label">Full Name</label>
              <div class="input-wrapper" :class="{ 'input-error': validationErrors.fullName }">
                <input
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  placeholder="Dr. Jane Doe"
                  @blur="validateField('fullName')"
                />
                <svg class="input-icon-right" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3" stroke="#9CA3AF" stroke-width="1.3"/>
                  <path d="M3.5 16v-1a4.5 4.5 0 019 0v1" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </div>
              <span v-if="validationErrors.fullName" class="field-error">{{ validationErrors.fullName }}</span>
            </div>

            <!-- License + Branch (side by side) -->
            <div class="form-row">
              <div class="form-group">
                <label for="licenseNumber" class="field-label">Pharmacy License Number</label>
                <div class="input-wrapper" :class="{ 'input-error': validationErrors.licenseNumber }">
                  <input
                    id="licenseNumber"
                    v-model="form.licenseNumber"
                    type="text"
                    placeholder="PH-992011"
                    @blur="validateField('licenseNumber')"
                  />
                  <svg class="input-icon-right" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="3" width="14" height="12" rx="2" stroke="#9CA3AF" stroke-width="1.3"/>
                    <path d="M6 3V1.5M12 3V1.5M2 7h14" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                </div>
                <span v-if="validationErrors.licenseNumber" class="field-error">{{ validationErrors.licenseNumber }}</span>
              </div>

              <div class="form-group">
                <label for="branch" class="field-label">Branch Location</label>
                <div class="select-wrapper">
                  <select id="branch" v-model="form.branch">
                    <option value="" disabled>Select Branch</option>
                    <option value="Main Hospital">Main Hospital</option>
                    <option value="North Wing">North Wing</option>
                    <option value="South Wing">South Wing</option>
                    <option value="East Campus">East Campus</option>
                    <option value="West Campus">West Campus</option>
                    <option value="Outpatient Center">Outpatient Center</option>
                  </select>
                  <svg class="select-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="4" stroke="#9CA3AF" stroke-width="1.3"/>
                    <path d="M10 10l3.5 3.5" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="field-label">Institutional Email</label>
              <div class="input-wrapper" :class="{ 'input-error': validationErrors.email }">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="pharmacist@apollohospital.com"
                  @blur="validateField('email')"
                />
                <svg class="input-icon-right" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="3" width="15" height="12" rx="2" stroke="#9CA3AF" stroke-width="1.3"/>
                  <path d="M1.5 5l7.5 5 7.5-5" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="field-label">Security Password</label>
              <div class="input-wrapper" :class="{ 'input-error': validationErrors.password }">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  @blur="validateField('password')"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
                  <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2.25 2.25l13.5 13.5M7.23 7.23a2.25 2.25 0 003.04 3.04M4.05 5.55C2.85 6.75 1.5 9 1.5 9s3 5.25 7.5 5.25c1.35 0 2.55-.38 3.53-.97M14.4 12.15C15.45 11.1 16.5 9 16.5 9s-3-5.25-7.5-5.25c-.6 0-1.17.08-1.72.22" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1.5 9s3-5.25 7.5-5.25S16.5 9 16.5 9s-3 5.25-7.5 5.25S1.5 9 1.5 9z" stroke="#9CA3AF" stroke-width="1.3"/>
                    <circle cx="9" cy="9" r="2.25" stroke="#9CA3AF" stroke-width="1.3"/>
                  </svg>
                </button>
              </div>
              <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
              <div v-if="form.password" class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" :style="{ width: `${(strength.score / 4) * 100}%`, background: strength.color }"></div>
                </div>
                <span class="strength-label" :style="{ color: strength.color }">{{ strength.label }}</span>
              </div>
            </div>

            <!-- Compliance Checkbox -->
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="agreeTerms" />
              <span class="checkmark"></span>
              <span class="checkbox-text">
                I agree to the <a href="#" @click.prevent>Hospital Compliance Standards</a> and <a href="#" @click.prevent>Data Privacy Policy</a>.
              </span>
            </label>

            <!-- Submit -->
            <button type="submit" class="submit-btn" :disabled="isLoading || !agreeTerms">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Complete Registration</span>
              <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.75 9h10.5M10.5 5.25L14.25 9l-3.75 3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>

          <p class="login-link">
            Already have a pharmacist profile?
            <router-link to="/">Sign In Here</router-link>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <footer class="register-footer">
        <span class="footer-text">SYSTEM VERSION 4.8.2</span>
        <span class="footer-dot">&#8226;</span>
        <span class="footer-text">ENCRYPTED HIPAA COMPLIANT</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validators, passwordStrength } from '@/utils/validators'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const agreeTerms = ref(false)

const form = reactive({
  fullName: '',
  licenseNumber: '',
  branch: '',
  email: '',
  password: '',
})

const validationErrors = reactive({
  fullName: '',
  licenseNumber: '',
  email: '',
  password: '',
})

const strength = computed(() => passwordStrength(form.password))

function validateField(field: string): boolean {
  let error: string | null = null
  switch (field) {
    case 'fullName':
      error = validators.fullName(form.fullName)
      validationErrors.fullName = error || ''; return !error
    case 'licenseNumber':
      error = validators.licenseNumber(form.licenseNumber)
      validationErrors.licenseNumber = error || ''; return !error
    case 'email':
      error = validators.email(form.email)
      validationErrors.email = error || ''; return !error
    case 'password':
      error = validators.password(form.password)
      validationErrors.password = error || ''; return !error
    default: return true
  }
}

function validateAll(): boolean {
  const fields = ['fullName', 'licenseNumber', 'email', 'password']
  return fields.map(f => validateField(f)).every(Boolean)
}

async function handleRegister() {
  errorMessage.value = ''
  if (!validateAll()) return

  isLoading.value = true
  try {
    await authStore.register({
      full_name: form.fullName,
      email: form.email,
      password: form.password,
      role: 'pharmacist',
      license_number: form.licenseNumber,
      branch_location: form.branch || undefined,
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
  background: #f3f4f6;
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
  justify-content: flex-end;
  padding: 60px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 45, 58, 0.55) 0%,
    rgba(18, 50, 62, 0.65) 40%,
    rgba(12, 38, 50, 0.85) 100%
  );
  z-index: 2;
}

.left-content {
  position: relative;
  z-index: 3;
  color: #ffffff;
  max-width: 480px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 260px;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.logo-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.hero-text {
  margin-bottom: 48px;
}

.hero-text h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.accent {
  color: #4dd0e1;
}

.underline-accent {
  width: 48px;
  height: 3px;
  background: #4dd0e1;
  border-radius: 2px;
  margin-bottom: 20px;
}

.hero-text p {
  font-size: 0.925rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

/* ─── Stats Bar ─── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.25);
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
  background: #f3f4f6;
}

.form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  max-width: 480px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 44px 40px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* ─── Form Header ─── */
.form-tag {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--primary);
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-header p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ─── Error Banner ─── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
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
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0;
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
  border-color: #dc2626;
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

/* ─── Select ─── */
.select-wrapper {
  position: relative;
  height: 48px;
}

.select-wrapper select {
  width: 100%;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 36px 0 12px;
  font-size: 0.8125rem;
  color: var(--text-primary);
  background: #ffffff;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.select-wrapper select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.08);
}

.select-wrapper select option[value=""][disabled] {
  color: #9ca3af;
}

.select-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* ─── Password Toggle ─── */
.toggle-password {
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* ─── Checkbox ─── */
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  background: #ffffff;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox-wrapper input[type="checkbox"]:checked {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-wrapper input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 4.5px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.checkbox-text a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

.field-error {
  font-size: 0.75rem;
  color: #dc2626;
  padding-left: 2px;
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
  margin-top: 8px;
  font-family: 'Inter', sans-serif;
}

.submit-btn:hover:not(:disabled) {
  background: #15303d;
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
  margin-top: 32px;
}

.login-link a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

/* ─── Footer ─── */
.register-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 16px;
}

.footer-text {
  font-size: 0.65rem;
  color: #9ca3af;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.footer-dot {
  color: #9ca3af;
  font-size: 0.5rem;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}
.strength-bar {
  flex: 1;
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}
.strength-label {
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .left-panel {
    padding: 40px;
  }
  .right-panel {
    padding: 32px 24px;
  }
  .hero-text h1 {
    font-size: 1.875rem;
  }
  .form-card {
    padding: 32px 28px;
  }
}

@media (max-width: 768px) {
  .register-page {
    flex-direction: column;
  }
  .left-panel {
    width: 100%;
    min-height: 300px;
    padding: 32px 24px;
  }
  .logo {
    margin-bottom: 80px;
  }
  .right-panel {
    width: 100%;
    min-height: auto;
    padding: 24px 16px;
  }
  .form-card {
    max-width: 100%;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .hero-text h1 {
    font-size: 1.5rem;
  }
}
</style>
