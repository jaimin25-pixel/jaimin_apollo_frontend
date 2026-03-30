<template>
  <div class="access-denied-page">
    <div class="denial-container">
      <!-- Icon -->
      <div class="denial-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#EF4444" stroke-width="2"/>
          <path d="M40 24V44M40 54V56" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Title -->
      <h1>Access Denied</h1>

      <!-- Message -->
      <p class="denial-message">
        This area is restricted to hospital doctors only. Your account does not have the required permissions to access the doctor portal.
      </p>

      <!-- Details -->
      <div class="denial-details">
        <div class="detail-item">
          <span class="detail-label">Account Type:</span>
          <span class="detail-value">{{ userRole }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{ userEmail }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="denial-actions">
        <button @click="goToDashboard" class="btn-primary">
          Go to Dashboard
        </button>
        <button @click="logout" class="btn-secondary">
          Logout
        </button>
      </div>

      <!-- Help Text -->
      <p class="help-text">
        If you believe this is an error, please contact the hospital administration or your department manager.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userRole = computed(() => authStore.user?.role || 'Unknown')
const userEmail = computed(() => authStore.user?.email || 'N/A')

function goToDashboard() {
  const redirectRoute = authStore.getLoginRedirectRoute()
  if (redirectRoute !== '/login') {
    router.push(redirectRoute)
  } else {
    router.push('/')
  }
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.access-denied-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.denial-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  padding: 60px 40px;
  text-align: center;
}

.denial-icon {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.denial-message {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 32px;
}

.denial-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
  word-break: break-all;
}

.denial-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.help-text {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 16px;
}
</style>
