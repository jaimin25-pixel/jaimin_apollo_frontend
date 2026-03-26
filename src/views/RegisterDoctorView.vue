<template>
  <div class="register-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="overlay"></div>
      <div class="left-content">
        <div class="logo">
          <img :src="logoSvg" alt="Apollo Hospital" class="logo-img" />
          <span class="logo-title">Apollo Hospital</span>
        </div>

        <div class="hero-text">
          <h1>Join the Elite Network of<br /><span class="accent">Care</span> <span class="accent">Providers.</span></h1>
          <p>
            Access cutting-edge clinical tools and manage your practice with the
            precision of Apollo's digital ecosystem.
          </p>
        </div>

        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 1.667l2.5 5 5.5.833-4 3.833 1 5.5L10 14.167l-5 2.666 1-5.5-4-3.833 5.5-.833z"/>
                <path d="M7 10.5l2 2 4-4"/>
              </svg>
            </div>
            <span>Secure Medical Credentialing</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2,10 5,10 7,4 10,16 13,8 15,10 18,10"/>
              </svg>
            </div>
            <span>Real-time Patient Diagnostics</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4z"/>
                <path d="M7 8h6M7 11h4"/>
              </svg>
            </div>
            <span>Integrated Records Management</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>Create Clinical Account</h2>
          <p>Please enter your professional credentials to begin.</p>
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
                placeholder="e.g. Dr. Sarah Jenkins"
                @blur="validateField('fullName')"
              />
            </div>
            <span v-if="validationErrors.fullName" class="field-error">{{ validationErrors.fullName }}</span>
          </div>

          <!-- License Number -->
          <div class="form-group">
            <label for="licenseNumber" class="field-label">Medical License Number</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.licenseNumber }">
              <input
                id="licenseNumber"
                v-model="form.licenseNumber"
                type="text"
                placeholder="MED-998273-X"
                @blur="validateField('licenseNumber')"
              />
            </div>
            <span v-if="validationErrors.licenseNumber" class="field-error">{{ validationErrors.licenseNumber }}</span>
          </div>

          <!-- Specialization -->
          <div class="form-group">
            <label for="specialization" class="field-label">Specialization</label>
            <div class="input-wrapper select-wrapper" :class="{ 'input-error': validationErrors.specialization }">
              <select
                id="specialization"
                v-model="form.specialization"
                @blur="validateField('specialization')"
              >
                <option value="" disabled>Select your field</option>
                <option v-for="spec in specializations" :key="spec" :value="spec">{{ spec }}</option>
              </select>
              <svg class="select-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span v-if="validationErrors.specialization" class="field-error">{{ validationErrors.specialization }}</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="field-label">Institutional Email</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.email }">
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="doctor@apollo.com"
                @blur="validateField('email')"
              />
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
                type="password"
                placeholder="••••••••••••"
                @blur="validateField('password')"
              />
            </div>
            <span v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</span>
            <div v-if="form.password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :style="{ width: `${(strength.score / 4) * 100}%`, background: strength.color }"></div>
              </div>
              <span class="strength-label" :style="{ color: strength.color }">{{ strength.label }}</span>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Register Medical Account</span>
            <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9h10.5M10.5 5.25L14.25 9l-3.75 3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>

        <p class="login-link">
          Already have an account?
          <router-link to="/">Sign In</router-link>
        </p>
      </div>

      <!-- Footer -->
      <footer class="register-footer">
        <span class="footer-left">APOLLO ADMIN PORTAL V4.2</span>
        <div class="footer-links">
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoSvg from '@/assets/images/logo.svg'
import { validators, passwordStrength } from '@/utils/validators'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

const specializations = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Psychiatry',
  'General Medicine',
  'Surgery',
  'Radiology',
  'Anesthesiology',
]

const form = reactive({
  fullName: '',
  licenseNumber: '',
  specialization: '',
  email: '',
  password: '',
})

const validationErrors = reactive({
  fullName: '',
  licenseNumber: '',
  specialization: '',
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
    case 'specialization':
      error = validators.required(form.specialization, 'Specialization')
      validationErrors.specialization = error || ''; return !error
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
  const fields = ['fullName', 'licenseNumber', 'specialization', 'email', 'password']
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
      role: 'doctor',
      license_number: form.licenseNumber,
      specialization: form.specialization,
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

.logo-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
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

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(77, 208, 225, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #4dd0e1;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.select-wrapper select option[value=""][disabled] {
  color: #9ca3af;
}

.select-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.field-error {
  font-size: 0.75rem;
  color: var(--error, #dc2626);
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
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid var(--border, #e5e7eb);
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}

.footer-left {
  font-size: 0.7rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  font-weight: 500;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-decoration: none;
  letter-spacing: 0.05em;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--primary);
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
    padding: 32px 36px;
  }
  .hero-text h1 {
    font-size: 1.875rem;
  }
}

@media (max-width: 768px) {
  .register-page {
    flex-direction: column;
  }
  .left-panel {
    width: 100%;
    min-height: 280px;
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
}
</style>
