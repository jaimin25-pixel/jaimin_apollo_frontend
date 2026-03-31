<template>
  <div class="profile-container">
    <h1>{{ isDoctorUser ? 'Doctor Profile' : 'My Profile' }}</h1>

    <div v-if="loading" class="loading">
      <span>Loading profile...</span>
    </div>

    <div v-else-if="profile" class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <span class="avatar-initials">{{ getInitials }}</span>
        </div>
        <div class="profile-info">
          <h2>{{ profile.full_name }}</h2>
          <p class="role-badge">{{ formatRole(profile.role) }}</p>
          <p v-if="isDoctorUser && doctorProfile" class="specialization">{{ doctorProfile.specialization }}</p>
          <p class="status" :class="`status-${profile.is_active ? 'active' : 'inactive'}`">
            {{ profile.is_active ? 'Active' : 'Inactive' }}
          </p>
        </div>
      </div>

      <!-- Profile Details Grid -->
      <div class="details-grid">
        <!-- Left Column -->
        <div class="details-column">
          <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-item">
              <label>Full Name</label>
              <span>{{ profile.full_name }}</span>
            </div>
            <div class="detail-item">
              <label>Email</label>
              <span>{{ profile.email }}</span>
            </div>
            <div class="detail-item">
              <label>Phone</label>
              <span>{{ profile.phone || 'N/A' }}</span>
            </div>
          </div>

          <div v-if="isDoctorUser && doctorProfile" class="detail-section">
            <h3>Professional Details</h3>
            <div class="detail-item">
              <label>Doctor Code</label>
              <span>{{ doctorProfile.doc_code }}</span>
            </div>
            <div class="detail-item">
              <label>Specialization</label>
              <span>{{ doctorProfile.specialization }}</span>
            </div>
            <div class="detail-item">
              <label>Qualification</label>
              <span>{{ doctorProfile.qualification }}</span>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="details-column">
          <div class="detail-section">
            <h3>Account & Employment</h3>
            <div class="detail-item">
              <label>Role</label>
              <span>{{ formatRole(profile.role) }}</span>
            </div>
            <div v-if="isDoctorUser && doctorProfile" class="detail-item">
              <label>Department</label>
              <span>{{ doctorProfile.department?.name || 'N/A' }}</span>
            </div>
            <div v-if="isDoctorUser && doctorProfile?.joining_date" class="detail-item">
              <label>Joining Date</label>
              <span>{{ formatDate(doctorProfile.joining_date) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>Account Settings</h3>
            <div class="detail-item">
              <label>Created At</label>
              <span>{{ formatDateTime(profile.created_at) }}</span>
            </div>
            <div class="detail-item" v-if="profile.updated_at">
              <label>Last Updated</label>
              <span>{{ formatDateTime(profile.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Button -->
      <div class="profile-actions">
        <button class="btn-primary" @click="isEditMode = !isEditMode">
          {{ isEditMode ? 'Cancel' : 'Edit Profile' }}
        </button>
      </div>

      <!-- Edit Mode -->
      <div v-if="isEditMode" class="edit-form">
        <h3>Edit Profile</h3>
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="editForm.full_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="editForm.phone" type="tel" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-save">Save Changes</button>
            <button type="button" class="btn-cancel" @click="isEditMode = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-else class="no-profile">
      <p>Profile information unavailable</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const isEditMode = ref(false)

const profile = computed(() => authStore.user)
const doctorProfile = computed(() => authStore.doctor)
const isDoctorUser = computed(() => authStore.isDoctorUser)

const editForm = ref({
  full_name: profile.value?.full_name || '',
  phone: profile.value?.phone || '',
})

const getInitials = computed(() => {
  if (!profile.value?.full_name) return 'U'
  return profile.value.full_name
    .split(' ')
    .filter(n => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

function formatRole(role?: string) {
  if (!role) return 'User'
  return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString()
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString()
}

async function saveProfile() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:8080/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: editForm.value.full_name,
        phone: editForm.value.phone
      })
    })

    if (!res.ok) throw new Error('Failed to update profile')

    if (profile.value) {
      profile.value.full_name = editForm.value.full_name
      profile.value.phone = editForm.value.phone
    }

    isEditMode.value = false
  } catch (err) {
    console.error(err)
    alert('Failed to update profile')
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.profile-header {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  align-items: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
}

.profile-info h2 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.role-badge {
  color: #666;
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
}

.specialization {
  color: #764ba2;
  margin: 0.5rem 0;
  font-weight: 600;
  font-size: 1rem;
}

.status {
  margin: 0.5rem 0 0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.details-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-section h3 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.detail-item span {
  color: #333;
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.profile-actions {
  text-align: center;
  margin: 2rem 0;
}

.btn-primary {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.edit-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.edit-form h3 {
  margin: 0 0 1.5rem;
  color: #333;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-save:hover {
  background: #059669;
}

.btn-cancel {
  background: #e5e7eb;
  color: #333;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.no-profile {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-item span {
    text-align: left;
    max-width: 100%;
  }
}
</style>
