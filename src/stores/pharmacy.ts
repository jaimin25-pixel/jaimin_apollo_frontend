import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pharmacyAPI } from '@/api/pharmacy'

export const usePharmacyStore = defineStore('pharmacy', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const medicines = ref<any[]>([])
  const currentMedicine = ref<any>(null)
  const currentBatches = ref<any[]>([])
  const prescriptions = ref<any[]>([])
  const alerts = ref<any[]>([])
  const transfers = ref<any[]>([])
  const partnerPharmacies = ref<any[]>([])
  const dashboardStats = ref({
    pending_prescriptions: 0,
    low_stock_medicines: 0,
    expiring_medicines: 0,
    total_medicines: 0,
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────
  const lowStockMedicines = computed(() =>
    medicines.value.filter((m) => m.current_stock <= m.reorder_level)
  )

  const medicinesByCategory = computed(() => {
    const map: Record<string, any[]> = {}
    for (const m of medicines.value) {
      if (!map[m.category]) map[m.category] = []
      map[m.category].push(m)
    }
    return map
  })

  const categories = computed(() => Object.keys(medicinesByCategory.value).sort())

  // ── Actions - Dashboard ────────────────────────────────────────────────
  const loadDashboard = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await pharmacyAPI.getDashboard()
      dashboardStats.value = data.stats || dashboardStats.value
      prescriptions.value = data.recent_pending || []
      alerts.value = data.low_stock_alerts || []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // ── Actions - Medicines ────────────────────────────────────────────────
  const loadMedicines = async (category?: string, search?: string) => {
    loading.value = true
    error.value = null
    try {
      medicines.value = await pharmacyAPI.listMedicines(category, search)
    } catch (err: any) {
      error.value = err.message
      medicines.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchMedicine = async (medicineId: number) => {
    loading.value = true
    error.value = null
    try {
      currentMedicine.value = await pharmacyAPI.getMedicine(medicineId)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMedicine = async (data: any) => {
    loading.value = true
    error.value = null
    try {
      const med = await pharmacyAPI.createMedicine(data)
      medicines.value.push(med)
      return med
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMedicine = async (medicineId: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      await pharmacyAPI.updateMedicine(medicineId, data)
      const idx = medicines.value.findIndex((m) => m.medicine_id === medicineId)
      if (idx !== -1) {
        medicines.value[idx] = { ...medicines.value[idx], ...data }
      }
      if (currentMedicine.value?.medicine_id === medicineId) {
        currentMedicine.value = { ...currentMedicine.value, ...data }
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Actions - Batches ──────────────────────────────────────────────────
  const loadBatches = async (medicineId: number) => {
    loading.value = true
    error.value = null
    try {
      currentBatches.value = await pharmacyAPI.listBatches(medicineId)
    } catch (err: any) {
      error.value = err.message
      currentBatches.value = []
    } finally {
      loading.value = false
    }
  }

  const createBatch = async (medicineId: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const batch = await pharmacyAPI.createBatch(medicineId, data)
      currentBatches.value.push(batch)
      // refresh stock on the medicine in list
      const idx = medicines.value.findIndex((m) => m.medicine_id === medicineId)
      if (idx !== -1) {
        medicines.value[idx].current_stock =
          (medicines.value[idx].current_stock || 0) + data.quantity
      }
      return batch
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Actions - Prescriptions ────────────────────────────────────────────
  const loadPrescriptions = async (filters?: any) => {
    loading.value = true
    error.value = null
    try {
      prescriptions.value = await pharmacyAPI.listPrescriptions(filters)
    } catch (err: any) {
      error.value = err.message
      prescriptions.value = []
    } finally {
      loading.value = false
    }
  }

  const dispensePrescription = async (rxId: number, items: any[]) => {
    loading.value = true
    error.value = null
    try {
      await pharmacyAPI.dispensePrescription(rxId, items)
      await loadDashboard()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Actions - Alerts ───────────────────────────────────────────────────
  const loadLowStockAlerts = async () => {
    loading.value = true
    error.value = null
    try {
      alerts.value = await pharmacyAPI.getLowStockAlerts()
    } catch (err: any) {
      error.value = err.message
      alerts.value = []
    } finally {
      loading.value = false
    }
  }

  const loadExpiringAlerts = async (days = 60) => {
    loading.value = true
    error.value = null
    try {
      alerts.value = await pharmacyAPI.getExpiringAlerts(days)
    } catch (err: any) {
      error.value = err.message
      alerts.value = []
    } finally {
      loading.value = false
    }
  }

  // ── Actions - Partners & Transfers ────────────────────────────────────
  const loadPartnerPharmacies = async () => {
    loading.value = true
    error.value = null
    try {
      partnerPharmacies.value = await pharmacyAPI.listPartnerPharmacies()
    } catch (err: any) {
      error.value = err.message
      partnerPharmacies.value = []
    } finally {
      loading.value = false
    }
  }

  const loadTransferRequests = async (status?: string) => {
    loading.value = true
    error.value = null
    try {
      transfers.value = await pharmacyAPI.listTransferRequests(status)
    } catch (err: any) {
      error.value = err.message
      transfers.value = []
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    medicines,
    currentMedicine,
    currentBatches,
    prescriptions,
    alerts,
    transfers,
    partnerPharmacies,
    dashboardStats,
    loading,
    error,
    // Computed
    lowStockMedicines,
    categories,
    medicinesByCategory,
    // Actions
    loadDashboard,
    loadMedicines,
    fetchMedicine,
    createMedicine,
    updateMedicine,
    loadBatches,
    createBatch,
    loadPrescriptions,
    dispensePrescription,
    loadLowStockAlerts,
    loadExpiringAlerts,
    loadPartnerPharmacies,
    loadTransferRequests,
    clearError,
  }
})
