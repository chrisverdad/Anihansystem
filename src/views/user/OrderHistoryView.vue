<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Order History</h1>
            <p class="text-gray-600 mt-1">Track your orders and their status</p>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="statusFilter" class="form-input">
              <option value="">All Status</option>
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
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <ClockIcon class="w-5 h-5 text-warning-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Pending</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.pending }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CogIcon class="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Processing</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.processing }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon class="w-5 h-5 text-success-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Delivered</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.delivered }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon class="w-5 h-5 text-info-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Spent</p>
                <p class="text-2xl font-semibold text-gray-900">₱{{ stats.totalSpent.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">
            My Orders ({{ filteredOrders.length }})
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
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
                  <div class="text-sm text-gray-500">{{ formatDate(order.order_date) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img
                          v-if="order.product?.image_url && !imageErrors[order.id]"
                          :src="getImageUrl(order.product?.image_url)"
                          :alt="order.product?.name"
                          class="h-10 w-10 object-cover rounded"
                          @error="handleImageError(order.id)"
                          loading="lazy"
                        />
                        <div v-else class="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <CubeIcon class="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ order.product?.name }}</div>
                      <div class="text-sm text-gray-500">{{ order.product?.category }}</div>
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
                  <span :class="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col space-y-2">
                    <span :class="getPaymentStatusBadgeClass(order.payment_status)">
                      {{ order.payment_status }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ order.payment_method === 'bank' ? 'Bank Transfer' : order.payment_method === 'gcash' ? 'GCash' : order.payment_method === 'cash' ? 'Cash on Delivery' : order.payment_method?.toUpperCase() }}
                    </span>
                    <!-- Receipt Image Thumbnail for GCash and Bank -->
                    <div v-if="(order.payment_method === 'gcash' || order.payment_method === 'bank') && order.receipt_image" class="mt-1">
                      <img 
                        :src="getImageUrl(order.receipt_image)" 
                        :alt="order.payment_method === 'bank' ? 'Bank Receipt' : 'GCash Receipt'"
                        class="h-20 w-20 object-cover rounded border border-gray-300"
                        @click="viewReceiptImage(order.receipt_image)"
                        style="cursor: pointer;"
                      />
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getDeliveryStatusBadgeClass(order.delivery_status)">
                    {{ order.delivery_status?.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.order_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewOrder(order)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </button>
                    <button
                      v-if="order.status === 'pending'"
                      @click="cancelOrder(order.id)"
                      class="text-danger-600 hover:text-danger-900"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="card-footer">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
              {{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }} of 
              {{ filteredOrders.length }} results
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span class="text-sm text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      @click.self="selectedOrder = null"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[min(92vh,800px)] overflow-hidden flex flex-col ring-1 ring-slate-200/80"
      >
        <div
          class="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50/90 to-emerald-50/60"
        >
          <div>
            <h3 class="text-xl font-semibold text-slate-900">Order details</h3>
            <p class="text-sm text-slate-500 mt-0.5">#{{ selectedOrder.id }} · placed {{ formatDate(selectedOrder.order_date) }}</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white/90"
            aria-label="Close"
            @click="selectedOrder = null"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <span :class="getStatusBadgeClass(selectedOrder.status)">{{ selectedOrder.status }}</span>
            <span :class="getPaymentStatusBadgeClass(selectedOrder.payment_status)">{{ selectedOrder.payment_status }}</span>
            <span :class="getDeliveryStatusBadgeClass(selectedOrder.delivery_status)">{{
              selectedOrder.delivery_status?.replace(/_/g, ' ')
            }}</span>
            <span class="text-xs text-slate-500 px-2 py-1 rounded-md bg-slate-100">{{
              selectedOrder.payment_method?.toUpperCase()
            }}</span>
          </div>

          <!-- Payment Details Section -->
          <div 
            v-if="selectedOrder.payment_method === 'bank'"
            class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 ring-1 ring-blue-200"
          >
            <div class="flex items-center gap-2 text-blue-800 text-xs font-semibold uppercase tracking-wide mb-3">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
              </svg>
              Bank Transfer Payment
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-blue-600">Bank</dt>
                <dd class="font-semibold text-blue-900">PNB</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-blue-600">Account</dt>
                <dd class="font-mono font-semibold text-blue-900">402949769</dd>
              </div>
              <div v-if="selectedOrder.payment_reference" class="flex justify-between">
                <dt class="text-blue-600">Reference #</dt>
                <dd class="font-mono text-blue-900">{{ selectedOrder.payment_reference }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-blue-600">Status</dt>
                <dd :class="['font-semibold', selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600']">
                  {{ selectedOrder.payment_status?.toUpperCase() }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Alternative Payment Methods Display -->
          <div 
            v-else-if="selectedOrder.payment_method === 'gcash'"
            class="rounded-xl bg-gradient-to-br from-purple-50 to-purple-50/50 p-4 ring-1 ring-purple-200"
          >
            <div class="flex items-center gap-2 text-purple-800 text-xs font-semibold uppercase tracking-wide mb-3">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm0 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"></path>
              </svg>
              GCash Payment
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-purple-600">Payment Method</dt>
                <dd class="font-semibold text-purple-900">GCash</dd>
              </div>
              <div v-if="selectedOrder.payment_reference" class="flex justify-between">
                <dt class="text-purple-600">Reference #</dt>
                <dd class="font-mono text-purple-900">{{ selectedOrder.payment_reference }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-purple-600">Status</dt>
                <dd :class="['font-semibold', selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600']">
                  {{ selectedOrder.payment_status?.toUpperCase() }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Cash Payment Display -->
          <div 
            v-else-if="selectedOrder.payment_method === 'cash'"
            class="rounded-xl bg-gradient-to-br from-green-50 to-green-50/50 p-4 ring-1 ring-green-200"
          >
            <div class="flex items-center gap-2 text-green-800 text-xs font-semibold uppercase tracking-wide mb-3">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              Cash Payment
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-green-600">Payment Method</dt>
                <dd class="font-semibold text-green-900">Cash on Delivery</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-green-600">Status</dt>
                <dd :class="['font-semibold', selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600']">
                  {{ selectedOrder.payment_status?.toUpperCase() }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Delivery date</p>
              <p class="text-sm font-medium text-slate-900">
                {{ selectedOrder.delivery_date ? formatDate(selectedOrder.delivery_date) : 'To be scheduled' }}
              </p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total</p>
              <p class="text-lg font-semibold text-slate-900">₱{{ selectedOrder.total_price.toLocaleString() }}</p>
            </div>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
              <MapPinIcon class="w-4 h-4" />
              Delivery address
            </div>
            <p class="text-sm text-slate-900 whitespace-pre-wrap">{{ selectedOrder.delivery_address || '—' }}</p>
            <p v-if="selectedOrder.delivery_notes" class="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/80">
              {{ selectedOrder.delivery_notes }}
            </p>
            <p v-if="selectedOrder.purpose" class="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/80">
              <span class="font-semibold">Purpose:</span> {{ selectedOrder.purpose }}
            </p>
          </div>

          <div
            v-if="hasCourierInfo(selectedOrder)"
            class="rounded-xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100"
          >
            <div class="flex items-center gap-2 text-emerald-900 text-xs font-semibold uppercase tracking-wide mb-3">
              <TruckIcon class="w-4 h-4" />
              Your delivery team
            </div>
            <dl class="space-y-2 text-sm">
              <div v-if="selectedOrder.delivery_info?.delivery_person?.trim()" class="flex justify-between gap-4">
                <dt class="text-slate-500">Courier</dt>
                <dd class="font-medium text-slate-900 text-right">{{ selectedOrder.delivery_info?.delivery_person }}</dd>
              </div>
              <div v-if="selectedOrder.delivery_info?.delivery_vehicle?.trim()" class="flex justify-between gap-4">
                <dt class="text-slate-500">Vehicle</dt>
                <dd class="font-medium text-slate-900 text-right">{{ selectedOrder.delivery_info?.delivery_vehicle }}</dd>
              </div>
              <div v-if="selectedOrder.delivery_info?.fulfillment_notes?.trim()" class="pt-2 border-t border-emerald-100">
                <dt class="text-slate-500 text-xs mb-1">From vendor</dt>
                <dd class="text-slate-700 text-sm whitespace-pre-wrap">{{ selectedOrder.delivery_info?.fulfillment_notes }}</dd>
              </div>
            </dl>
          </div>
          <div
            v-else
            class="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500 text-center"
          >
            Courier details will appear here when your vendor assigns a delivery person.
          </div>

          <div class="rounded-xl border border-slate-200 p-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Product</h4>
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  v-if="selectedOrder.product?.image_url && !imageErrors[selectedOrder.id]"
                  :src="getImageUrl(selectedOrder.product?.image_url)"
                  :alt="selectedOrder.product?.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError(selectedOrder.id)"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <CubeIcon class="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-slate-900">{{ selectedOrder.product?.name }}</p>
                <p class="text-sm text-slate-500 line-clamp-2 mt-1">{{ selectedOrder.product?.description }}</p>
                <p class="text-sm text-slate-600 mt-2">
                  Qty {{ selectedOrder.quantity }} · Unit ₱{{ Number(selectedOrder.product?.price ?? 0).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Summary</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Subtotal</span>
                <span class="text-slate-900">₱{{ (Number(selectedOrder.product?.price) || 0) * selectedOrder.quantity }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Shipping</span>
                <span class="text-slate-900">₱0</span>
              </div>
              <div class="flex justify-between font-semibold border-t border-slate-200 pt-2 text-slate-900">
                <span>Total</span>
                <span>₱{{ selectedOrder.total_price.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.notes" class="rounded-xl bg-amber-50/50 p-4 ring-1 ring-amber-100/80">
            <h4 class="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1">Your notes</h4>
            <p class="text-sm text-slate-800">{{ selectedOrder.notes }}</p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Timeline</h4>
            <div class="space-y-0 border-l-2 border-emerald-200 ml-2 pl-4 py-1">
              <div class="relative pb-4">
                <span class="absolute -left-[calc(0.5rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p class="text-sm font-medium text-slate-900">Order placed</p>
                <p class="text-xs text-slate-500">{{ formatDate(selectedOrder.order_date) }}</p>
              </div>
              <div
                v-if="['confirmed', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status)"
                class="relative pb-4"
              >
                <span class="absolute -left-[calc(0.5rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p class="text-sm font-medium text-slate-900">Confirmed</p>
                <p class="text-xs text-slate-500">Vendor is processing your order</p>
              </div>
              <div v-if="['shipped', 'delivered'].includes(selectedOrder.status)" class="relative pb-4">
                <span class="absolute -left-[calc(0.5rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p class="text-sm font-medium text-slate-900">Shipped / out for delivery</p>
                <p class="text-xs text-slate-500">On the way to your address</p>
              </div>
              <div v-if="selectedOrder.status === 'delivered'" class="relative">
                <span class="absolute -left-[calc(0.5rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <p class="text-sm font-medium text-slate-900">Delivered</p>
                <p class="text-xs text-slate-500">
                  {{ selectedOrder.delivery_date ? formatDate(selectedOrder.delivery_date) : 'Completed' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button type="button" class="btn-primary" @click="selectedOrder = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import {
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CubeIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/vue/24/outline'
import { getImageUrl } from '@/utils/imageUtils'
import { DEMO_WASTE_TYPE_IMAGES } from '@/constants/demoMedia'
import type { Order } from '@/types'

const toast = useToast()
const authStore = useAuthStore()
const productsStore = useProductsStore()

// State
const orders = ref<Order[]>([])
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedOrder = ref<Order | null>(null)
const imageErrors = ref<Record<string, boolean>>({})

const stats = ref({
  pending: 0,
  processing: 0,
  delivered: 0,
  totalSpent: 0
})

// Computed
const filteredOrders = computed(() => {
  let filtered = orders.value

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage.value)
})

// Methods
const loadOrders = async () => {
  try {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, using fallback data')
      // Use empty fallback data
      orders.value = []
      
      // Calculate stats from fallback data
      stats.value = {
        pending: orders.value.filter(order => order.status === 'pending').length,
        processing: orders.value.filter(order => ['confirmed', 'processing', 'shipped'].includes(order.status)).length,
        delivered: orders.value.filter(order => order.status === 'delivered').length,
        totalSpent: orders.value.reduce((sum, order) => sum + order.total_price, 0)
      }
      return
    }
    
    // Debug: Check if user is authenticated
    console.log('Loading orders for user:', authStore.user)
    console.log('User ID:', authStore.user?.id)
    
    // Load orders from products store (fetches from API then filters)
    await productsStore.loadOrders()
    
    // Filter orders for current user (compare as string - API may return numeric ids)
    const currentUserId = authStore.user?.id != null ? String(authStore.user.id) : ''
    const userOrders = productsStore.orders.filter(order => String(order.user_id) === currentUserId)
    
    orders.value = userOrders
    
    // Calculate stats
    stats.value = {
      pending: userOrders.filter(order => order.status === 'pending').length,
      processing: userOrders.filter(order => ['confirmed', 'processing', 'shipped'].includes(order.status)).length,
      delivered: userOrders.filter(order => order.status === 'delivered').length,
      totalSpent: userOrders.reduce((sum, order) => sum + order.total_price, 0)
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
    // Fallback to mock data if needed
  orders.value = [
    {
      id: 'ORD-001',
      user_id: authStore.user?.id || '3',
      product_id: '1',
      quantity: 2,
      total_price: 300,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'gcash',
      payment_reference: '09123456789',
      delivery_status: 'pending',
      delivery_address: 'Residential Area, Butuan City',
      delivery_notes: 'Please deliver in the morning',
      order_date: '2024-12-15T10:30:00Z',
      notes: 'Please deliver in the morning',
      user: {
        id: authStore.user?.id || '3',
        email: authStore.user?.email || 'user@anihan.com',
        full_name: authStore.user?.full_name || 'Pedro Garcia',
        role: 'user',
        phone: authStore.user?.phone || '+63 912 345 6786',
        address: authStore.user?.address || 'Residential Area, Butuan City',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        is_active: true
      },
      product: {
        id: '1',
        name: 'Organic Banana Compost',
        description: 'Rich compost made from overripe bananas',
        price: 150,
        category: 'compost',
        image_url: DEMO_WASTE_TYPE_IMAGES.compost,
        stock_quantity: 25,
        unit: 'kg',
        is_available: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    }
  ]

  // Calculate stats from fallback data
  stats.value = {
    pending: orders.value.filter(order => order.status === 'pending').length,
    processing: orders.value.filter(order => ['confirmed', 'processing', 'shipped'].includes(order.status)).length,
    delivered: orders.value.filter(order => order.status === 'delivered').length,
    totalSpent: orders.value.reduce((sum, order) => sum + order.total_price, 0)
  }
  }
}

const viewOrder = (order: Order) => {
  selectedOrder.value = order
}

const cancelOrder = async (orderId: string) => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'cancelled'
    }
    
    toast.success('Order cancelled successfully')
    loadOrders() // Reload stats
  } catch (error) {
    toast.error('Failed to cancel order')
  }
}

const viewReceiptImage = (imagePath: string) => {
  // Open receipt image in a modal or new window
  window.open(getImageUrl(imagePath), '_blank')
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'badge-warning',
    confirmed: 'badge-primary',
    processing: 'badge-primary',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  }
  return classes[status as keyof typeof classes] || 'badge-gray'
}

const getPaymentStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'badge-warning',
    paid: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-info'
  }
  return classes[status as keyof typeof classes] || 'badge-gray'
}

const getDeliveryStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'badge-warning',
    assigned: 'badge-info',
    picked_up: 'badge-primary',
    in_transit: 'badge-secondary',
    delivered: 'badge-success',
    failed: 'badge-danger'
  }
  return classes[status as keyof typeof classes] || 'badge-gray'
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

const handleImageError = (orderId: string) => {
  imageErrors.value[orderId] = true
}

const hasCourierInfo = (o: Order) => {
  const d = o.delivery_info
  if (!d) return false
  return Boolean(
    d.delivery_person?.trim() || d.delivery_vehicle?.trim() || d.fulfillment_notes?.trim()
  )
}

onMounted(() => {
  loadOrders()
})
</script>
