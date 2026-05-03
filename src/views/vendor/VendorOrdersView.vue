<template>
  <div class="min-h-screen bg-gray-50">
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Product orders</h1>
            <p class="text-gray-600 mt-1">
              Customers who bought products linked to your submissions (name, contact, and payment status).
            </p>
          </div>
          <select v-model="statusFilter" class="form-input max-w-xs">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <p class="text-sm font-medium text-gray-500">Total orders</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <p class="text-sm font-medium text-gray-500">Pending</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pending }}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <p class="text-sm font-medium text-gray-500">Gross sales (your products)</p>
            <p class="text-2xl font-semibold text-gray-900">₱{{ stats.revenue.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Orders ({{ filteredOrders.length }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in paginatedOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">#{{ order.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.user?.full_name || '—' }}</div>
                  <div class="text-sm text-gray-500">{{ order.user?.email || '' }}</div>
                  <div v-if="order.user?.phone" class="text-xs text-gray-400">{{ order.user.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        v-if="order.product?.image_url && !imageErrors[order.id]"
                        :src="getImageUrl(order.product.image_url)"
                        :alt="order.product.name"
                        class="h-10 w-10 object-cover"
                        loading="lazy"
                        @error="handleImageError(order.id)"
                      />
                      <div v-else class="h-10 w-10 bg-gray-200 flex items-center justify-center">
                        <CubeIcon class="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ order.product?.name }}</div>
                      <div class="text-xs text-gray-500">{{ order.product?.category }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.quantity }} {{ order.product?.unit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₱{{ order.total_price.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(order.status)">{{ order.status }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentBadgeClass(order.payment_status)">{{ order.payment_status }}</span>
                  <div class="text-xs text-gray-500 mt-0.5">{{ order.payment_method?.toUpperCase() }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getDeliveryBadgeClass(order.delivery_status)">{{ formatDeliveryLabel(order.delivery_status) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.order_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button type="button" class="text-primary-600 hover:text-primary-900" @click="openOrderModal(order)">
                    Manage
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!productsStore.loading && filteredOrders.length === 0" class="px-6 py-8 text-center text-gray-500">
            No orders yet for your products. When buyers purchase items created from your waste submissions, they appear
            here.
          </p>
        </div>

        <div v-if="totalPages > 1" class="card-footer flex justify-between items-center">
          <span class="text-sm text-gray-600">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <div class="flex gap-2">
            <button
              type="button"
              class="btn-outline"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              Previous
            </button>
            <button
              type="button"
              class="btn-outline"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedOrder"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeOrderModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(90vh,720px)] overflow-hidden flex flex-col ring-1 ring-slate-200/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-order-modal-title"
      >
        <div class="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-emerald-50/50">
          <div>
            <p id="vendor-order-modal-title" class="text-lg font-semibold text-slate-900">
              Order #{{ selectedOrder.id }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5">Update order, payment, and delivery status</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
            aria-label="Close"
            @click="closeOrderModal"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm">
          <div class="flex flex-wrap gap-2">
            <span :class="getStatusBadgeClass(selectedOrder.status)">{{ selectedOrder.status }}</span>
            <span :class="getPaymentBadgeClass(selectedOrder.payment_status)">{{ selectedOrder.payment_status }}</span>
            <span :class="getDeliveryBadgeClass(selectedOrder.delivery_status)">{{
              formatDeliveryLabel(selectedOrder.delivery_status)
            }}</span>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
              <UserIcon class="w-4 h-4" />
              Buyer
            </div>
            <p class="font-medium text-slate-900">{{ selectedOrder.user?.full_name || '—' }}</p>
            <p class="text-slate-600 mt-1">{{ selectedOrder.user?.email }}</p>
            <p v-if="selectedOrder.user?.phone" class="text-slate-600">{{ selectedOrder.user.phone }}</p>
            <p v-if="selectedOrder.user?.address" class="text-slate-600 mt-2 text-xs leading-relaxed">
              {{ selectedOrder.user.address }}
            </p>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
              <MapPinIcon class="w-4 h-4" />
              Delivery address
            </div>
            <p class="text-slate-900 whitespace-pre-wrap">{{ selectedOrder.delivery_address || '—' }}</p>
            <p v-if="selectedOrder.delivery_notes" class="text-slate-600 mt-2 text-xs border-t border-slate-200/80 pt-2">
              {{ selectedOrder.delivery_notes }}
            </p>
          </div>

          <div
            v-if="hasCourierInfo(selectedOrder)"
            class="rounded-xl bg-emerald-50/60 p-4 ring-1 ring-emerald-100"
          >
            <div class="flex items-center gap-2 text-emerald-800 text-xs font-semibold uppercase tracking-wide mb-3">
              <TruckIcon class="w-4 h-4" />
              Courier (from deliveries)
            </div>
            <dl class="space-y-2 text-slate-800">
              <div v-if="selectedOrder.delivery_info?.delivery_person?.trim()" class="flex justify-between gap-4">
                <dt class="text-slate-500 shrink-0">Person</dt>
                <dd class="font-medium text-right">{{ selectedOrder.delivery_info?.delivery_person }}</dd>
              </div>
              <div v-if="selectedOrder.delivery_info?.delivery_vehicle?.trim()" class="flex justify-between gap-4">
                <dt class="text-slate-500 shrink-0">Vehicle</dt>
                <dd class="font-medium text-right">{{ selectedOrder.delivery_info?.delivery_vehicle }}</dd>
              </div>
              <div v-if="selectedOrder.delivery_info?.fulfillment_notes?.trim()" class="pt-2 border-t border-emerald-100">
                <dt class="text-slate-500 text-xs mb-1">Delivery notes</dt>
                <dd class="text-slate-700 text-xs whitespace-pre-wrap">{{ selectedOrder.delivery_info?.fulfillment_notes }}</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
              <CubeIcon class="w-4 h-4" />
              Product &amp; payment
            </div>
            <p class="font-medium text-slate-900">{{ selectedOrder.product?.name }} × {{ selectedOrder.quantity }}</p>
            <p class="text-slate-600 mt-1">
              Total <span class="font-semibold text-slate-900">₱{{ selectedOrder.total_price.toLocaleString() }}</span>
              · {{ selectedOrder.payment_method?.toUpperCase() }}
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 p-4 space-y-3">
            <div class="flex items-center gap-2 text-slate-700 text-sm font-semibold">
              <ClipboardDocumentListIcon class="w-4 h-4 text-violet-600" />
              Update statuses
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Order status</label>
              <select v-model="orderEdit.status" class="form-input w-full">
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
              <select v-model="orderEdit.payment_status" class="form-input w-full">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1.5">Delivery status</label>
              <select v-model="orderEdit.delivery_status" class="form-input w-full">
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked up</option>
                <option value="in_transit">In transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button type="button" class="btn-outline" @click="closeOrderModal">Cancel</button>
          <button type="button" class="btn-primary min-w-[100px]" :disabled="orderSaving" @click="saveOrderStatuses">
            <span v-if="orderSaving">Saving…</span>
            <span v-else>Save changes</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { useToast } from 'vue-toastification'
import {
  CubeIcon,
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  TruckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'
import { getImageUrl } from '@/utils/imageUtils'
import type { Order } from '@/types'

const authStore = useAuthStore()
const productsStore = useProductsStore()
const toast = useToast()

const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedOrder = ref<Order | null>(null)
const orderSaving = ref(false)
const orderEdit = ref({
  status: 'pending' as Order['status'],
  payment_status: 'pending' as Order['payment_status'],
  delivery_status: 'pending' as Order['delivery_status']
})
const imageErrors = ref<Record<string, boolean>>({})

const orders = computed(() => productsStore.vendorOrders)

const filteredOrders = computed(() => {
  let list = orders.value
  if (statusFilter.value) {
    list = list.filter((o) => o.status === statusFilter.value)
  }
  return [...list].sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredOrders.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / itemsPerPage.value)))

const stats = computed(() => {
  const list = orders.value
  return {
    total: list.length,
    pending: list.filter((o) => o.status === 'pending').length,
    revenue: list.reduce((s, o) => s + o.total_price, 0)
  }
})

watch([filteredOrders, statusFilter], () => {
  currentPage.value = 1
})

const formatDate = (d: string) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const handleImageError = (id: string) => {
  imageErrors.value[id] = true
}

const getStatusBadgeClass = (status: string) => {
  const m: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-primary',
    processing: 'badge-primary',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  }
  return m[status] || 'badge-gray'
}

const getPaymentBadgeClass = (status: string) => {
  const m: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-info'
  }
  return m[status] || 'badge-gray'
}

const getDeliveryBadgeClass = (status: string) => {
  const m: Record<string, string> = {
    pending: 'badge-warning',
    assigned: 'badge-info',
    picked_up: 'badge-primary',
    in_transit: 'badge-primary',
    delivered: 'badge-success',
    failed: 'badge-danger'
  }
  return m[status] || 'badge-gray'
}

const formatDeliveryLabel = (s: string) => s.replace(/_/g, ' ')

const hasCourierInfo = (o: Order) => {
  const d = o.delivery_info
  if (!d) return false
  return Boolean(
    d.delivery_person?.trim() ||
      d.delivery_vehicle?.trim() ||
      d.fulfillment_notes?.trim()
  )
}

const openOrderModal = (order: Order) => {
  selectedOrder.value = order
  orderEdit.value = {
    status: order.status,
    payment_status: order.payment_status,
    delivery_status: order.delivery_status
  }
}

const closeOrderModal = () => {
  selectedOrder.value = null
}

const saveOrderStatuses = async () => {
  if (!selectedOrder.value) return
  orderSaving.value = true
  try {
    const updated = await productsStore.updateOrderFields(selectedOrder.value.id, {
      status: orderEdit.value.status,
      payment_status: orderEdit.value.payment_status,
      delivery_status: orderEdit.value.delivery_status
    })
    selectedOrder.value = updated
    orderEdit.value = {
      status: updated.status,
      payment_status: updated.payment_status,
      delivery_status: updated.delivery_status
    }
    toast.success('Order updated')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update order'
    toast.error(msg)
  } finally {
    orderSaving.value = false
  }
}

onMounted(async () => {
  const vid = authStore.user?.id
  if (vid) await productsStore.loadVendorOrders(String(vid))
})
</script>
