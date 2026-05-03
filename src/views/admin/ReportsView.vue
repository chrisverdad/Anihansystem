<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p class="text-gray-600 mt-1">Comprehensive system reports and analytics</p>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="reportPeriod" class="form-input">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="btn-outline inline-flex items-center gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                @click="exportExcel"
              >
                <TableCellsIcon class="w-5 h-5 text-emerald-600 shrink-0" />
                Export Excel
              </button>
              <button type="button" class="btn-primary inline-flex items-center gap-2" @click="exportPdf">
                <DocumentTextIcon class="w-5 h-5 shrink-0 opacity-90" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="pageLoading" class="flex flex-col items-center justify-center py-24 text-gray-500">
        <div class="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading reports…</p>
      </div>

      <template v-else>
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <UsersIcon class="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Users</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.totalUsers }}</p>
                <p
                  class="text-xs"
                  :class="metrics.userGrowth >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.userGrowth >= 0 ? '+' : '' }}{{ metrics.userGrowth }}% new users vs prior period
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <CubeIcon class="w-5 h-5 text-success-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Waste Processed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.wasteProcessed }} kg</p>
                <p
                  class="text-xs"
                  :class="metrics.wasteGrowth >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.wasteGrowth >= 0 ? '+' : '' }}{{ metrics.wasteGrowth }}% processed kg vs prior period
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon class="w-5 h-5 text-warning-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Orders Completed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.ordersCompleted }}</p>
                <p
                  class="text-xs"
                  :class="metrics.orderGrowth >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.orderGrowth >= 0 ? '+' : '' }}{{ metrics.orderGrowth }}% completed vs prior period
                </p>
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
                <p class="text-sm font-medium text-gray-500">Revenue</p>
                <p class="text-2xl font-semibold text-gray-900">₱{{ metrics.revenue.toLocaleString() }}</p>
                <p
                  class="text-xs"
                  :class="metrics.revenueGrowth >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.revenueGrowth >= 0 ? '+' : '' }}{{ metrics.revenueGrowth }}% revenue vs prior period
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Waste Processing Trend -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Waste volume trend</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">
              Daily submitted vs processed quantity (kg)
            </p>
          </div>
          <div class="card-body">
            <div class="h-64">
              <canvas ref="wasteTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Revenue Trend -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Revenue trend</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">
              Delivered order totals by day (PHP)
            </p>
          </div>
          <div class="card-body">
            <div class="h-64">
              <canvas ref="revenueTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Daily submission counts & new registrations (merged from former Analytics page) -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Source submissions per day</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">Count of vendor source submissions (last {{ chartDaySpan() }} days)</p>
          </div>
          <div class="card-body">
            <div class="h-64">
              <canvas ref="submissionCountChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">New user registrations</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">Accounts created per day (last {{ chartDaySpan() }} days)</p>
          </div>
          <div class="card-body">
            <div class="h-64">
              <canvas ref="userRegistrationsChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Category mix by submission count & role distribution (legacy analytics widgets) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Top categories by submissions</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">In the selected reporting period</p>
          </div>
          <div class="card-body">
            <p v-if="topWasteTypesBySubmissions.length === 0" class="text-center py-8 text-gray-500 text-sm">
              No submissions in this period.
            </p>
            <div v-else class="space-y-4">
              <div
                v-for="(waste, index) in topWasteTypesBySubmissions"
                :key="waste.type"
                class="flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ waste.type }}</p>
                    <p class="text-xs text-gray-500">{{ waste.category }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ waste.count }}</p>
                  <p class="text-xs text-gray-500">submissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">User distribution by role</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">All registered accounts</p>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div
                v-for="role in roleDistribution"
                :key="role.type"
                class="flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <div :class="role.color" class="w-3 h-3 rounded-full" />
                  <span class="text-sm font-medium text-gray-900">{{ role.type }}</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ role.count }}</p>
                  <p class="text-xs text-gray-500">{{ role.percentage }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Statistics -->
      <div class="card mb-8">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">User Statistics</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UsersIcon class="w-8 h-8 text-primary-600" />
              </div>
              <h4 class="font-medium text-gray-900 mb-1">Total Users</h4>
              <p class="text-2xl font-bold text-primary-600">{{ userStats.totalUsers }}</p>
              <p class="text-sm text-gray-500">All registered users</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CubeIcon class="w-8 h-8 text-success-600" />
              </div>
              <h4 class="font-medium text-gray-900 mb-1">Vendors</h4>
              <p class="text-2xl font-bold text-success-600">{{ userStats.vendors }}</p>
              <p class="text-sm text-gray-500">Waste suppliers</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBagIcon class="w-8 h-8 text-warning-600" />
              </div>
              <h4 class="font-medium text-gray-900 mb-1">Customers</h4>
              <p class="text-2xl font-bold text-warning-600">{{ userStats.customers }}</p>
              <p class="text-sm text-gray-500">Product buyers</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon class="w-8 h-8 text-info-600" />
              </div>
              <h4 class="font-medium text-gray-900 mb-1">Active Users</h4>
              <p class="text-2xl font-bold text-info-600">{{ userStats.activeUsers }}</p>
              <p class="text-sm text-gray-500">{{ userStats.activePercentage }}% of total</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Reports -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Vendors -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Top Performing Vendors</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">In the selected reporting period</p>
          </div>
          <div class="card-body">
            <p v-if="topVendors.length === 0" class="text-center py-8 text-gray-500 text-sm">No vendor activity in this period.</p>
            <div v-else class="space-y-4">
              <div
                v-for="(vendor, index) in topVendors"
                :key="vendor.vendorKey"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ vendor.name }}</p>
                    <p class="text-sm text-gray-500">{{ vendor.submissions }} submissions</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ vendor.wasteProcessed }} kg</p>
                  <p class="text-sm text-gray-500">processed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Popular Products -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Most Popular Products</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">By delivered orders in this period</p>
          </div>
          <div class="card-body">
            <p v-if="popularProducts.length === 0" class="text-center py-8 text-gray-500 text-sm">No delivered orders in this period.</p>
            <div v-else class="space-y-4">
              <div
                v-for="(product, index) in popularProducts"
                :key="product.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-success-600">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ product.name }}</p>
                    <p class="text-sm text-gray-500">{{ product.category }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ product.orders }} orders</p>
                  <p class="text-sm text-gray-500">₱{{ product.revenue.toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform waste contribution (aligned with vendor reports) -->
      <div class="mt-8 space-y-6">
        <div
          class="rounded-2xl overflow-hidden border border-indigo-900/20 shadow-md bg-gradient-to-br from-indigo-950 via-violet-900 to-slate-900 text-white"
        >
          <div class="p-6 sm:p-8 grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div class="flex flex-col justify-center">
              <p class="text-violet-200/90 text-xs font-semibold uppercase tracking-wider">Platform waste contribution</p>
              <p class="text-4xl sm:text-5xl font-bold mt-3 tabular-nums">
                {{ metrics.wasteContributedKg }}
                <span class="text-lg sm:text-xl font-semibold text-violet-200/90">kg</span>
              </p>
              <p class="text-violet-100/85 mt-3 text-sm leading-relaxed max-w-lg">
                Total weight submitted by all vendors in this period. Processed volume and impact estimates use processed submissions only.
              </p>
              <div class="mt-6 flex flex-wrap gap-3 text-xs text-violet-200/80">
                <span class="rounded-full bg-white/10 px-3 py-1"
                  >Processed: <strong class="text-white">{{ metrics.wasteProcessed }} kg</strong></span
                >
                <span class="rounded-full bg-white/10 px-3 py-1"
                  >Submissions: <strong class="text-white">{{ metrics.submissionsInPeriod }}</strong></span
                >
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-violet-200 mb-4">Mix by category</p>
              <div v-if="platformWasteBreakdown.length === 0" class="text-sm text-violet-200/70 py-6">
                No category data for this period.
              </div>
              <ul v-else class="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                <li v-for="row in platformWasteBreakdown.slice(0, 10)" :key="row.id" class="space-y-1.5">
                  <div class="flex justify-between gap-3 text-xs sm:text-sm">
                    <span class="truncate text-violet-50 font-medium">{{ row.name }}</span>
                    <span class="text-violet-200/90 tabular-nums shrink-0">{{ row.pct }}% · {{ row.kg }} kg</span>
                  </div>
                  <div class="h-2 rounded-full bg-black/30 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-300 transition-all"
                      :style="{ width: Math.min(100, row.pct) + '%' }"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card border-t-4 border-t-indigo-500">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Platform impact estimate (processed)</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">Indicative only — same factors as vendor-facing reports.</p>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="rounded-xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col items-start gap-2">
                <div class="flex items-center gap-2 text-green-700">
                  <SparklesIcon class="w-6 h-6" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-green-800/80">Diverted</span>
                </div>
                <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ metrics.wasteProcessed }} kg</p>
                <p class="text-sm text-gray-500">Processed in period</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col items-start gap-2">
                <div class="flex items-center gap-2 text-blue-700">
                  <CloudIcon class="w-6 h-6" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-blue-800/80">CO₂ (est.)</span>
                </div>
                <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ metrics.co2SavedEst }} kg</p>
                <p class="text-sm text-gray-500">Rough footprint reduction</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col items-start gap-2">
                <div class="flex items-center gap-2 text-amber-700">
                  <LightBulbIcon class="w-6 h-6" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-amber-900/70">Energy (est.)</span>
                </div>
                <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ metrics.energySavedEst }} kWh</p>
                <p class="text-sm text-gray-500">Order-of-magnitude equivalent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="mt-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">System Health & Performance</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon class="w-8 h-8 text-success-600" />
                </div>
                <h4 class="font-medium text-gray-900 mb-1">System Uptime</h4>
                <p class="text-2xl font-bold text-success-600">99.9%</p>
                <p class="text-sm text-gray-500">Last 30 days</p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClockIcon class="w-8 h-8 text-primary-600" />
                </div>
                <h4 class="font-medium text-gray-900 mb-1">Avg Response Time</h4>
                <p class="text-2xl font-bold text-primary-600">245ms</p>
                <p class="text-sm text-gray-500">API calls</p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UsersIcon class="w-8 h-8 text-info-600" />
                </div>
                <h4 class="font-medium text-gray-900 mb-1">Active Users</h4>
                <p class="text-2xl font-bold text-info-600">{{ metrics.activeUsers }}</p>
                <p class="text-sm text-gray-500">Currently online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useUsersStore } from '@/stores/users'
import { useWasteStore } from '@/stores/waste'
import { useProductsStore } from '@/stores/products'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Filler
} from 'chart.js'
import type { Chart } from 'chart.js'
import {
  DocumentTextIcon,
  TableCellsIcon,
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  CloudIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'
import { downloadExcelReport, downloadPdfReport, type ReportBlock } from '@/utils/reportExport'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Filler
)

const toast = useToast()
const usersStore = useUsersStore()
const wasteStore = useWasteStore()
const productsStore = useProductsStore()

const wasteTrendChart = ref<HTMLCanvasElement>()
const revenueTrendChart = ref<HTMLCanvasElement>()
const submissionCountChart = ref<HTMLCanvasElement>()
const userRegistrationsChart = ref<HTMLCanvasElement>()

let wasteChartInstance: Chart | null = null
let revenueChartInstance: Chart | null = null
let submissionCountChartInstance: Chart | null = null
let userRegChartInstance: Chart | null = null

const reportPeriod = ref('30')
const pageLoading = ref(true)

const metrics = ref({
  totalUsers: 0,
  userGrowth: 0,
  wasteProcessed: 0,
  wasteGrowth: 0,
  ordersCompleted: 0,
  orderGrowth: 0,
  revenue: 0,
  revenueGrowth: 0,
  activeUsers: 0,
  wasteContributedKg: 0,
  submissionsInPeriod: 0,
  co2SavedEst: 0,
  energySavedEst: 0
})

const topVendors = ref<
  Array<{ vendorKey: string; name: string; submissions: number; wasteProcessed: number }>
>([])
const popularProducts = ref<Array<{ name: string; category: string; orders: number; revenue: number; id: string }>>([])

const platformWasteBreakdown = ref<{ id: string; name: string; kg: number; pct: number; submissions: number }[]>([])

const topWasteTypesBySubmissions = ref<Array<{ type: string; category: string; count: number }>>([])
const roleDistribution = ref<
  Array<{ type: string; count: number; percentage: string; color: string }>
>([])

const userStats = ref({
  totalUsers: 0,
  vendors: 0,
  customers: 0,
  activeUsers: 0,
  activePercentage: 0
})

function submissionQty(s: { quantity?: unknown }) {
  const n = Number(s.quantity)
  return Number.isFinite(n) ? n : 0
}

function orderPrice(o: { total_price?: unknown }) {
  const n = Number(o.total_price)
  return Number.isFinite(n) ? n : 0
}

function pctChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

const loadMetrics = async () => {
  pageLoading.value = true
  try {
    await Promise.all([
      usersStore.loadUsers(),
      wasteStore.loadSourceWasteSubmissions(),
      wasteStore.loadWasteCategories(),
      productsStore.loadProducts(),
      productsStore.loadOrders()
    ])

    const allUsers = usersStore.users
    const allSubmissions = wasteStore.sourceWasteSubmissions
    const allProducts = productsStore.products
    const allOrders = productsStore.orders

    const days = Math.max(1, Number(reportPeriod.value) || 30)
    const now = Date.now()
    const windowStart = now - days * 24 * 60 * 60 * 1000
    const prevStart = now - 2 * days * 24 * 60 * 60 * 1000
    const prevEnd = windowStart

    const subsInWindow = allSubmissions.filter(s => {
      const t = new Date(s.submitted_at || '').getTime()
      return Number.isFinite(t) && t >= windowStart && t <= now
    })
    const subsPrev = allSubmissions.filter(s => {
      const t = new Date(s.submitted_at || '').getTime()
      return Number.isFinite(t) && t >= prevStart && t < prevEnd
    })

    const processedInWindow = subsInWindow.filter(s => s.status === 'processed')
    const processedPrev = subsPrev.filter(s => s.status === 'processed')
    const wasteProcessed = processedInWindow.reduce((sum, s) => sum + submissionQty(s), 0)
    const wastePrev = processedPrev.reduce((sum, s) => sum + submissionQty(s), 0)

    const wasteContributedKg = subsInWindow.reduce((sum, s) => sum + submissionQty(s), 0)

    const deliveredInWindow = allOrders.filter(o => {
      const t = new Date(o.order_date).getTime()
      return Number.isFinite(t) && t >= windowStart && t <= now && o.status === 'delivered'
    })
    const deliveredPrev = allOrders.filter(o => {
      const t = new Date(o.order_date).getTime()
      return Number.isFinite(t) && t >= prevStart && t < prevEnd && o.status === 'delivered'
    })

    const revenueWindow = deliveredInWindow.reduce((sum, o) => sum + orderPrice(o), 0)
    const revenuePrev = deliveredPrev.reduce((sum, o) => sum + orderPrice(o), 0)

    const usersWindow = allUsers.filter(u => {
      const t = new Date(u.created_at).getTime()
      return Number.isFinite(t) && t >= windowStart && t <= now
    })
    const usersPrev = allUsers.filter(u => {
      const t = new Date(u.created_at).getTime()
      return Number.isFinite(t) && t >= prevStart && t < prevEnd
    })

    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter(u => u.is_active).length
    const vendors = allUsers.filter(u => u.role === 'vendor').length
    const regularUsers = allUsers.filter(u => u.role === 'user').length

    const co2SavedEst = Math.round(wasteProcessed * 0.2)
    const energySavedEst = Math.round(wasteProcessed * 0.4)

    metrics.value = {
      totalUsers,
      userGrowth: pctChange(usersWindow.length, usersPrev.length),
      wasteProcessed: Math.round(wasteProcessed * 10) / 10,
      wasteGrowth: pctChange(wasteProcessed, wastePrev),
      ordersCompleted: deliveredInWindow.length,
      orderGrowth: pctChange(deliveredInWindow.length, deliveredPrev.length),
      revenue: revenueWindow,
      revenueGrowth: pctChange(revenueWindow, revenuePrev),
      activeUsers,
      wasteContributedKg: Math.round(wasteContributedKg * 10) / 10,
      submissionsInPeriod: subsInWindow.length,
      co2SavedEst,
      energySavedEst
    }

    userStats.value = {
      totalUsers,
      vendors,
      customers: regularUsers,
      activeUsers,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    }

    const catById = new Map(wasteStore.wasteCategories.map(c => [String(c.id), c]))
    const byCat: Record<string, { name: string; kg: number; submissions: number }> = {}
    subsInWindow.forEach(sub => {
      let cid = String(sub.category_id ?? '')
      if (!cid && sub.category && typeof sub.category === 'object' && sub.category !== null && 'id' in sub.category) {
        cid = String((sub.category as { id?: string }).id ?? '')
      }
      if (!cid) cid = '_uncat'
      const cat = catById.get(cid)
      const embedded = sub.category && typeof sub.category === 'object' && sub.category !== null && 'name' in sub.category
      const name = cat?.name || (embedded ? String((sub.category as { name: string }).name) : 'Unknown')
      if (!byCat[cid]) byCat[cid] = { name, kg: 0, submissions: 0 }
      byCat[cid].submissions++
      byCat[cid].kg += submissionQty(sub)
    })
    const totalMix = Object.values(byCat).reduce((s, x) => s + x.kg, 0)
    platformWasteBreakdown.value = Object.entries(byCat)
      .map(([id, row]) => ({
        id,
        name: row.name,
        kg: Math.round(row.kg * 10) / 10,
        submissions: row.submissions,
        pct: totalMix > 0 ? Math.round((row.kg / totalMix) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.kg - a.kg)

    const wasteTypeSubCount: Record<string, number> = {}
    subsInWindow.forEach(sub => {
      let cid = String(sub.category_id ?? '')
      if (!cid && sub.category && typeof sub.category === 'object' && sub.category !== null && 'id' in sub.category) {
        cid = String((sub.category as { id?: string }).id ?? '')
      }
      const cat = catById.get(cid)
      const embedded =
        sub.category && typeof sub.category === 'object' && sub.category !== null && 'name' in sub.category
      const name = cat?.name || (embedded ? String((sub.category as { name: string }).name) : 'Unknown')
      wasteTypeSubCount[name] = (wasteTypeSubCount[name] || 0) + 1
    })
    topWasteTypesBySubmissions.value = Object.entries(wasteTypeSubCount)
      .map(([type, count]) => ({ type, category: type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const roleCountMap: Record<string, number> = {}
    allUsers.forEach(u => {
      roleCountMap[u.role] = (roleCountMap[u.role] || 0) + 1
    })
    roleDistribution.value = Object.entries(roleCountMap).map(([role, count]) => ({
      type: role.charAt(0).toUpperCase() + role.slice(1) + 's',
      count,
      percentage: totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : '0',
      color:
        role === 'admin' ? 'bg-danger-500' : role === 'vendor' ? 'bg-primary-500' : 'bg-success-500'
    }))

    const vendorStats: Record<string, { name: string; submissions: number; wasteProcessed: number }> = {}
    subsInWindow.forEach(sub => {
      const vid = String(
        sub.vendor_id ??
          (typeof sub.vendor === 'object' && sub.vendor && 'id' in sub.vendor
            ? (sub.vendor as { id?: string }).id
            : '') ??
          ''
      )
      if (!vid) return
      if (!vendorStats[vid]) {
        const vendor = allUsers.find(u => String(u.id) === vid)
        vendorStats[vid] = {
          name: vendor?.full_name || 'Unknown Vendor',
          submissions: 0,
          wasteProcessed: 0
        }
      }
      vendorStats[vid].submissions++
      if (sub.status === 'processed') vendorStats[vid].wasteProcessed += submissionQty(sub)
    })

    topVendors.value = Object.entries(vendorStats)
      .map(([vendorKey, data]) => ({
        vendorKey,
        name: data.name,
        submissions: data.submissions,
        wasteProcessed: Math.round(data.wasteProcessed * 10) / 10
      }))
      .sort((a, b) => b.wasteProcessed - a.wasteProcessed)
      .slice(0, 5)

    const productStats: Record<string, { name: string; category: string; orders: number; revenue: number }> = {}
    deliveredInWindow.forEach(order => {
      const product = order.product || allProducts.find(p => String(p.id) === String(order.product_id))
      if (!product) return
      const pid = String(product.id)
      const rawCat = (product as { category?: string }).category || 'general'
      const category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1)
      if (!productStats[pid]) {
        productStats[pid] = { name: product.name, category, orders: 0, revenue: 0 }
      }
      productStats[pid].orders++
      productStats[pid].revenue += orderPrice(order)
    })

    popularProducts.value = Object.entries(productStats)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  } catch (error: unknown) {
    console.error('Failed to load metrics:', error)
    toast.error('Failed to load report data')
  } finally {
    pageLoading.value = false
  }
}

function buildAdminExportBlocks(): ReportBlock[] {
  const periodLabel = `Last ${reportPeriod.value} days`
  return [
    {
      title: 'Summary',
      head: ['Metric', 'Value'],
      body: [
        ['Period', periodLabel],
        ['Total users (all time)', metrics.value.totalUsers],
        ['New users vs prior window', metrics.value.userGrowth + '%'],
        ['Waste processed kg (period)', metrics.value.wasteProcessed],
        ['Waste growth vs prior', metrics.value.wasteGrowth + '%'],
        ['Contributed kg (all subs)', metrics.value.wasteContributedKg],
        ['Submissions in period', metrics.value.submissionsInPeriod],
        ['Orders completed (delivered)', metrics.value.ordersCompleted],
        ['Revenue PHP (delivered)', metrics.value.revenue],
        ['CO2 est kg', metrics.value.co2SavedEst],
        ['Energy est kWh', metrics.value.energySavedEst]
      ]
    },
    {
      title: 'Top vendors',
      head: ['Vendor', 'Submissions', 'Processed kg'],
      body: topVendors.value.map(v => [v.name, v.submissions, v.wasteProcessed])
    },
    {
      title: 'Category mix',
      head: ['Category', 'Kg', 'Share %', 'Submissions'],
      body: platformWasteBreakdown.value.map(r => [r.name, r.kg, r.pct, r.submissions])
    },
    {
      title: 'Popular products',
      head: ['Product', 'Category', 'Orders', 'Revenue PHP'],
      body: popularProducts.value.map(p => [p.name, p.category, p.orders, p.revenue])
    }
  ]
}

const exportExcel = () => {
  downloadExcelReport(`admin-report-${reportPeriod.value}d.xlsx`, buildAdminExportBlocks())
  toast.success('Excel file downloaded')
}

const exportPdf = () => {
  downloadPdfReport(
    'Admin — Reports & analytics',
    `admin-report-${reportPeriod.value}d.pdf`,
    buildAdminExportBlocks()
  )
  toast.success('PDF downloaded')
}

function chartDaySpan(): number {
  const days = Math.max(1, Number(reportPeriod.value) || 30)
  return Math.min(days, 35)
}

const createWasteTrendChart = () => {
  if (!wasteTrendChart.value) return
  const ctx = wasteTrendChart.value.getContext('2d')
  if (!ctx) return

  wasteChartInstance?.destroy()
  wasteChartInstance = null

  const span = chartDaySpan()
  const labels: string[] = []
  const processedKg: number[] = []
  const submittedKg: number[] = []

  for (let i = span - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayAll = wasteStore.sourceWasteSubmissions.filter(sub => {
      const subDate = new Date(sub.submitted_at || '')
      return subDate >= dayStart && subDate <= dayEnd
    })
    submittedKg.push(dayAll.reduce((sum, sub) => sum + submissionQty(sub), 0))

    const dayProcessed = dayAll.filter(sub => sub.status === 'processed')
    processedKg.push(dayProcessed.reduce((sum, sub) => sum + submissionQty(sub), 0))
  }

  const h = wasteTrendChart.value.height || 256
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.4)')
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.02)')

  wasteChartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Processed (kg)',
          data: processedKg,
          borderColor: 'rgba(5, 150, 105, 1)',
          backgroundColor: grad,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          order: 2
        },
        {
          label: 'Submitted (kg)',
          data: submittedKg,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 2,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Quantity (kg)' }
        }
      }
    }
  })
}

const createRevenueTrendChart = () => {
  if (!revenueTrendChart.value) return
  const ctx = revenueTrendChart.value.getContext('2d')
  if (!ctx) return

  revenueChartInstance?.destroy()
  revenueChartInstance = null

  const span = chartDaySpan()
  const labels: string[] = []
  const revenueData: number[] = []

  for (let i = span - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayOrders = productsStore.orders.filter(order => {
      const orderDate = new Date(order.order_date)
      return orderDate >= dayStart && orderDate <= dayEnd && order.status === 'delivered'
    })

    revenueData.push(dayOrders.reduce((sum, order) => sum + orderPrice(order), 0))
  }

  const rh = revenueTrendChart.value.height || 256
  const revGrad = ctx.createLinearGradient(0, 0, 0, rh)
  revGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)')
  revGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)')

  revenueChartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue (₱)',
          data: revenueData,
          borderColor: 'rgba(5, 150, 105, 1)',
          backgroundColor: revGrad,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = ctx.parsed.y
              if (v == null) return ''
              return `₱${Number(v).toLocaleString()}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Revenue (₱)' }
        }
      }
    }
  })
}

const createSubmissionCountChart = () => {
  if (!submissionCountChart.value) return
  const ctx = submissionCountChart.value.getContext('2d')
  if (!ctx) return

  submissionCountChartInstance?.destroy()
  submissionCountChartInstance = null

  const span = chartDaySpan()
  const labels: string[] = []
  const counts: number[] = []

  for (let i = span - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const n = wasteStore.sourceWasteSubmissions.filter(sub => {
      const subDate = new Date(sub.submitted_at || '')
      return subDate >= dayStart && subDate <= dayEnd
    }).length
    counts.push(n)
  }

  submissionCountChartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Submissions',
          data: counts,
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Count' }
        }
      }
    }
  })
}

const createUserRegistrationsChart = () => {
  if (!userRegistrationsChart.value) return
  const ctx = userRegistrationsChart.value.getContext('2d')
  if (!ctx) return

  userRegChartInstance?.destroy()
  userRegChartInstance = null

  const span = chartDaySpan()
  const labels: string[] = []
  const regCounts: number[] = []

  for (let i = span - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const n = usersStore.users.filter(u => {
      const regDate = new Date(u.created_at)
      return regDate >= dayStart && regDate <= dayEnd
    }).length
    regCounts.push(n)
  }

  userRegChartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Registrations',
          data: regCounts,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'New accounts' }
        }
      }
    }
  })
}

async function refreshCharts() {
  await nextTick()
  createWasteTrendChart()
  createRevenueTrendChart()
  createSubmissionCountChart()
  createUserRegistrationsChart()
}

onMounted(async () => {
  await loadMetrics()
  await refreshCharts()
})

watch(reportPeriod, async () => {
  await loadMetrics()
  await refreshCharts()
})
</script>
