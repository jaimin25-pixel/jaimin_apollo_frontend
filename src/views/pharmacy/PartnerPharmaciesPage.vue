<template>
  <div class="partner-page">
    <div class="header">
      <h1>Partner Pharmacies</h1>
    </div>

    <div class="info-box">
      <p>
        When internal stock is insufficient for a prescription, you can request medicines from partner pharmacies.
      </p>
    </div>

    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'"
      >
        Available Partners
      </button>
      <button
        :class="['tab', { active: activeTab === 'transfers' }]"
        @click="activeTab = 'transfers'; loadTransfers()"
      >
        Transfer Requests
      </button>
    </div>

    <!-- Partners List -->
    <div v-if="activeTab === 'list'" class="content-section">
      <table class="table" v-if="partners.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>License Number</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="partner in partners" :key="partner.partner_id">
            <td>{{ partner.name }}</td>
            <td>{{ partner.license_number }}</td>
            <td>{{ partner.address }}</td>
            <td>{{ partner.contact_phone }}</td>
            <td>{{ partner.contact_email }}</td>
            <td>
              <span :class="['badge', partner.status]">{{ partner.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">No partner pharmacies available</div>
    </div>

    <!-- Transfer Requests -->
    <div v-if="activeTab === 'transfers'" class="content-section">
      <div class="filters">
        <select v-model="transferFilter" @change="loadTransfers" class="input">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <table class="table" v-if="transfers.length">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Partner</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transfer in transfers" :key="transfer.transfer_id">
            <td>{{ transfer.medicine?.generic_name }}</td>
            <td>{{ transfer.partner?.name }}</td>
            <td>{{ transfer.quantity }}</td>
            <td>
              <span :class="['badge', transfer.status]">{{ transfer.status }}</span>
            </td>
            <td>{{ formatDate(transfer.created_at) }}</td>
            <td>
              <button v-if="transfer.status === 'pending'" @click="markComplete(transfer.transfer_id)" class="btn btn-sm">
                Mark as Complete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">No transfer requests</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pharmacyAPI } from '@/api/pharmacy'

const activeTab = ref('list')
const partners = ref([])
const transfers = ref([])
const transferFilter = ref('')

onMounted(async () => {
  await loadPartners()
})

const loadPartners = async () => {
  try {
    partners.value = await pharmacyAPI.listPartnerPharmacies()
  } catch (error) {
    console.error('Failed to load partner pharmacies', error)
  }
}

const loadTransfers = async () => {
  try {
    transfers.value = await pharmacyAPI.listTransferRequests(transferFilter.value || undefined)
  } catch (error) {
    console.error('Failed to load transfer requests', error)
  }
}

const markComplete = async (transferId: number) => {
  try {
    await pharmacyAPI.updateTransferRequest(transferId, 'completed')
    await loadTransfers()
    alert('Transfer request marked as completed')
  } catch (error) {
    console.error('Failed to update transfer request', error)
    alert('Failed to update transfer request')
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.partner-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.info-box {
  background: #e7f3ff;
  border-left: 4px solid #007bff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.info-box p {
  margin: 0;
  color: #004085;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
}

.tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: 500;
}

.content-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters {
  margin-bottom: 1rem;
}

.input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 200px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f8f9fa;
}

.table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}

.table tr:hover {
  background: #f8f9fa;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge.active {
  background: #28a745;
  color: white;
}

.badge.pending {
  background: #ffc107;
  color: #333;
}

.badge.accepted {
  background: #17a2b8;
  color: white;
}

.badge.completed {
  background: #28a745;
  color: white;
}

.badge.rejected {
  background: #dc3545;
  color: white;
}

.btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  background: #007bff;
  color: white;
  transition: all 0.3s;
}

.btn:hover {
  background: #0056b3;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
