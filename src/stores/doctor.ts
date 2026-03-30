import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import doctorAPI from '@/api/doctor'
import type {
  AppointmentFilters,
  PatientFilters,
  PrescriptionFilters,
  LabOrderFilters,
  RadiologyOrderFilters,
  UpdateAppointmentStatusInput,
  RecordVitalInput,
  CreateClinicalNoteInput,
  CreatePrescriptionInput,
  CreateLabOrderInput,
  CreateRadiologyOrderInput,
  CreateAdmissionInput,
  DischargeInput,
} from '@/api/doctor'

export const useDoctorStore = defineStore('doctor', () => {
  // State
  const dashboard = ref<any>(null)
  const appointments = ref<any[]>([])
  const patients = ref<any[]>([])
  const prescriptions = ref<any[]>([])
  const labOrders = ref<any[]>([])
  const radiologyOrders = ref<any[]>([])

  const currentAppointment = ref<any>(null)
  const currentPatient = ref<any>(null)
  const currentPrescription = ref<any>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const appointmentCount = computed(() => appointments.value.length)
  const prescriptionCount = computed(() => prescriptions.value.length)
  const pendingLabOrders = computed(() => labOrders.value.filter((o: any) => o.status === 'pending'))
  const pendingRadiologyOrders = computed(() =>
    radiologyOrders.value.filter((o: any) => o.status === 'pending')
  )

  // Actions - Dashboard
  const loadDashboard = async () => {
    loading.value = true
    error.value = null
    try {
      dashboard.value = await doctorAPI.getDashboard()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Actions - Appointments
  const loadAppointments = async (filters?: AppointmentFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await doctorAPI.listAppointments(filters)
      appointments.value = Array.isArray(data) ? data : data.appointments || []
    } catch (err: any) {
      error.value = err.message
      appointments.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchAppointment = async (appointmentId: number) => {
    loading.value = true
    error.value = null
    try {
      currentAppointment.value = await doctorAPI.getAppointment(appointmentId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateAppointmentStatus = async (
    appointmentId: number,
    input: UpdateAppointmentStatusInput
  ) => {
    loading.value = true
    error.value = null
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, input)
      await loadAppointments()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Patients
  const loadPatients = async (filters?: PatientFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await doctorAPI.listPatients(filters)
      patients.value = Array.isArray(data) ? data : data.patients || []
    } catch (err: any) {
      error.value = err.message
      patients.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchPatientEHR = async (patientId: number) => {
    loading.value = true
    error.value = null
    try {
      currentPatient.value = await doctorAPI.getPatientEHR(patientId)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const recordVital = async (patientId: number, input: RecordVitalInput) => {
    loading.value = true
    error.value = null
    try {
      const vital = await doctorAPI.recordVital(patientId, input)
      if (currentPatient.value) {
        currentPatient.value.vitals = currentPatient.value.vitals || []
        currentPatient.value.vitals.push(vital)
      }
      return vital
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createClinicalNote = async (patientId: number, input: CreateClinicalNoteInput) => {
    loading.value = true
    error.value = null
    try {
      const note = await doctorAPI.createClinicalNote(patientId, input)
      if (currentPatient.value) {
        currentPatient.value.clinical_notes = currentPatient.value.clinical_notes || []
        currentPatient.value.clinical_notes.push(note)
      }
      return note
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Prescriptions
  const loadPrescriptions = async (filters?: PrescriptionFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await doctorAPI.listPrescriptions(filters)
      prescriptions.value = Array.isArray(data) ? data : data.prescriptions || []
    } catch (err: any) {
      error.value = err.message
      prescriptions.value = []
    } finally {
      loading.value = false
    }
  }

  const createPrescription = async (input: CreatePrescriptionInput) => {
    loading.value = true
    error.value = null
    try {
      const rx = await doctorAPI.createPrescription(input)
      prescriptions.value.push(rx)
      return rx
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPrescription = async (prescriptionId: number) => {
    loading.value = true
    error.value = null
    try {
      currentPrescription.value = await doctorAPI.getPrescription(prescriptionId)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Lab Orders
  const loadLabOrders = async (filters?: LabOrderFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await doctorAPI.listLabOrders(filters)
      labOrders.value = Array.isArray(data) ? data : data.orders || []
    } catch (err: any) {
      error.value = err.message
      labOrders.value = []
    } finally {
      loading.value = false
    }
  }

  const createLabOrder = async (input: CreateLabOrderInput) => {
    loading.value = true
    error.value = null
    try {
      const order = await doctorAPI.createLabOrder(input)
      labOrders.value.push(order)
      return order
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLabOrder = async (labOrderId: number) => {
    loading.value = true
    error.value = null
    try {
      return await doctorAPI.getLabOrder(labOrderId)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Radiology Orders
  const loadRadiologyOrders = async (filters?: RadiologyOrderFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await doctorAPI.listRadiologyOrders(filters)
      radiologyOrders.value = Array.isArray(data) ? data : data.orders || []
    } catch (err: any) {
      error.value = err.message
      radiologyOrders.value = []
    } finally {
      loading.value = false
    }
  }

  const createRadiologyOrder = async (input: CreateRadiologyOrderInput) => {
    loading.value = true
    error.value = null
    try {
      const order = await doctorAPI.createRadiologyOrder(input)
      radiologyOrders.value.push(order)
      return order
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRadiologyOrder = async (radiologyOrderId: number) => {
    loading.value = true
    error.value = null
    try {
      return await doctorAPI.getRadiologyOrder(radiologyOrderId)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Admissions
  const createAdmission = async (input: CreateAdmissionInput) => {
    loading.value = true
    error.value = null
    try {
      return await doctorAPI.createAdmission(input)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const dischargeAdmission = async (admissionId: number, input: DischargeInput) => {
    loading.value = true
    error.value = null
    try {
      await doctorAPI.dischargeAdmission(admissionId, input)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear
  const clearError = () => {
    error.value = null
  }

  const resetCurrents = () => {
    currentAppointment.value = null
    currentPatient.value = null
    currentPrescription.value = null
  }

  return {
    // State
    dashboard,
    appointments,
    patients,
    prescriptions,
    labOrders,
    radiologyOrders,
    currentAppointment,
    currentPatient,
    currentPrescription,
    loading,
    error,

    // Computed
    appointmentCount,
    prescriptionCount,
    pendingLabOrders,
    pendingRadiologyOrders,

    // Actions
    loadDashboard,
    loadAppointments,
    fetchAppointment,
    updateAppointmentStatus,
    loadPatients,
    fetchPatientEHR,
    recordVital,
    createClinicalNote,
    loadPrescriptions,
    createPrescription,
    fetchPrescription,
    loadLabOrders,
    createLabOrder,
    fetchLabOrder,
    loadRadiologyOrders,
    createRadiologyOrder,
    fetchRadiologyOrder,
    createAdmission,
    dischargeAdmission,
    clearError,
    resetCurrents,
  }
})
