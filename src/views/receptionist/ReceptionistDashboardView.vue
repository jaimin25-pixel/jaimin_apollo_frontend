<template>
  <div class="dashboard">
    <h1>Reception Dashboard</h1>

    <div class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Today's Appointments</h3>
          <p class="stat-value">{{ stats.todayAppointments || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending Check-ins</h3>
          <p class="stat-value">{{ stats.pendingCheckIns || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Completed Today</h3>
          <p class="stat-value">{{ stats.completedToday || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Walk-ins Queue</h3>
          <p class="stat-value">{{ stats.walkInsQueue || 0 }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/receptionist/appointments" class="action-card">
            <span class="action-icon">📅</span>
            <span>Schedule Appointment</span>
          </router-link>
          <router-link to="/receptionist/patients" class="action-card">
            <span class="action-icon">👥</span>
            <span>Check-in Patient</span>
          </router-link>
          <router-link to="/receptionist/billing" class="action-card">
            <span class="action-icon">💳</span>
            <span>Process Payment</span>
          </router-link>
          <button @click="handlePrint" class="action-card">
            <span class="action-icon">🖨️</span>
            <span>Print Documents</span>
          </button>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="schedule-section">
        <h2>Today's Appointments Overview</h2>
        <div v-if="todayAppointments.length === 0" class="no-data">
          <p>No appointments scheduled for today</p>
        </div>
        <div v-else class="appointments-list">
          <div v-for="appt in todayAppointments.slice(0, 8)" :key="appt.id" class="appointment-item">
            <div class="time">{{ formatTime(appt.appointment_time) }}</div>
            <div class="details">
              <p class="patient-name">{{ appt.patient_name }}</p>
              <p class="doctor">Dr. {{ appt.doctor_name }}</p>
            </div>
            <div class="status">
              <span :class="`badge badge-${appt.status}`">{{ appt.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Info -->
      <div class="info-section">
        <h2>Department Contacts</h2>
        <div class="contact-grid">
          <div class="contact-card">
            <h4>General Medicine</h4>
            <p>Extension: 2001</p>
          </div>
          <div class="contact-card">
            <h4>Cardiology</h4>
            <p>Extension: 2002</p>
          </div>
          <div class="contact-card">
            <h4>Neurology</h4>
            <p>Extension: 2003</p>
          </div>
          <div class="contact-card">
            <h4>Orthopedics</h4>
            <p>Extension: 2004</p>
          </div>
          <div class="contact-card">
            <h4>Emergency</h4>
            <p>Extension: 1911</p>
          </div>
          <div class="contact-card">
            <h4>Reception</h4>
            <p>Extension: 1001</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref({
  todayAppointments: 12,
  pendingCheckIns: 3,
  completedToday: 8,
  walkInsQueue: 2,
})

const todayAppointments = ref([
  {
    id: 1,
    appointment_time: new Date().toISOString(),
    patient_name: 'Raj Kumar',
    doctor_name: 'Rajesh Kumar',
    status: 'completed',
  },
  {
    id: 2,
    appointment_time: new Date(Date.now() + 3600000).toISOString(),
    patient_name: 'Priya Sharma',
    doctor_name: 'Priya Sharma',
    status: 'confirmed',
  },
  {
    id: 3,
    appointment_time: new Date(Date.now() + 7200000).toISOString(),
    patient_name: 'Anil Mehta',
    doctor_name: 'Anil Mehta',
    status: 'pending',
  },
])

onMounted(() => {
  // Initialize dashboard data
})

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
}

.stat-card h3 {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h2 {
  color: #333;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-icon {
  font-size: 2rem;
}

.schedule-section,
.info-section {
  margin-bottom: 2rem;
}

.schedule-section h2,
.info-section h2 {
  color: #333;
  margin-bottom: 1rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointments-list {
  display: grid;
  gap: 1rem;
}

.appointment-item {
  display: grid;
  grid-template-columns: 80px 1fr 100px;
  gap: 1rem;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time {
  font-weight: 600;
  color: #667eea;
  font-size: 0.95rem;
}

.details p {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.patient-name {
  font-weight: 600;
  color: #333;
}

.doctor {
  color: #666;
  font-size: 0.85rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge-pending {
  background-color: #fff3cd;
  color: #856404;
}

.badge-confirmed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-completed {
  background-color: #d4edda;
  color: #155724;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.contact-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.contact-card h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.95rem;
}

.contact-card p {
  margin: 0;
  color: #667eea;
  font-weight: 600;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .appointment-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@print {
  .quick-actions,
  .navbar-menu {
    display: none;
  }
}
</style>
