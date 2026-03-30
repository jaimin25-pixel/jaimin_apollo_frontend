import axios from './axios'

// Types for API requests/responses
export interface AppointmentFilters {
  status?: string
  date?: string
  patient?: string
}

export interface PatientFilters {
  search?: string
  status?: string
}

export interface PrescriptionFilters {
  status?: string
  patient?: string
  date?: string
}

export interface LabOrderFilters {
  status?: string
  test?: string
}

export interface RadiologyOrderFilters {
  status?: string
  modality?: string
}

export interface UpdateAppointmentStatusInput {
  status: string
  notes?: string
}

export interface RecordVitalInput {
  blood_pressure: string
  heart_rate: number
  temperature: number
  respiratory_rate: number
  oxygen_saturation: number
  weight?: number
  height?: number
  notes?: string
}

export interface CreateClinicalNoteInput {
  chief_complaint: string
  diagnosis: string
  diagnosis_icd10?: string
  treatment_plan: string
  follow_up_date?: string
  notes?: string
}

export interface PrescriptionItem {
  medicine_name: string
  strength: string
  frequency: string
  duration_days: number
  instructions?: string
  quantity?: number
}

export interface CreatePrescriptionInput {
  patient_id: number
  appointment_id?: number
  diagnosis: string
  diagnosis_icd10?: string
  notes?: string
  items: PrescriptionItem[]
}

export interface CreateLabOrderInput {
  patient_id: number
  appointment_id?: number
  test_names: string[]
  instructions?: string
  urgent: boolean
}

export interface CreateRadiologyOrderInput {
  patient_id: number
  appointment_id?: number
  modality: string
  body_part: string
  instructions?: string
  urgent: boolean
}

export interface CreateAdmissionInput {
  patient_id: number
  ward_id: number
  bed_id?: number
  reason: string
  estimated_duration?: number
}

export interface DischargeInput {
  discharge_date: string
  summary: string
  follow_up_instructions?: string
  prescription_id?: number
}

// Doctor API Module
const doctorAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await axios.get('/doctor/dashboard')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to load dashboard')
    }
  },

  // Appointments
  listAppointments: async (filters?: AppointmentFilters) => {
    try {
      const response = await axios.get('/doctor/appointments', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch appointments')
    }
  },

  getAppointment: async (appointmentId: number) => {
    try {
      const response = await axios.get(`/doctor/appointments/${appointmentId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch appointment')
    }
  },

  updateAppointmentStatus: async (appointmentId: number, input: UpdateAppointmentStatusInput) => {
    try {
      const response = await axios.patch(`/doctor/appointments/${appointmentId}/status`, input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update appointment status')
    }
  },

  // Patients
  listPatients: async (filters?: PatientFilters) => {
    try {
      const response = await axios.get('/doctor/patients', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch patients')
    }
  },

  getPatientEHR: async (patientId: number) => {
    try {
      const response = await axios.get(`/doctor/patients/${patientId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch patient record')
    }
  },

  recordVital: async (patientId: number, input: RecordVitalInput) => {
    try {
      const response = await axios.post(`/doctor/patients/${patientId}/vitals`, input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to record vital')
    }
  },

  createClinicalNote: async (patientId: number, input: CreateClinicalNoteInput) => {
    try {
      const response = await axios.post(`/doctor/patients/${patientId}/clinical-notes`, input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create clinical note')
    }
  },

  // Prescriptions
  listPrescriptions: async (filters?: PrescriptionFilters) => {
    try {
      const response = await axios.get('/doctor/prescriptions', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch prescriptions')
    }
  },

  createPrescription: async (input: CreatePrescriptionInput) => {
    try {
      const response = await axios.post('/doctor/prescriptions', input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create prescription')
    }
  },

  getPrescription: async (prescriptionId: number) => {
    try {
      const response = await axios.get(`/doctor/prescriptions/${prescriptionId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch prescription')
    }
  },

  // Lab Orders
  listLabOrders: async (filters?: LabOrderFilters) => {
    try {
      const response = await axios.get('/doctor/lab-orders', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch lab orders')
    }
  },

  createLabOrder: async (input: CreateLabOrderInput) => {
    try {
      const response = await axios.post('/doctor/lab-orders', input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create lab order')
    }
  },

  getLabOrder: async (labOrderId: number) => {
    try {
      const response = await axios.get(`/doctor/lab-orders/${labOrderId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch lab order')
    }
  },

  // Radiology Orders
  listRadiologyOrders: async (filters?: RadiologyOrderFilters) => {
    try {
      const response = await axios.get('/doctor/radiology-orders', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch radiology orders')
    }
  },

  createRadiologyOrder: async (input: CreateRadiologyOrderInput) => {
    try {
      const response = await axios.post('/doctor/radiology-orders', input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create radiology order')
    }
  },

  getRadiologyOrder: async (radiologyOrderId: number) => {
    try {
      const response = await axios.get(`/doctor/radiology-orders/${radiologyOrderId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch radiology order')
    }
  },

  // Admissions
  createAdmission: async (input: CreateAdmissionInput) => {
    try {
      const response = await axios.post('/doctor/admissions', input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create admission')
    }
  },

  dischargeAdmission: async (admissionId: number, input: DischargeInput) => {
    try {
      const response = await axios.patch(`/doctor/admissions/${admissionId}/discharge`, input)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to discharge patient')
    }
  },
}

export default doctorAPI
