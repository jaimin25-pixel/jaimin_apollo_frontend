<template>
  <div class="verify-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="overlay"></div>
      <div class="left-content">
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1l2.5 1.5v3c0 3-2.5 5.5-2.5 5.5S7.5 8.5 7.5 5.5v-3L10 1z" stroke="white" stroke-width="1.3" fill="none"/>
          </svg>
          <span class="logo-title">APOLLO HOSPITAL</span>
        </div>

        <div class="hero-section">
          <h1>Security in Precision</h1>
          <p class="hero-subtitle">Verifying clinical access to ensure the highest standards of patient data integrity.</p>
        </div>

        <div class="authorized-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/>
            <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>AUTHORIZED PERSONNEL ONLY</span>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="form-wrapper">
        <div class="form-card">
          <div class="form-header">
            <h2>Verify Your Identity</h2>
            <p>Enter the 6-digit code sent to your <strong>institutional email</strong> to proceed to the clinical dashboard.</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-banner">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Code Inputs -->
          <form @submit.prevent="handleVerify" novalidate>
            <div class="code-inputs">
              <input
                v-for="(_, index) in codeDigits"
                :key="index"
                :ref="el => { if (el) inputRefs[index] = el as HTMLInputElement }"
                v-model="codeDigits[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="code-box"
                :class="{ filled: codeDigits[index] }"
                @input="handleInput(index)"
                @keydown="handleKeydown($event, index)"
                @paste="handlePaste($event)"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading || !isCodeComplete">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Verify Code &rarr;</span>
            </button>
          </form>

          <div class="resend-section">
            <span class="resend-text">Didn't receive the code? </span>
            <button
              v-if="resendTimer <= 0"
              class="resend-btn"
              @click="handleResend"
              :disabled="isResending"
            >
              Resend Code
            </button>
            <span v-else class="resend-timer">Resend Code ({{ formattedTimer }})</span>
          </div>

          <div class="card-footer">
            <span>END-TO-END ENCRYPTED</span>
            <span class="dot">&bull;</span>
            <span>HIPAA COMPLIANT</span>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar">
        <div class="slide-indicators">
          <span class="indicator"></span>
          <span class="indicator active"></span>
          <span class="indicator"></span>
        </div>
        <a href="#" class="admin-link" @click.prevent>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/>
            <path d="M7 4v3M7 9v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Contact System Admin
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { verifyCode, forgotPassword } from '@/api/auth'

const router = useRouter()

const codeDigits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const resendTimer = ref(60)
let timerInterval: ReturnType<typeof setInterval> | null = null

const email = ref('')

const isCodeComplete = computed(() => codeDigits.value.every(d => d !== ''))

const formattedTimer = computed(() => {
  const mins = Math.floor(resendTimer.value / 60)
  const secs = resendTimer.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

function startTimer() {
  resendTimer.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0 && timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }, 1000)
}

function handleInput(index: number) {
  const val = codeDigits.value[index]
  if (val && !/^\d$/.test(val)) {
    codeDigits.value[index] = ''
    return
  }
  if (val && index < 5) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus()
    })
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || ''
  for (let i = 0; i < 6; i++) {
    codeDigits.value[i] = pasted[i] || ''
  }
  const focusIndex = Math.min(pasted.length, 5)
  nextTick(() => {
    inputRefs.value[focusIndex]?.focus()
  })
}

async function handleVerify() {
  errorMessage.value = ''
  const code = codeDigits.value.join('')
  if (code.length !== 6) return

  isLoading.value = true
  try {
    await verifyCode(email.value, code)
    sessionStorage.setItem('reset_code', code)
    router.push('/reset-password')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Invalid verification code. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function handleResend() {
  isResending.value = true
  errorMessage.value = ''
  try {
    await forgotPassword(email.value)
    startTimer()
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || err.message || 'Failed to resend code.'
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  const storedEmail = sessionStorage.getItem('reset_email')
  if (!storedEmail) {
    router.push('/forgot-password')
    return
  }
  email.value = storedEmail
  startTimer()
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.verify-page {
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
    rgba(12, 38, 50, 0.72) 0%,
    rgba(15, 42, 55, 0.78) 40%,
    rgba(10, 32, 44, 0.92) 100%
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
  gap: 10px;
}

.logo-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-section {
  margin-bottom: 60px;
}

.hero-section h1 {
  font-size: 3rem;
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
  max-width: 400px;
}

.authorized-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  width: fit-content;
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

.form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  max-width: 440px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 44px 40px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin-bottom: 10px;
}

.form-header p {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.6;
}

.form-header strong {
  color: var(--primary, #1a3a4a);
  font-weight: 600;
}

/* ── Error ── */
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
  margin-bottom: 24px;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* ── Code Inputs ── */
.code-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 28px;
}

.code-box {
  width: 52px;
  height: 56px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  text-align: center;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.code-box:focus {
  border-color: var(--primary, #1a3a4a);
  box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.1);
  background: #ffffff;
}

.code-box.filled {
  border-color: var(--primary, #1a3a4a);
  background: #ffffff;
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

/* ── Resend ── */
.resend-section {
  text-align: center;
  margin-top: 24px;
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

.resend-text {
  color: var(--text-secondary, #6b7280);
}

.resend-btn {
  background: none;
  border: none;
  color: var(--primary, #1a3a4a);
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
  transition: color 0.2s ease;
}

.resend-btn:hover {
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resend-timer {
  color: #9ca3af;
  font-size: 0.8125rem;
}

/* ── Card Footer ── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: #9ca3af;
  text-transform: uppercase;
}

.dot {
  font-size: 0.5rem;
}

/* ── Bottom Bar ── */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
}

.slide-indicators {
  display: flex;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--primary, #1a3a4a);
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.admin-link:hover {
  color: var(--primary, #1a3a4a);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .left-panel {
    padding: 40px;
  }
  .right-panel {
    padding: 32px 24px;
  }
  .hero-section h1 {
    font-size: 2.25rem;
  }
  .form-card {
    padding: 32px 28px;
  }
  .code-box {
    width: 46px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .verify-page {
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
  .form-card {
    max-width: 100%;
  }
  .hero-section h1 {
    font-size: 1.75rem;
  }
  .code-box {
    width: 42px;
    height: 46px;
    font-size: 1.1rem;
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
  .code-inputs {
    gap: 6px;
  }
  .code-box {
    width: 38px;
    height: 42px;
    font-size: 1rem;
    border-radius: 8px;
  }
}
</style>
