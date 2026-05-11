import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/css/main.css'

import App from './App.vue'
import { useAuthStore } from './stores/auth'

// Import views
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ProfileView from './views/ProfileView.vue'

// Admin views
import AdminDashboardView from './views/admin/DashboardView.vue'
import UserManagementView from './views/admin/UserManagementView.vue'
import WasteManagementView from './views/admin/WasteManagementView.vue'
import OrderManagementView from './views/admin/OrderManagementView.vue'
import ProductManagementView from './views/admin/ProductManagementView.vue'
import CategoryManagementView from './views/admin/CategoryManagementView.vue'
import DeliveryManagementView from './views/admin/DeliveryManagementView.vue'
import ReportsView from './views/admin/ReportsView.vue'

// User views
import UserDashboardView from './views/user/DashboardView.vue'
import UserProductCatalogView from './views/user/ProductCatalogView.vue'
import UserOrderHistoryView from './views/user/OrderHistoryView.vue'

// Vendor views
import VendorDashboardView from './views/vendor/DashboardView.vue'
import InventoryView from './views/vendor/InventoryView.vue'
import VendorReportsView from './views/vendor/ReportsView.vue'
import WasteCategoryManagementView from './views/vendor/WasteCategoryManagementView.vue'
import SourceWasteSubmissionView from './views/vendor/SourceWasteSubmissionView.vue'
import VendorOrdersView from './views/vendor/VendorOrdersView.vue'
import VendorDeliveryManagementView from './views/vendor/VendorDeliveryManagementView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: UserDashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/user/dashboard',
    name: 'user-dashboard',
    component: UserDashboardView,
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/profile',
    redirect: '/profile'
  },
  {
    path: '/vendor/profile',
    redirect: '/profile'
  },
  // Admin routes
  {
    path: '/admin/users',
    name: 'admin-users',
    component: UserManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/waste',
    name: 'admin-waste',
    component: WasteManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: OrderManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: ProductManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: CategoryManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/delivery',
    name: 'admin-delivery',
    component: DeliveryManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: ReportsView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/analytics',
    redirect: { name: 'admin-reports' }
  },
  // User routes
  {
    path: '/user/products',
    name: 'user-products',
    component: UserProductCatalogView,
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/orders',
    name: 'user-orders',
    component: UserOrderHistoryView,
    meta: { requiresAuth: true, roles: ['user'] }
  },
  // Vendor routes
  {
    path: '/vendor/dashboard',
    name: 'vendor-dashboard',
    component: VendorDashboardView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  {
    path: '/vendor/source-submissions',
    name: 'vendor-source-submissions',
    component: SourceWasteSubmissionView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  {
    path: '/vendor/categories',
    name: 'vendor-categories',
    component: WasteCategoryManagementView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  {
    path: '/vendor/inventory',
    name: 'vendor-inventory',
    component: InventoryView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  {
    path: '/vendor/orders',
    name: 'vendor-orders',
    component: VendorOrdersView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  {
    path: '/vendor/deliveries',
    name: 'vendor-deliveries',
    component: VendorDeliveryManagementView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  {
    path: '/vendor/reports',
    name: 'vendor-reports',
    component: VendorReportsView,
    meta: { requiresAuth: true, roles: ['vendor'] }
  },
  // Catch-all routes for common paths
  {
    path: '/products',
    redirect: () => {
      // This will be handled by navigation guard after Pinia is initialized
      return '/user/products'
    }
  },
  {
    path: '/orders',
    redirect: () => {
      // This will be handled by navigation guard after Pinia is initialized
      return '/user/orders'
    }
  },
  // Catch-all for unknown routes
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else if (authStore.isVendor) {
      next('/vendor/dashboard')
    } else {
      next('/user/dashboard')
    }
  } else if (to.meta.roles && Array.isArray(to.meta.roles) && !to.meta.roles.includes(authStore.user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else if (authStore.isVendor) {
      next('/vendor/dashboard')
    } else {
      next('/user/dashboard')
    }
  } else if (to.path === '/dashboard') {
    // Handle /dashboard route - redirect to role-specific dashboard
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else if (authStore.isVendor) {
      next('/vendor/dashboard')
    } else {
      next('/user/dashboard')
    }
  } else {
    next()
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3800,
  maxToasts: 4,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.55,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

// Initialize stores
const authStore = useAuthStore()
authStore.initializeAuth()

// Initialize data persistence manager
import { dataPersistenceManager } from './utils/dataPersistence'
import { migrateBlobUrlsInStorage } from './utils/imageUtils'

// Migrate blob URLs in localStorage on app startup
migrateBlobUrlsInStorage()

// Initialize all stores and load data
dataPersistenceManager.initializeAllStores().catch(console.error)

app.mount('#app')

// Simple IntersectionObserver to add `is-visible` to cards for scroll animations
if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          // Stop observing once visible to avoid repeated triggers
          io.unobserve(el)
        }
      })
    },
    {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    }
  )

  // Attach to all elements with class `card`.
  // Add `scroll-animated` class so CSS controls initial hidden state.
  const initCards = () => {
    const selector = '.card, .rounded-2xl'
    const cards = Array.from(document.querySelectorAll<HTMLElement>(selector))
    cards.forEach((c) => {
      if (!c.classList.contains('scroll-animated')) c.classList.add('scroll-animated')
      io.observe(c)
    })
  }

  // Run after next paint to catch server-rendered or initial elements
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    requestAnimationFrame(initCards)
  } else {
    window.addEventListener('DOMContentLoaded', initCards, { once: true })
  }
}
