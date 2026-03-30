<template>
  <div class="billing-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1>Billing & Payments</h1>
        <p>Manage invoices, payments, and receipts</p>
      </div>
      <button class="btn-primary" @click="showInvoiceModal = true">
        <span>+ Generate Invoice</span>
      </button>
    </div>

    <!-- Finance Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-label">Today's Revenue</div>
        <div class="card-amount">₹{{ todayRevenue.toLocaleString() }}</div>
        <div class="card-count">{{ paidInvoices.length }} invoices</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Pending Amount</div>
        <div class="card-amount pending">₹{{ pendingAmount.toLocaleString() }}</div>
        <div class="card-count">{{ pendingInvoices.length }} invoices</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Total Collections</div>
        <div class="card-amount">₹{{ totalCollections.toLocaleString() }}</div>
        <div class="card-count">This month</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Collection Rate</div>
        <div class="card-amount">{{ collectionRate }}%</div>
        <div class="card-count">Monthly average</div>
      </div>
    </div>

    <!-- Filters & Tabs -->
    <div class="filter-section">
      <div class="filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search invoice or patient..."
          class="filter-input search-input"
        />
        <select v-model="statusFilter" class="filter-input">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial Payment</option>
          <option value="overdue">Overdue</option>
        </select>
        <input
          v-model="dateFilter"
          type="date"
          class="filter-input"
        />
      </div>
      <div class="tabs">
        <button
          v-for="tab in ['All', 'Paid', 'Pending', 'Overdue']"
          :key="tab"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }} ({{ getTabCount(tab) }})
        </button>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="invoices-section">
      <div class="table-responsive">
        <table class="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="invoice-row">
              <td class="invoice-num">{{ invoice.invoiceNumber }}</td>
              <td class="invoice-date">{{ invoice.date }}</td>
              <td class="invoice-patient">{{ invoice.patientName }}</td>
              <td class="invoice-amount">₹{{ invoice.amount.toLocaleString() }}</td>
              <td class="invoice-paid">₹{{ invoice.paidAmount.toLocaleString() }}</td>
              <td class="invoice-status">
                <span class="status-badge" :class="invoice.status">{{ invoice.status }}</span>
              </td>
              <td class="invoice-actions">
                <button class="btn-small btn-view" @click="viewInvoice(invoice)">View</button>
                <button
                  v-if="invoice.status !== 'paid'"
                  class="btn-small btn-payment"
                  @click="openPaymentModal(invoice)"
                >
                  Payment
                </button>
                <button class="btn-small btn-print" @click="printInvoice(invoice)">
                  Print
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div v-if="selectedInvoice && showDetailsModal" class="modal-overlay" @click.self="showDetailsModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h2>Invoice #{{ selectedInvoice.invoiceNumber }}</h2>
          <button class="btn-close" @click="showDetailsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Invoice Header -->
          <div class="invoice-header-print">
            <div class="hospital-info">
              <h3>Apollo Hospital Management System</h3>
              <p>📞 +91-1234567890 | 📧 billing@apollo.com</p>
            </div>
            <div class="invoice-info">
              <div class="info-row">
                <span>Invoice Number:</span>
                <strong>{{ selectedInvoice.invoiceNumber }}</strong>
              </div>
              <div class="info-row">
                <span>Date:</span>
                <strong>{{ selectedInvoice.date }}</strong>
              </div>
            </div>
          </div>

          <!-- Patient Info -->
          <div class="patient-section">
            <h4>Bill To:</h4>
            <p>
              <strong>{{ selectedInvoice.patientName }}</strong><br />
              Register No: {{ selectedInvoice.patientId }}<br />
              Contact: {{ selectedInvoice.patientPhone }}
            </p>
          </div>

          <!-- Services -->
          <div class="services-section">
            <table class="services-table">
              <thead>
                <tr>
                  <th>Service/Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedInvoice.items" :key="idx">
                  <td>{{ item.description }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">₹{{ item.unitPrice.toLocaleString() }}</td>
                  <td class="text-right"><strong>₹{{ item.amount.toLocaleString() }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹{{ selectedInvoice.subtotal.toLocaleString() }}</span>
            </div>
            <div class="total-row" v-if="selectedInvoice.tax > 0">
              <span>Tax ({{ selectedInvoice.taxPercent }}%):</span>
              <span>₹{{ selectedInvoice.tax.toLocaleString() }}</span>
            </div>
            <div class="total-row" v-if="selectedInvoice.discount > 0">
              <span>Discount:</span>
              <span>-₹{{ selectedInvoice.discount.toLocaleString() }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Amount Due:</span>
              <span>₹{{ selectedInvoice.amount.toLocaleString() }}</span>
            </div>
            <div class="total-row">
              <span>Paid:</span>
              <span>₹{{ selectedInvoice.paidAmount.toLocaleString() }}</span>
            </div>
            <div class="total-row" v-if="selectedInvoice.amount > selectedInvoice.paidAmount" :class="{ overdue: selectedInvoice.status === 'overdue' }">
              <span>{{ selectedInvoice.status === 'overdue' ? 'Overdue Amount' : 'Balance Due' }}:</span>
              <span>₹{{ (selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Payment History -->
          <div class="payment-history">
            <h4>Payment History</h4>
            <table v-if="selectedInvoice.payments && selectedInvoice.payments.length" class="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, idx) in selectedInvoice.payments" :key="idx">
                  <td>{{ payment.date }}</td>
                  <td>₹{{ payment.amount.toLocaleString() }}</td>
                  <td>{{ payment.method }}</td>
                  <td>{{ payment.reference }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="no-data">No payments recorded yet</p>
          </div>

          <!-- Notes -->
          <div class="notes-section" v-if="selectedInvoice.notes">
            <h4>Notes:</h4>
            <p>{{ selectedInvoice.notes }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDetailsModal = false">Close</button>
          <button class="btn-print-modal" @click="printInvoice(selectedInvoice)">🖨️ Print Invoice</button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="selectedInvoice && showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Record Payment - Invoice #{{ selectedInvoice.invoiceNumber }}</h2>
          <button class="btn-close" @click="showPaymentModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="payment-info">
            <div class="info-row">
              <span>Total Amount:</span>
              <strong>₹{{ selectedInvoice.amount.toLocaleString() }}</strong>
            </div>
            <div class="info-row">
              <span>Already Paid:</span>
              <strong>₹{{ selectedInvoice.paidAmount.toLocaleString() }}</strong>
            </div>
            <div class="info-row balance">
              <span>Balance Due:</span>
              <strong>₹{{ (selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString() }}</strong>
            </div>
          </div>

          <div class="form-group">
            <label>Payment Amount:</label>
            <input
              v-model.number="paymentForm.amount"
              type="number"
              placeholder="Enter amount"
              class="form-input"
              :max="selectedInvoice.amount - selectedInvoice.paidAmount"
            />
          </div>
          <div class="form-group">
            <label>Payment Method:</label>
            <select v-model="paymentForm.method" class="form-input">
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reference/Transaction ID (Optional):</label>
            <input
              v-model="paymentForm.reference"
              type="text"
              placeholder="e.g., CHQ123456 or UPI Ref"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label v-if="paymentForm.method === 'Card'">Card Details:</label>
            <input
              v-if="paymentForm.method === 'Card'"
              v-model="paymentForm.cardDetails"
              type="text"
              placeholder="e.g., VISA ***1234"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Notes (Optional):</label>
            <textarea v-model="paymentForm.notes" placeholder="Any additional notes..." class="form-input"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showPaymentModal = false">Cancel</button>
          <button class="btn-primary" @click="submitPayment">Record Payment</button>
        </div>
      </div>
    </div>

    <!-- Generate Invoice Modal -->
    <div v-if="showInvoiceModal" class="modal-overlay" @click.self="showInvoiceModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Generate New Invoice</h2>
          <button class="btn-close" @click="showInvoiceModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Patient ID:</label>
            <input v-model="invoiceForm.patientId" placeholder="Register number" class="form-input" />
          </div>
          <div class="form-group">
            <label>Patient Name:</label>
            <input v-model="invoiceForm.patientName" placeholder="Full name" class="form-input" />
          </div>
          <div class="form-group">
            <label>Service/Item Description:</label>
            <input
              v-model="invoiceForm.serviceDescription"
              placeholder="e.g., Consultation, Lab Tests, Medication"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Amount:</label>
            <input v-model.number="invoiceForm.amount" type="number" placeholder="0.00" class="form-input" />
          </div>
          <div class="form-group">
            <label>Tax (%):</label>
            <select v-model.number="invoiceForm.taxPercent" class="form-input">
              <option value="0">No Tax</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
            </select>
          </div>
          <div class="form-group">
            <label>Discount (₹):</label>
            <input v-model.number="invoiceForm.discount" type="number" placeholder="0.00" class="form-input" />
          </div>
          <div class="form-group">
            <label>Notes:</label>
            <textarea v-model="invoiceForm.notes" placeholder="Invoice notes..." class="form-input"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showInvoiceModal = false">Cancel</button>
          <button class="btn-primary" @click="submitInvoice">Generate Invoice</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface Payment {
  date: string
  amount: number
  method: string
  reference: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  patientId: string
  patientName: string
  patientPhone: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxPercent: number
  discount: number
  amount: number
  paidAmount: number
  status: 'paid' | 'pending' | 'partial' | 'overdue'
  payments: Payment[]
  notes: string
}

// Sample invoices
const invoices = ref<Invoice[]>([
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    patientId: 'REG001',
    patientName: 'Raj Kumar',
    patientPhone: '+91-9876543210',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 },
      { description: 'Lab Tests', quantity: 1, unitPrice: 2000, amount: 2000 },
    ],
    subtotal: 2500,
    tax: 450,
    taxPercent: 18,
    discount: 0,
    amount: 2950,
    paidAmount: 2950,
    status: 'paid',
    payments: [
      { date: '2024-01-15', amount: 2950, method: 'Card', reference: 'VISA ***1234' },
    ],
    notes: 'Payment received',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-01-15',
    patientId: 'REG002',
    patientName: 'Priya Singh',
    patientPhone: '+91-9876543211',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 },
      { description: 'Medication', quantity: 1, unitPrice: 1000, amount: 1000 },
    ],
    subtotal: 1500,
    tax: 270,
    taxPercent: 18,
    discount: 0,
    amount: 1770,
    paidAmount: 0,
    status: 'pending',
    payments: [],
    notes: 'Awaiting payment',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-003',
    date: '2024-01-14',
    patientId: 'REG003',
    patientName: 'Amit Patel',
    patientPhone: '+91-9876543212',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 },
      { description: 'X-Ray', quantity: 2, unitPrice: 800, amount: 1600 },
      { description: 'Lab Tests', quantity: 1, unitPrice: 2000, amount: 2000 },
    ],
    subtotal: 4100,
    tax: 738,
    taxPercent: 18,
    discount: 200,
    amount: 4638,
    paidAmount: 3000,
    status: 'partial',
    payments: [
      { date: '2024-01-14', amount: 3000, method: 'UPI', reference: 'UPI ID' },
    ],
    notes: 'Partial payment received',
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2024-004',
    date: '2024-01-10',
    patientId: 'REG004',
    patientName: 'Neha Gupta',
    patientPhone: '+91-9876543213',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 500, amount: 500 },
      { description: 'Medication', quantity: 3, unitPrice: 800, amount: 2400 },
    ],
    subtotal: 2900,
    tax: 522,
    taxPercent: 18,
    discount: 0,
    amount: 3422,
    paidAmount: 0,
    status: 'overdue',
    payments: [],
    notes: 'Overdue - payment pending',
  },
])

const showDetailsModal = ref(false)
const showPaymentModal = ref(false)
const showInvoiceModal = ref(false)
const selectedInvoice = ref<Invoice | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const activeTab = ref('All')

const paymentForm = ref({
  amount: 0,
  method: '',
  reference: '',
  cardDetails: '',
  notes: '',
})

const invoiceForm = ref({
  patientId: '',
  patientName: '',
  serviceDescription: '',
  amount: 0,
  taxPercent: 18,
  discount: 0,
  notes: '',
})

const paidInvoices = computed(() => invoices.value.filter((i) => i.status === 'paid'))
const pendingInvoices = computed(() =>
  invoices.value.filter((i) => i.status === 'pending' || i.status === 'partial' || i.status === 'overdue')
)

const todayRevenue = computed(() => {
  return paidInvoices.value
    .filter((i) => i.date === new Date().toISOString().split('T')[0])
    .reduce((sum, i) => sum + i.amount, 0)
})

const pendingAmount = computed(() => {
  return pendingInvoices.value.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0)
})

const totalCollections = computed(() => {
  return invoices.value
    .filter((i) => i.date.startsWith(new Date().getFullYear().toString()))
    .reduce((sum, i) => sum + i.paidAmount, 0)
})

const collectionRate = computed(() => {
  const total = invoices.value.reduce((sum, i) => sum + i.amount, 0)
  return total > 0 ? Math.round((totalCollections.value / total) * 100) : 0
})

const filteredInvoices = computed(() => {
  let result = invoices.value

  if (statusFilter.value) {
    result = result.filter((i) => i.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.patientName.toLowerCase().includes(q) ||
        i.patientId.toLowerCase().includes(q)
    )
  }

  if (dateFilter.value) {
    result = result.filter((i) => i.date === dateFilter.value)
  }

  if (activeTab.value === 'Paid') {
    result = result.filter((i) => i.status === 'paid')
  } else if (activeTab.value === 'Pending') {
    result = result.filter((i) => i.status === 'pending' || i.status === 'partial')
  } else if (activeTab.value === 'Overdue') {
    result = result.filter((i) => i.status === 'overdue')
  }

  return result
})

const getTabCount = (tab: string): number => {
  if (tab === 'All') return invoices.value.length
  if (tab === 'Paid') return paidInvoices.value.length
  if (tab === 'Pending') return pendingInvoices.value.length
  if (tab === 'Overdue') return invoices.value.filter((i) => i.status === 'overdue').length
  return 0
}

const viewInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  showDetailsModal.value = true
}

const openPaymentModal = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  paymentForm.value = {
    amount: Math.max(0, invoice.amount - invoice.paidAmount),
    method: '',
    reference: '',
    cardDetails: '',
    notes: '',
  }
  showPaymentModal.value = true
  showDetailsModal.value = false
}

const printInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  setTimeout(() => {
    window.print()
  }, 100)
}

const submitPayment = () => {
  if (!paymentForm.value.method || paymentForm.value.amount <= 0) {
    alert('Please select payment method and enter valid amount')
    return
  }

  if (selectedInvoice.value) {
    selectedInvoice.value.paidAmount += paymentForm.value.amount

    const payment: Payment = {
      date: new Date().toISOString().split('T')[0],
      amount: paymentForm.value.amount,
      method: paymentForm.value.method,
      reference: paymentForm.value.reference || 'N/A',
    }
    selectedInvoice.value.payments.push(payment)

    if (selectedInvoice.value.paidAmount >= selectedInvoice.value.amount) {
      selectedInvoice.value.status = 'paid'
    } else if (selectedInvoice.value.paidAmount > 0) {
      selectedInvoice.value.status = 'partial'
    }
  }

  showPaymentModal.value = false
}

const submitInvoice = () => {
  if (!invoiceForm.value.patientId || !invoiceForm.value.amount) {
    alert('Please fill required fields')
    return
  }

  const subtotal = invoiceForm.value.amount
  const tax = Math.round((subtotal * invoiceForm.value.taxPercent) / 100)
  const total = subtotal + tax - (invoiceForm.value.discount || 0)

  const newInvoice: Invoice = {
    id: `inv${Date.now()}`,
    invoiceNumber: `INV-2024-${String(invoices.value.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    patientId: invoiceForm.value.patientId,
    patientName: invoiceForm.value.patientName,
    patientPhone: '',
    items: [
      {
        description: invoiceForm.value.serviceDescription,
        quantity: 1,
        unitPrice: invoiceForm.value.amount,
        amount: invoiceForm.value.amount,
      },
    ],
    subtotal: subtotal,
    tax: tax,
    taxPercent: invoiceForm.value.taxPercent,
    discount: invoiceForm.value.discount || 0,
    amount: total,
    paidAmount: 0,
    status: 'pending',
    payments: [],
    notes: invoiceForm.value.notes,
  }

  invoices.value.push(newInvoice)
  showInvoiceModal.value = false
  invoiceForm.value = {
    patientId: '',
    patientName: '',
    serviceDescription: '',
    amount: 0,
    taxPercent: 18,
    discount: 0,
    notes: '',
  }
}
</script>

<style scoped>
.billing-container {
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

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
}

.card-label {
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.card-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 0.5rem;
}

.card-amount.pending {
  color: #f39c12;
}

.card-count {
  color: #999;
  font-size: 0.85rem;
}

/* Filters & Tabs */
.filter-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.tabs {
  display: flex;
  gap: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
  flex-wrap: wrap;
}

.tab {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: #666;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #667eea;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

/* Invoices Table */
.invoices-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.invoices-table {
  width: 100%;
  border-collapse: collapse;
}

.invoices-table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.invoices-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.invoices-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.invoice-row:hover {
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

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.partial {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
}

.invoice-actions {
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

.btn-view {
  background: #667eea;
  color: white;
}

.btn-payment {
  background: #27ae60;
  color: white;
}

.btn-print {
  background: #3498db;
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
  max-width: 800px;
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

/* Invoice Details */
.invoice-header-print {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #667eea;
}

.hospital-info h3 {
  margin: 0 0 0.5rem 0;
  color: #667eea;
}

.hospital-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.invoice-info {
  margin-top: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.patient-section {
  margin-bottom: 2rem;
}

.patient-section h4 {
  margin: 0 0 0.75rem 0;
  color: #333;
}

.patient-section p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.services-section {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.services-table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.services-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
}

.services-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.totals-section {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.total-row.grand-total {
  font-size: 1.2rem;
  font-weight: bold;
  border-bottom: 2px solid #667eea;
  padding: 1rem 0;
  color: #667eea;
}

.total-row.overdue {
  color: #e74c3c;
  font-weight: bold;
}

.payment-history {
  margin-bottom: 2rem;
}

.payment-history h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.history-table thead {
  background: #f5f5f5;
}

.history-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
}

.history-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.no-data {
  color: #999;
  font-style: italic;
}

.notes-section {
  margin-bottom: 2rem;
}

.notes-section h4 {
  margin: 0 0 0.75rem 0;
  color: #333;
}

.notes-section p {
  margin: 0;
  color: #666;
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

.payment-info {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.payment-info .info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.payment-info .balance {
  font-weight: bold;
  color: #e74c3c;
  border-top: 2px solid #ddd;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
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

.btn-print-modal {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

@media print {
  body {
    background: white;
  }

  .billing-container {
    padding: 0;
  }

  .header-section,
  .summary-cards,
  .filter-section,
  .invoices-section,
  .modal-overlay {
    display: none;
  }
}
</style>
