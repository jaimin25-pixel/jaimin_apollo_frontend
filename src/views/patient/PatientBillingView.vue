<template>
  <div class="billing-view">
    <h1>Patient Billing</h1>

    <!-- Patient Search -->
    <div class="search-section">
      <div class="search-bar">
        <input v-model="searchQuery" @keyup.enter="searchPatient" type="text"
          placeholder="Search patient to view invoices..." class="search-input" />
        <button @click="searchPatient" class="search-btn">Search</button>
      </div>
    </div>

    <div v-if="patientResults.length > 0 && !selectedPatient" class="patient-chips">
      <button v-for="p in patientResults" :key="p.patient_id" @click="selectPatient(p)" class="patient-chip">
        <span class="chip-code">{{ p.pat_code }}</span> {{ p.full_name }}
      </button>
    </div>

    <div v-if="selectedPatient" class="selected-patient-bar">
      <div class="selected-info">
        <span class="pat-badge">{{ selectedPatient.pat_code }}</span>
        <span class="selected-name">{{ selectedPatient.full_name }}</span>
      </div>
      <div class="filter-actions">
        <select v-model="statusFilter" @change="applyFilter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="finalized">Finalized</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button @click="clearSelection" class="btn-outline-sm">Change Patient</button>
      </div>
    </div>

    <div v-if="store.loading" class="loading-state"><div class="spinner"></div><p>Loading...</p></div>
    <div v-if="store.error" class="alert alert-danger">{{ store.error }}</div>

    <!-- Summary Cards -->
    <div v-if="selectedPatient && store.invoices.length > 0" class="billing-summary">
      <div class="summary-card">
        <span class="summary-label">Total Billed</span>
        <span class="summary-value">₹{{ totalBilled.toLocaleString('en-IN') }}</span>
      </div>
      <div class="summary-card paid">
        <span class="summary-label">Amount Paid</span>
        <span class="summary-value">₹{{ totalPaid.toLocaleString('en-IN') }}</span>
      </div>
      <div class="summary-card due">
        <span class="summary-label">Balance Due</span>
        <span class="summary-value">₹{{ totalDue.toLocaleString('en-IN') }}</span>
      </div>
    </div>

    <!-- Invoices Table -->
    <div v-if="selectedPatient && store.invoices.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Date</th>
            <th>Consultation</th>
            <th>Procedure</th>
            <th>Lab</th>
            <th>Pharmacy</th>
            <th>Bed</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in store.invoices" :key="inv.invoice_id">
            <td class="name-cell">#{{ inv.invoice_id }}</td>
            <td>{{ formatDate(inv.created_at) }}</td>
            <td>₹{{ inv.consultation_charges.toLocaleString('en-IN') }}</td>
            <td>₹{{ inv.procedure_charges.toLocaleString('en-IN') }}</td>
            <td>₹{{ inv.lab_charges.toLocaleString('en-IN') }}</td>
            <td>₹{{ inv.pharmacy_charges.toLocaleString('en-IN') }}</td>
            <td>₹{{ inv.bed_charges.toLocaleString('en-IN') }}</td>
            <td class="amount-total">₹{{ inv.total_amount.toLocaleString('en-IN') }}</td>
            <td class="amount-paid">₹{{ inv.amount_paid.toLocaleString('en-IN') }}</td>
            <td class="amount-due">₹{{ inv.balance_due.toLocaleString('en-IN') }}</td>
            <td><span class="inv-status" :class="inv.status">{{ inv.status.replace('_', ' ') }}</span></td>
            <td><button @click="selectedInvoice = inv" class="btn-sm btn-outline">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="selectedPatient && !store.loading" class="no-data">
      <p>No invoices found for this patient.</p>
    </div>

    <!-- Invoice Detail Modal -->
    <div v-if="selectedInvoice" class="modal-overlay" @click.self="selectedInvoice = null">
      <div class="modal">
        <div class="modal-header">
          <h2>Invoice #{{ selectedInvoice.invoice_id }}</h2>
          <button @click="selectedInvoice = null" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="inv-status-bar">
            <span class="inv-status lg" :class="selectedInvoice.status">{{ selectedInvoice.status.replace('_',' ') }}</span>
            <span v-if="selectedInvoice.payment_mode" class="payment-mode">{{ selectedInvoice.payment_mode }}</span>
          </div>

          <h3>Charge Breakdown</h3>
          <div class="charges-grid">
            <div class="charge-row"><span>Consultation</span><span>₹{{ selectedInvoice.consultation_charges.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row"><span>Procedure</span><span>₹{{ selectedInvoice.procedure_charges.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row"><span>Lab</span><span>₹{{ selectedInvoice.lab_charges.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row"><span>Pharmacy</span><span>₹{{ selectedInvoice.pharmacy_charges.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row"><span>Bed</span><span>₹{{ selectedInvoice.bed_charges.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row"><span>Miscellaneous</span><span>₹{{ selectedInvoice.miscellaneous_charges.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row divider"><span>Sub Total</span><span>₹{{ selectedInvoice.sub_total.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row"><span>Tax (GST)</span><span>₹{{ selectedInvoice.tax_amount.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row total"><span>Total Amount</span><span>₹{{ selectedInvoice.total_amount.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row paid-row"><span>Amount Paid</span><span>₹{{ selectedInvoice.amount_paid.toLocaleString('en-IN') }}</span></div>
            <div class="charge-row due-row"><span>Balance Due</span><span>₹{{ selectedInvoice.balance_due.toLocaleString('en-IN') }}</span></div>
          </div>

          <div v-if="selectedInvoice.finalized_at" class="meta-info">
            <span>Finalized: {{ formatDate(selectedInvoice.finalized_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePatientStore } from '@/stores/patient'
import * as patientApi from '@/api/patient'
import type { Patient, InvoiceFull } from '@/types'

const store = usePatientStore()
const searchQuery = ref('')
const patientResults = ref<Patient[]>([])
const selectedPatient = ref<Patient | null>(null)
const selectedInvoice = ref<InvoiceFull | null>(null)
const statusFilter = ref('')

const totalBilled = computed(() => store.invoices.reduce((s, i) => s + i.total_amount, 0))
const totalPaid = computed(() => store.invoices.reduce((s, i) => s + i.amount_paid, 0))
const totalDue = computed(() => store.invoices.reduce((s, i) => s + i.balance_due, 0))

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function searchPatient() {
  patientResults.value = await patientApi.searchPatients(searchQuery.value) || []
  selectedPatient.value = null
}

async function selectPatient(p: Patient) {
  selectedPatient.value = p
  patientResults.value = []
  await store.fetchInvoices(p.patient_id)
}

async function applyFilter() {
  if (!selectedPatient.value) return
  await store.fetchInvoices(selectedPatient.value.patient_id, statusFilter.value ? { status: statusFilter.value } : undefined)
}

function clearSelection() { selectedPatient.value = null; store.invoices = [] }
</script>

<style scoped>
.billing-view { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
h1 { color: #064e3b; font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; }
h3 { color: #1e293b; font-size: 1.1rem; margin: 1rem 0 0.75rem; }

.search-section { margin-bottom: 1.5rem; }
.search-bar { display: flex; gap: 0.75rem; }
.search-input { flex: 1; padding: 0.8rem 1.2rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
.search-input:focus { outline: none; border-color: #0d9488; }
.search-btn { padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #0d9488, #065f46); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }

.patient-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.patient-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.3s; }
.patient-chip:hover { border-color: #0d9488; background: #f0fdfa; }
.chip-code { font-size: 0.75rem; font-weight: 700; color: #0d9488; }

.selected-patient-bar { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 1.5rem; border-left: 4px solid #0d9488; }
.selected-info { display: flex; align-items: center; gap: 0.75rem; }
.pat-badge { background: linear-gradient(135deg, #0d9488, #065f46); color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
.selected-name { font-weight: 700; color: #0f172a; }
.filter-actions { display: flex; gap: 0.75rem; align-items: center; }
.filter-select { padding: 0.5rem 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; }
.btn-outline-sm { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: #64748b; gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0d9488; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 0.8rem; border-radius: 10px; margin-bottom: 1rem; }

/* Summary */
.billing-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.summary-card {
  background: white; padding: 1.25rem 1.5rem; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06); border-left: 4px solid #0d9488;
}
.summary-card.paid { border-color: #10b981; }
.summary-card.due { border-color: #f59e0b; }
.summary-label { font-size: 0.82rem; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; }
.summary-value { font-size: 1.6rem; font-weight: 700; color: #0f172a; }

/* Table */
.table-container { background: white; border-radius: 16px; overflow-x: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.data-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.data-table th { background: #f8fafc; padding: 0.8rem 0.75rem; text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.data-table td { padding: 0.7rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.82rem; white-space: nowrap; }
.data-table tbody tr:hover { background: #f0fdfa; }
.name-cell { font-weight: 700; }
.amount-total { font-weight: 700; color: #0f172a; }
.amount-paid { color: #10b981; font-weight: 600; }
.amount-due { color: #f59e0b; font-weight: 600; }

.inv-status { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; text-transform: capitalize; }
.inv-status.paid { background: #dcfce7; color: #166534; }
.inv-status.finalized { background: #dbeafe; color: #1e40af; }
.inv-status.draft { background: #f1f5f9; color: #475569; }
.inv-status.partially_paid { background: #fef3c7; color: #92400e; }
.inv-status.cancelled { background: #fee2e2; color: #991b1b; }
.inv-status.lg { font-size: 0.9rem; padding: 0.35rem 1rem; }

.btn-sm { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
.btn-outline { background: transparent; border: 1px solid #e2e8f0; transition: all 0.2s; }
.btn-outline:hover { background: #f0fdfa; border-color: #0d9488; }

.no-data { text-align: center; padding: 3rem; color: #64748b; background: white; border-radius: 16px; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; border-radius: 20px; width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
.modal-header h2 { margin: 0; color: #064e3b; font-size: 1.2rem; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 1.5rem; }

.inv-status-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.payment-mode { font-size: 0.85rem; color: #64748b; text-transform: uppercase; font-weight: 600; }

.charges-grid { display: flex; flex-direction: column; gap: 0.4rem; }
.charge-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; color: #475569; }
.charge-row.divider { border-top: 1px solid #e2e8f0; padding-top: 0.75rem; margin-top: 0.25rem; }
.charge-row.total { font-weight: 700; color: #0f172a; font-size: 1rem; border-top: 2px solid #0d9488; padding-top: 0.75rem; }
.charge-row.paid-row span:last-child { color: #10b981; font-weight: 600; }
.charge-row.due-row span:last-child { color: #f59e0b; font-weight: 700; }

.meta-info { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; font-size: 0.82rem; color: #94a3b8; }

@media (max-width: 768px) {
  .billing-summary { grid-template-columns: 1fr; }
}
</style>
