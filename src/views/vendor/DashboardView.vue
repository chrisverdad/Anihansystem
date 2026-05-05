<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="mb-2 sm:mb-0">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p class="text-sm sm:text-base text-gray-600 mt-1">Manage your agricultural waste and products</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-xs sm:text-sm text-gray-500">Welcome, {{ user?.email || user?.full_name || 'Vendor' }}</p>
              <p class="text-xs sm:text-sm text-gray-500">Vendor</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div class="card">
          <div class="card-body p-3 sm:p-4 lg:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon class="w-3 h-3 sm:w-5 sm:h-5 text-violet-600" />
                </div>
              </div>
              <div class="ml-2 sm:ml-4">
                <p class="text-xs sm:text-sm font-medium text-gray-500">Waste Submissions</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{{ stats.wasteSubmissions }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon class="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Processed Items</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.processedItems }}</p>
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
                <p class="text-sm font-medium text-gray-500">Active (scheduled)</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.activeScheduled }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon class="w-5 h-5 text-danger-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Earnings</p>
                <p class="text-2xl font-semibold text-gray-900">₱{{ stats.earnings.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <router-link
                to="/vendor/source-submissions"
                class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <PlusIcon class="w-6 h-6 text-primary-600" />
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Submit Waste</p>
                  <p class="text-sm text-gray-500">Report agricultural waste</p>
                </div>
              </router-link>
              
              <router-link
                to="/vendor/source-submissions"
                class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <DocumentTextIcon class="w-6 h-6 text-primary-600" />
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">My Submissions</p>
                  <p class="text-sm text-gray-500">View submission history</p>
                </div>
              </router-link>
              
              <router-link
                to="/vendor/products"
                class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <CubeIcon class="w-6 h-6 text-primary-600" />
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">My Products</p>
                  <p class="text-sm text-gray-500">Manage products</p>
                </div>
              </router-link>
              
              <router-link
                to="/vendor/profile"
                class="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <UserIcon class="w-6 h-6 text-primary-600" />
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Profile</p>
                  <p class="text-sm text-gray-500">Manage account</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Submissions -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Recent Submissions</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div
                v-for="submission in recentSubmissions"
                :key="submission.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    <img
                      v-if="submission.waste_type.image_url && !imageErrors[submission.id]"
                      :src="getSafeImageUrl(submission.waste_type.image_url)"
                      :alt="submission.waste_type.name"
                      class="w-10 h-10 object-cover rounded"
                      @error="handleImageError(submission.id)"
                      loading="lazy"
                    />
                    <div v-else class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <CubeIcon class="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ submission.waste_type.name }}</p>
                    <p class="text-xs text-gray-500">{{ submission.quantity }} {{ submission.unit }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span :class="getSourceSubmissionBadgeClass(submission.status)">
                    {{ sourceSubmissionStatusLabel(submission.status) }}
                  </span>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(submission.submitted_at) }}</p>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <router-link
                to="/vendor/source-submissions"
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                View all submissions →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Waste Types Guide -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Waste Types Guide</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="wasteType in wasteTypes"
              :key="wasteType.id"
              class="h-full border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="text-center h-full flex flex-col">
                <div class="w-full h-48 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    :src="getWasteTypeImage(wasteType.name)"
                    :alt="wasteType.name"
                    class="w-full h-full object-cover rounded"
                    @error="onWasteTypeImageError"
                    loading="lazy"
                  />
                </div>
                <h4 class="font-medium text-gray-900 min-h-[1.75rem]">{{ wasteType.name }}</h4>
                <p class="text-sm text-gray-500 mt-1 min-h-[2.5rem]">{{ wasteType.description }}</p>
                <div class="mt-auto pt-2">
                  <span class="badge-primary text-xs">{{ wasteType.category }}</span>
                  <span class="badge-warning text-xs ml-1">{{ wasteType.damage_level }}</span>
                </div>
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
import { useAuthStore } from '@/stores/auth'
import { useWasteStore } from '@/stores/waste'
import { getSafeImageUrl } from '@/utils/imageUtils'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  CubeIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const wasteStore = useWasteStore()

const user = computed(() => authStore.user)
const loading = ref(false)
const imageErrors = ref<Record<string, boolean>>({})

const stats = ref({
  wasteSubmissions: 0,
  processedItems: 0,
  activeScheduled: 0,
  earnings: 0
})

const recentSubmissions = ref<any[]>([])

const wasteTypes = ref<any[]>([])

// Mapping of waste type names to their images in public/photos
const wasteTypeImageMap: Record<string, string> = {
  'banana compost': '/photos/banana compost.jpg',
  'bruised tomatos': '/photos/bruised tomatos.jpg',
  'dairy': '/photos/dairy.jpg',
  'damage apples': '/photos/damage apples.webp',
  'damage mangoes': '/photos/damage mangoes.jpg',
  'grains': '/photos/grains.jpg',
  'mango jam': '/photos/mango jam.webp',
  'meat': '/photos/meat\'.jpeg',
  'overripe banana': '/photos/overripe banana.jpg',
  'overripe papaya': '/photos/overripe papaya.jpg',
  'tomato fertilizer': '/photos/tomato fertilizer.jpg',
  'vegetable compost': '/photos/vegetable compost.webp',
  'vegetables': '/photos/vegetables.webp',
  'wilted lettuce': '/photos/wilted lettuce.jpg'
}

const getWasteTypeImage = (wasteTypeName: string): string => {
  const lowerName = (wasteTypeName || '').toLowerCase().trim()

  // Specific overrides to handle plural/singular and common naming variants
  if (lowerName.includes('overripe') && lowerName.includes('papaya')) return '/photos/overripe papaya.jpg'
  if (lowerName.includes('overripe') && lowerName.includes('banana')) return '/photos/overripe banana.jpg'
  if (lowerName.includes('bruised') && (lowerName.includes('tomato') || lowerName.includes('tomatos') || lowerName.includes('tomatoes'))) return '/photos/bruised tomatos.jpg'

  // Fallback to exact map key or default image
  return wasteTypeImageMap[lowerName] || '/photos/vegetables.webp'
}

const sourceSubmissionStatusLabel = (status: string) => {
  if (status === 'pending' || status === 'approved' || status === 'rejected') return 'Scheduled'
  if (status === 'collected') return 'Collected'
  if (status === 'processed') return 'Processed'
  return status
}

const getSourceSubmissionBadgeClass = (status: string) => {
  if (status === 'pending' || status === 'approved' || status === 'rejected') return 'badge-primary'
  if (status === 'collected') return 'badge-warning'
  if (status === 'processed') return 'badge-success'
  return 'badge-gray'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (submissionId: string) => {
  imageErrors.value[submissionId] = true
}

const onWasteTypeImageError = (e: Event) => {
  const el = e.target as HTMLImageElement | null
  if (el) el.src = '/placeholder-image.svg'
}

const loadStats = async () => {
  loading.value = true
  try {
    // Load source waste submissions and waste categories for this vendor
    await Promise.all([
      wasteStore.loadSourceWasteSubmissions(),
      wasteStore.loadWasteCategories(),
      wasteStore.loadWasteTypes()
    ])
    
    // Filter submissions for current user (compare as strings: backend may return vendor_id as id string)
    const userSubmissions = wasteStore.sourceWasteSubmissions.filter(sub => String(sub.vendor_id) === String(user.value?.id))
    
    // Calculate stats from actual data
    stats.value = {
      wasteSubmissions: userSubmissions.length,
      processedItems: userSubmissions.filter((sub) => sub.status === 'processed').length,
      activeScheduled: userSubmissions.filter(
        (sub) => sub.status === 'pending' || sub.status === 'approved'
      ).length,
      earnings: userSubmissions.filter((sub) => sub.status === 'processed').length * 150
    }
    
    // Update recent submissions with actual data
    recentSubmissions.value = userSubmissions.slice(0, 5).map(sub => ({
      id: sub.id,
      waste_type: {
        name: sub.title,
        image_url: sub.image_url || '/placeholder-image.svg'
      },
      quantity: sub.quantity,
      unit: sub.unit,
      status: sub.status,
      submitted_at: sub.submitted_at
    }))
    
    // Update waste types with actual data
    wasteTypes.value = wasteStore.wasteTypes.map(wt => ({
      id: wt.id,
      name: wt.name,
      description: wt.description,
      image_url: getWasteTypeImage(wt.name),
      category: wt.category,
      damage_level: wt.damage_level
    }))
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
