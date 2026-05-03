<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Waste Management</h1>
            <p class="text-gray-600 mt-1">
              Vendor source submissions appear automatically as catalog products and inventory. Delete a row to remove it everywhere.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CubeIcon class="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total submissions</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <p class="text-sm text-gray-600">
              Each submission is recorded as submitted and mirrored to the product catalog and the vendor’s inventory. Use Delete to remove a submission and its linked product and inventory rows.
            </p>
          </div>
        </div>
      </div>

      <!-- Waste Submissions Table -->
      <div class="card">
        <div class="card-header">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Waste Submissions ({{ filteredSubmissions.length }})
            </h3>
            <div class="relative w-full sm:w-72">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search submissions..."
                class="form-input pl-10 w-full"
              />
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="submission in paginatedSubmissions" :key="submission.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          v-if="submission.image_url"
                          :src="getImageUrl(submission.image_url)"
                          :alt="submission.title"
                          class="h-10 w-10 object-cover rounded-lg"
                          @error="handleImageError(submission.id)"
                        />
                        <div v-else class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <CubeIcon class="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ submission.title || 'Waste Submission' }}</div>
                      <div class="text-sm text-gray-500">{{ submission.category?.name || submission.description || 'No description' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ vendorDisplayName(submission) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ submission.vendor?.email || 'Unknown Email' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ submission.quantity }} {{ submission.unit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(submission.submitted_at || '') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      @click="viewSubmission(submission)"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      <EyeIcon class="w-4 h-4 text-violet-600" />
                      View
                    </button>
                    <button
                      type="button"
                      @click="deleteSubmission(submission)"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 hover:border-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <TrashIcon class="w-4 h-4" />
                      Delete
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
              {{ Math.min(currentPage * itemsPerPage, filteredSubmissions.length) }} of 
              {{ filteredSubmissions.length }} results
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

    <!-- Submission Details Modal -->
    <div
      v-if="selectedSubmission"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Submission Details</h3>
            <button
              @click="selectedSubmission = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Submission Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Submission ID</label>
                <p class="text-sm text-gray-900">#{{ selectedSubmission.id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Submitted</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedSubmission.submitted_at || '') }}</p>
              </div>
            </div>
            
            <!-- Waste Information -->
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-3">Waste Information</h4>
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    v-if="selectedSubmission.image_url"
                    :src="getImageUrl(selectedSubmission.image_url)"
                    :alt="selectedSubmission.title"
                    class="w-16 h-16 object-cover rounded-lg"
                  />
                  <CubeIcon v-else class="w-8 h-8 text-gray-400" />
                </div>
                <div class="flex-1">
                  <h5 class="font-medium text-gray-900">{{ selectedSubmission.title }}</h5>
                  <p class="text-sm text-gray-500">{{ selectedSubmission.description }}</p>
                  <div class="flex items-center space-x-4 mt-2">
                    <span class="text-sm text-gray-500">Category: {{ selectedSubmission.category?.name || 'Unknown' }}</span>
                    <span class="text-sm text-gray-500">Condition: {{ selectedSubmission.condition }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Quantity and Description -->
            <div class="border-t pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Quantity</label>
                  <p class="text-sm text-gray-900">{{ selectedSubmission.quantity }} {{ selectedSubmission.unit }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Vendor</label>
                  <p class="text-sm text-gray-900">{{ vendorDisplayName(selectedSubmission) }}</p>
                </div>
              </div>
              <div v-if="selectedSubmission.description" class="mt-4">
                <label class="text-sm font-medium text-gray-500">Description</label>
                <p class="text-sm text-gray-900">{{ selectedSubmission.description }}</p>
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-4 mt-6">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                @click="selectedSubmission = null"
              >
                Close
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                @click="deleteSubmission(selectedSubmission)"
              >
                <TrashIcon class="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useWasteStore } from '@/stores/waste'
import { XMarkIcon, CubeIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import type { SourceWasteSubmission } from '@/types'
import { getImageUrl } from '@/utils/imageUtils'

const toast = useToast()
const wasteStore = useWasteStore()

// State
const submissions = ref<SourceWasteSubmission[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedSubmission = ref<SourceWasteSubmission | null>(null)

const stats = ref({ total: 0 })

// Remove unused imageErrors

const vendorDisplayName = (submission: SourceWasteSubmission) => {
  const v = submission.vendor
  if (!v) return 'Unknown Vendor'
  const biz = (v.business_name || '').trim()
  return biz || (v.full_name || '').trim() || 'Unknown Vendor'
}

// Computed
const filteredSubmissions = computed(() => {
  let list = [...submissions.value]
  const raw = searchQuery.value.trim()
  if (raw) {
    const q = raw.toLowerCase()
    list = list.filter(s => {
      const title = (s.title || '').toLowerCase()
      const desc = (s.description || '').toLowerCase()
      const catName = (s.category?.name || '').toLowerCase()
      const v = s.vendor
      const full = (v?.full_name || '').toLowerCase()
      const biz = (v?.business_name || '').toLowerCase()
      const email = (v?.email || '').toLowerCase()
      return (
        title.includes(q) ||
        desc.includes(q) ||
        catName.includes(q) ||
        full.includes(q) ||
        biz.includes(q) ||
        email.includes(q)
      )
    })
  }
  return list.sort(
    (a, b) => new Date(b.submitted_at || '').getTime() - new Date(a.submitted_at || '').getTime()
  )
})

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSubmissions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSubmissions.value.length / itemsPerPage.value)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Methods
const loadSubmissions = async () => {
  try {
    // Load source waste submissions instead of old submissions
    await wasteStore.loadSourceWasteSubmissions()
    submissions.value = wasteStore.sourceWasteSubmissions
  } catch (error: any) {
    console.error('Error loading submissions:', error)
    toast.error(error.message || 'Failed to load waste submissions')
  }
}

const loadStats = async () => {
  try {
    // Load source waste submissions instead of old submissions
    await wasteStore.loadSourceWasteSubmissions()
    
    // Calculate stats from source waste submissions
    const allSubmissions = wasteStore.sourceWasteSubmissions
    stats.value = { total: allSubmissions.length }
  } catch (error: any) {
    console.error('Failed to load stats:', error)
  }
}

const deleteSubmission = async (submission: SourceWasteSubmission) => {
  const title = submission.title || 'this submission'
  if (
    !confirm(
      `Delete "${title}"? This removes the submission, linked catalog product, and vendor inventory for this entry.`
    )
  ) {
    return
  }
  try {
    await wasteStore.deleteSourceWasteSubmission(String(submission.id))
    toast.success('Submission deleted')
    selectedSubmission.value = null
    await loadSubmissions()
    await loadStats()
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete submission')
  }
}

const viewSubmission = (submission: SourceWasteSubmission) => {
  selectedSubmission.value = submission
}

const handleImageError = (submissionId: string) => {
  // Handle image loading errors
  console.log(`Image failed to load for submission ${submissionId}`)
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

onMounted(() => {
  loadSubmissions()
  loadStats()
})
</script>
