<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="mb-2 sm:mb-0">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">User Dashboard</h1>
            <p class="text-sm sm:text-base text-gray-600 mt-1">Welcome to AniHan Platform</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-xs sm:text-sm text-gray-500">Welcome, {{ user?.full_name }}</p>
              <p class="text-xs sm:text-sm text-gray-500">General User</p>
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
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon class="w-3 h-3 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
              </div>
              <div class="ml-2 sm:ml-4">
                <p class="text-xs sm:text-sm font-medium text-gray-500">Total Orders</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{{ stats.totalOrders }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body p-3 sm:p-4 lg:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-diamond-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon class="w-3 h-3 sm:w-5 sm:h-5 text-diamond-600" />
                </div>
              </div>
              <div class="ml-2 sm:ml-4">
                <p class="text-xs sm:text-sm font-medium text-gray-500">Completed Orders</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{{ stats.completedOrders }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body p-3 sm:p-4 lg:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <ClockIcon class="w-3 h-3 sm:w-5 sm:h-5 text-warning-600" />
                </div>
              </div>
              <div class="ml-2 sm:ml-4">
                <p class="text-xs sm:text-sm font-medium text-gray-500">Pending Orders</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{{ stats.pendingOrders }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body p-3 sm:p-4 lg:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-8 sm:h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon class="w-3 h-3 sm:w-5 sm:h-5 text-danger-600" />
                </div>
              </div>
              <div class="ml-2 sm:ml-4">
                <p class="text-xs sm:text-sm font-medium text-gray-500">Total Spent</p>
                <p class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">₱{{ stats.totalSpent.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <div class="card">
          <div class="card-header p-3 sm:p-4 lg:p-6">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div class="card-body p-3 sm:p-4 lg:p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <router-link
                to="/user/products"
                class="flex items-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ShoppingBagIcon class="w-4 h-4 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                <div class="ml-2 sm:ml-3">
                  <p class="text-xs sm:text-sm font-medium text-gray-900">Browse Products</p>
                  <p class="text-xs sm:text-sm text-gray-500">Shop repurposed items</p>
                </div>
              </router-link>
              
              <router-link
                to="/user/orders"
                class="flex items-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <DocumentTextIcon class="w-4 h-4 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                <div class="ml-2 sm:ml-3">
                  <p class="text-xs sm:text-sm font-medium text-gray-900">My Orders</p>
                  <p class="text-xs sm:text-sm text-gray-500">View order history</p>
                </div>
              </router-link>
              
              <router-link
                to="/user/profile"
                class="flex items-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <UserIcon class="w-4 h-4 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                <div class="ml-2 sm:ml-3">
                  <p class="text-xs sm:text-sm font-medium text-gray-900">Profile</p>
                  <p class="text-xs sm:text-sm text-gray-500">Manage account</p>
                </div>
              </router-link>
              
              <router-link
                to="/user/favorites"
                class="flex items-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <HeartIcon class="w-4 h-4 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                <div class="ml-2 sm:ml-3">
                  <p class="text-xs sm:text-sm font-medium text-gray-900">Favorites</p>
                  <p class="text-xs sm:text-sm text-gray-500">Saved products</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card">
          <div class="card-header p-3 sm:p-4 lg:p-6">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div class="card-body p-3 sm:p-4 lg:p-6">
            <div class="space-y-3 sm:space-y-4">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-2 sm:space-x-3">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    <img
                      v-if="order.product.image_url && !imageErrors[order.id]"
                      :src="getSafeImageUrl(order.product.image_url)"
                      :alt="order.product.name"
                      class="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                      @error="handleImageError(order.id)"
                      loading="lazy"
                    />
                    <div v-else class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded flex items-center justify-center">
                      <CubeIcon class="w-3 h-3 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p class="text-xs sm:text-sm font-medium text-gray-900">{{ order.product.name }}</p>
                    <p class="text-xs text-gray-500">Order #{{ order.id }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span :class="getStatusBadgeClass(order.status)" class="text-xs sm:text-sm">
                    {{ order.status }}
                  </span>
                  <p class="text-xs sm:text-sm font-medium text-gray-900 mt-1">₱{{ order.total_price }}</p>
                </div>
              </div>
            </div>
            <div class="mt-3 sm:mt-4">
              <router-link
                to="/user/orders"
                class="text-primary-600 hover:text-primary-900 text-xs sm:text-sm font-medium"
              >
                View all orders →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Butuan City Markets Map -->
      <div class="card mb-6 sm:mb-8">
        <div class="card-header p-3 sm:p-4 lg:p-6">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">Butuan City Public Markets</h3>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">Explore nearby public market locations in Butuan City. Click market pins to see store details.</p>
        </div>
        <div class="card-body p-3 sm:p-4 lg:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
            <div class="relative">
              <div class="h-72 sm:h-96 overflow-hidden rounded-2xl border border-gray-200 relative">
                <iframe
                  title="Butuan City Public Markets"
                  class="w-full h-full"
                  :src="mapIframeSrc"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
                <!-- Store Location Markers -->
                <div v-if="showStores" class="absolute inset-0 pointer-events-none">
                  <button
                    v-for="marker in storeMarkers[selectedMarket] || []"
                    :key="marker.id"
                    @click="selectStoreMarker(marker)"
                    :style="{ left: `${marker.position.x}%`, top: `${marker.position.y}%` }"
                    class="absolute w-8 h-8 sm:w-10 sm:h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                    <div class="relative w-full h-full">
                      <div class="w-full h-full bg-red-500 rounded-full border-2 border-white shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow"></div>
                    </div>
                  </button>
                </div>
              </div>
              <!-- Stores Overlay on Map -->
              <div
                v-if="showStores && selectedMarketStores.length > 0"
                class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-lg border-t-2 border-primary-200 max-h-56 overflow-y-auto"
              >
                <div class="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
                  <h4 class="text-sm sm:text-base font-semibold text-gray-900">{{ selectedMarket }} - Stores</h4>
                  <button
                    @click="closeStoresModal"
                    class="text-gray-500 hover:text-gray-700 font-bold text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div class="p-3 sm:p-4 space-y-2">
                  <div
                    v-for="store in selectedMarketStores"
                    :key="store.name"
                    @click="selectedStoreInfo = store"
                    :class="[
                      'p-3 rounded-lg border-2 cursor-pointer transition-all',
                      selectedStoreInfo?.name === store.name
                        ? 'bg-red-50 border-red-500 shadow-md'
                        : 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200 hover:shadow-md'
                    ]"
                  >
                    <h5 class="text-xs sm:text-sm font-semibold text-gray-900">{{ store.name }}</h5>
                    <p class="text-xs text-gray-600 mt-1">
                      <span class="font-medium">Sells:</span> {{ store.products }}
                    </p>
                    <div class="mt-2 flex items-center">
                      <span class="inline-block px-2 py-0.5 bg-primary-200 text-primary-800 text-xs font-medium rounded">
                        Fruits
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Store Info Popup on Map -->
              <div
                v-if="selectedStoreInfo && showStores"
                class="absolute top-4 right-4 bg-white rounded-lg shadow-xl border-2 border-red-500 max-w-xs z-10 pointer-events-auto"
              >
                <div class="p-4">
                  <div class="flex items-start justify-between mb-2">
                    <h5 class="text-sm font-bold text-gray-900 flex-1">{{ selectedStoreInfo.name }}</h5>
                    <button
                      @click="selectedStoreInfo = null"
                      class="ml-2 text-gray-500 hover:text-gray-700 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                  <p class="text-xs text-gray-600 mb-3">
                    <span class="font-semibold">Products:</span> {{ selectedStoreInfo.products }}
                  </p>
                  <div class="flex items-center space-x-2">
                    <span class="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                      📍 Store Location
                    </span>
                    <span class="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded">
                      🍎 Fruits
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div
                v-for="market in publicMarkets"
                :key="market.name"
                @click="selectMarket(market.name)"
                :class="[
                  'p-4 bg-gray-50 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                  selectedMarket === market.name
                    ? 'border-primary-600 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                ]"
              >
                <h4 class="text-sm sm:text-base font-semibold text-gray-900">{{ market.name }}</h4>
                <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ market.barangay }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ market.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Products -->
      <div class="card">
        <div class="card-header p-3 sm:p-4 lg:p-6">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">Featured Products</h3>
        </div>
        <div class="card-body p-3 sm:p-4 lg:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div
              v-for="product in featuredProducts"
              :key="product.id"
              class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div class="w-full h-24 sm:h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  v-if="product.image_url && !imageErrors[product.id]"
                  :src="getSafeImageUrl(product.image_url)"
                  :alt="product.name"
                  class="w-full h-24 sm:h-32 object-cover"
                  @error="handleImageError(product.id)"
                  loading="lazy"
                />
                <div v-else class="w-full h-24 sm:h-32 bg-gray-200 flex items-center justify-center">
                  <CubeIcon class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
              </div>
              <div class="p-3 sm:p-4">
                <h4 class="font-medium text-gray-900 text-sm sm:text-base">{{ product.name }}</h4>
                <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ product.description }}</p>
                <div class="flex items-center justify-between mt-2 sm:mt-3">
                  <span class="text-sm sm:text-lg font-semibold text-primary-600">₱{{ product.price }}</span>
                  <button class="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">Add to Cart</button>
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
import { useProductsStore } from '@/stores/products'
import { getSafeImageUrl } from '@/utils/imageUtils'
import { DEMO_WASTE_TYPE_IMAGES } from '@/constants/demoMedia'
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  HeartIcon,
  CubeIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const productsStore = useProductsStore()

const user = computed(() => authStore.user)

const imageErrors = ref<Record<string, boolean>>({})
const selectedMarket = ref<string>('Butuan Public Market')
const mapIframeSrc = ref<string>('https://maps.google.com/maps?q=Butuan%20Public%20Market%2C%20Butuan%20City&output=embed')
const selectedMarketStores = ref<Array<{ name: string; products: string }>>([])
const showStores = ref<boolean>(false)
const selectedStoreInfo = ref<{ name: string; products: string } | null>(null)

type StoreMarker = {
  id: number
  position: { x: number; y: number }
  name: string
  products: string
}

const storeMarkers = ref<Record<string, StoreMarker[]>>({
  'Butuan Public Market': [
    { id: 1, position: { x: 25, y: 30 }, name: 'Fresh Valley Fruits', products: 'Fresh tropical fruits - mangoes, papayas, bananas' },
    { id: 2, position: { x: 70, y: 35 }, name: 'Golden Orchard', products: 'Organic fruits and produce' },
    { id: 3, position: { x: 40, y: 65 }, name: 'Sunrise Fruits Stall', products: 'Daily fresh fruits and vegetables' },
    { id: 4, position: { x: 65, y: 70 }, name: 'Tropical Harvest', products: 'Seasonal fruits and citrus' }
  ],
  'Libertad Public Market': [
    { id: 1, position: { x: 30, y: 40 }, name: 'Libertad Fruit Center', products: 'Wide variety of fresh fruits' },
    { id: 2, position: { x: 60, y: 30 }, name: 'Nature\'s Bounty', products: 'Organic and pesticide-free fruits' },
    { id: 3, position: { x: 75, y: 60 }, name: 'Green Valley Produce', products: 'Fresh fruits and local vegetables' },
    { id: 4, position: { x: 45, y: 75 }, name: 'Premium Fruits Market', products: 'High-quality imported and local fruits' }
  ],
  'San Roque Public Market': [
    { id: 1, position: { x: 35, y: 35 }, name: 'San Roque Fresh Fruits', products: 'Local fruits at competitive prices' },
    { id: 2, position: { x: 65, y: 45 }, name: 'Community Harvest', products: 'Fresh daily fruit selection' },
    { id: 3, position: { x: 50, y: 70 }, name: 'Neighborhood Fruits', products: 'Traditional fruit varieties' },
    { id: 4, position: { x: 80, y: 55 }, name: 'Quality Fruits Stall', products: 'Best selection of fresh fruits' }
  ],
  'Ampayon Public Market': [
    { id: 1, position: { x: 40, y: 50 }, name: 'Ampayon Fresh Market', products: 'Premium fresh fruits daily' },
    { id: 2, position: { x: 70, y: 40 }, name: 'Fruit Paradise', products: 'Exotic and common fruits' },
    { id: 3, position: { x: 55, y: 65 }, name: 'Ampayon Organic Fruits', products: 'Naturally grown fruits' },
    { id: 4, position: { x: 25, y: 60 }, name: 'Local Fruits Depot', products: 'Farm-fresh fruits and produce' }
  ]
})
type DashboardRecentOrder = {
  id: string
  product: { name: string; image_url: string }
  status: string
  total_price: number
}

type DashboardFeaturedProduct = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

const marketStores: Record<string, Array<{ name: string; products: string }>> = {
  'Butuan Public Market': [
    { name: 'Fresh Valley Fruits', products: 'Fresh tropical fruits - mangoes, papayas, bananas' },
    { name: 'Golden Orchard', products: 'Organic fruits and produce' },
    { name: 'Sunrise Fruits Stall', products: 'Daily fresh fruits and vegetables' },
    { name: 'Tropical Harvest', products: 'Seasonal fruits and citrus' }
  ],
  'Libertad Public Market': [
    { name: 'Libertad Fruit Center', products: 'Wide variety of fresh fruits' },
    { name: 'Nature\'s Bounty', products: 'Organic and pesticide-free fruits' },
    { name: 'Green Valley Produce', products: 'Fresh fruits and local vegetables' },
    { name: 'Premium Fruits Market', products: 'High-quality imported and local fruits' }
  ],
  'San Roque Public Market': [
    { name: 'San Roque Fresh Fruits', products: 'Local fruits at competitive prices' },
    { name: 'Community Harvest', products: 'Fresh daily fruit selection' },
    { name: 'Neighborhood Fruits', products: 'Traditional fruit varieties' },
    { name: 'Quality Fruits Stall', products: 'Best selection of fresh fruits' }
  ],
  'Ampayon Public Market': [
    { name: 'Ampayon Fresh Market', products: 'Premium fresh fruits daily' },
    { name: 'Fruit Paradise', products: 'Exotic and common fruits' },
    { name: 'Ampayon Organic Fruits', products: 'Naturally grown fruits' },
    { name: 'Local Fruits Depot', products: 'Farm-fresh fruits and produce' }
  ]
}

const stats = ref({
  totalOrders: 0,
  completedOrders: 0,
  pendingOrders: 0,
  totalSpent: 0
})

const recentOrders = ref<DashboardRecentOrder[]>([
  {
    id: 'ORD-001',
    product: {
      name: 'Organic Banana Compost',
      image_url: DEMO_WASTE_TYPE_IMAGES.compost
    },
    status: 'delivered',
    total_price: 300
  }
])

const featuredProducts = ref<DashboardFeaturedProduct[]>([
  {
    id: '1',
    name: 'Organic Banana Compost',
    description: 'Rich compost made from overripe bananas',
    price: 150,
    image_url: DEMO_WASTE_TYPE_IMAGES.compost
  }
])

const publicMarkets = ref([
  {
    name: 'Butuan Public Market',
    barangay: 'Poblacion',
    description: 'The central market in Butuan City for fresh produce and local goods.'
  },
  {
    name: 'Libertad Public Market',
    barangay: 'Libertad',
    description: 'Popular neighborhood market offering fruits, vegetables, and seafood.'
  },
  {
    name: 'San Roque Public Market',
    barangay: 'San Roque',
    description: 'A community market serving nearby residential areas.'
  },
  {
    name: 'Ampayon Public Market',
    barangay: 'Ampayon',
    description: 'Local market known for fresh vegetable and meat vendors.'
  }
])

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

const selectMarket = (marketName: string) => {
  selectedMarket.value = marketName
  // Update iframe src to navigate to the selected market
  const query = `${marketName}%2C%20Butuan%20City`
  mapIframeSrc.value = `https://maps.google.com/maps?q=${query}&output=embed`
  // Show stores for the selected market
  const marketStoresData = marketStores[marketName] || []
  selectedMarketStores.value = marketStoresData.map(m => ({ name: m.name, products: m.products }))
  showStores.value = true
  selectedStoreInfo.value = null
}

const closeStoresModal = () => {
  showStores.value = false
  selectedStoreInfo.value = null
}

const selectStoreMarker = (store: StoreMarker) => {
  selectedStoreInfo.value = { name: store.name, products: store.products }
}

const handleImageError = (orderId: string) => {
  imageErrors.value[orderId] = true
}

const loadStats = async () => {
  try {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, using fallback data')
      // Use fallback data
      stats.value = {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalSpent: 0
      }
      
      recentOrders.value = []
      featuredProducts.value = []
      return
    }
    
    // Debug: Check if user is authenticated
    console.log('Loading dashboard for user:', user.value)
    console.log('User ID:', user.value?.id)
    
    // Load products and orders
    await Promise.all([
      productsStore.loadProducts(),
      productsStore.loadOrders()
    ])
    
    // Filter orders for current user (compare as string - API may return numeric ids)
    const currentUserId = user.value?.id != null ? String(user.value.id) : ''
    const userOrders = productsStore.orders.filter(order => String(order.user_id) === currentUserId)
    
    // Calculate stats from actual data
    stats.value = {
      totalOrders: userOrders.length,
      completedOrders: userOrders.filter(order => order.status === 'delivered').length,
      pendingOrders: userOrders.filter(order => ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)).length,
      totalSpent: userOrders.reduce((sum, order) => sum + order.total_price, 0)
    }
    
    // Update recent orders with actual data
    recentOrders.value = userOrders.slice(0, 5).map(order => ({
      id: order.id,
      product: {
        name: order.product?.name || 'Unknown Product',
        image_url: order.product?.image_url || '/placeholder-image.svg'
      },
      status: order.status,
      total_price: order.total_price
    }))
    
    // Update featured products with actual data
    featuredProducts.value = productsStore.products.slice(0, 4).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '/placeholder-image.svg'
    }))
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>
