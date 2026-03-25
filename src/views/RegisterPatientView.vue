<template>
  <div class="register-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="overlay"></div>
      <div class="left-content">
        <div class="logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round">
              <path d="M10 4v12M4 10h12"/>
            </svg>
          </div>
          <img :src="logoSvg" alt="Apollo Hospital" class="logo-img" />
          <span class="logo-title">Apollo Hospital</span>
        </div>

        <div class="hero-text">
          <h1>Excellence in<br /><span class="accent">Clinical Care.</span></h1>
          <p>
            Welcome to the Patient Portal. Manage your health records, schedule
            consultations, and connect with your medical team in one secure place.
          </p>
        </div>

        <div class="left-footer">
          &copy; 2024 APOLLO ADMIN &nbsp;&bull;&nbsp; PRIVACY PROTOCOL 2.4.1
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="teal-accent-line"></div>
      <div class="form-container">
        <div class="form-header">
          <div class="header-row">
            <h2>Create Account</h2>
            <span class="role-badge">Patient Role</span>
          </div>
          <p>Begin your journey to personalized wellness.</p>
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
                placeholder="Johnathan Doe"
                @blur="validateField('fullName')"
              />
              <svg class="input-icon-right" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="6" r="3.5"/>
                <path d="M2.5 16.5v-1a5 5 0 0113 0v1"/>
              </svg>
            </div>
            <span v-if="validationErrors.fullName" class="field-error">{{ validationErrors.fullName }}</span>
          </div>

          <!-- DOB + Insurance Row -->
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="dob" class="field-label">Date of Birth</label>
              <div class="input-wrapper" :class="{ 'input-error': validationErrors.dob }">
                <input
                  id="dob"
                  v-model="form.dob"
                  type="date"
                  @blur="validateField('dob')"
                />
              </div>
              <span v-if="validationErrors.dob" class="field-error">{{ validationErrors.dob }}</span>
            </div>
            <div class="form-group form-group-half">
              <label for="insuranceId" class="field-label">
                Insurance ID <span class="optional-tag">(optional)</span>
              </label>
              <div class="input-wrapper">
                <input
                  id="insuranceId"
                  v-model="form.insuranceId"
                  type="text"
                  placeholder="POL-99203"
                />
              </div>
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="field-label">Email Address</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.email }">
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="j.doe@example.com"
                @blur="validateField('email')"
              />
              <svg class="input-icon-right" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2.25 4.5L8.16 8.41a1.5 1.5 0 001.68 0L15.75 4.5"/>
                <rect x="1.5" y="3" width="15" height="12" rx="2"/>
              </svg>
            </div>
            <span v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="field-label">Password</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.password }">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••••••"
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
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Initialize Registration</span>
            <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9h10.5M10.5 5.25L14.25 9l-3.75 3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>

        <p class="login-link">
          Already have an account?
          <router-link to="/">Sign In</router-link>
        </p>

        <!-- Security Info Box -->
        <div class="security-info">
          <svg class="security-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4dd0e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 1.667L3.333 5v4.167c0 4.583 2.85 8.875 6.667 10 3.817-1.125 6.667-5.417 6.667-10V5L10 1.667z"/>
            <path d="M7 10l2 2 4-4"/>
          </svg>
          <p>
            Your data is encrypted with AES-256 standard and managed under HIPAA
            compliance regulations for medical privacy and security.
          </p>
        </div>
      </div>
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

const form = reactive({
  fullName: '',
  dob: '',
  insuranceId: '',
  email: '',
  password: '',
})

const validationErrors = reactive({
  fullName: '',
  dob: '',
  email: '',
  password: '',
})

function validateField(field: string): boolean {
  switch (field) {
    case 'fullName':
      if (!form.fullName.trim()) { validationErrors.fullName = 'Full name is required'; return false }
      validationErrors.fullName = ''; return true
    case 'dob':
      if (!form.dob) { validationErrors.dob = 'Date of birth is required'; return false }
      validationErrors.dob = ''; return true
    case 'email':
      if (!form.email.trim()) { validationErrors.email = 'Email is required'; return false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { validationErrors.email = 'Please enter a valid email'; return false }
      validationErrors.email = ''; return true
    case 'password':
      if (!form.password) { validationErrors.password = 'Password is required'; return false }
      if (form.password.length < 6) { validationErrors.password = 'Password must be at least 6 characters'; return false }
      validationErrors.password = ''; return true
    default: return true
  }
}

function validateAll(): boolean {
  const fields = ['fullName', 'dob', 'email', 'password']
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
      role: 'PATIENT',
      date_of_birth: form.dob || undefined,
      insurance_id: form.insuranceId || undefined,
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
  gap: 10px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(77, 208, 225, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
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

.left-footer {
  position: absolute;
  bottom: 40px;
  left: 60px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* ─── Right Panel ─── */
.right-panel {
  width: 50%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 48px 40px;
  overflow-y: auto;
}

.teal-accent-line {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4dd0e1, var(--primary));
  flex-shrink: 0;
}

.form-container {
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 40px;
}

.form-header {
  margin-bottom: 28px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.form-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1.5px solid #4dd0e1;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #4dd0e1;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
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

.optional-tag {
  font-style: italic;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: #9ca3af;
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

.input-wrapper input[type="date"] {
  color: var(--text-primary);
}

.input-wrapper input[type="date"]:invalid,
.input-wrapper input[type="date"][value=""] {
  color: #9ca3af;
}

.input-icon-right {
  flex-shrink: 0;
  margin-left: 8px;
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

/* ─── Security Info ─── */
.security-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 28px;
  padding: 16px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 8px;
}

.security-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.security-info p {
  font-size: 0.75rem;
  color: #5f6b7a;
  line-height: 1.6;
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .left-panel {
    padding: 40px;
  }
  .right-panel {
    padding: 0 36px 32px;
  }
  .hero-text h1 {
    font-size: 1.875rem;
  }
  .left-footer {
    left: 40px;
    bottom: 30px;
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
    padding: 0 24px 32px;
  }
  .form-container {
    max-width: 100%;
  }
  .hero-text h1 {
    font-size: 1.5rem;
  }
  .left-footer {
    position: relative;
    left: 0;
    bottom: 0;
    margin-top: 32px;
  }
  .form-row {
    flex-direction: column;
    gap: 18px;
  }
}
</style>
