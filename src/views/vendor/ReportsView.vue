<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">My Reports</h1>
            <p class="text-gray-600 mt-1">Track your performance and waste contribution</p>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="reportPeriod" class="form-input">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 sm:px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm hover:bg-emerald-100 hover:border-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                :disabled="pageLoading"
                @click="exportExcel"
              >
                <TableCellsIcon class="w-5 h-5 text-emerald-600 shrink-0" />
                Excel
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2 text-sm font-semibold text-red-800 shadow-sm hover:bg-red-100 hover:border-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                :disabled="pageLoading"
                @click="exportPdf"
              >
                <DocumentTextIcon class="w-5 h-5 text-red-600 shrink-0" />
                PDF
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
        <p>Loading report data…</p>
      </div>

      <template v-else>
      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CubeIcon class="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Submissions</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.totalSubmissions }}</p>
                <p
                  class="text-xs"
                  :class="metrics.submissionGrowth >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.submissionGrowth >= 0 ? '+' : '' }}{{ metrics.submissionGrowth }}% from prior period
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
                  <CheckCircleIcon class="w-5 h-5 text-success-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Waste Processed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.wasteProcessed }} kg</p>
                <p
                  class="text-xs"
                  :class="metrics.wasteGrowth >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.wasteGrowth >= 0 ? '+' : '' }}{{ metrics.wasteGrowth }}% from prior period
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
                  <ClockIcon class="w-5 h-5 text-warning-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Avg Processing Time</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.avgProcessingTime }}h</p>
                <p
                  class="text-xs"
                  :class="metrics.timeImprovement >= 0 ? 'text-success-600' : 'text-amber-600'"
                >
                  {{ metrics.timeImprovement >= 0 ? '−' : '+' }}{{ Math.abs(metrics.timeImprovement) }}% vs prior period (avg hours)
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
                  <ChartBarIcon class="w-5 h-5 text-info-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Completion rate</p>
                <p class="text-2xl font-semibold text-gray-900">{{ metrics.completionRate }}%</p>
                <p class="text-xs text-success-600">Processed ÷ total submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Activity trend</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">
              Day-by-day submitted quantity (kg) for the selected period
            </p>
          </div>
          <div class="card-body">
            <div class="h-64">
              <canvas ref="submissionTrendChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Category mix</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">
              Share of your submitted quantity by waste category
            </p>
          </div>
          <div class="card-body">
            <div v-if="wasteContributionBreakdown.length === 0" class="h-64 flex items-center justify-center text-gray-500 text-sm">
              No category data for this period yet.
            </div>
            <div v-else class="h-64">
              <canvas ref="categoryMixChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Reports -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Waste Types -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Most Submitted Waste Types</h3>
          </div>
          <div class="card-body">
            <div v-if="topWasteTypes.length === 0" class="text-center py-8 text-gray-500 text-sm">
              No waste-type breakdown for this period yet.
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="(wasteType, index) in topWasteTypes"
                :key="String(wasteType.id)"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ wasteType.name }}</p>
                    <p class="text-sm text-gray-500">{{ wasteType.category }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ wasteType.submissions }} submissions</p>
                  <p class="text-sm text-gray-500">{{ wasteType.totalQuantity }} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Performance -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Monthly Performance</h3>
          </div>
          <div class="card-body">
            <div v-if="monthlyPerformance.length === 0" class="text-center py-8 text-gray-500 text-sm">
              No monthly activity for this period yet.
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="month in monthlyPerformance"
                :key="month.monthKey"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ month.month }}</p>
                  <p class="text-sm text-gray-500">{{ month.submissions }} submissions</p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ month.wasteProcessed }} kg</p>
                  <p class="text-sm text-gray-500">processed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Waste contribution (distinct from headline KPIs): total submitted mix + impact from processed -->
      <div class="mt-8 space-y-6">
        <div
          class="rounded-2xl overflow-hidden border border-emerald-900/20 shadow-md bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white"
        >
          <div class="p-6 sm:p-8 grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div class="flex flex-col justify-center">
              <p class="text-emerald-300/90 text-xs font-semibold uppercase tracking-wider">Waste contribution</p>
              <p class="text-4xl sm:text-5xl font-bold mt-3 tabular-nums">
                {{ totalContributedKg }}
                <span class="text-lg sm:text-xl font-semibold text-emerald-200/90">kg</span>
              </p>
              <p class="text-emerald-100/85 mt-3 text-sm leading-relaxed max-w-md">
                Total weight you submitted in this period (all statuses). Category mix shows where your contributions concentrate.
              </p>
              <div class="mt-6 flex flex-wrap gap-3 text-xs text-emerald-200/80">
                <span class="rounded-full bg-white/10 px-3 py-1">Processed in period: <strong class="text-white">{{ metrics.wasteProcessed }} kg</strong></span>
                <span class="rounded-full bg-white/10 px-3 py-1">Submissions: <strong class="text-white">{{ metrics.totalSubmissions }}</strong></span>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-emerald-200 mb-4">Contribution mix by category</p>
              <div v-if="wasteContributionBreakdown.length === 0" class="text-sm text-emerald-200/70 py-6">
                No category data for this period yet.
              </div>
              <ul v-else class="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                <li v-for="row in wasteContributionBreakdown.slice(0, 10)" :key="row.id" class="space-y-1.5">
                  <div class="flex justify-between gap-3 text-xs sm:text-sm">
                    <span class="truncate text-emerald-50 font-medium">{{ row.name }}</span>
                    <span class="text-emerald-200/90 tabular-nums shrink-0">{{ row.pct }}% · {{ row.kg }} kg</span>
                  </div>
                  <div class="h-2 rounded-full bg-black/30 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all"
                      :style="{ width: Math.min(100, row.pct) + '%' }"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card border-t-4 border-t-primary-500">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Impact estimate (processed waste)</h3>
            <p class="text-sm text-gray-500 font-normal mt-1">
              Indicative equivalents from diverted / processed quantity only — not a certified carbon audit.
            </p>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="rounded-xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col items-start gap-2"
              >
                <div class="flex items-center gap-2 text-green-700">
                  <SparklesIcon class="w-6 h-6" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-green-800/80">Diverted</span>
                </div>
                <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ metrics.wasteProcessed }} kg</p>
                <p class="text-sm text-gray-500">Not sent to landfill (processed)</p>
              </div>
              <div
                class="rounded-xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col items-start gap-2"
              >
                <div class="flex items-center gap-2 text-blue-700">
                  <CloudIcon class="w-6 h-6" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-blue-800/80">CO₂ (est.)</span>
                </div>
                <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ metrics.co2Saved }} kg</p>
                <p class="text-sm text-gray-500">Rough footprint reduction</p>
              </div>
              <div
                class="rounded-xl border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-5 flex flex-col items-start gap-2"
              >
                <div class="flex items-center gap-2 text-amber-700">
                  <LightBulbIcon class="w-6 h-6" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-amber-900/70">Energy (est.)</span>
                </div>
                <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ metrics.energySaved }} kWh</p>
                <p class="text-sm text-gray-500">Order-of-magnitude equivalent</p>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useWasteStore } from '@/stores/waste'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  ArcElement,
  DoughnutController,
  Filler
} from 'chart.js'
import type { Chart } from 'chart.js'
import {
  DocumentTextIcon,
  TableCellsIcon,
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  CloudIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'
import { downloadExcelReport, downloadPdfReport, type ReportBlock } from '@/utils/reportExport'

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  ArcElement,
  DoughnutController,
  Filler
)

const toast = useToast()
const authStore = useAuthStore()
const wasteStore = useWasteStore()

// State
const reportPeriod = ref('30')
const pageLoading = ref(true)

const metrics = ref({
  totalSubmissions: 0,
  submissionGrowth: 0,
  wasteProcessed: 0,
  wasteGrowth: 0,
  avgProcessingTime: 0,
  timeImprovement: 0,
  completionRate: 0,
  co2Saved: 0,
  energySaved: 0
})

const topWasteTypes = ref<any[]>([])
const monthlyPerformance = ref<any[]>([])
const totalContributedKg = ref(0)
const wasteContributionBreakdown = ref<
  { id: string; name: string; kg: number; pct: number; submissions: number }[]
>([])

const submissionTrendChart = ref<HTMLCanvasElement>()
const categoryMixChart = ref<HTMLCanvasElement>()
let submissionTrendInstance: Chart | null = null
let categoryMixInstance: Chart | null = null

function vendorOwnsSubmission(sub: { vendor_id?: string; vendor?: { id?: string | number } }) {
  const uid = authStore.user?.id
  if (uid == null || uid === '') return false
  const u = String(uid)
  return String(sub.vendor_id ?? '') === u || String(sub.vendor?.id ?? '') === u
}

// All submissions for this vendor (not period-filtered; period applied in loadMetrics)
const userSubmissions = computed(() => {
  if (!authStore.user?.id) return []
  return wasteStore.sourceWasteSubmissions.filter(vendorOwnsSubmission)
})

function submissionQuantity(sub: { quantity?: unknown }) {
  const n = Number(sub.quantity)
  return Number.isFinite(n) ? n : 0
}

function submittedAtMs(sub: { submitted_at?: string }) {
  const t = sub.submitted_at ? new Date(sub.submitted_at).getTime() : NaN
  return Number.isFinite(t) ? t : NaN
}

function filterByPeriodDays(submissions: typeof userSubmissions.value, days: number) {
  const now = Date.now()
  const start = now - days * 24 * 60 * 60 * 1000
  return submissions.filter(sub => {
    const ms = submittedAtMs(sub)
    return Number.isFinite(ms) && ms >= start && ms <= now
  })
}

function pctChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

// Methods
const loadMetrics = async () => {
  pageLoading.value = true
  try {
    await Promise.all([
      wasteStore.loadSourceWasteSubmissions(),
      wasteStore.loadInventoryItems(),
      wasteStore.loadWasteCategories()
    ])

    const days = Math.max(1, Number(reportPeriod.value) || 30)
    const allMine = userSubmissions.value
    const submissions = filterByPeriodDays(allMine, days)

    const prevStart = Date.now() - 2 * days * 24 * 60 * 60 * 1000
    const prevEnd = Date.now() - days * 24 * 60 * 60 * 1000
    const prevPeriodSubs = allMine.filter(sub => {
      const ms = submittedAtMs(sub)
      return Number.isFinite(ms) && ms >= prevStart && ms < prevEnd
    })

    const processed = submissions.filter(sub => sub.status === 'processed')
    const totalWasteProcessed = processed.reduce((sum, sub) => sum + submissionQuantity(sub), 0)

    const prevProcessed = prevPeriodSubs.filter(sub => sub.status === 'processed')
    const prevWaste = prevProcessed.reduce((sum, sub) => sum + submissionQuantity(sub), 0)

    const completionRate =
      submissions.length > 0 ? (processed.length / submissions.length) * 100 : 0

    const avgProcessingTime =
      processed.length > 0
        ? processed.reduce((sum, sub) => {
            const submitted = new Date(sub.submitted_at || '')
            const processedDate = new Date(sub.processed_at || sub.submitted_at || '')
            const dh =
              (processedDate.getTime() - submitted.getTime()) / (1000 * 60 * 60)
            return sum + (Number.isFinite(dh) && dh >= 0 ? dh : 0)
          }, 0) / processed.length
        : 0

    const prevAvg =
      prevProcessed.length > 0
        ? prevProcessed.reduce((sum, sub) => {
            const submitted = new Date(sub.submitted_at || '')
            const processedDate = new Date(sub.processed_at || sub.submitted_at || '')
            const dh =
              (processedDate.getTime() - submitted.getTime()) / (1000 * 60 * 60)
            return sum + (Number.isFinite(dh) && dh >= 0 ? dh : 0)
          }, 0) / prevProcessed.length
        : 0

    const co2Saved = totalWasteProcessed * 0.2
    const energySaved = totalWasteProcessed * 0.4

    metrics.value = {
      totalSubmissions: submissions.length,
      submissionGrowth: pctChange(submissions.length, prevPeriodSubs.length),
      wasteProcessed: Math.round(totalWasteProcessed * 10) / 10,
      wasteGrowth: pctChange(totalWasteProcessed, prevWaste),
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      timeImprovement:
        prevAvg > 0 ? Math.round(((prevAvg - avgProcessingTime) / prevAvg) * 1000) / 10 : 0,
      completionRate: Math.round(completionRate * 10) / 10,
      co2Saved: Math.round(co2Saved),
      energySaved: Math.round(energySaved)
    }

    const catById = new Map(
      wasteStore.wasteCategories.map(c => [String(c.id), c])
    )

    const wasteTypeStats: Record<string, any> = {}
    submissions.forEach(sub => {
      const rawId = sub.category_id
      const categoryId = rawId != null && rawId !== '' ? String(rawId) : '_uncat'
      const cat = catById.get(categoryId) || sub.category
      const catName =
        (cat && typeof cat === 'object' && 'name' in cat && (cat as { name?: string }).name) ||
        sub.title ||
        'Unknown'

      if (!wasteTypeStats[categoryId]) {
        wasteTypeStats[categoryId] = {
          id: categoryId,
          name: catName,
          category: typeof cat === 'object' && cat && 'name' in cat ? (cat as { name: string }).name : 'Waste',
          submissions: 0,
          totalQuantity: 0
        }
      }
      wasteTypeStats[categoryId].submissions++
      wasteTypeStats[categoryId].totalQuantity += submissionQuantity(sub)
    })

    topWasteTypes.value = Object.values(wasteTypeStats)
      .sort((a: any, b: any) => b.submissions - a.submissions)
      .slice(0, 5)

    const totalContribKg = submissions.reduce((sum, sub) => sum + submissionQuantity(sub), 0)
    totalContributedKg.value = Math.round(totalContribKg * 10) / 10
    wasteContributionBreakdown.value = Object.values(wasteTypeStats)
      .map((row: any) => ({
        id: String(row.id),
        name: row.name,
        submissions: row.submissions,
        kg: Math.round(row.totalQuantity * 10) / 10,
        pct: totalContribKg > 0 ? Math.round((row.totalQuantity / totalContribKg) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.kg - a.kg)

    const monthlyStats: Record<string, any> = {}
    submissions.forEach(sub => {
      const date = new Date(sub.submitted_at || '')
      if (Number.isNaN(date.getTime())) return
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          monthKey,
          month: monthName,
          submissions: 0,
          wasteProcessed: 0
        }
      }
      monthlyStats[monthKey].submissions++
      if (sub.status === 'processed') {
        monthlyStats[monthKey].wasteProcessed += submissionQuantity(sub)
      }
    })

    monthlyPerformance.value = Object.values(monthlyStats)
      .sort((a: any, b: any) => String(b.monthKey).localeCompare(String(a.monthKey)))
      .slice(0, 6)
  } catch (error) {
    console.error('Failed to load metrics:', error)
    toast.error('Failed to load report data')
  } finally {
    pageLoading.value = false
  }
}

function buildVendorExportBlocks(): ReportBlock[] {
  const periodLabel = `Last ${reportPeriod.value} days`
  const vendorName = authStore.user?.full_name || authStore.user?.email || '—'
  return [
    {
      title: 'Summary',
      head: ['Metric', 'Value'],
      body: [
        ['Period', periodLabel],
        ['Vendor', vendorName],
        ['Total submissions', metrics.value.totalSubmissions],
        ['Total contributed (kg)', totalContributedKg.value],
        ['Waste processed (kg)', metrics.value.wasteProcessed],
        ['Completion rate (%)', metrics.value.completionRate],
        ['Avg processing time (h)', metrics.value.avgProcessingTime],
        ['CO2 saved (kg est.)', metrics.value.co2Saved],
        ['Energy saved (kWh est.)', metrics.value.energySaved]
      ]
    },
    {
      title: 'Contribution by type',
      head: ['Waste type', 'Submissions', 'Quantity kg', 'Share %'],
      body: wasteContributionBreakdown.value.map(r => [r.name, r.submissions, r.kg, r.pct])
    },
    {
      title: 'Monthly',
      head: ['Month', 'Submissions', 'Processed kg'],
      body: monthlyPerformance.value.map(m => [
        m.month,
        m.submissions,
        Math.round(m.wasteProcessed * 10) / 10
      ])
    }
  ]
}

const exportExcel = () => {
  downloadExcelReport(`vendor-report-${reportPeriod.value}d.xlsx`, buildVendorExportBlocks())
  toast.success('Excel file downloaded')
}

const exportPdf = () => {
  downloadPdfReport(
    'Vendor waste report',
    `vendor-report-${reportPeriod.value}d.pdf`,
    buildVendorExportBlocks()
  )
  toast.success('PDF downloaded')
}

function chartDaySpan(): number {
  const days = Math.max(1, Number(reportPeriod.value) || 30)
  return Math.min(days, 35)
}

const createSubmissionTrendChart = () => {
  if (!submissionTrendChart.value) return
  const ctx = submissionTrendChart.value.getContext('2d')
  if (!ctx) return

  submissionTrendInstance?.destroy()
  submissionTrendInstance = null

  const span = chartDaySpan()
  const labels: string[] = []
  const kgPerDay: number[] = []

  for (let i = span - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayTotal = userSubmissions.value
      .filter(sub => {
        const ms = submittedAtMs(sub)
        if (!Number.isFinite(ms)) return false
        const d = new Date(ms)
        return d >= dayStart && d <= dayEnd
      })
      .reduce((sum, sub) => sum + submissionQuantity(sub), 0)
    kgPerDay.push(Math.round(dayTotal * 10) / 10)
  }

  const h = submissionTrendChart.value.height || 256
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)')
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)')

  submissionTrendInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Submitted (kg)',
          data: kgPerDay,
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: gradient,
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
            label(c) {
              const v = c.parsed.y
              return v == null ? '' : `${v} kg`
            }
          }
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

const createCategoryMixChart = () => {
  if (!categoryMixChart.value || wasteContributionBreakdown.value.length === 0) return
  const ctx = categoryMixChart.value.getContext('2d')
  if (!ctx) return

  categoryMixInstance?.destroy()
  categoryMixInstance = null

  const labels = wasteContributionBreakdown.value.map(r => r.name)
  const data = wasteContributionBreakdown.value.map(r => r.kg)
  const palette = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16']
  const catById = new Map(wasteStore.wasteCategories.map(c => [String(c.id), c]))

  const bg = wasteContributionBreakdown.value.map((row, i) => {
    const c = catById.get(row.id) as { color?: string } | undefined
    const col = c?.color
    if (typeof col === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(col)) return col
    return palette[i % palette.length]
  })

  categoryMixInstance = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = Number(ctx.raw)
              const pct = wasteContributionBreakdown.value[ctx.dataIndex]?.pct
              return `${ctx.label}: ${v} kg (${pct ?? 0}%)`
            }
          }
        }
      }
    }
  })
}

async function refreshCharts() {
  await nextTick()
  createSubmissionTrendChart()
  createCategoryMixChart()
}

watch(reportPeriod, async () => {
  await loadMetrics()
  await refreshCharts()
})

onMounted(async () => {
  authStore.initializeAuth()
  await loadMetrics()
  await refreshCharts()
})

onBeforeUnmount(() => {
  submissionTrendInstance?.destroy()
  submissionTrendInstance = null
  categoryMixInstance?.destroy()
  categoryMixInstance = null
})
</script>
