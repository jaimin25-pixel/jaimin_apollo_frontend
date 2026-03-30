<template>
  <div class="appointments-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1>Appointments</h1>
        <p>Schedule and manage patient appointments</p>
      </div>
      <button class="btn-primary" @click="showScheduleModal = true">
        <span>+ Schedule Appointment</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.status" class="filter-input">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select v-model="filters.department" class="filter-input">
        <option value="">All Departments</option>
        <option value="cardiology">Cardiology</option>
        <option value="neurology">Neurology</option>
        <option value="orthopedics">Orthopedics</option>
        <option value="pediatrics">Pediatrics</option>
        <option value="general">General</option>
      </select>
      <input
        v-model="filters.date"
        type="date"
        class="filter-input"
      />
    </div>

    <!-- Upcoming Appointments Calendar -->
    <div class="calendar-section">
      <div class="calendar-header">
        <button @click="previousWeek" class="btn-nav">&lt;</button>
        <h3>{{ weekLabel }}</h3>
        <button @click="nextWeek" class="btn-nav">&gt;</button>
      </div>
      <div class="weekdays">
        <div
          v-for="day in weekDays"
          :key="day.date"
          class="day-column"
          :class="{ 'is-today': day.isToday }"
        >
          <div class="day-header">
            <span class="day-name">{{ day.name }}</span>
            <span class="day-date">{{ day.date }}</span>
          </div>
          <div class="time-slots">
            <div
              v-for="slot in getAppointmentsForDay(day.date)"
              :key="slot.id"
              class="time-slot"
              :class="slot.status"
              @click="selectAppointment(slot)"
            >
              <div class="slot-time">{{ slot.time }}</div>
              <div class="slot-patient">{{ slot.patientName }}</div>
              <div class="slot-doctor">{{ slot.doctorName }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointments List -->
    <div class="appointments-list-section">
      <h3>All Appointments</h3>
      <div class="table-responsive">
        <table class="appointments-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="apt in filteredAppointments" :key="apt.id" class="apt-row">
              <td class="apt-time">{{ apt.time }}</td>
              <td class="apt-patient">{{ apt.patientName }}</td>
              <td class="apt-doctor">{{ apt.doctorName }}</td>
              <td class="apt-dept">{{ apt.department }}</td>
              <td class="apt-status">
                <span class="status-badge" :class="apt.status">{{ apt.status }}</span>
              </td>
              <td class="apt-actions">
                <button
                  class="btn-small btn-info"
                  @click="selectAppointment(apt)"
                >
                  View
                </button>
                <button
                  v-if="apt.status === 'pending'"
                  class="btn-small btn-success"
                  @click="confirmAppointment(apt.id)"
                >
                  Confirm
                </button>
                <button
                  class="btn-small btn-danger"
                  @click="cancelAppointment(apt.id)"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Schedule Appointment Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="showScheduleModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Schedule New Appointment</h2>
          <button class="btn-close" @click="showScheduleModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Patient ID:</label>
            <input v-model="scheduleForm.patientId" placeholder="Enter patient ID" class="form-input" />
          </div>
          <div class="form-group">
            <label>Doctor:</label>
            <select v-model="scheduleForm.doctorId" class="form-input">
              <option value="">Select Doctor</option>
              <option value="doc1">Dr. Rajesh Kumar</option>
              <option value="doc2">Dr. Priya Sharma</option>
              <option value="doc3">Dr. Amit Verma</option>
              <option value="doc4">Dr. Neha Patel</option>
            </select>
          </div>
          <div class="form-group">
            <label>Appointment Date:</label>
            <input v-model="scheduleForm.date" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Time:</label>
            <input v-model="scheduleForm.time" type="time" class="form-input" />
          </div>
          <div class="form-group">
            <label>Chief Complaint:</label>
            <textarea v-model="scheduleForm.chiefComplaint" placeholder="Reason for visit" class="form-input"></textarea>
          </div>
          <div class="form-group">
            <label>
              <input v-model="scheduleForm.isUrgent" type="checkbox" />
              Mark as Urgent
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showScheduleModal = false">Cancel</button>
          <button class="btn-primary" @click="submitScheduleForm">Schedule</button>
        </div>
      </div>
    </div>

    <!-- Appointment Detail Modal -->
    <div v-if="selectedAppointment && showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h2>Appointment Details</h2>
          <button class="btn-close" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Patient Name:</label>
              <p>{{ selectedAppointment.patientName }}</p>
            </div>
            <div class="detail-item">
              <label>Phone:</label>
              <p>{{ selectedAppointment.patientPhone }}</p>
            </div>
            <div class="detail-item">
              <label>Doctor:</label>
              <p>{{ selectedAppointment.doctorName }}</p>
            </div>
            <div class="detail-item">
              <label>Department:</label>
              <p>{{ selectedAppointment.department }}</p>
            </div>
            <div class="detail-item">
              <label>Date & Time:</label>
              <p>{{ selectedAppointment.date }} at {{ selectedAppointment.time }}</p>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <p>
                <span class="status-badge" :class="selectedAppointment.status">
                  {{ selectedAppointment.status }}
                </span>
              </p>
            </div>
            <div class="detail-item full-width">
              <label>Chief Complaint:</label>
              <p>{{ selectedAppointment.chiefComplaint }}</p>
            </div>
            <div class="detail-item full-width">
              <label>Notes:</label>
              <textarea v-model="selectedAppointment.notes" placeholder="Add notes..." class="form-input"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDetailModal = false">Close</button>
          <button
            v-if="selectedAppointment.status === 'pending'"
            class="btn-success"
            @click="confirmAppointment(selectedAppointment.id)"
          >
            Confirm
          </button>
          <button class="btn-danger" @click="cancelAppointment(selectedAppointment.id)">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  patientId: string
  doctorName: string
  doctorId: string
  department: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  chiefComplaint: string
  notes: string
  isUrgent: boolean
}

// Sample data
const appointments = ref<Appointment[]>([
  {
    id: 'apt1',
    patientName: 'Raj Kumar',
    patientPhone: '+91-9876543210',
    patientId: 'P001',
    doctorName: 'Dr. Rajesh Kumar',
    doctorId: 'doc1',
    department: 'Cardiology',
    date: '2024-01-15',
    time: '10:30',
    status: 'confirmed',
    chiefComplaint: 'Chest pain and shortness of breath',
    notes: '',
    isUrgent: true,
  },
  {
    id: 'apt2',
    patientName: 'Priya Singh',
    patientPhone: '+91-9876543211',
    patientId: 'P002',
    doctorName: 'Dr. Priya Sharma',
    doctorId: 'doc2',
    department: 'Neurology',
    date: '2024-01-15',
    time: '11:00',
    status: 'pending',
    chiefComplaint: 'Recurring headaches',
    notes: '',
    isUrgent: false,
  },
  {
    id: 'apt3',
    patientName: 'Amit Patel',
    patientPhone: '+91-9876543212',
    patientId: 'P003',
    doctorName: 'Dr. Amit Verma',
    doctorId: 'doc3',
    department: 'Orthopedics',
    date: '2024-01-16',
    time: '14:00',
    status: 'confirmed',
    chiefComplaint: 'Knee injury',
    notes: '',
    isUrgent: false,
  },
  {
    id: 'apt4',
    patientName: 'Neha Gupta',
    patientPhone: '+91-9876543213',
    patientId: 'P004',
    doctorName: 'Dr. Neha Patel',
    doctorId: 'doc4',
    department: 'Pediatrics',
    date: '2024-01-16',
    time: '15:30',
    status: 'completed',
    chiefComplaint: 'Fever and cold',
    notes: 'Follow-up in 1 week',
    isUrgent: false,
  },
])

const filters = ref({
  status: '',
  department: '',
  date: '',
})

const showScheduleModal = ref(false)
const showDetailModal = ref(false)
const selectedAppointment = ref<Appointment | null>(null)
const currentWeekStart = ref(new Date(2024, 0, 15))

const scheduleForm = ref({
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  chiefComplaint: '',
  isUrgent: false,
})

const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    days.push({
      date: date.toISOString().split('T')[0],
      name: dayNames[date.getDay()],
      isToday,
    })
  }
  return days
})

const weekLabel = computed(() => {
  const start = currentWeekStart.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 6)
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${start} - ${endStr}`
})

const filteredAppointments = computed(() => {
  return appointments.value.filter((apt) => {
    if (filters.value.status && apt.status !== filters.value.status) return false
    if (filters.value.department && apt.department !== filters.value.department) return false
    if (filters.value.date && apt.date !== filters.value.date) return false
    return true
  })
})

const previousWeek = () => {
  const date = new Date(currentWeekStart.value)
  date.setDate(date.getDate() - 7)
  currentWeekStart.value = date
}

const nextWeek = () => {
  const date = new Date(currentWeekStart.value)
  date.setDate(date.getDate() + 7)
  currentWeekStart.value = date
}

const getAppointmentsForDay = (date: string) => {
  return appointments.value.filter((apt) => apt.date === date).slice(0, 3)
}

const selectAppointment = (apt: Appointment) => {
  selectedAppointment.value = apt
  showDetailModal.value = true
}

const confirmAppointment = (id: string) => {
  const apt = appointments.value.find((a) => a.id === id)
  if (apt) {
    apt.status = 'confirmed'
  }
  showDetailModal.value = false
}

const cancelAppointment = (id: string) => {
  const apt = appointments.value.find((a) => a.id === id)
  if (apt) {
    apt.status = 'cancelled'
  }
  showDetailModal.value = false
}

const submitScheduleForm = () => {
  if (!scheduleForm.value.patientId || !scheduleForm.value.doctorId) {
    alert('Please fill in all required fields')
    return
  }

  const newApt: Appointment = {
    id: `apt${Date.now()}`,
    patientName: 'New Patient',
    patientPhone: '',
    patientId: scheduleForm.value.patientId,
    doctorName: [
      'Dr. Rajesh Kumar',
      'Dr. Priya Sharma',
      'Dr. Amit Verma',
      'Dr. Neha Patel',
    ][
      ['doc1', 'doc2', 'doc3', 'doc4'].indexOf(scheduleForm.value.doctorId)
    ] || 'Unknown',
    doctorId: scheduleForm.value.doctorId,
    department: 'General',
    date: scheduleForm.value.date,
    time: scheduleForm.value.time,
    status: 'pending',
    chiefComplaint: scheduleForm.value.chiefComplaint,
    notes: '',
    isUrgent: scheduleForm.value.isUrgent,
  }

  appointments.value.push(newApt)
  showScheduleModal.value = false
  scheduleForm.value = {
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    chiefComplaint: '',
    isUrgent: false,
  }
}
</script>

<style scoped>
.appointments-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-section h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.header-section p {
  color: #666;
  margin: 0.5rem 0 0 0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

/* Calendar Section */
.calendar-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-nav {
  background: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: bold;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.day-column {
  background: #f9f9f9;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 2px solid transparent;
}

.day-column.is-today {
  background: #e8f4f8;
  border-color: #667eea;
}

.day-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #ddd;
}

.day-name {
  font-weight: bold;
  color: #333;
  display: block;
}

.day-date {
  color: #666;
  font-size: 0.9rem;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-slot {
  background: white;
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border-left: 3px solid #667eea;
  transition: all 0.2s;
}

.time-slot:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(2px);
}

.time-slot.confirmed {
  border-left-color: #27ae60;
}

.time-slot.pending {
  border-left-color: #f39c12;
}

.time-slot.cancelled {
  border-left-color: #e74c3c;
  opacity: 0.6;
}

.slot-time {
  font-weight: bold;
  font-size: 0.85rem;
  color: #333;
}

.slot-patient {
  font-size: 0.75rem;
  color: #666;
}

.slot-doctor {
  font-size: 0.7rem;
  color: #999;
}

/* Appointments List */
.appointments-list-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.appointments-list-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.table-responsive {
  overflow-x: auto;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.appointments-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.appointments-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.apt-row:hover {
  background: #f9f9f9;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.apt-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
}

.btn-info {
  background: #667eea;
  color: white;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.modal-lg {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[type='checkbox'] {
  margin-right: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: block;
}

.detail-item p {
  color: #333;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-success {
  background: #27ae60;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}
</style>
