<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Patient Care</h1>
        <p class="text-sm text-gray-500 mt-1">Manage Medication Administration Records (MAR), record vitals, and add notes.</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
           <input v-model="searchQuery" type="text" placeholder="Search patients..." class="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
           <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-400">🔍</span>
           </div>
        </div>
      </div>
    </div>

    <!-- Vitals and MAR Modal Placeholder / Layout -->
    <!-- Assuming we are using a simplified view where clicking a patient opens detail -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Let's assume we list admissions here just mocked out for layout since endpoints might require searching patients -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-500 text-sm">
         <p>Select a patient from the assigned ward list to view MAR and record vitals.</p>
      </div>
      
      <div class="bg-gray-50 p-6 rounded-2xl shadow-inner border border-dashed border-gray-200 min-h-[400px] flex items-center justify-center text-gray-400 text-sm">
         <p>Patient Details Panel</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Use store if needed
const searchQuery = ref('')

// This view can be expanded later.
</script>
