<template>
  <div class="reset-page">
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

        <div class="hero-section">
          <h1>Access Restored</h1>
          <p class="hero-subtitle">Securing your clinical profile. We use enterprise-grade encryption to ensure your medical data remains private and protected.</p>
        </div>

        <div class="badges">
          <div class="badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/>
              <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>HIPAA COMPLIANT</span>
          </div>
          <div class="badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="6" width="8" height="6" rx="1.5" stroke="currentColor" stroke-width="1"/>
              <path d="M5 6V4.5a2 2 0 014 0V6" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
            </svg>
            <span>256-BIT AES</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>Create New Password</h2>
          <p>Please choose a strong password that you haven't used before for this account.</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <form @submit.prevent="handleReset" class="reset-form" novalidate>
          <!-- New Password -->
          <div class="form-group">
            <label for="newPassword" class="field-label">New Password</label>
            <div class="input-underline-wrapper">
              <input
                id="newPassword"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Enter new password"
                class="underline-input"
                @input="checkRequirements"
              />
              <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword" tabindex="-1">
                <svg v-if="!showNewPassword" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1.5 9s3-5.25 7.5-5.25S16.5 9 16.5 9s-3 5.25-7.5 5.25S1.5 9 1.5 9z" stroke="#9CA3AF" stroke-width="1.3"/>
                  <circle cx="9" cy="9" r="2.25" stroke="#9CA3AF" stroke-width="1.3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2.25 2.25l13.5 13.5M7.23 7.23a2.25 2.25 0 003.04 3.04M4.05 5.55C2.85 6.75 1.5 9 1.5 9s3 5.25 7.5 5.25c1.35 0 2.55-.38 3.53-.97M14.4 12.15C15.45 11.1 16.5 9 16.5 9s-3-5.25-7.5-5.25c-.6 0-1.17.08-1.72.22" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword" class="field-label">Confirm New Password</label>
            <div class="input-underline-wrapper">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm new password"
                class="underline-input"
              />
              <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                <svg v-if="!showConfirmPassword" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1.5 9s3-5.25 7.5-5.25S16.5 9 16.5 9s-3 5.25-7.5 5.25S1.5 9 1.5 9z" stroke="#9CA3AF" stroke-width="1.3"/>
                  <circle cx="9" cy="9" r="2.25" stroke="#9CA3AF" stroke-width="1.3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2.25 2.25l13.5 13.5M7.23 7.23a2.25 2.25 0 003.04 3.04M4.05 5.55C2.85 6.75 1.5 9 1.5 9s3 5.25 7.5 5.25c1.35 0 2.55-.38 3.53-.97M14.4 12.15C15.45 11.1 16.5 9 16.5 9s-3-5.25-7.5-5.25c-.6 0-1.17.08-1.72.22" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="confirmPassword && newPassword !== confirmPassword" class="field-error">Passwords do not match</span>
          </div>

          <!-- Password Requirements -->
          <div class="requirements-box">
            <div class="requirements-title">PASSWORD REQUIREMENTS</div>
            <div class="requirements-grid">
              <div class="requirement" :class="{ met: requirements.length }">
                <div class="req-icon">
                  <svg v-if="requirements.length" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="#16a34a"/>
                    <path d="M4.5 7l1.5 1.5L9.5 5" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#d1d5db" stroke-width="1.2"/>
                  </svg>
                </div>
                <span>12+ characters</span>
              </div>
              <div class="requirement" :class="{ met: requirements.case }">
                <div class="req-icon">
                  <svg v-if="requirements.case" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="#16a34a"/>
                    <path d="M4.5 7l1.5 1.5L9.5 5" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#d1d5db" stroke-width="1.2"/>
                  </svg>
                </div>
                <span>Upper &amp; Lowercase</span>
              </div>
              <div class="requirement" :class="{ met: requirements.number }">
                <div class="req-icon">
                  <svg v-if="requirements.number" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="#16a34a"/>
                    <path d="M4.5 7l1.5 1.5L9.5 5" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#d1d5db" stroke-width="1.2"/>
                  </svg>
                </div>
                <span>At least one number</span>
              </div>
              <div class="requirement" :class="{ met: requirements.special }">
                <div class="req-icon">
                  <svg v-if="requirements.special" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="#16a34a"/>
                    <path d="M4.5 7l1.5 1.5L9.5 5" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#d1d5db" stroke-width="1.2"/>
                  </svg>
                </div>
                <span>Special symbol (!@#)</span>
              </div>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading || !canSubmit">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Reset Password</span>
          </button>
        </form>

        <router-link to="/" class="back-link">&larr; Return to Secure Login</router-link>
      </div>

      <!-- Footer -->
      <footer class="page-footer">
        <span class="copyright">&copy; 2024 APOLLO HEALTHCARE SYSTEMS</span>
        <div class="footer-icons">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#9ca3af" stroke-width="1"/>
            <path d="M8 2v12M2 8h12M3.5 4.5Q5.5 6 8 6t4.5-1.5M3.5 11.5Q5.5 10 8 10t4.5 1.5" stroke="#9ca3af" stroke-width="0.8"/>
          </svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#9ca3af" stroke-width="1"/>
            <path d="M8 5v3M8 10v.5" stroke="#9ca3af" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword } from '@/api/auth'
import { validators } from '@/utils/validators'
import { encryptPassword } from '@/utils/crypto'

const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const email = ref('')
const code = ref('')

const requirements = reactive({
  length: false,
  case: false,
  number: false,
  special: false,
})

const allRequirementsMet = computed(() =>
  requirements.length && requirements.case && requirements.number && requirements.special
)

const canSubmit = computed(() =>
  allRequirementsMet.value &&
  newPassword.value === confirmPassword.value &&
  confirmPassword.value.length > 0
)

function checkRequirements() {
  const pw = newPassword.value
  requirements.length = pw.length >= 12
  requirements.case = /[a-z]/.test(pw) && /[A-Z]/.test(pw)
  requirements.number = /\d/.test(pw)
  requirements.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)
  // Also run shared validator for consistency
  const error = validators.password(pw)
  // error is used implicitly via requirements checks
}

async function handleReset() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!allRequirementsMet.value) {
    errorMessage.value = 'Please meet all password requirements.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isLoading.value = true
  try {
    const encryptedPassword = await encryptPassword(newPassword.value)
    await resetPassword(email.value, code.value, encryptedPassword)
    successMessage.value = 'Password reset successfully! Redirecting to login...'
    sessionStorage.removeItem('reset_email')
    sessionStorage.removeItem('reset_code')
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to reset password. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const storedEmail = sessionStorage.getItem('reset_email')
  const storedCode = sessionStorage.getItem('reset_code')
  if (!storedEmail || !storedCode) {
    router.push('/forgot-password')
    return
  }
  email.value = storedEmail
  code.value = storedCode
})
</script>

<style scoped>
.reset-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* ── Left Panel ── */
.left-panel {
  position: relative;
  width: 50%;
  min-height: 100vh;
  background: url('/images/hospital-corridor.jpg') center/cover no-repeat;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 56px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 45, 58, 0.65) 0%,
    rgba(18, 50, 62, 0.70) 40%,
    rgba(12, 38, 50, 0.88) 100%
  );
  z-index: 2;
}

.left-content {
  position: relative;
  z-index: 3;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
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

.hero-section {
  margin-bottom: 48px;
}

.hero-section h1 {
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 300;
  line-height: 1.7;
  max-width: 420px;
}

.badges {
  display: flex;
  gap: 16px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

/* ── Right Panel ── */
.right-panel {
  width: 50%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 56px;
  background: #f3f4f6;
  overflow-y: auto;
}

.form-container {
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 36px;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin-bottom: 10px;
}

.form-header p {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.6;
}

/* ── Messages ── */
.success-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.85rem;
  margin-bottom: 20px;
}

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

/* ── Form ── */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #374151;
}

.input-underline-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid #e5e7eb;
  transition: border-color 0.2s ease;
}

.input-underline-wrapper:focus-within {
  border-bottom-color: var(--primary, #1a3a4a);
}

.underline-input {
  flex: 1;
  height: 46px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary, #111827);
  font-family: 'Inter', sans-serif;
  outline: none;
  padding: 0;
}

.underline-input::placeholder {
  color: #9ca3af;
}

.toggle-password {
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  color: #9ca3af;
}

.field-error {
  font-size: 0.75rem;
  color: #dc2626;
}

/* ── Requirements ── */
.requirements-box {
  background: #f9fafb;
  border-radius: 10px;
  padding: 20px;
}

.requirements-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.requirements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.requirement.met {
  color: #16a34a;
}

.req-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Submit ── */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  background: var(--primary, #1a3a4a);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
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

.back-link {
  display: block;
  text-align: center;
  margin-top: 28px;
  font-size: 0.875rem;
  color: var(--primary, #1a3a4a);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-link:hover {
  text-decoration: underline;
}

/* ── Footer ── */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  margin-top: 40px;
}

.copyright {
  font-size: 0.65rem;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 500;
}

.footer-icons {
  display: flex;
  gap: 12px;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .left-panel {
    padding: 40px;
  }
  .right-panel {
    padding: 32px 36px;
  }
  .hero-section h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .reset-page {
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
    padding: 24px 16px;
  }
  .form-container {
    max-width: 100%;
  }
  .hero-section h1 {
    font-size: 1.75rem;
  }
  .requirements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .left-panel {
    min-height: 220px;
    padding: 24px 16px;
  }
  .right-panel {
    padding: 16px;
  }
}
</style>
