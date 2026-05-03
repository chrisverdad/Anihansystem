import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, Order, Delivery } from '@/types'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'
import apiService from '@/services/api'
import { DEMO_WASTE_TYPE_IMAGES, resolveDemoImageUrl } from '@/constants/demoMedia'

// Normalize product from API (MySQL returns id as number)
function normalizeProduct(p: any): Product {
  const vendor =
    p?.vendor && typeof p.vendor === 'object'
      ? {
          id: String(p.vendor.id ?? p.vendor_id ?? ''),
          full_name: String(p.vendor.full_name ?? ''),
          business_name: String(p.vendor.business_name ?? ''),
          email: String(p.vendor.email ?? '')
        }
      : undefined
  const rawImg = p?.image_url != null ? String(p.image_url).trim() : ''
  const isPublicOff =
    p?.is_public === false ||
    p?.is_public === 0 ||
    p?.is_public === '0' ||
    p?.is_public === 'false'
  return {
    ...p,
    id: String(p?.id ?? ''),
    vendor_id: p?.vendor_id != null && p.vendor_id !== '' ? String(p.vendor_id) : undefined,
    vendor,
    is_public: isPublicOff ? false : true,
    deleted_at: p?.deleted_at != null && p.deleted_at !== '' ? String(p.deleted_at) : null,
    created_at: p?.created_at ?? new Date().toISOString(),
    updated_at: p?.updated_at ?? new Date().toISOString(),
    image_url: rawImg ? resolveDemoImageUrl(rawImg) : ''
  }
}

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const orders = ref<Order[]>([])
  /** Orders for products owned by the logged-in vendor (from GET /orders?vendor_id=) */
  const vendorOrders = ref<Order[]>([])
  const deliveries = ref<Delivery[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Offline fallback — matches seeded catalog (single product)
  const mockProducts: Product[] = [
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
      is_public: true,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ]

  const mockOrders: Order[] = []

  const loadProducts = async (options?: { includeRemoved?: boolean }) => {
    loading.value = true
    try {
      // Try API first
      try {
        const response = await apiService.getProducts(options?.includeRemoved === true)
        if (response.success && response.data) {
          products.value = (response.data as any[]).map(normalizeProduct)
          // Save to localStorage as backup
          localStorage.setItem('anihan_products', JSON.stringify(products.value))
          return
        }
      } catch (apiError: any) {
        console.warn('API load failed, using localStorage:', apiError.message)
      }
      
      // Fallback to localStorage
      const storedProducts = localStorage.getItem('anihan_products')
      if (storedProducts) {
        products.value = JSON.parse(storedProducts)
      } else {
        // Fallback to mock data
        products.value = [...mockProducts]
        localStorage.setItem('anihan_products', JSON.stringify(products.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load products'
      // Fallback to mock data
      products.value = [...mockProducts]
      localStorage.setItem('anihan_products', JSON.stringify(products.value))
    } finally {
      loading.value = false
    }
  }

  const normalizeOrder = (row: any): Order => {
    const order: Order = {
      id: String(row?.id ?? ''),
      user_id: typeof row?.user_id === 'object' ? String(row.user_id?.id ?? row.user_id) : String(row?.user_id ?? ''),
      product_id: typeof row?.product_id === 'object' ? String(row.product_id?.id ?? row.product_id) : String(row?.product_id ?? ''),
      quantity: Number(row?.quantity) || 0,
      total_price: Number(row?.total_price) || 0,
      status: row?.status ?? 'pending',
      payment_status: row?.payment_status ?? 'pending',
      payment_method: row?.payment_method ?? 'cash',
      payment_reference: row?.payment_reference ?? '',
      delivery_status: row?.delivery_status ?? 'pending',
      delivery_address: row?.delivery_address ?? '',
      delivery_notes: row?.delivery_notes ?? '',
      order_date: row?.order_date ?? new Date().toISOString(),
      delivery_date: row?.delivery_date != null && row.delivery_date !== '' ? String(row.delivery_date) : undefined
    }
    if (typeof row?.user_id === 'object') order.user = row.user_id as any
    if (typeof row?.product_id === 'object') {
      order.product = normalizeProduct(row.product_id) as any
    }
    if (row?.delivery_info && typeof row.delivery_info === 'object') {
      const di = row.delivery_info as Record<string, unknown>
      order.delivery_info = {
        delivery_person: String(di.delivery_person ?? ''),
        delivery_vehicle: String(di.delivery_vehicle ?? ''),
        fulfillment_notes: String(di.fulfillment_notes ?? ''),
        fulfillment_status: String(di.fulfillment_status ?? '')
      }
    }
    return order
  }

  const normalizeDelivery = (row: any): Delivery => {
    const d: Delivery = {
      id: String(row?.id ?? ''),
      order_id: String(row?.order_id ?? ''),
      vendor_id: row?.vendor_id != null && row.vendor_id !== '' ? String(row.vendor_id) : undefined,
      delivery_person: row?.delivery_person,
      delivery_vehicle: row?.delivery_vehicle,
      pickup_time: row?.pickup_time,
      delivery_time: row?.delivery_time,
      status: row?.status ?? 'pending',
      notes: row?.notes ?? '',
      admin_notes: row?.admin_notes,
      created_at: row?.created_at ?? new Date().toISOString(),
      updated_at: row?.updated_at ?? new Date().toISOString()
    }
    if (row?.order) d.order = normalizeOrder(row.order)
    return d
  }

  const loadOrders = async () => {
    loading.value = true
    try {
      try {
        const response = await apiService.getOrders()
        if (response.success && response.data) {
          orders.value = (response.data as any[]).map(normalizeOrder)
          localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
          await syncOrderUserData()
          return
        }
      } catch (apiError: any) {
        console.warn('API load orders failed, using localStorage:', apiError.message)
      }
      const storedOrders = localStorage.getItem('anihan_orders')
      if (storedOrders) {
        orders.value = JSON.parse(storedOrders)
        await syncOrderUserData()
      } else {
        orders.value = [...mockOrders]
        localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
      }
      if (orders.value.length === 0) {
        orders.value = [...mockOrders]
        localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load orders'
      orders.value = [...mockOrders]
      localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
    } finally {
      loading.value = false
    }
  }

  const loadVendorOrders = async (vendorId: string) => {
    loading.value = true
    try {
      try {
        const response = await apiService.getOrders(vendorId)
        if (response.success && response.data) {
          vendorOrders.value = (response.data as any[]).map(normalizeOrder)
          return
        }
      } catch (apiError: any) {
        console.warn('API load vendor orders failed:', apiError.message)
      }
      await loadOrders()
      vendorOrders.value = orders.value.filter(
        (o) => String((o.product as Product | undefined)?.vendor_id ?? '') === String(vendorId)
      )
    } catch (err: any) {
      error.value = err.message || 'Failed to load vendor orders'
      vendorOrders.value = []
    } finally {
      loading.value = false
    }
  }

  const syncOrderUserData = async () => {
    try {
      const usersStore = useUsersStore()
      await usersStore.loadUsers()
      const allUsers = usersStore.users
      
      let hasUpdates = false
      
      for (const order of orders.value) {
        // If order has hardcoded user data, try to find the real user
        if (order.user && (order.user.email === 'user@anihan.com' || order.user.full_name === 'User')) {
          const realUser = allUsers.find(u => u.id === order.user_id)
          if (realUser) {
            order.user = {
              id: realUser.id,
              email: realUser.email,
              full_name: realUser.full_name,
              role: realUser.role,
              phone: realUser.phone,
              address: realUser.address,
              created_at: realUser.created_at,
              updated_at: realUser.updated_at,
              is_active: realUser.is_active
            }
            hasUpdates = true
          }
        }
      }
      
      if (hasUpdates) {
        localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
      }
    } catch (error) {
      console.error('Failed to sync order user data:', error)
    }
  }

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, imageFile?: File) => {
    loading.value = true
    try {
      // Try API first
      try {
        const response = await apiService.createProduct(productData, imageFile)
        if (response.success && response.data) {
          const newProduct = normalizeProduct(response.data)
          products.value = [newProduct, ...products.value]
          localStorage.setItem('anihan_products', JSON.stringify(products.value))
          return newProduct
        }
      } catch (apiError: any) {
        console.warn('API create failed, using localStorage:', apiError.message)
      }
      
      // Fallback to localStorage
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Auto out-of-stock logic: if stock_quantity is 0, set is_available to false
      const processedProductData = {
        ...productData,
        is_available: productData.stock_quantity > 0 ? productData.is_available : false
      }
      
      const newProduct: Product = {
        ...processedProductData,
        id: (products.value.length + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      products.value.unshift(newProduct)
      // Save to localStorage
      localStorage.setItem('anihan_products', JSON.stringify(products.value))
      return newProduct
    } catch (err: any) {
      error.value = err.message || 'Failed to add product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>, imageFile?: File) => {
    loading.value = true
    try {
      // Try API first
      try {
        const response = await apiService.updateProduct(id, updates, imageFile)
        if (response.success && response.data) {
          const updatedProduct = normalizeProduct(response.data)
          const index = products.value.findIndex(product => String(product.id) === String(id))
          if (index !== -1) {
            products.value[index] = updatedProduct
          } else {
            products.value = [updatedProduct, ...products.value]
          }
          localStorage.setItem('anihan_products', JSON.stringify(products.value))
          return updatedProduct
        }
      } catch (apiError: any) {
        console.warn('API update failed, using localStorage:', apiError.message)
      }
      
      // Fallback to localStorage
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = products.value.findIndex(product => product.id === id)
      if (index !== -1) {
        // Auto out-of-stock logic: if stock_quantity is 0, set is_available to false
        const updatedProduct = {
          ...products.value[index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        // Check if stock quantity is being updated and is 0
        if (updates.stock_quantity !== undefined && updates.stock_quantity === 0) {
          updatedProduct.is_available = false
        }
        
        products.value[index] = updatedProduct
        // Save to localStorage
        localStorage.setItem('anihan_products', JSON.stringify(products.value))
        return products.value[index]
      }
      throw new Error('Product not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to update product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: string, reloadOptions?: { includeRemoved?: boolean }) => {
    loading.value = true
    try {
      // Try API first
      try {
        await apiService.deleteProduct(id)
        await loadProducts(reloadOptions?.includeRemoved ? { includeRemoved: true } : {})
        return true
      } catch (apiError: any) {
        console.warn('API delete failed, using localStorage:', apiError.message)
      }
      
      // Fallback to localStorage
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = products.value.findIndex(product => String(product.id) === String(id))
      if (index !== -1) {
        if (reloadOptions?.includeRemoved) {
          products.value[index] = {
            ...products.value[index],
            deleted_at: new Date().toISOString(),
            is_available: false,
            updated_at: new Date().toISOString()
          }
        } else {
          products.value.splice(index, 1)
        }
        localStorage.setItem('anihan_products', JSON.stringify(products.value))
        return true
      }
      throw new Error('Product not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const restoreProduct = async (id: string) => {
    loading.value = true
    try {
      const response = await apiService.restoreProduct(id)
      if (response.success && response.data) {
        await loadProducts({ includeRemoved: true })
        return normalizeProduct(response.data)
      }
      throw new Error('Restore failed')
    } catch (err: any) {
      error.value = err.message || 'Failed to restore product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const placeOrder = async (orderData: Omit<Order, 'id' | 'order_date' | 'status' | 'user' | 'product'>) => {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const currentUser = authStore.user
      if (!currentUser) throw new Error('User not authenticated')

      const product = products.value.find(p => String(p.id) === String(orderData.product_id))
      if (!product) throw new Error('Product not found')
      if (product.stock_quantity < orderData.quantity) throw new Error('Insufficient stock')

      const payload = {
        user_id: Number(currentUser.id) || currentUser.id,
        product_id: Number(orderData.product_id) || orderData.product_id,
        quantity: orderData.quantity,
        total_price: orderData.total_price,
        payment_method: orderData.payment_method || 'cash',
        payment_reference: orderData.payment_reference || '',
        delivery_address: orderData.delivery_address || '',
        delivery_notes: orderData.delivery_notes || ''
      }
      try {
        const response = await apiService.createOrder(payload)
        if (response.success && response.data) {
          const newOrder = normalizeOrder(response.data)
          orders.value = [newOrder, ...orders.value]
          const idx = products.value.findIndex(p => String(p.id) === String(orderData.product_id))
          if (idx !== -1) {
            products.value[idx].stock_quantity = product.stock_quantity - orderData.quantity
            products.value[idx].updated_at = new Date().toISOString()
            products.value[idx].is_available = products.value[idx].stock_quantity > 0
          }
          localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
          localStorage.setItem('anihan_products', JSON.stringify(products.value))
          try {
            await loadDeliveries()
          } catch {
            /* deliveries sync optional */
          }
          return newOrder
        }
      } catch (apiError: any) {
        console.warn('API create order failed:', apiError.message)
      }
      product.stock_quantity -= orderData.quantity
      product.updated_at = new Date().toISOString()
      const newOrder: Order = {
        ...orderData,
        id: `ORD-${String(orders.value.length + 1).padStart(3, '0')}`,
        status: 'pending',
        payment_status: orderData.payment_status || 'pending',
        payment_method: orderData.payment_method || 'cash',
        payment_reference: orderData.payment_reference || '',
        delivery_status: orderData.delivery_status || 'pending',
        delivery_address: orderData.delivery_address || '',
        delivery_notes: orderData.delivery_notes || '',
        order_date: new Date().toISOString(),
        user: {
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.full_name,
          role: currentUser.role,
          phone: currentUser.phone,
          address: currentUser.address,
          created_at: currentUser.created_at,
          updated_at: currentUser.updated_at,
          is_active: currentUser.is_active
        },
        product
      }
      orders.value = [newOrder, ...orders.value]
      const newDelivery: Delivery = {
        id: `DEL-${newOrder.id}`,
        order_id: newOrder.id,
        status: newOrder.delivery_status,
        notes: newOrder.delivery_notes ?? '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order: newOrder
      }
      deliveries.value = [newDelivery, ...deliveries.value]
      localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
      localStorage.setItem('anihan_products', JSON.stringify(products.value))
      localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
      return newOrder
    } catch (err: any) {
      error.value = err.message || 'Failed to place order'
      throw err
    } finally {
      loading.value = false
    }
  }

  type OrderVendorPatch = Partial<
    Pick<Order, 'status' | 'payment_status' | 'delivery_status' | 'payment_reference' | 'delivery_notes' | 'notes'>
  >

  /** Apply server order payload across orders, vendorOrders, and nested delivery.order + delivery.status */
  const mergeOrderIntoState = (updated: Order) => {
    const id = String(updated.id)
    const replaceIn = (arr: Order[]) => {
      const i = arr.findIndex((o) => String(o.id) === id)
      if (i !== -1) arr.splice(i, 1, updated)
    }
    replaceIn(orders.value)
    replaceIn(vendorOrders.value)
    deliveries.value = deliveries.value.map((d) => {
      if (String(d.order_id) !== id) return d
      return {
        ...d,
        status: updated.delivery_status,
        order: updated
      }
    })
    try {
      localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
      localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
    } catch {
      /* ignore quota */
    }
    return updated
  }

  const updateOrderViaApi = async (id: string, payload: OrderVendorPatch) => {
    const res = await apiService.updateOrder(id, payload)
    if (res.success && res.data) {
      return mergeOrderIntoState(normalizeOrder(res.data))
    }
    throw new Error((res as { message?: string }).message || 'Failed to update order')
  }

  const updateOrderFields = async (id: string, fields: OrderVendorPatch) => {
    loading.value = true
    try {
      return await updateOrderViaApi(id, fields)
    } catch (err: any) {
      error.value = err.message || 'Failed to update order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    return updateOrderFields(id, { status })
  }

  const updateOrderPaymentStatus = async (id: string, paymentStatus: Order['payment_status']) => {
    return updateOrderFields(id, { payment_status: paymentStatus })
  }

  const updateOrderDeliveryStatus = async (id: string, deliveryStatus: Order['delivery_status']) => {
    return updateOrderFields(id, { delivery_status: deliveryStatus })
  }

  const getProductStats = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return {
        total: products.value.length,
        available: products.value.filter(p => p.is_available).length,
        outOfStock: products.value.filter(p => !p.is_available).length,
        totalStock: products.value.reduce((sum, p) => sum + p.stock_quantity, 0),
        byCategory: products.value.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch product stats'
      throw err
    }
  }

  const getOrderStats = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return {
        total: orders.value.length,
        pending: orders.value.filter(o => o.status === 'pending').length,
        confirmed: orders.value.filter(o => o.status === 'confirmed').length,
        processing: orders.value.filter(o => o.status === 'processing').length,
        shipped: orders.value.filter(o => o.status === 'shipped').length,
        delivered: orders.value.filter(o => o.status === 'delivered').length,
        cancelled: orders.value.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders.value.reduce((sum, o) => sum + o.total_price, 0)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch order stats'
      throw err
    }
  }

  // Delivery Management (API: admin = all rows + admin_notes; vendor = ?vendor_id=, admin_notes stripped)
  const loadDeliveries = async (options?: { vendorId?: string }) => {
    loading.value = true
    try {
      try {
        const response = await apiService.getDeliveries(options?.vendorId)
        if (response.success && response.data) {
          deliveries.value = (response.data as any[]).map(normalizeDelivery)
          localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
          await syncDeliveryOrderData()
          return
        }
      } catch (apiError: any) {
        console.warn('API load deliveries failed:', apiError.message)
      }

      const storedDeliveries = localStorage.getItem('anihan_deliveries')
      if (storedDeliveries) {
        deliveries.value = JSON.parse(storedDeliveries)
        await syncDeliveryOrderData()
      } else {
        const mockDeliveries: Delivery[] = orders.value.map(order => ({
          id: `DEL-${order.id}`,
          order_id: order.id,
          status: order.delivery_status,
          notes: order.delivery_notes,
          created_at: order.order_date,
          updated_at: order.order_date,
          order: order
        }))
        deliveries.value = mockDeliveries
        localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load deliveries'
      throw err
    } finally {
      loading.value = false
    }
  }

  const syncDeliveryOrderData = async () => {
    try {
      const usersStore = useUsersStore()
      await usersStore.loadUsers()
      const allUsers = usersStore.users
      
      let hasUpdates = false
      
      for (const delivery of deliveries.value) {
        if (delivery.order) {
          // If order has hardcoded user data, try to find the real user
          if (delivery.order.user && (delivery.order.user.email === 'user@anihan.com' || delivery.order.user.full_name === 'User')) {
            const realUser = allUsers.find(u => u.id === delivery.order!.user_id)
            if (realUser) {
              delivery.order.user = {
                id: realUser.id,
                email: realUser.email,
                full_name: realUser.full_name,
                role: realUser.role,
                phone: realUser.phone,
                address: realUser.address,
                created_at: realUser.created_at,
                updated_at: realUser.updated_at,
                is_active: realUser.is_active
              }
              hasUpdates = true
            }
          }
        }
      }
      
      if (hasUpdates) {
        localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
      }
    } catch (error) {
      console.error('Failed to sync delivery order data:', error)
    }
  }

  const updateDeliveryStatus = async (
    deliveryId: string,
    status: Delivery['status'],
    deliveryPerson?: string,
    deliveryVehicle?: string,
    extras?: { notes?: string; adminNotes?: string; vendorId?: string }
  ) => {
    loading.value = true
    try {
      const body: Record<string, unknown> = {
        status,
        delivery_person: deliveryPerson ?? '',
        delivery_vehicle: deliveryVehicle ?? ''
      }
      if (extras?.notes !== undefined) body.notes = extras.notes
      if (extras?.adminNotes !== undefined) body.admin_notes = extras.adminNotes

      try {
        const res = await apiService.updateDelivery(deliveryId, body, extras?.vendorId)
        if (res.success && res.data) {
          const normalized = normalizeDelivery(res.data)
          const ix = deliveries.value.findIndex(d => String(d.id) === String(deliveryId))
          if (ix !== -1) deliveries.value[ix] = normalized
          else deliveries.value = [normalized, ...deliveries.value]
          const ord = normalized.order
          if (ord) mergeOrderIntoState(ord)
          localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
          return
        }
      } catch (apiError: any) {
        console.warn('API update delivery failed:', apiError.message)
      }

      const delivery = deliveries.value.find(d => d.id === deliveryId)
      if (delivery) {
        delivery.status = status
        delivery.delivery_person = deliveryPerson || delivery.delivery_person
        delivery.delivery_vehicle = deliveryVehicle || delivery.delivery_vehicle
        if (extras?.notes !== undefined) delivery.notes = extras.notes
        if (extras?.adminNotes !== undefined) delivery.admin_notes = extras.adminNotes
        delivery.updated_at = new Date().toISOString()
        const order = orders.value.find(o => o.id === delivery.order_id)
        if (order) {
          order.delivery_status = status
          if (status === 'delivered') {
            order.delivery_date = new Date().toISOString()
          }
        }
        localStorage.setItem('anihan_deliveries', JSON.stringify(deliveries.value))
        localStorage.setItem('anihan_orders', JSON.stringify(orders.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update delivery status'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    orders,
    vendorOrders,
    deliveries,
    loading,
    error,
    loadProducts,
    loadOrders,
    loadVendorOrders,
    loadDeliveries,
    addProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    placeOrder,
    updateOrderFields,
    updateOrderStatus,
    updateOrderPaymentStatus,
    updateOrderDeliveryStatus,
    updateDeliveryStatus,
    getProductStats,
    getOrderStats
  }
})