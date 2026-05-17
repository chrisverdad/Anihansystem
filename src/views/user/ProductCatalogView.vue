<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Product Catalog</h1>
            <p class="text-gray-600 mt-1">Browse repurposed products from agricultural waste</p>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="categoryFilter" class="form-input">
              <option value="">All Categories</option>
              <option v-for="category in wasteStore.productCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="form-input pl-10"
              />
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Featured Products -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Featured Products</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewProduct(product)"
          >
            <div class="relative">
              <div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  v-if="product.image_url && !imageErrors[product.id]"
                  :src="getImageUrl(product.image_url)"
                  :alt="product.name"
                  class="w-full h-48 object-cover"
                  @error="handleImageError(product.id)"
                  loading="lazy"
                />
                <div v-else class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <CubeIcon class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div class="absolute top-2 right-2">
                <span class="badge-success">Featured</span>
              </div>
            </div>
            <div class="card-body">
              <h3 class="font-semibold text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>
              <p v-if="vendorDisplay(product)" class="text-xs text-primary-700 font-medium mb-2">
                {{ vendorDisplay(product) }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-primary-600">₱{{ product.price }}</span>
                <span class="text-sm text-gray-500">{{ product.stock_quantity }} {{ product.unit }} available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Products -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">
            All Products ({{ filteredProducts.length }})
          </h2>
          <div class="flex items-center space-x-2">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-md',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <Squares2X2Icon class="w-5 h-5" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-md',
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <ListBulletIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="product in paginatedProducts"
            :key="product.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewProduct(product)"
          >
            <div class="relative">
              <div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  v-if="product.image_url && !imageErrors[product.id]"
                  :src="getImageUrl(product.image_url)"
                  :alt="product.name"
                  class="w-full h-48 object-cover"
                  @error="handleImageError(product.id)"
                  loading="lazy"
                />
                <div v-else class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <CubeIcon class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div v-if="!product.is_available" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span class="badge-danger">Out of Stock</span>
              </div>
            </div>
            <div class="card-body">
              <h3 class="font-semibold text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-primary-600">₱{{ product.price }}</span>
                <span class="text-sm text-gray-500">{{ product.stock_quantity }} {{ product.unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="space-y-4">
          <div
            v-for="product in paginatedProducts"
            :key="product.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewProduct(product)"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <div class="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    v-if="product.image_url && !imageErrors[product.id]"
                    :src="getImageUrl(product.image_url)"
                    :alt="product.name"
                    class="w-32 h-32 object-cover"
                    @error="handleImageError(product.id)"
                    loading="lazy"
                  />
                  <div v-else class="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <CubeIcon class="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              </div>
              <div class="card-body flex-1">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ product.name }}</h3>
                    <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-lg font-bold text-primary-600">₱{{ product.price }}</span>
                      <span class="text-sm text-gray-500">{{ product.stock_quantity }} {{ product.unit }} available</span>
                      <span class="badge-primary">{{ categoryLabel(product.category) }}</span>
                      <span v-if="vendorDisplay(product)" class="text-xs text-primary-700 font-medium">
                        {{ vendorDisplay(product) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="!product.is_available" class="ml-4">
                    <span class="badge-danger">Out of Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex items-center justify-center">
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-700 px-4">
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

    <!-- Product Details Modal -->
    <div
      v-if="selectedProduct"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Product Details</h3>
            <button
              @click="selectedProduct = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Product Image -->
            <div class="text-center">
              <div class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  v-if="selectedProduct.image_url && !imageErrors[selectedProduct.id]"
                  :src="getImageUrl(selectedProduct.image_url)"
                  :alt="selectedProduct.name"
                  class="w-full h-64 object-cover"
                  @error="handleImageError(selectedProduct.id)"
                />
                <div v-else class="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <CubeIcon class="w-16 h-16 text-gray-400" />
                </div>
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="space-y-4">
              <div>
                <h4 class="text-xl font-semibold text-gray-900">{{ selectedProduct.name }}</h4>
                <p v-if="vendorDisplay(selectedProduct)" class="text-sm text-primary-700 font-medium mt-1">
                  {{ vendorDisplay(selectedProduct) }}
                </p>
                <p class="text-gray-600 mt-2">{{ selectedProduct.description }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Price</label>
                  <p class="text-lg font-bold text-primary-600">₱{{ selectedProduct.price }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Category</label>
                  <p class="text-sm text-gray-900">{{ selectedProduct.category }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Stock</label>
                  <p class="text-sm text-gray-900">{{ selectedProduct.stock_quantity }} {{ selectedProduct.unit }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Availability</label>
                  <span :class="selectedProduct.is_available ? 'badge-success' : 'badge-danger'">
                    {{ selectedProduct.is_available ? 'Available' : 'Out of Stock' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Order Form -->
            <div v-if="selectedProduct.is_available" class="border-t pt-6">
              <h4 class="font-medium text-gray-900 mb-4">Place Order</h4>
              <form @submit.prevent="placeOrder" class="space-y-4">
                <div class="form-group">
                  <label class="form-label">Quantity</label>
                  <div class="flex items-center space-x-2">
                    <button
                      type="button"
                      @click="orderQuantity = Math.max(1, orderQuantity - 1)"
                      class="btn-outline w-10 h-10 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      v-model.number="orderQuantity"
                      type="number"
                      min="1"
                      :max="selectedProduct.stock_quantity"
                      class="form-input text-center w-20"
                    />
                    <button
                      type="button"
                      @click="orderQuantity = Math.min(selectedProduct.stock_quantity, orderQuantity + 1)"
                      class="btn-outline w-10 h-10 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    Maximum: {{ selectedProduct.stock_quantity }} {{ selectedProduct.unit }}
                  </p>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Total Amount</label>
                  <p class="text-lg font-bold text-primary-600">
                    ₱{{ (selectedProduct.price * orderQuantity).toLocaleString() }}
                  </p>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Payment Method</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="paymentMethod"
                        type="radio"
                        value="cash"
                        class="mr-2"
                      />
                      <span>Cash on Delivery</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="paymentMethod"
                        type="radio"
                        value="gcash"
                        class="mr-2"
                      />
                      <span>GCash</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="paymentMethod"
                        type="radio"
                        value="bank"
                        class="mr-2"
                      />
                      <span>Bank Transfer (PNB)</span>
                    </label>
                  </div>
                </div>
                
                <!-- Cash on Delivery Section -->
                <div v-if="paymentMethod === 'cash'" class="form-group bg-yellow-50 p-4 rounded-lg">
                  <label class="form-label">Cash on Delivery</label>
                  <div class="text-sm text-gray-600">
                    <p class="font-semibold">You will pay when the order arrives</p>
                    <p class="mt-1">Please ensure someone is available to receive the package and make the payment upon delivery.</p>
                  </div>
                </div>
                
                <!-- GCash Payment Section -->
                <div v-if="paymentMethod === 'gcash'" class="form-group bg-blue-50 p-4 rounded-lg">
                  <label class="form-label">GCash Payment</label>
                  <div class="mb-4">
                    <img 
                      src="/photos/GCash.jpg" 
                      alt="GCash" 
                      class="w-32 h-auto rounded-lg mb-3"
                    />
                    <div class="text-sm text-gray-600">
                      <p class="font-semibold">Send payment to: <span class="text-primary-600">09165283313</span></p>
                      <p class="mt-1">Please send your payment and provide proof of payment below.</p>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Receipt/Reference Number <span class="text-red-500">*</span></label>
                    <p class="text-sm text-gray-600 mb-2">Upload receipt image or enter reference number</p>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Upload Receipt Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          @change="(e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files[0]) {
                              receiptFile = files[0];
                              receiptFileName = files[0].name;
                            }
                          }"
                          class="form-input"
                        />
                        <p v-if="receiptFileName" class="text-sm text-green-600 mt-1">✓ {{ receiptFileName }} selected</p>
                      </div>
                      <div class="text-center text-gray-500">or</div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">GCash Reference Number</label>
                        <input
                          v-model="paymentReference"
                          type="text"
                          placeholder="Enter GCash reference number"
                          class="form-input"
                        />
                      </div>
                    </div>
                    <small class="form-help text-red-600">You must provide either an uploaded receipt or a reference number to complete the order.</small>
                  </div>
                </div>
                
                <!-- Bank Transfer Payment Section -->
                <div v-if="paymentMethod === 'bank'" class="form-group bg-green-50 p-4 rounded-lg">
                  <label class="form-label">PNB Bank Transfer</label>
                  <div class="mb-4">
                    <img 
                      src="/photos/PNB.png" 
                      alt="PNB Bank" 
                      class="w-32 h-auto rounded-lg mb-3"
                    />
                    <div class="text-sm text-gray-600">
                      <p class="font-semibold">Account Number: <span class="text-primary-600 font-bold">402949769</span></p>
                      <p class="mt-1">Please transfer your payment to the PNB account and provide proof of transfer below.</p>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Receipt/Reference Number <span class="text-red-500">*</span></label>
                    <p class="text-sm text-gray-600 mb-2">Upload receipt image or enter reference number</p>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Upload Receipt Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          @change="(e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files[0]) {
                              receiptFile = files[0];
                              receiptFileName = files[0].name;
                            }
                          }"
                          class="form-input"
                        />
                        <p v-if="receiptFileName" class="text-sm text-green-600 mt-1">✓ {{ receiptFileName }} selected</p>
                      </div>
                      <div class="text-center text-gray-500">or</div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Bank Reference Number</label>
                        <input
                          v-model="paymentReference"
                          type="text"
                          placeholder="Enter bank reference number"
                          class="form-input"
                        />
                      </div>
                    </div>
                    <small class="form-help text-red-600">You must provide either an uploaded receipt or a reference number to complete the order.</small>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Delivery Address</label>
                  <textarea
                    v-model="deliveryAddress"
                    rows="3"
                    placeholder="Enter your complete delivery address"
                    class="form-input"
                    required
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Delivery Notes (Optional)</label>
                  <textarea
                    v-model="deliveryNotes"
                    rows="2"
                    placeholder="Any special instructions for delivery"
                    class="form-input"
                  ></textarea>
                </div>
                
                <div class="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    @click="selectedProduct = null"
                    class="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { useWasteStore } from '@/stores/waste'
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  CubeIcon
} from '@heroicons/vue/24/outline'
import { getImageUrl } from '@/utils/imageUtils'
import { DEMO_WASTE_TYPE_IMAGES } from '@/constants/demoMedia'
import type { Product } from '@/types'

const toast = useToast()
const route = useRoute()
const authStore = useAuthStore()
const productsStore = useProductsStore()
const wasteStore = useWasteStore()

// State
const products = ref<Product[]>([])
const searchQuery = ref('')
const categoryFilter = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const selectedProduct = ref<Product | null>(null)
const orderQuantity = ref(1)
const paymentMethod = ref<'cash' | 'gcash' | 'bank'>('gcash')
const paymentReference = ref('')
const receiptFile = ref<File | null>(null)
const receiptFileName = ref('')
const deliveryAddress = ref('')
const deliveryNotes = ref('')
const imageErrors = ref<Record<string, boolean>>({})

// Computed
const filteredProducts = computed(() => {
  const q = String(searchQuery.value || '').toLowerCase().trim()
  const sel = String(categoryFilter.value || '').toLowerCase().trim()

  return products.value.filter(product => {
    const name = String(product.name || '').toLowerCase()
    const desc = String(product.description || '').toLowerCase()
    const prodCat = String(product.category || '').toLowerCase()

    if (q) {
      if (!name.includes(q) && !desc.includes(q)) return false
    }

    if (sel) {
      return prodCat === sel
    }

    return true
  })
})

// Reset pagination when filters/search change
watch([categoryFilter, searchQuery], () => {
  currentPage.value = 1
})

const featuredProducts = computed(() => {
  return filteredProducts.value.slice(0, 3)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

const categoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    vegetables: 'Vegetables',
    grains: 'Grains',
    fruits: 'Fruits',
    compost: 'Compost',
    fertilizer: 'Fertilizer',
    preserved_food: 'Preserved food',
    processed_food: 'Processed food',
    other: 'Other'
  }
  return labels[category] || category
}

// Methods
const loadProducts = async () => {
  try {
    await Promise.all([
      productsStore.loadProducts(),
      wasteStore.loadWasteCategories()
    ])
    products.value = productsStore.products
  } catch (error) {
    console.error('Failed to load products:', error)
    // Fallback to mock data if needed
    products.value = [
      {
        id: '1',
        name: 'Organic Banana Compost',
        description: 'Rich compost made from overripe bananas, perfect for organic gardening',
        price: 150,
        category: 'compost',
        image_url: DEMO_WASTE_TYPE_IMAGES.compost,
        stock_quantity: 25,
        unit: 'kg',
        is_available: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ]
  }
}

const viewProduct = (product: Product) => {
  selectedProduct.value = product
  orderQuantity.value = 1
}

const placeOrder = async () => {
  try {
    if (!selectedProduct.value) return
    
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      toast.error('Please log in to place an order')
      return
    }
    
    // Validate receipt or reference number for GCash and Bank payment (not required for Cash)
    if ((paymentMethod.value === 'gcash' || paymentMethod.value === 'bank') && !receiptFile.value && !paymentReference.value) {
      toast.error(`Please upload a receipt image or provide a reference number for ${paymentMethod.value === 'gcash' ? 'GCash' : 'Bank'} payment`)
      return
    }
    
    // Debug: Check if user is authenticated
    console.log('Current user:', authStore.user)
    console.log('User ID:', authStore.user?.id)
    
    // Create order data
    const orderData = {
      user_id: authStore.user?.id || '3', // Use current user ID or fallback
      product_id: selectedProduct.value.id,
      quantity: orderQuantity.value,
      total_price: selectedProduct.value.price * orderQuantity.value,
      payment_status: 'pending' as const,
      payment_method: paymentMethod.value,
      payment_reference: paymentReference.value,
      delivery_status: 'pending' as const,
      delivery_address: deliveryAddress.value,
      delivery_notes: deliveryNotes.value,
      notes: deliveryNotes.value
    }
    
    console.log('Order data:', orderData)
    
    // Place order using products store
    const newOrder = await productsStore.placeOrder(orderData)
    
    console.log('Order created:', newOrder)
    
    toast.success(`Order placed successfully! ${orderQuantity.value} ${selectedProduct.value.unit} of ${selectedProduct.value.name}`)
    selectedProduct.value = null
    resetOrderForm()
  } catch (error: any) {
    console.error('Order placement error:', error)
    toast.error(error.message || 'Failed to place order')
  }
}

const resetOrderForm = () => {
  orderQuantity.value = 1
  paymentMethod.value = 'cash'
  paymentReference.value = ''
  receiptFile.value = null
  receiptFileName.value = ''
  deliveryAddress.value = ''
  deliveryNotes.value = ''
}

const handleImageError = (productId: string) => {
  imageErrors.value[productId] = true
}

const vendorDisplay = (product: Product) => {
  const v = product.vendor
  if (!v) return ''
  const b = (v.business_name || '').trim()
  const label = b || (v.full_name || '').trim()
  return label ? `Sold by ${label}` : ''
}

const resetImageErrors = () => {
  imageErrors.value = {}
}

// Watch for changes in products to reset image errors
watch(products, () => {
  resetImageErrors()
}, { deep: true })

onMounted(() => {
  // Initialize from route query if present
  const qcat = String(route.query.category || '').toLowerCase()
  if (qcat) categoryFilter.value = qcat
  loadProducts()
})

// Keep categoryFilter in sync with route (so back/forward work)
watch(() => route.query.category, (val) => {
  const c = String(val || '').toLowerCase()
  categoryFilter.value = c
})
</script>
