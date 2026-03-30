<template>
  <div class="checkin-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1>Patient Check-In</h1>
        <p>Welcome patients and manage check-ins</p>
      </div>
      <button class="btn-primary" @click="showCheckInModal = true">
        <span>+ New Check-In</span>
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-number">{{ waitingPatients.length }}</div>
        <div class="stat-label">Waiting</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ inProgressPatients.length }}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ completedToday }}</div>
        <div class="stat-label">Completed Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ averageWaitTime }}</div>
        <div class="stat-label">Avg Wait Time</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or ID..."
        class="filter-input search-input"
      />
      <select v-model="statusFilter" class="filter-input">
        <option value="">All Status</option>
        <option value="waiting">Waiting</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <!-- Waiting Queue -->
    <div class="queue-section">
      <h3>Waiting Queue ({{ waitingPatients.length }})</h3>
      <div class="patient-cards">
        <div
          v-for="patient in waitingPatients"
          :key="patient.id"
          class="patient-card waiting"
          @click="selectPatient(patient)"
        >
          <div class="patient-header">
            <div class="patient-name">{{ patient.name }}</div>
            <div class="patient-time">{{ patient.checkInTime }}</div>
          </div>
          <div class="patient-info">
            <span class="info-badge">ID: {{ patient.id }}</span>
            <span class="info-badge">Age: {{ patient.age }}</span>
          </div>
          <div class="patient-actions">
            <button class="btn-small btn-start" @click.stop="startConsultation(patient.id)">
              Start Consultation
            </button>
            <button class="btn-small btn-info" @click.stop="viewPatientDetails(patient)">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- In Progress -->
    <div class="queue-section">
      <h3>Currently in Consultation ({{ inProgressPatients.length }})</h3>
      <div class="patient-cards">
        <div
          v-for="patient in inProgressPatients"
          :key="patient.id"
          class="patient-card in-progress"
        >
          <div class="patient-header">
            <div class="patient-name">{{ patient.name }}</div>
            <div class="patient-time">Started: {{ patient.consultationStart }}</div>
          </div>
          <div class="patient-info">
            <span class="info-badge">ID: {{ patient.id }}</span>
            <span class="info-badge">Doctor: {{ patient.doctor }}</span>
          </div>
          <div class="patient-actions">
            <button class="btn-small btn-complete" @click="completeConsultation(patient.id)">
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Today -->
    <div class="queue-section">
      <h3>Completed Today ({{ completedToday }})</h3>
      <div class="completed-list">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>ID</th>
              <th>Age</th>
              <th>Doctor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in completedPatients" :key="patient.id">
              <td>{{ patient.completionTime }}</td>
              <td>{{ patient.name }}</td>
              <td>{{ patient.id }}</td>
              <td>{{ patient.age }}</td>
              <td>{{ patient.doctor }}</td>
              <td>
                <button class="btn-small btn-info" @click="viewPatientDetails(patient)">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Check-In Modal -->
    <div v-if="showCheckInModal" class="modal-overlay" @click.self="showCheckInModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>New Patient Check-In</h2>
          <button class="btn-close" @click="showCheckInModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Patient ID (Register Number):</label>
            <input
              v-model="checkInForm.patientId"
              placeholder="e.g., REG001"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Full Name:</label>
            <input
              v-model="checkInForm.name"
              placeholder="Patient full name"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Date of Birth:</label>
            <input v-model="checkInForm.dob" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Phone Number:</label>
            <input
              v-model="checkInForm.phone"
              placeholder="+91-9876543210"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Appointment Doctor:</label>
            <select v-model="checkInForm.doctor" class="form-input">
              <option value="">Select Doctor</option>
              <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
              <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
              <option value="Dr. Amit Verma">Dr. Amit Verma</option>
              <option value="Dr. Neha Patel">Dr. Neha Patel</option>
            </select>
          </div>
          <div class="form-group">
            <label>Chief Complaint:</label>
            <textarea
              v-model="checkInForm.chiefComplaint"
              placeholder="Reason for visit..."
              class="form-input"
            ></textarea>
          </div>
          <div class="form-group">
            <label>
              <input v-model="checkInForm.isEmergency" type="checkbox" />
              Emergency Case
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCheckInModal = false">Cancel</button>
          <button class="btn-primary" @click="submitCheckIn">Check-In Patient</button>
        </div>
      </div>
    </div>

    <!-- Patient Details Modal -->
    <div v-if="selectedPatient && showDetailsModal" class="modal-overlay" @click.self="showDetailsModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h2>Patient Details</h2>
          <button class="btn-close" @click="showDetailsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Personal Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Name:</label>
                <p>{{ selectedPatient.name }}</p>
              </div>
              <div class="detail-item">
                <label>Register Number:</label>
                <p>{{ selectedPatient.id }}</p>
              </div>
              <div class="detail-item">
                <label>Age:</label>
                <p>{{ selectedPatient.age }} years</p>
              </div>
              <div class="detail-item">
                <label>Phone:</label>
                <p>{{ selectedPatient.phone }}</p>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h4>Visit Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Appointment Doctor:</label>
                <p>{{ selectedPatient.doctor }}</p>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <p>
                  <span class="status-badge" :class="selectedPatient.status">
                    {{ selectedPatient.status }}
                  </span>
                </p>
              </div>
              <div class="detail-item full-width">
                <label>Chief Complaint:</label>
                <p>{{ selectedPatient.chiefComplaint }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDetailsModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  doctor: string
  status: 'waiting' | 'in-progress' | 'completed'
  checkInTime: string
  consultationStart?: string
  completionTime?: string
  chiefComplaint: string
  isEmergency: boolean
}

const patients = ref<Patient[]>([
  {
    id: 'REG001',
    name: 'Raj Kumar',
    age: 45,
    phone: '+91-9876543210',
    doctor: 'Dr. Rajesh Kumar',
    status: 'waiting',
    checkInTime: '09:45',
    chiefComplaint: 'Chest pain',
    isEmergency: true,
  },
  {
    id: 'REG002',
    name: 'Priya Singh',
    age: 32,
    phone: '+91-9876543211',
    doctor: 'Dr. Priya Sharma',
    status: 'waiting',
    checkInTime: '10:15',
    chiefComplaint: 'Headache',
    isEmergency: false,
  },
  {
    id: 'REG003',
    name: 'Amit Patel',
    age: 28,
    phone: '+91-9876543212',
    doctor: 'Dr. Amit Verma',
    status: 'in-progress',
    checkInTime: '09:30',
    consultationStart: '10:00',
    chiefComplaint: 'Knee injury',
    isEmergency: false,
  },
  {
    id: 'REG004',
    name: 'Neha Gupta',
    age: 38,
    phone: '+91-9876543213',
    doctor: 'Dr. Neha Patel',
    status: 'completed',
    checkInTime: '08:45',
    completionTime: '09:20',
    chiefComplaint: 'Fever',
    isEmergency: false,
  },
  {
    id: 'REG005',
    name: 'Vikram Reddy',
    age: 55,
    phone: '+91-9876543214',
    doctor: 'Dr. Rajesh Kumar',
    status: 'completed',
    checkInTime: '08:20',
    completionTime: '08:50',
    chiefComplaint: 'Regular checkup',
    isEmergency: false,
  },
])

const showCheckInModal = ref(false)
const showDetailsModal = ref(false)
const selectedPatient = ref<Patient | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')

const checkInForm = ref({
  patientId: '',
  name: '',
  dob: '',
  phone: '',
  doctor: '',
  chiefComplaint: '',
  isEmergency: false,
})

const waitingPatients = computed(() =>
  patients.value
    .filter((p) => p.status === 'waiting')
    .filter((p) => matchesFilters(p))
)

const inProgressPatients = computed(() =>
  patients.value
    .filter((p) => p.status === 'in-progress')
    .filter((p) => matchesFilters(p))
)

const completedPatients = computed(() =>
  patients.value
    .filter((p) => p.status === 'completed')
    .filter((p) => matchesFilters(p))
)

const completedToday = computed(() => completedPatients.value.length)

const averageWaitTime = computed(() => {
  if (waitingPatients.value.length === 0) return '0 min'
  // Simple calculation: assume 15 min average per appointment
  return Math.ceil(waitingPatients.value.length * 15) + ' min'
})

const matchesFilters = (patient: Patient): boolean => {
  const matchesStatus = !statusFilter.value || patient.status === statusFilter.value
  const matchesSearch =
    !searchQuery.value ||
    patient.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.value.toLowerCase())
  return matchesStatus && matchesSearch
}

const startConsultation = (patientId: string) => {
  const patient = patients.value.find((p) => p.id === patientId)
  if (patient) {
    patient.status = 'in-progress'
    patient.consultationStart = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
}

const completeConsultation = (patientId: string) => {
  const patient = patients.value.find((p) => p.id === patientId)
  if (patient) {
    patient.status = 'completed'
    patient.completionTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
}

const selectPatient = (patient: Patient) => {
  selectedPatient.value = patient
  showDetailsModal.value = true
}

const viewPatientDetails = (patient: Patient) => {
  selectedPatient.value = patient
  showDetailsModal.value = true
}

const submitCheckIn = () => {
  if (!checkInForm.value.patientId || !checkInForm.value.name) {
    alert('Please fill in required fields')
    return
  }

  const dob = new Date(checkInForm.value.dob)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  const newPatient: Patient = {
    id: checkInForm.value.patientId,
    name: checkInForm.value.name,
    age: age || 0,
    phone: checkInForm.value.phone,
    doctor: checkInForm.value.doctor,
    status: 'waiting',
    checkInTime: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    chiefComplaint: checkInForm.value.chiefComplaint,
    isEmergency: checkInForm.value.isEmergency,
  }

  patients.value.push(newPatient)
  showCheckInModal.value = false
  checkInForm.value = {
    patientId: '',
    name: '',
    dob: '',
    phone: '',
    doctor: '',
    chiefComplaint: '',
    isEmergency: false,
  }
}
</script>

<style scoped>
.checkin-container {
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
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
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

.search-input {
  grid-column: 1 / -1;
}

.queue-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.queue-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.patient-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.patient-card {
  background: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.patient-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.patient-card.waiting {
  border-left: 4px solid #f39c12;
}

.patient-card.in-progress {
  border-left: 4px solid #667eea;
  background: #f0f4ff;
}

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.patient-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.patient-time {
  color: #666;
  font-size: 0.85rem;
}

.patient-info {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.info-badge {
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.patient-actions {
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
  transition: all 0.2s;
}

.btn-start {
  background: #27ae60;
  color: white;
}

.btn-complete {
  background: #3498db;
  color: white;
}

.btn-info {
  background: #667eea;
  color: white;
}

.completed-list {
  overflow-x: auto;
}

.completed-list table {
  width: 100%;
  border-collapse: collapse;
}

.completed-list thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.completed-list th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.completed-list td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.waiting {
  background: #fff3cd;
  color: #856404;
}

.status-badge.in-progress {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
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
  cursor: pointer;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
</style>
