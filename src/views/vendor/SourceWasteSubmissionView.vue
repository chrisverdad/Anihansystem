<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Source Waste Submissions</h1>
            
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="statusFilter" class="form-input">
              <option value="">All</option>
              <option value="active">Scheduled</option>
              <option value="collected">Collected</option>
              <option value="processed">Processed</option>
            </select>
            <button
              @click="showAddSubmissionModal = true"
              class="btn-primary"
            >
              <PlusIcon class="w-5 h-5 mr-2" />
              Submit Waste
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards (pickup / processing only—no approval stage) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon class="w-5 h-5 text-violet-600" />
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
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <TruckIcon class="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Collected</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.collected }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-diamond-100 rounded-lg flex items-center justify-center">
                  <CogIcon class="w-5 h-5 text-diamond-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Processed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.processed }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submissions Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">My Submissions</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
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
              <tr v-for="submission in filteredSubmissions" :key="submission.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div 
                        v-if="submission.image_url"
                        class="relative h-10 w-10"
                      >
                        <img
                          :src="getImageUrl(submission.image_url)"
                          :alt="submission.title"
                          class="h-10 w-10 object-cover rounded ring-1 ring-slate-200"
                          loading="lazy"
                          decoding="async"
                          @load="imageLoading[submission.id] = false"
                          @error="handleImageError($event, submission.id)"
                        />
                        <div
                          v-if="imageLoading[submission.id] === true"
                          class="absolute inset-0 bg-slate-100 rounded flex items-center justify-center pointer-events-none"
                        >
                          <div class="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div 
                          v-if="imageError[submission.id]"
                          class="absolute inset-0 bg-gray-200 rounded flex items-center justify-center"
                        >
                          <div class="w-6 h-6 text-gray-400">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div 
                        v-else
                        class="h-10 w-10 bg-gray-200 rounded flex items-center justify-center"
                      >
                        <CubeIcon class="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ submission.title }}</div>
                      <div class="text-sm text-gray-500 truncate max-w-xs">{{ submission.description }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div 
                      class="w-4 h-4 rounded-full mr-2"
                      :style="{ backgroundColor: submission.category?.color }"
                    ></div>
                    <span class="text-sm text-gray-900">{{ submission.category?.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ submission.quantity }} {{ submission.unit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="badge-warning">{{ submission.condition.replace('_', ' ') }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ submission.location }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(submission.submitted_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewSubmission(submission)"
                      class="text-violet-600 hover:text-violet-900"
                    >
                      View
                    </button>
                    <button
                      v-if="vendorCanEditOrDelete(submission.status)"
                      @click="editSubmission(submission)"
                      class="text-emerald-600 hover:text-emerald-900"
                    >
                      Edit
                    </button>
                    <button
                      v-if="vendorCanEditOrDelete(submission.status)"
                      @click="deleteSubmission(submission)"
                      class="text-blood-600 hover:text-blood-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSubmissions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DocumentTextIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
        <p class="text-gray-500 mb-4">Submit your first waste to get started</p>
        <button
          @click="showAddSubmissionModal = true"
          class="btn-primary"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Submit Waste
        </button>
      </div>
    </div>

    <!-- Add/Edit Submission Modal -->
    <div
      v-if="showAddSubmissionModal || showEditSubmissionModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ showAddSubmissionModal ? 'Submit New Waste' : 'Edit Submission' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveSubmission" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Title -->
              <div class="form-group">
                <label class="form-label">Title</label>
                <input
                  v-model="submissionForm.title"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Overripe Bananas"
                  required
                />
              </div>

              <!-- Category -->
              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="submissionForm.category_id" class="form-input" required>
                  <option value="">Select category</option>
                  <option 
                    v-for="category in categories" 
                    :key="category.id" 
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="submissionForm.description"
                class="form-input"
                rows="3"
                placeholder="Describe the waste condition and any relevant details"
                required
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Quantity -->
              <div class="form-group">
                <label class="form-label">Quantity</label>
                <input
                  v-model.number="submissionForm.quantity"
                  type="number"
                  min="1"
                  class="form-input"
                  required
                />
              </div>

              <!-- Unit -->
              <div class="form-group">
                <label class="form-label">Unit</label>
                <select v-model="submissionForm.unit" class="form-input" required>
                  <option value="kg">Kilograms</option>
                  <option value="pieces">Pieces</option>
                  <option value="baskets">Baskets</option>
                  <option value="bags">Bags</option>
                  <option value="boxes">Boxes</option>
                  <option value="liters">Liters</option>
                </select>
              </div>

              <!-- Condition -->
              <div class="form-group">
                <label class="form-label">Condition</label>
                <select v-model="submissionForm.condition" class="form-input" required>
                  <option value="fresh">Fresh</option>
                  <option value="slightly_damaged">Slightly Damaged</option>
                  <option value="overripe">Overripe</option>
                  <option value="bruised">Bruised</option>
                  <option value="expired">Expired</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location</label>
              <input
                v-model="submissionForm.location"
                type="text"
                class="form-input"
                placeholder="e.g., Public Market, Butuan City"
                required
              />
            </div>

            <!-- Estimated Value -->
            <div class="form-group">
              <label class="form-label">Estimated Value (Optional)</label>
              <input
                v-model.number="submissionForm.estimated_value"
                type="number"
                min="0"
                step="0.01"
                class="form-input"
                placeholder="₱0.00"
              />
            </div>

            <!-- Image Upload -->
            <div class="form-group">
              <label class="form-label text-slate-800">Waste photo (optional)</label>
              <div
                class="mt-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-4 py-5 text-center"
              >
                <svg
                  class="mx-auto h-10 w-10 text-slate-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p class="mt-2 text-sm text-slate-700 font-medium">Choose an image from your device</p>
                <input
                  ref="imageInput"
                  id="waste-submission-image"
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="mt-3 block w-full cursor-pointer text-sm text-slate-800 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                />
                <p class="mt-2 text-xs text-slate-600">PNG, JPG, WebP or GIF — max 10MB</p>
              </div>
              <div v-if="submissionForm.image_preview" class="mt-4">
                <div class="flex items-center justify-center">
                  <img
                    :src="submissionForm.image_preview"
                    alt="Preview"
                    class="h-48 w-48 object-cover rounded-lg border shadow-sm"
                  />
                </div>
                <div class="mt-2 text-center">
                  <button
                    type="button"
                    @click="removeImage"
                    class="text-sm text-red-600 hover:text-red-500"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="btn-primary"
              >
                {{ loading ? 'Saving...' : (showAddSubmissionModal ? 'Submit Waste' : 'Update Submission') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Submission Modal -->
    <div
      v-if="showViewSubmissionModal && selectedSubmission"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Submission Details</h3>
            <button
              @click="closeViewModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Title</label>
                <p class="text-sm text-gray-900">{{ selectedSubmission.title }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Category</label>
                <div class="flex items-center">
                  <div 
                    class="w-4 h-4 rounded-full mr-2"
                    :style="{ backgroundColor: selectedSubmission.category?.color }"
                  ></div>
                  <p class="text-sm text-gray-900">{{ selectedSubmission.category?.name }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-500">Description</label>
              <p class="text-sm text-gray-900">{{ selectedSubmission.description }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Quantity</label>
                <p class="text-sm text-gray-900">{{ selectedSubmission.quantity }} {{ selectedSubmission.unit }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Condition</label>
                <p class="text-sm text-gray-900">{{ selectedSubmission.condition.replace('_', ' ') }}</p>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-500">Location</label>
              <p class="text-sm text-gray-900">{{ selectedSubmission.location }}</p>
            </div>

            <div v-if="selectedSubmission.estimated_value">
              <label class="text-sm font-medium text-gray-500">Estimated Value</label>
              <p class="text-sm text-gray-900">₱{{ selectedSubmission.estimated_value.toLocaleString() }}</p>
            </div>

            <div v-if="selectedSubmission.image_url">
              <label class="text-sm font-medium text-gray-500">Image</label>
              <div class="mt-2 flex justify-center">
                <img
                  :src="getImageUrl(selectedSubmission.image_url)"
                  :alt="selectedSubmission.title"
                  class="max-h-64 max-w-full object-contain rounded-lg border border-slate-200 shadow-sm"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useWasteStore } from '@/stores/waste'
import { useAuthStore } from '@/stores/auth'
import {
  PlusIcon,
  XMarkIcon,
  CogIcon,
  TruckIcon,
  DocumentTextIcon,
  CubeIcon
} from '@heroicons/vue/24/outline'
import type { SourceWasteSubmission, WasteCategory } from '@/types'
import { getImageUrl } from '@/utils/imageUtils'

const toast = useToast()
const wasteStore = useWasteStore()
const authStore = useAuthStore()

// State
const submissions = ref<SourceWasteSubmission[]>([])
const categories = ref<WasteCategory[]>([])
const loading = ref(false)
const statusFilter = ref('')
const showAddSubmissionModal = ref(false)
const showEditSubmissionModal = ref(false)
const showViewSubmissionModal = ref(false)
const selectedSubmission = ref<SourceWasteSubmission | null>(null)
const editingSubmission = ref<SourceWasteSubmission | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

// Image loading states
const imageLoading = ref<Record<string, boolean>>({})
const imageError = ref<Record<string, boolean>>({})

const submissionForm = ref({
  title: '',
  category_id: '',
  description: '',
  quantity: 1,
  unit: 'kg' as 'kg' | 'pieces' | 'baskets' | 'bags' | 'boxes' | 'liters',
  condition: 'fresh' as 'fresh' | 'slightly_damaged' | 'overripe' | 'bruised' | 'expired' | 'other',
  location: '',
  estimated_value: 0,
  image_file: null as File | null,
  image_preview: ''
})

const stats = ref({
  total: 0,
  collected: 0,
  processed: 0
})

// Computed
const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  if (statusFilter.value === 'active') {
    filtered = filtered.filter((s) => s.status === 'pending' || s.status === 'approved')
  } else if (statusFilter.value) {
    filtered = filtered.filter((s) => s.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
})

// Refresh the view's list from the store only (no API re-fetch). Use after save so the new submission stays visible.
const refreshSubmissionsFromStore = () => {
  const currentUserId = authStore.user?.id
  if (currentUserId != null && currentUserId !== '') {
    submissions.value = wasteStore.sourceWasteSubmissions.filter((sub: any) => String(sub.vendor_id) === String(currentUserId))
    submissions.value.forEach((submission: any) => {
      if (submission.image_url && imageLoading.value[submission.id] === undefined) {
        imageLoading.value[submission.id] = true
        imageError.value[submission.id] = false
      }
    })
  } else {
    submissions.value = []
  }
  calculateStats()
}

// Methods
const loadSubmissions = async () => {
  try {
    loading.value = true
    await Promise.all([
      wasteStore.loadSourceWasteSubmissions(),
      wasteStore.loadWasteCategories()
    ])
    refreshSubmissionsFromStore()
    categories.value = wasteStore.wasteCategories.filter((cat: any) => cat.is_active)
    // Initialize image loading states
    submissions.value.forEach((submission: any) => {
      if (submission.image_url) {
        imageLoading.value[submission.id] = true
        imageError.value[submission.id] = false
      }
    })
  } catch (error: any) {
    toast.error(error.message || 'Failed to load submissions')
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const userSubmissions = submissions.value
  stats.value = {
    total: userSubmissions.length,
    collected: userSubmissions.filter((s) => s.status === 'collected').length,
    processed: userSubmissions.filter((s) => s.status === 'processed').length
  }
}

const viewSubmission = (submission: SourceWasteSubmission) => {
  selectedSubmission.value = submission
  showViewSubmissionModal.value = true
}

const vendorStatusLabel = (status: string) => {
  if (status === 'pending' || status === 'approved' || status === 'rejected') return 'Scheduled'
  if (status === 'collected') return 'Collected'
  if (status === 'processed') return 'Processed'
  return status
}

const getVendorStatusBadgeClass = (status: string) => {
  if (status === 'pending' || status === 'approved' || status === 'rejected') return 'badge-primary'
  if (status === 'collected') return 'badge-warning'
  if (status === 'processed') return 'badge-success'
  return 'badge-gray'
}

const vendorCanEditOrDelete = (status: string) => !['processed', 'collected'].includes(status)

const editSubmission = (submission: SourceWasteSubmission) => {
  editingSubmission.value = submission
  const catId = (submission as { category?: { id?: string } }).category?.id
  const existingUrl = submission.image_url ? String(submission.image_url).trim() : ''
  submissionForm.value = {
    title: submission.title,
    category_id: String(catId ?? submission.category_id ?? ''),
    description: submission.description,
    quantity: submission.quantity,
    unit: submission.unit,
    condition: submission.condition,
    location: submission.location,
    estimated_value: submission.estimated_value || 0,
    image_file: null,
    image_preview: existingUrl ? getImageUrl(existingUrl) : ''
  }
  showEditSubmissionModal.value = true
}

const deleteSubmission = async (submission: SourceWasteSubmission) => {
  if (confirm(`Are you sure you want to delete "${submission.title}"?`)) {
    try {
      await (wasteStore as any).deleteSourceWasteSubmission(submission.id)
      toast.success('Submission deleted successfully!')
      await loadSubmissions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete submission')
    }
  }
}

const saveSubmission = async () => {
  try {
    loading.value = true
    
    if (!authStore.user?.id) {
      toast.error('You must be signed in as a vendor to submit waste.')
      return
    }
    if (!submissionForm.value.category_id) {
      toast.error('Please select a category.')
      return
    }
    if (!submissionForm.value.title?.trim() || !submissionForm.value.description?.trim() || !submissionForm.value.location?.trim()) {
      toast.error('Title, description, and location are required.')
      return
    }
    if (Number(submissionForm.value.quantity) < 1) {
      toast.error('Quantity must be at least 1.')
      return
    }

    const formData = {
      ...submissionForm.value,
      vendor_id: authStore.user.id,
      vendor: authStore.user,
      image_file: submissionForm.value.image_file
    }

    if (showAddSubmissionModal.value) {
      await (wasteStore as any).createSourceWasteSubmission(formData)
      closeModal()
      toast.success('Waste submitted successfully!')
      await loadSubmissions()
    } else if (showEditSubmissionModal.value && editingSubmission.value) {
      await (wasteStore as any).updateSourceWasteSubmission(editingSubmission.value.id, formData)
      closeModal()
      toast.success('Submission updated successfully!')
      await loadSubmissions()
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to save submission')
  } finally {
    loading.value = false
  }
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    
    submissionForm.value.image_file = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      submissionForm.value.image_preview = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  submissionForm.value.image_file = null
  submissionForm.value.image_preview = ''
  // Reset the file input
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const handleImageError = (_event: Event, id: string) => {
  imageLoading.value[id] = false
  imageError.value[id] = true
  console.warn(`Failed to load image for submission ${id}`)
}

const closeModal = () => {
  showAddSubmissionModal.value = false
  showEditSubmissionModal.value = false
  editingSubmission.value = null
  submissionForm.value = {
    title: '',
    category_id: '',
    description: '',
    quantity: 1,
    unit: 'kg',
    condition: 'fresh',
    location: '',
    estimated_value: 0,
    image_file: null,
    image_preview: ''
  }
  // Reset the file input
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const closeViewModal = () => {
  showViewSubmissionModal.value = false
  selectedSubmission.value = null
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

onMounted(async () => {
  authStore.initializeAuth()
  await loadSubmissions()
})
</script>
