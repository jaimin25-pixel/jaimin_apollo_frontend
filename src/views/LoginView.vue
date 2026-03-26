<template>
  <div class="login-page">
    <!-- Left Panel - Hero Image -->
    <div class="left-panel">
      <div class="overlay"></div>
      <div class="left-content">
        <div class="hero-text">
          <h1>Advancing the Frontier of Clinical Excellence</h1>
          <p>
            Empowering healthcare professionals with cutting-edge technology
            to deliver exceptional patient care and streamline hospital operations.
          </p>
        </div>
        <div class="slide-indicators">
          <span class="indicator active"></span>
          <span class="indicator"></span>
          <span class="indicator"></span>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="right-panel">
      <div class="form-container">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo">
            <img :src="logoSvg" alt="Apollo Hospital" class="logo-img" />
            <div class="logo-text">
              <span class="logo-title">Apollo Hospital</span>
            </div>
          </div>
        </div>

        <!-- Form Header -->
        <div class="form-header">
          <h2>Login</h2>
          <p>Please identify your role and enter your credentials</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Role Selector -->
        <div class="role-selector">
          <label class="field-label">Select Role</label>
          <div class="role-cards">
            <button
              v-for="role in roles"
              :key="role.value"
              class="role-card"
              :class="{ active: selectedRole === role.value }"
              @click="selectedRole = role.value"
              type="button"
            >
              <div class="role-icon" v-html="role.icon"></div>
              <span class="role-name">{{ role.label }}</span>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="field-label">Email Address</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.email }">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2.25 4.5L8.16 8.41a1.5 1.5 0 001.68 0L15.75 4.5" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="1.5" y="3" width="15" height="12" rx="2" stroke="#9CA3AF" stroke-width="1.3"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="e.g. j.doe@apollo.health"
                autocomplete="email"
                @blur="validateEmail"
              />
            </div>
            <span v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="field-label">Password</label>
            <div class="input-wrapper" :class="{ 'input-error': validationErrors.password }">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="8.25" width="12" height="8.25" rx="2" stroke="#9CA3AF" stroke-width="1.3"/>
                <path d="M5.25 8.25V5.25a3.75 3.75 0 017.5 0v3" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                <circle cx="9" cy="12.375" r="1.125" fill="#9CA3AF"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
                @blur="validatePassword"
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
            <div v-if="password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :style="{ width: `${(strength.score / 4) * 100}%`, background: strength.color }"></div>
              </div>
              <span class="strength-label" :style="{ color: strength.color }">{{ strength.label }}</span>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              <span class="checkbox-label">Remember Me</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">Forgot Password?</router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Sign In to Portal</span>
            <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9h10.5M10.5 5.25L14.25 9l-3.75 3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>

        <!-- Register Link -->
        <p class="register-link">
          New to Apollo?
          <router-link :to="`/register/${selectedRole.toLowerCase()}`">Create Account</router-link>
        </p>
      </div>

      <!-- Footer -->
      <footer class="login-footer">
        <span class="copyright">&copy; 2026 Apollo Hospital. All rights reserved.</span>
        <div class="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'
import logoSvg from '@/assets/images/logo.svg'
import { validators, passwordStrength } from '@/utils/validators'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const selectedRole = ref<UserRole>('doctor')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const validationErrors = reactive({
  email: '',
  password: '',
})

const roles = [
  {
    value: 'doctor' as UserRole,
    label: 'Doctor',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.4h14.4c1.32 0 2.4 1.08 2.4 2.4v14.4c0 1.32-1.08 2.4-2.4 2.4H4.8c-1.32 0-2.4-1.08-2.4-2.4V4.8c0-1.32 1.08-2.4 2.4-2.4z"/><path d="M8 10h8M12 6v8"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg>`,
  },
  {
    value: 'patient' as UserRole,
    label: 'Patient',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a5 5 0 0110 0v2"/><path d="M17 10l2 2 4-4"/></svg>`,
  },
  {
    value: 'pharmacist' as UserRole,
    label: 'Pharmacist',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-1.5 6H7.5L6 3z"/><rect x="5" y="9" width="14" height="12" rx="2"/><path d="M9 9v12M15 9v12M5 15h14"/></svg>`,
  },
  {
    value: 'admin' as UserRole,
    label: 'Admin',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.09 4.26L19 7.27l-3.5 3.41.82 4.82L12 13.4l-4.32 2.1.82-4.82L5 7.27l4.91-1.01L12 2z"/><circle cx="12" cy="17" r="5"/><path d="M12 14v3l2 1"/></svg>`,
  },
]

const strength = computed(() => passwordStrength(password.value))

function validateEmail(): boolean {
  const error = validators.email(email.value)
  validationErrors.email = error || ''
  return !error
}

function validatePassword(): boolean {
  const error = validators.loginPassword(password.value)
  validationErrors.password = error || ''
  return !error
}

async function handleLogin() {
  errorMessage.value = ''
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) return

  isLoading.value = true
  try {
    await authStore.login(email.value, password.value, selectedRole.value)
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    errorMessage.value = err.message || 'Login failed. Please check your credentials and try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ─── Left Panel ─── */
.left-panel {
  position: relative;
  width: 60%;
  min-height: 100vh;
  background: url('/images/hospital-corridor.jpg') center/cover no-repeat;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 60px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 45, 58, 0.65) 0%,
    rgba(18, 50, 62, 0.70) 40%,
    rgba(12, 38, 50, 0.85) 100%
  );
  z-index: 2;
}

.left-content {
  position: relative;
  z-index: 3;
  color: #ffffff;
  max-width: 540px;
}

.hero-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero-text p {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

.slide-indicators {
  display: flex;
  gap: 8px;
  margin-top: 40px;
}

.indicator {
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
}

.indicator.active {
  width: 48px;
  background: #ffffff;
}

/* ─── Right Panel ─── */
.right-panel {
  width: 40%;
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

/* ─── Logo ─── */
.logo-section {
  margin-bottom: 36px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 48px;
  height: 48px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* ─── Form Header ─── */
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
  background: var(--error-bg);
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--error);
  font-size: 0.85rem;
  margin-bottom: 20px;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* ─── Role Selector ─── */
.role-selector {
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
  color: var(--text-secondary);
}

.role-card:hover {
  border-color: var(--primary-light);
  background: #f0f7fa;
  color: var(--primary);
}

.role-card.active {
  border-color: var(--primary);
  background: #eef6f9;
  color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.1);
}

.role-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-name {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* ─── Form Fields ─── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0 14px;
  height: 46px;
  background: var(--bg);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.08);
}

.input-wrapper.input-error {
  border-color: var(--error);
}

.input-wrapper.input-error:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  flex-shrink: 0;
  margin-right: 10px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  height: 100%;
}

.input-wrapper input::placeholder {
  color: #9ca3af;
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
  color: var(--error);
  padding-left: 2px;
}

/* ─── Form Options ─── */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--border);
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: var(--bg);
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

.checkbox-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  user-select: none;
}

.forgot-link {
  font-size: 0.8125rem;
  color: var(--primary);
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-light);
  text-decoration: underline;
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
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.1s ease;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
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

/* ─── Register Link ─── */
.register-link {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 24px;
}

.register-link a {
  color: var(--primary);
  font-weight: 600;
  transition: color 0.2s ease;
}

.register-link a:hover {
  text-decoration: underline;
}

/* ─── Footer ─── */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}

.copyright {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  font-size: 0.7rem;
  color: var(--text-secondary);
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
    width: 50%;
    padding: 40px;
  }

  .right-panel {
    width: 50%;
    padding: 32px 36px;
  }

  .hero-text h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-height: 240px;
    padding: 32px 24px;
  }

  .hero-text h1 {
    font-size: 1.5rem;
  }

  .hero-text p {
    font-size: 0.875rem;
  }

  .right-panel {
    width: 100%;
    min-height: auto;
    padding: 32px 24px;
  }

  .form-container {
    max-width: 100%;
  }

  .role-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .login-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .left-panel {
    min-height: 180px;
    padding: 24px 16px;
  }

  .right-panel {
    padding: 24px 16px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
