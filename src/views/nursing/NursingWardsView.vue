<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Wards & Beds</h1>
        <p class="text-sm text-gray-500 mt-1">Monitor bed occupancy and room housekeeping.</p>
      </div>
      <div>
         <select v-model="selectedWard" @change="fetchBeds" class="block w-full sm:w-64 rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
           <option :value="0">Select a Ward</option>
           <option v-for="w in wards" :key="w.ward_id" :value="w.ward_id">{{ w.ward_name }}</option>
         </select>
      </div>
    </div>

    <div v-if="selectedWard" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="bed in store.beds" :key="bed.bed_id" 
           class="p-4 rounded-xl border border-gray-200 bg-white flex flex-col justify-between shadow-sm relative group overflow-hidden"
           :class="{'border-l-4 border-l-emerald-500': bed.status === 'available', 'border-l-4 border-l-orange-500': bed.status === 'occupied', 'border-l-4 border-l-gray-500': bed.status === 'maintenance'}"
      >
        <div class="flex justify-between items-start">
           <div>
             <span class="block font-bold text-gray-900">{{ bed.bed_number }}</span>
             <span class="text-xs text-gray-500 capitalize">{{ bed.status }}</span>
           </div>
           
           <div class="relative">
              <button @click="openStatusModal(bed)" class="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
              </button>
           </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
           <span v-if="bed.status === 'occupied'" class="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">In Use</span>
           <button v-if="bed.status === 'maintenance'" @click="markClean(bed.bed_id)" class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors">Mark Clean</button>
           <span v-if="bed.status === 'available'" class="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
        </div>
      </div>
      
      <div v-if="store.beds.length === 0 && !store.loading" class="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
         No beds found in this ward.
      </div>
    </div>
    
    <div v-else class="py-12 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed text-gray-500">
       Please select a ward to view beds.
    </div>

    <!-- Status Change Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Update Bed {{ activeBed?.bed_number }}</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select v-model="statusForm.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                <option value="available">Available</option>
                <option value="maintenance">Maintenance (Cleaning)</option>
              </select>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button @click="showStatusModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button @click="submitStatusChange" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNursingStore } from '@/stores/nursing'
import nursingApi from '@/api/nursing'

const store = useNursingStore()
const wards = computed(() => store.wards)
const selectedWard = ref(0)
const showStatusModal = ref(false)
const activeBed = ref<any>(null)
const statusForm = ref({ status: '' })

onMounted(async () => {
  await store.fetchWards()
})

const fetchBeds = async () => {
  if (selectedWard.value) {
    await store.fetchBeds(selectedWard.value)
  }
}

const openStatusModal = (bed: any) => {
  activeBed.value = bed
  statusForm.value.status = bed.status
  showStatusModal.value = true
}

const submitStatusChange = async () => {
  if (activeBed.value && statusForm.value.status) {
    await nursingApi.updateBedStatus(activeBed.value.bed_id, { status: statusForm.value.status })
    showStatusModal.value = false
    await fetchBeds()
  }
}

const markClean = async (bedId: number) => {
  await nursingApi.markBedClean(bedId)
  await fetchBeds()
}
</script>
