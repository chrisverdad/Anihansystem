<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">My deliveries</h1>
            <p class="text-gray-600 mt-1">Fulfillment for orders of your products (buyer details and shared notes only).</p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="loadDeliveries"
              class="btn-secondary"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <TruckIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p class="text-2xl font-bold text-gray-900">{{ deliveryStats.total }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-gray-900">{{ deliveryStats.pending }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Delivered</p>
              <p class="text-2xl font-bold text-gray-900">{{ deliveryStats.delivered }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <XCircleIcon class="w-6 h-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Failed</p>
              <p class="text-2xl font-bold text-gray-900">{{ deliveryStats.failed }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select v-model="statusFilter" class="form-input">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Delivery Person</label>
              <input
                v-model="deliveryPersonFilter"
                type="text"
                placeholder="Search by delivery person..."
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
              <input
                v-model="orderIdFilter"
                type="text"
                placeholder="Search by order ID..."
                class="form-input"
              />
            </div>
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Deliveries Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Deliveries ({{ filteredDeliveries.length }})</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Person</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="delivery in paginatedDeliveries" :key="delivery.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ delivery.order_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex flex-col">
                    <span class="font-medium">{{ delivery.order?.user?.full_name || 'N/A' }}</span>
                    <span class="text-xs text-gray-500">{{ delivery.order?.user?.email || 'N/A' }}</span>
                    <span class="text-xs text-gray-500">{{ delivery.order?.user?.phone || 'N/A' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ delivery.order?.product?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ delivery.order?.delivery_address || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(delivery.status)" class="badge">
                    {{ delivery.status.replace('_', ' ').toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ delivery.delivery_person || 'Not assigned' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(delivery.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openDeliveryModal(delivery)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredDeliveries.length) }}</span>
                of
                <span class="font-medium">{{ filteredDeliveries.length }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon class="h-5 w-5" />
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delivery Management Modal -->
    <div
      v-if="showDeliveryModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeDeliveryModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(90vh,760px)] overflow-hidden flex flex-col ring-1 ring-slate-200/80"
      >
        <div
          class="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-emerald-50/50"
        >
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Manage delivery</h3>
            <p class="text-xs text-slate-500 mt-0.5">Order #{{ selectedDelivery?.order_id }} — visible to the buyer when saved</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80"
            aria-label="Close"
            @click="closeDeliveryModal"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm">
          <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Customer</p>
            <p class="font-medium text-slate-900">{{ selectedDelivery?.order?.user?.full_name || 'N/A' }}</p>
            <p class="text-slate-600 text-sm mt-1">{{ selectedDelivery?.order?.user?.email || 'N/A' }}</p>
            <p class="text-slate-600 text-sm">{{ selectedDelivery?.order?.user?.phone || 'N/A' }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Delivery address</label>
            <textarea
              :value="selectedDelivery?.order?.delivery_address"
              disabled
              rows="2"
              class="form-input bg-slate-50 text-slate-700"
            />
          </div>

          <div class="rounded-xl border border-slate-200 p-4 space-y-3">
            <p class="text-sm font-semibold text-slate-800">Status</p>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Delivery status</label>
              <select v-model="deliveryForm.status" class="form-input w-full">
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">Order status</label>
                <select v-model="deliveryForm.order_status" class="form-input w-full">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">Payment status</label>
                <select v-model="deliveryForm.payment_status" class="form-input w-full">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-emerald-50/50 p-4 ring-1 ring-emerald-100 space-y-3">
            <p class="text-xs font-semibold text-emerald-900 uppercase tracking-wide">Courier (shown to customer)</p>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Delivery person</label>
              <input
                v-model="deliveryForm.delivery_person"
                type="text"
                placeholder="Name of courier or driver"
                class="form-input w-full"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Vehicle</label>
              <input
                v-model="deliveryForm.delivery_vehicle"
                type="text"
                placeholder="e.g. Motorcycle, Van — plate optional"
                class="form-input w-full"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
              <textarea
                v-model="deliveryForm.notes"
                rows="3"
                placeholder="Instructions for the buyer (optional)"
                class="form-input w-full"
              />
            </div>
          </div>
        </div>

        <div class="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button type="button" class="btn-outline" @click="closeDeliveryModal">Cancel</button>
          <button type="button" class="btn-primary min-w-[140px]" :disabled="loading" @click="updateDelivery">
            <span v-if="loading">Saving…</span>
            <span v-else>Save changes</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { Delivery, Order } from '@/types'
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const productsStore = useProductsStore()
const authStore = useAuthStore()
const toast = useToast()

// State
const deliveries = ref<Delivery[]>([])
const loading = ref(false)
const showDeliveryModal = ref(false)
const selectedDelivery = ref<Delivery | null>(null)

// Filters
const statusFilter = ref('')
const deliveryPersonFilter = ref('')
const orderIdFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Form
const deliveryForm = ref({
  status: 'pending' as Delivery['status'],
  delivery_person: '',
  delivery_vehicle: '',
  notes: '',
  order_status: 'pending' as Order['status'],
  payment_status: 'pending' as Order['payment_status']
})

// Computed
const filteredDeliveries = computed(() => {
  return deliveries.value.filter(delivery => {
    const matchesStatus = !statusFilter.value || delivery.status === statusFilter.value
    const matchesPerson = !deliveryPersonFilter.value || 
      delivery.delivery_person?.toLowerCase().includes(deliveryPersonFilter.value.toLowerCase())
    const matchesOrderId = !orderIdFilter.value || 
      delivery.order_id.toLowerCase().includes(orderIdFilter.value.toLowerCase())
    
    return matchesStatus && matchesPerson && matchesOrderId
  })
})

const paginatedDeliveries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDeliveries.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredDeliveries.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const deliveryStats = computed(() => {
  return {
    total: deliveries.value.length,
    pending: deliveries.value.filter(d => d.status === 'pending').length,
    delivered: deliveries.value.filter(d => d.status === 'delivered').length,
    failed: deliveries.value.filter(d => d.status === 'failed').length
  }
})

// Methods
const loadDeliveries = async () => {
  const vid = authStore.user?.id
  if (!vid) {
    toast.error('Please sign in as a vendor')
    return
  }
  try {
    await productsStore.loadDeliveries({ vendorId: String(vid) })
    deliveries.value = productsStore.deliveries
  } catch (error) {
    console.error('Failed to load deliveries:', error)
    toast.error('Failed to load deliveries')
  }
}

const openDeliveryModal = (delivery: Delivery) => {
  selectedDelivery.value = delivery
  const o = delivery.order
  deliveryForm.value = {
    status: delivery.status,
    delivery_person: delivery.delivery_person || '',
    delivery_vehicle: delivery.delivery_vehicle || '',
    notes: delivery.notes || '',
    order_status: o?.status ?? 'pending',
    payment_status: o?.payment_status ?? 'pending'
  }
  showDeliveryModal.value = true
}

const closeDeliveryModal = () => {
  showDeliveryModal.value = false
  selectedDelivery.value = null
  deliveryForm.value = {
    status: 'pending',
    delivery_person: '',
    delivery_vehicle: '',
    notes: '',
    order_status: 'pending',
    payment_status: 'pending'
  }
}

const updateDelivery = async () => {
  if (!selectedDelivery.value) return
  
  loading.value = true
  try {
    const vid = authStore.user?.id
    if (!vid) throw new Error('Not signed in')
    await productsStore.updateDeliveryStatus(
      selectedDelivery.value.id,
      deliveryForm.value.status,
      deliveryForm.value.delivery_person,
      deliveryForm.value.delivery_vehicle,
      { notes: deliveryForm.value.notes, vendorId: String(vid) }
    )

    const ord = selectedDelivery.value.order
    const orderChanged =
      ord &&
      (deliveryForm.value.order_status !== ord.status ||
        deliveryForm.value.payment_status !== ord.payment_status)
    if (orderChanged) {
      await productsStore.updateOrderFields(String(selectedDelivery.value.order_id), {
        status: deliveryForm.value.order_status,
        payment_status: deliveryForm.value.payment_status
      })
    }

    deliveries.value = productsStore.deliveries

    toast.success('Updated successfully')
    closeDeliveryModal()
  } catch (error) {
    console.error('Failed to update delivery:', error)
    toast.error('Failed to update delivery')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  statusFilter.value = ''
  deliveryPersonFilter.value = ''
  orderIdFilter.value = ''
  currentPage.value = 1
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'badge-warning',
    assigned: 'badge-info',
    picked_up: 'badge-primary',
    in_transit: 'badge-secondary',
    delivered: 'badge-success',
    failed: 'badge-danger'
  }
  return classes[status as keyof typeof classes] || 'badge-secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadDeliveries()
})
</script>
