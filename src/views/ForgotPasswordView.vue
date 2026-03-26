<template>
  <div class="forgot-page">
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
          <h1>Precision in Recovery.</h1>
          <p class="hero-subtitle">Restoring access with clinical security.</p>
        </div>

        <div class="badges">
          <div class="badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/>
              <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>INSTITUTIONAL GRADE</span>
          </div>
          <div class="badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5l1.5 1.2 1.8-.3.6 1.8 1.6.9-.1 1.9 1.2 1.5-1.2 1.5.1 1.9-1.6.9-.6 1.8-1.8-.3L7 12.5l-1.5-1.2-1.8.3-.6-1.8-1.6-.9.1-1.9L.4 5.5l1.2-1.5-.1-1.9 1.6-.9.6-1.8 1.8.3L7 1.5z" stroke="currentColor" stroke-width="1" fill="none"/>
            </svg>
            <span>SECURE RECOVERY</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>Forgot Password</h2>
          <p>Enter the institutional email associated with your account, and we'll send a secure password reset link.</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="forgot-form" novalidate>
          <div class="form-group">
            <label for="email" class="field-label">INSTITUTIONAL EMAIL</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="e.g. j.doe@apollo.health"
              class="underline-input"
              :class="{ 'input-error': validationError }"
              @input="validationError = ''"
            />
            <span v-if="validationError" class="field-error">{{ validationError }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>SEND RESET LINK</span>
          </button>
        </form>

        <router-link to="/" class="back-link">&larr; Return to Login</router-link>

        <div class="security-badges">
          <div class="security-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1.5" stroke="currentColor" stroke-width="1"/>
              <path d="M4 5V3.5a2 2 0 014 0V5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
            </svg>
            <span>AES-256 ENCRYPTED</span>
          </div>
          <div class="security-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1l3 1.5v3c0 2.5-3 4.5-3 4.5S3 8 3 5.5v-3L6 1z" stroke="currentColor" stroke-width="1" fill="none"/>
            </svg>
            <span>HIPAA COMPLIANT</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="page-footer">
        <span class="copyright">&copy; 2024 APOLLO HOSPITAL MANAGEMENT SYSTEM. PRECISION IN CARE.</span>
        <div class="footer-links">
          <a href="#">PRIVACY POLICY</a>
          <a href="#">TERMS OF SERVICE</a>
          <a href="#">CONTACT SUPPORT</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword } from '@/api/auth'
import { validators } from '@/utils/validators'

const router = useRouter()

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const validationError = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  const emailError = validators.email(email.value)
  if (emailError) {
    validationError.value = emailError
    return
  }

  isLoading.value = true
  try {
    const response = await forgotPassword(email.value)
    sessionStorage.setItem('reset_email', email.value)
    const code = response.code || ''
    successMessage.value = `Reset code sent successfully.${code ? ` [DEV] Code: ${code}` : ''}`
    setTimeout(() => {
      router.push('/verify-code')
    }, 2000)
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to send reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* ── Left Panel ── */
.left-panel {
  position: relative;
  width: 60%;
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
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
  line-height: 1.6;
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
  width: 40%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 56px;
  background: #ffffff;
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
.forgot-form {
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
  text-transform: uppercase;
}

.underline-input {
  width: 100%;
  height: 46px;
  border: none;
  border-bottom: 1.5px solid #e5e7eb;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary, #111827);
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s ease;
  padding: 0 0 4px 0;
}

.underline-input::placeholder {
  color: #9ca3af;
}

.underline-input:focus {
  border-bottom-color: var(--primary, #1a3a4a);
}

.underline-input.input-error {
  border-bottom-color: #dc2626;
}

.field-error {
  font-size: 0.75rem;
  color: #dc2626;
}

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
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

/* ── Security Badges ── */
.security-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 48px;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Footer ── */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  max-width: 100%;
  width: 100%;
  margin-top: 40px;
}

.copyright {
  font-size: 0.6rem;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 500;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  font-size: 0.6rem;
  color: #9ca3af;
  text-decoration: none;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--primary, #1a3a4a);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .left-panel {
    width: 50%;
    padding: 40px;
  }
  .right-panel {
    width: 50%;
    padding: 32px 36px;
  }
  .hero-section h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .forgot-page {
    flex-direction: column;
  }
  .left-panel {
    width: 100%;
    min-height: 260px;
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
  .hero-section h1 {
    font-size: 1.5rem;
  }
  .page-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  .badges {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .left-panel {
    min-height: 200px;
    padding: 24px 16px;
  }
  .right-panel {
    padding: 24px 16px;
  }
}
</style>
