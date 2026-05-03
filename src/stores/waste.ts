import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WasteSubmission, WasteType, InventoryItem, QuantityHistory, WasteCategory, SourceWasteSubmission } from '@/types'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'
import apiService from '@/services/api'
import { DEMO_WASTE_TYPE_IMAGES, resolveDemoImageUrl } from '@/constants/demoMedia'
import { convertFileToBase64 } from '@/utils/imageUtils'

function normalizeSourceSubmission(row: any): SourceWasteSubmission {
  const sub = { ...row }
  sub.id = String(row?.id ?? '')
  if (typeof sub.image_url === 'string') {
    sub.image_url = resolveDemoImageUrl(sub.image_url.trim())
  }
  if (row?.vendor_id != null && typeof row.vendor_id === 'object') {
    sub.vendor_id = String(row.vendor_id.id ?? row.vendor_id)
    sub.vendor = row.vendor_id
  } else {
    sub.vendor_id = String(row?.vendor_id ?? '')
  }
  if (row?.category_id != null && typeof row.category_id === 'object') {
    sub.category_id = String(row.category_id.id ?? row.category_id)
    sub.category = row.category_id
  } else {
    sub.category_id = String(row?.category_id ?? '')
  }
  // No admin approval: legacy pending/rejected rows are treated as scheduled (approved)
  let st = row?.status
  if (st === 'pending' || st === 'rejected') st = 'approved'
  if (!st || !['approved', 'collected', 'processed'].includes(st)) st = 'approved'
  sub.status = st
  delete (sub as any).pickup_date
  return sub as SourceWasteSubmission
}

function normalizeWasteCategory(row: any): WasteCategory {
  return {
    ...row,
    id: String(row?.id ?? ''),
    is_active: row?.is_active === true || row?.is_active === 1,
    created_at: row?.created_at ?? new Date().toISOString(),
    updated_at: row?.updated_at ?? new Date().toISOString()
  }
}

function normalizeWasteTypeRow(row: any): WasteType {
  const rawImg = String(row?.image_url ?? '').trim()
  return {
    id: String(row?.id ?? ''),
    name: String(row?.name ?? ''),
    description: String(row?.description ?? ''),
    image_url: rawImg ? resolveDemoImageUrl(rawImg) : '',
    category: (row?.category ?? 'other') as WasteType['category'],
    damage_level: (row?.damage_level ?? 'moderate') as WasteType['damage_level']
  }
}

function normalizeInventoryItem(row: any): InventoryItem {
  const item: any = {
    ...row,
    id: String(row?.id ?? ''),
    vendor_id: typeof row?.vendor_id === 'object' ? String(row.vendor_id?.id ?? row.vendor_id) : String(row?.vendor_id ?? ''),
    quantity: Number(row?.quantity) ?? 0,
    price_per_unit: Number(row?.price_per_unit) ?? 0,
    total_value: Number(row?.total_value) ?? 0,
    is_available: row?.is_available === true || row?.is_available === 1,
    created_at: row?.created_at ?? new Date().toISOString(),
    updated_at: row?.updated_at ?? new Date().toISOString(),
    image_url: (() => {
      const u = row?.image_url != null ? String(row.image_url).trim() : ''
      return u ? resolveDemoImageUrl(u) : ''
    })()
  }
  if (row?.source_waste_submission_id != null && typeof row.source_waste_submission_id === 'object') {
    item.source_waste_submission_id = String(row.source_waste_submission_id?.id ?? row.source_waste_submission_id)
  } else if (row?.source_waste_submission_id != null) {
    item.source_waste_submission_id = String(row.source_waste_submission_id)
  }
  if (item.quantity_history && typeof item.quantity_history === 'string') {
    try {
      item.quantity_history = JSON.parse(item.quantity_history)
    } catch (_) {
      item.quantity_history = []
    }
  }
  return item as InventoryItem
}

export const useWasteStore = defineStore('waste', () => {
  const submissions = ref<WasteSubmission[]>([])
  const wasteTypes = ref<WasteType[]>([])
  const inventoryItems = ref<InventoryItem[]>([])
  const wasteCategories = ref<WasteCategory[]>([])
  const productCategories = ref<Array<{id: string, name: string, description: string}>>([
    { id: 'compost', name: 'Compost', description: 'Organic compost made from waste materials' },
    { id: 'fertilizer', name: 'Fertilizer', description: 'Natural fertilizers derived from waste' },
    { id: 'preserved_food', name: 'Preserved Food', description: 'Food products preserved from waste materials' },
    { id: 'processed_food', name: 'Processed Food', description: 'Processed food items made from waste' },
    { id: 'other', name: 'Other', description: 'Other products made from waste materials' }
  ])
  const sourceWasteSubmissions = ref<SourceWasteSubmission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data
  const mockWasteCategories: WasteCategory[] = [
    {
      id: '1',
      name: 'Fruits',
      description: 'Fresh and processed fruits',
      color: '#f59e0b',
      icon: 'SunIcon',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Vegetables',
      description: 'Fresh and processed vegetables',
      color: '#10b981',
      icon: 'SunIcon',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Grains',
      description: 'Rice, wheat, and other grains',
      color: '#8b5cf6',
      icon: 'CubeIcon',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  const mockSourceWasteSubmissions: SourceWasteSubmission[] = [
    {
      id: '1',
      vendor_id: '2',
      category_id: '1',
      title: 'Overripe Bananas',
      description: 'Bananas from yesterday\'s harvest that are too ripe for sale',
      quantity: 25,
      unit: 'kg',
      condition: 'overripe',
      location: 'Public Market, Butuan City',
      estimated_value: 500,
      image_url: DEMO_WASTE_TYPE_IMAGES.bananas,
      status: 'approved',
      submitted_at: '2024-12-15T18:30:00Z',
      category: mockWasteCategories[0],
      vendor: {
        id: '2',
        email: 'vendor@anihan.com',
        full_name: 'Maria Santos',
        role: 'vendor',
        phone: '+63 912 345 6787',
        address: 'Public Market, Butuan City',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        is_active: true
      }
    },
    {
      id: '2',
      vendor_id: '4',
      category_id: '2',
      title: 'Bruised Tomatoes',
      description: 'Tomatoes with minor bruises from transport',
      quantity: 15,
      unit: 'pieces',
      condition: 'slightly_damaged',
      location: 'Farmers Market, Butuan City',
      estimated_value: 300,
      image_url: DEMO_WASTE_TYPE_IMAGES.tomatoes,
      status: 'approved',
      submitted_at: '2024-12-15T00:45:00Z',
      category: mockWasteCategories[1],
      vendor: {
        id: '4',
        email: 'vendor2@anihan.com',
        full_name: 'Juan Dela Cruz',
        role: 'vendor',
        phone: '+63 912 345 6785',
        address: 'Farmers Market, Butuan City',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
        is_active: true
      }
    },
    {
      id: '3',
      vendor_id: '5',
      category_id: '1',
      title: 'Overripe Papayas',
      description: 'Papayas that are too soft for sale',
      quantity: 8,
      unit: 'pieces',
      condition: 'bruised',
      location: 'Central Market, Butuan City',
      estimated_value: 200,
      image_url: DEMO_WASTE_TYPE_IMAGES.papayas,
      status: 'processed',
      submitted_at: '2024-12-13T17:15:00Z',
      processed_at: '2024-12-13T19:30:00Z',
      category: mockWasteCategories[0],
      vendor: {
        id: '5',
        email: 'vendor3@anihan.com',
        full_name: 'Ana Rodriguez',
        role: 'vendor',
        phone: '+63 912 345 6784',
        address: 'Central Market, Butuan City',
        created_at: '2024-01-25T00:00:00Z',
        updated_at: '2024-01-25T00:00:00Z',
        is_active: true
      }
    }
  ]

  const mockWasteTypes: WasteType[] = [
    {
      id: '1',
      name: 'Overripe Bananas',
      description: 'Bananas that are too ripe for sale',
      image_url: DEMO_WASTE_TYPE_IMAGES.bananas,
      category: 'fruit',
      damage_level: 'moderate'
    },
    {
      id: '2',
      name: 'Bruised Tomatoes',
      description: 'Tomatoes with minor bruises',
      image_url: DEMO_WASTE_TYPE_IMAGES.tomatoes,
      category: 'vegetable',
      damage_level: 'slight'
    },
    {
      id: '3',
      name: 'Overripe Papayas',
      description: 'Papayas that are too soft for sale',
      image_url: DEMO_WASTE_TYPE_IMAGES.papayas,
      category: 'fruit',
      damage_level: 'moderate'
    },
    {
      id: '4',
      name: 'Wilted Lettuce',
      description: 'Lettuce that has started to wilt',
      image_url: DEMO_WASTE_TYPE_IMAGES.lettuce,
      category: 'vegetable',
      damage_level: 'moderate'
    },
    {
      id: '5',
      name: 'Tomato Fertilizer',
      description: 'Organic fertilizer made from processed tomatoes',
      image_url: DEMO_WASTE_TYPE_IMAGES.tomatoFertilizer,
      category: 'vegetable',
      damage_level: 'moderate'
    },
    {
      id: '6',
      name: 'Overripe Papayas',
      description: 'Papayas that are too soft for sale',
      image_url: DEMO_WASTE_TYPE_IMAGES.papayas,
      category: 'fruit',
      damage_level: 'moderate'
    },
    {
      id: '7',
      name: 'Banana Compost',
      description: 'Compost made from overripe bananas',
      image_url: DEMO_WASTE_TYPE_IMAGES.compost,
      category: 'fruit',
      damage_level: 'moderate'
    },
    {
      id: '8',
      name: 'Vegetable Compost',
      description: 'Compost blend from assorted vegetable waste',
      image_url: DEMO_WASTE_TYPE_IMAGES.vegetableCompost,
      category: 'vegetable',
      damage_level: 'moderate'
    }
  ]

  const mockSubmissions: WasteSubmission[] = [
    {
      id: '1',
      user_id: '2',
      waste_type_id: '1',
      quantity: 25,
      unit: 'kg',
      description: 'Bananas from yesterday\'s harvest',
      status: 'pending',
      submitted_at: '2024-12-15T18:30:00Z',
      createdAt: '2024-12-15T18:30:00Z',
      title: 'Overripe Bananas',
      category: 'fruit',
      condition: 'overripe',
      user: {
        id: '2',
        email: 'vendor@anihan.com',
        full_name: 'Maria Santos',
        role: 'vendor',
        phone: '+63 912 345 6787',
        address: 'Public Market, Butuan City',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        is_active: true
      },
      waste_type: mockWasteTypes[0]
    },
    {
      id: '2',
      user_id: '2',
      waste_type_id: '2',
      quantity: 15,
      unit: 'pieces',
      description: 'Tomatoes with minor bruises',
      status: 'approved',
      submitted_at: '2024-12-15T00:45:00Z',
      createdAt: '2024-12-15T00:45:00Z',
      title: 'Bruised Tomatoes',
      category: 'vegetable',
      condition: 'slightly_damaged',
      user: {
        id: '2',
        email: 'vendor@anihan.com',
        full_name: 'Maria Santos',
        role: 'vendor',
        phone: '+63 912 345 6787',
        address: 'Public Market, Butuan City',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        is_active: true
      },
      waste_type: mockWasteTypes[1]
    },
    {
      id: '3',
      user_id: '2',
      waste_type_id: '3',
      quantity: 8,
      unit: 'pieces',
      description: 'Mangoes damaged during transport',
      status: 'processed',
      submitted_at: '2024-12-13T17:15:00Z',
      createdAt: '2024-12-13T17:15:00Z',
      processed_at: '2024-12-13T19:30:00Z',
      title: 'Damaged Mangoes',
      category: 'fruit',
      condition: 'bruised',
      user: {
        id: '2',
        email: 'vendor@anihan.com',
        full_name: 'Maria Santos',
        role: 'vendor',
        phone: '+63 912 345 6787',
        address: 'Public Market, Butuan City',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        is_active: true
      },
      waste_type: mockWasteTypes[2]
    },
    {
      id: '4',
      user_id: '2',
      waste_type_id: '4',
      quantity: 12,
      unit: 'pieces',
      description: 'Lettuce that has started to wilt',
      status: 'rejected',
      submitted_at: '2024-12-12T22:20:00Z',
      createdAt: '2024-12-12T22:20:00Z',
      title: 'Wilted Lettuce',
      category: 'vegetable',
      condition: 'overripe',
      user: {
        id: '2',
        email: 'vendor@anihan.com',
        full_name: 'Maria Santos',
        role: 'vendor',
        phone: '+63 912 345 6787',
        address: 'Public Market, Butuan City',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        is_active: true
      },
      waste_type: mockWasteTypes[3]
    },
    {
      id: '5',
      user_id: '2',
      waste_type_id: '1',
      quantity: 20,
      unit: 'pieces',
      description: 'Overripe bananas from current user',
      status: 'processed',
      submitted_at: '2024-10-24T17:00:00Z',
      createdAt: '2024-10-24T17:00:00Z',
      processed_at: '2024-10-24T19:00:00Z',
      title: 'Overripe Bananas',
      category: 'fruit',
      condition: 'overripe',
      user: {
        id: '9',
        email: 'vendor3@example.com',
        full_name: 'Carlos Rodriguez',
        role: 'vendor',
        phone: '+63 912 345 6780',
        address: 'Butuan City, Agusan del Norte',
        created_at: '2024-10-24T00:00:00Z',
        updated_at: '2024-10-24T00:00:00Z',
        is_active: true
      },
      waste_type: mockWasteTypes[0]
    },
    {
      id: '6',
      user_id: '2',
      waste_type_id: '2',
      quantity: 30,
      unit: 'kg',
      description: 'Bruised tomatoes from current user',
      status: 'processed',
      submitted_at: '2024-10-24T16:00:00Z',
      createdAt: '2024-10-24T16:00:00Z',
      processed_at: '2024-10-24T18:00:00Z',
      title: 'Bruised Tomatoes',
      category: 'vegetable',
      condition: 'slightly_damaged',
      user: {
        id: '9',
        email: 'vendor3@example.com',
        full_name: 'Carlos Rodriguez',
        role: 'vendor',
        phone: '+63 912 345 6780',
        address: 'Butuan City, Agusan del Norte',
        created_at: '2024-10-24T00:00:00Z',
        updated_at: '2024-10-24T00:00:00Z',
        is_active: true
      },
      waste_type: mockWasteTypes[1]
    }
  ]

  const mockInventoryItems: InventoryItem[] = [
    {
      id: '1',
      vendor_id: '2',
      product_name: 'Banana Compost',
      description: 'High-quality compost made from overripe bananas',
      category: 'compost',
      quantity: 50,
      unit: 'kg',
      price_per_unit: 25,
      total_value: 1250,
      source_waste_submission_id: '1',
      image_url: DEMO_WASTE_TYPE_IMAGES.compost,
      is_available: true,
      created_at: '2024-12-13T11:30:00Z',
      updated_at: '2024-12-13T11:30:00Z',
      waste_submission: mockSubmissions[0],
      quantity_history: [
        {
          id: '1',
          inventory_item_id: '1',
          adjustment_type: 'set',
          quantity_change: 50,
          previous_quantity: 0,
          new_quantity: 50,
          reason: 'Initial inventory creation',
          adjusted_by: 'Maria Santos',
          adjusted_at: '2024-12-13T11:30:00Z',
          notes: 'Created from processed banana waste'
        }
      ]
    }
  ]

  /** Removed from demo catalog; refresh cached localStorage if still present */
  const OBSOLETE_WASTE_TYPE_NAMES = new Set([
    'Dairy Products',
    'Grains',
    'Mango Jam',
    'Meat Products',
    'Damaged Mangoes',
    'Damaged Apples',
    'Mixed Vegetables'
  ])
  const OBSOLETE_INVENTORY_PRODUCT_NAMES = new Set([
    'Mango Jam'
  ])

  function wasteTypesNeedMockRefresh(list: WasteType[]): boolean {
    if (list.length === 0) return true
    if (list.length !== mockWasteTypes.length) return true
    return list.some(wt => OBSOLETE_WASTE_TYPE_NAMES.has(wt.name))
  }

  const loadWasteTypes = async () => {
    loading.value = true
    const applyImageMigration = (list: WasteType[]) => {
      list.forEach((wt: any) => {
        if (wt.image_url) wt.image_url = resolveDemoImageUrl(String(wt.image_url))
      })
      return list.filter(wt => !OBSOLETE_WASTE_TYPE_NAMES.has(wt.name))
    }

    try {
      try {
        const response = await apiService.getWasteTypes()
        if (response.success && response.data && Array.isArray(response.data)) {
          let list = (response.data as any[]).map(normalizeWasteTypeRow)
          list = applyImageMigration(list)
          wasteTypes.value = list
          localStorage.setItem('anihan_waste_types', JSON.stringify(wasteTypes.value))
          if (wasteTypes.value.length === 0) {
            wasteTypes.value = [...mockWasteTypes]
            localStorage.setItem('anihan_waste_types', JSON.stringify(wasteTypes.value))
          }
          return wasteTypes.value
        }
      } catch (apiError: any) {
        console.warn('API load waste types failed, using localStorage:', apiError.message)
      }

      const storedWasteTypes = localStorage.getItem('anihan_waste_types')
      if (storedWasteTypes) {
        wasteTypes.value = JSON.parse(storedWasteTypes)
        wasteTypes.value.forEach((wt: any) => {
          if (wt.image_url) wt.image_url = resolveDemoImageUrl(String(wt.image_url))
        })
        if (wasteTypesNeedMockRefresh(wasteTypes.value)) {
          wasteTypes.value = [...mockWasteTypes]
        }
        wasteTypes.value = applyImageMigration(wasteTypes.value as WasteType[])
        if (wasteTypes.value.length === 0) {
          wasteTypes.value = [...mockWasteTypes]
        }
        localStorage.setItem('anihan_waste_types', JSON.stringify(wasteTypes.value))
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
        wasteTypes.value = [...mockWasteTypes]
        localStorage.setItem('anihan_waste_types', JSON.stringify(wasteTypes.value))
      }

      if (wasteTypesNeedMockRefresh(wasteTypes.value)) {
        wasteTypes.value = [...mockWasteTypes]
        localStorage.setItem('anihan_waste_types', JSON.stringify(wasteTypes.value))
      }

      return wasteTypes.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load waste types'
      wasteTypes.value = [...mockWasteTypes]
      localStorage.setItem('anihan_waste_types', JSON.stringify(wasteTypes.value))
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadSubmissions = async () => {
    loading.value = true
    try {
      try {
        const response = await apiService.getWasteSubmissions()
        if (response.success && response.data) {
          submissions.value = (response.data as any[]).map((row: any) => ({
            ...row,
            id: String(row?.id ?? ''),
            user_id: row?.user_id != null ? String(row.user_id) : row?.user_id,
            waste_type_id: row?.waste_type_id != null ? String(row.waste_type_id) : row?.waste_type_id
          })) as WasteSubmission[]
          localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
          await syncWasteUserData()
          return
        }
      } catch (apiError: any) {
        console.warn('API load waste submissions failed, using localStorage:', apiError.message)
      }
      const storedSubmissions = localStorage.getItem('anihan_submissions')
      if (storedSubmissions) {
        submissions.value = JSON.parse(storedSubmissions)
        await syncWasteUserData()
      } else {
        submissions.value = [...mockSubmissions]
        localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
      }
      if (submissions.value.length === 0) {
        submissions.value = [...mockSubmissions]
        localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load submissions'
      submissions.value = [...mockSubmissions]
      localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
    } finally {
      loading.value = false
    }
  }

  const syncWasteUserData = async () => {
    try {
      const usersStore = useUsersStore()
      await usersStore.loadUsers()
      const allUsers = usersStore.users
      
      let hasUpdates = false
      
      for (const submission of submissions.value) {
        // If submission has hardcoded user data, try to find the real user
        if (submission.user && (submission.user.email === 'vendor3@example.com' || submission.user.full_name === 'Carlos Rodriguez')) {
          const realUser = allUsers.find((u: any) => u.id === submission.user_id)
          if (realUser) {
            submission.user = {
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
        localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
      }
    } catch (error) {
      console.error('Failed to sync waste user data:', error)
    }
  }

  const submitWaste = async (submissionData: Omit<WasteSubmission, 'id' | 'submitted_at' | 'status' | 'user' | 'waste_type'>) => {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const currentUser = authStore.user
      if (!currentUser) throw new Error('User not authenticated')
      const wasteType = wasteTypes.value.find(wt => String(wt.id) === String(submissionData.waste_type_id))
      if (!wasteType) throw new Error('Waste type not found')
      const payload = {
        user_id: Number(currentUser.id) || currentUser.id,
        waste_type_id: Number(submissionData.waste_type_id) || submissionData.waste_type_id,
        quantity: Number(submissionData.quantity) || 0,
        unit: submissionData.unit,
        description: submissionData.description || '',
        status: 'pending',
        title: (submissionData as any).title || '',
        category: (submissionData as any).category || '',
        condition: (submissionData as any).condition || ''
      }
      try {
        const response = await apiService.createWasteSubmission(payload)
        if (response.success && response.data) {
          const row = response.data as any
          const newSubmission: WasteSubmission = {
            ...row,
            id: String(row?.id ?? ''),
            user_id: row?.user_id,
            waste_type_id: row?.waste_type_id,
            status: row?.status ?? 'pending',
            submitted_at: row?.submitted_at ?? new Date().toISOString(),
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
            waste_type: wasteType
          }
          submissions.value = [newSubmission, ...submissions.value]
          localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
          return newSubmission
        }
      } catch (apiError: any) {
        console.warn('API create waste submission failed:', apiError.message)
      }
      const newSubmission: WasteSubmission = {
        ...submissionData,
        id: (submissions.value.length + 1).toString(),
        status: 'pending',
        submitted_at: new Date().toISOString(),
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
        waste_type: wasteType
      }
      submissions.value = [newSubmission, ...submissions.value]
      localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
      return newSubmission
    } catch (err: any) {
      error.value = err.message || 'Failed to submit waste'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWasteStatus = async (id: string, status: WasteSubmission['status']) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = submissions.value.findIndex(submission => submission.id === id)
      if (index !== -1) {
        submissions.value[index] = {
          ...submissions.value[index],
          status,
          processed_at: status === 'processed' ? new Date().toISOString() : submissions.value[index].processed_at
        }
        // Save to localStorage
        localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
        return submissions.value[index]
      }
      throw new Error('Submission not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to update waste status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWaste = async (id: string) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = submissions.value.findIndex(submission => submission.id === id)
      if (index !== -1) {
        submissions.value.splice(index, 1)
        // Save to localStorage
        localStorage.setItem('anihan_submissions', JSON.stringify(submissions.value))
        return true
      }
      throw new Error('Submission not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete waste submission'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getWasteStats = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return {
        total: submissions.value.length,
        pending: submissions.value.filter(s => s.status === 'pending').length,
        approved: submissions.value.filter(s => s.status === 'approved').length,
        processed: submissions.value.filter(s => s.status === 'processed').length,
        rejected: submissions.value.filter(s => s.status === 'rejected').length,
        totalQuantity: submissions.value.reduce((sum, s) => sum + s.quantity, 0)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch waste stats'
      throw err
    }
  }

  const loadInventoryItems = async () => {
    loading.value = true
    try {
      try {
        const response = await apiService.getInventoryItems()
        if (response.success && response.data) {
          inventoryItems.value = (response.data as any[]).map(normalizeInventoryItem)
          localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
          return
        }
      } catch (apiError: any) {
        console.warn('API load inventory items failed, using localStorage:', apiError.message)
      }
      const storedInventory = localStorage.getItem('anihan_inventory')
      if (storedInventory) {
        const parsed = JSON.parse(storedInventory) as InventoryItem[]
        inventoryItems.value = parsed.filter(
          item => !OBSOLETE_INVENTORY_PRODUCT_NAMES.has(String(item.product_name))
        )
        if (parsed.length !== inventoryItems.value.length) {
          localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
        }
      } else {
        inventoryItems.value = [...mockInventoryItems]
        localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
      }
      if (inventoryItems.value.length === 0) {
        inventoryItems.value = [...mockInventoryItems]
        localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load inventory items'
      inventoryItems.value = [...mockInventoryItems]
      localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
    } finally {
      loading.value = false
    }
  }

  const refreshCatalogAfterSourceSubmissionChange = async () => {
    try {
      await loadInventoryItems()
    } catch {
      /* ignore */
    }
    try {
      const { useProductsStore } = await import('./products')
      await useProductsStore().loadProducts()
    } catch {
      /* ignore */
    }
  }

  const addToInventory = async (inventoryData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'total_value'> & { image_file?: File }) => {
    loading.value = true
    try {
      const totalValue = (Number(inventoryData.quantity) || 0) * (Number(inventoryData.price_per_unit) || 0)
      let payload: Record<string, any> | FormData
      if (inventoryData.image_file instanceof File) {
        const form = new FormData()
        form.append('vendor_id', String(inventoryData.vendor_id ?? ''))
        form.append('product_name', inventoryData.product_name ?? '')
        form.append('description', inventoryData.description ?? '')
        form.append('category', inventoryData.category ?? '')
        form.append('quantity', String(inventoryData.quantity ?? 0))
        form.append('unit', inventoryData.unit ?? 'kg')
        form.append('price_per_unit', String(inventoryData.price_per_unit ?? 0))
        form.append('total_value', String(totalValue))
        form.append('source_waste_submission_id', String(inventoryData.source_waste_submission_id ?? ''))
        form.append('is_available', inventoryData.is_available !== false ? 'true' : 'false')
        form.append('image', inventoryData.image_file)
        payload = form
      } else {
        payload = {
          vendor_id: Number(inventoryData.vendor_id) || inventoryData.vendor_id,
          product_name: inventoryData.product_name,
          description: inventoryData.description,
          category: inventoryData.category,
          quantity: Number(inventoryData.quantity) || 0,
          unit: inventoryData.unit,
          price_per_unit: Number(inventoryData.price_per_unit) || 0,
          total_value: totalValue,
          source_waste_submission_id: inventoryData.source_waste_submission_id || null,
          image_url: inventoryData.image_url || '',
          is_available: inventoryData.is_available !== false
        }
      }
      try {
        const response = await apiService.createInventoryItem(payload)
        if (response.success && response.data) {
          const newItem = normalizeInventoryItem(response.data)
          inventoryItems.value = [newItem, ...inventoryItems.value]
          localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
          return newItem
        }
      } catch (apiError: any) {
        console.warn('API create inventory item failed:', apiError.message)
      }
      let sourceSubmission = undefined
      if (inventoryData.source_waste_submission_id) {
        sourceSubmission = submissions.value.find(s => String(s.id) === String(inventoryData.source_waste_submission_id))
      }
      const newInventoryItem: InventoryItem = {
        ...inventoryData,
        id: (inventoryItems.value.length + 1).toString(),
        total_value: totalValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        waste_submission: sourceSubmission
      }
      inventoryItems.value = [newInventoryItem, ...inventoryItems.value]
      localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
      return newInventoryItem
    } catch (err: any) {
      error.value = err.message || 'Failed to add item to inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem> & { image_file?: File }) => {
    loading.value = true
    try {
      let payload: Record<string, any> | FormData
      if (updates.image_file instanceof File) {
        const form = new FormData()
        form.append('product_name', String(updates.product_name ?? ''))
        form.append('description', String(updates.description ?? ''))
        form.append('category', String(updates.category ?? ''))
        form.append('quantity', String(updates.quantity ?? 0))
        form.append('unit', String(updates.unit ?? 'kg'))
        form.append('price_per_unit', String(updates.price_per_unit ?? 0))
        form.append('total_value', String(updates.total_value ?? 0))
        form.append('source_waste_submission_id', String(updates.source_waste_submission_id ?? ''))
        form.append('is_available', updates.is_available !== false ? 'true' : 'false')
        form.append('image', updates.image_file)
        payload = form
      } else {
        payload = { ...updates }
        delete payload.image_file
        if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity)
        if (payload.price_per_unit !== undefined) payload.price_per_unit = Number(payload.price_per_unit)
        if (payload.quantity !== undefined && payload.price_per_unit !== undefined) {
          payload.total_value = payload.quantity * payload.price_per_unit
        } else if (payload.quantity !== undefined || payload.price_per_unit !== undefined) {
          const idx = inventoryItems.value.findIndex(item => String(item.id) === String(id))
          if (idx !== -1) {
            const q = payload.quantity ?? inventoryItems.value[idx].quantity
            const p = payload.price_per_unit ?? inventoryItems.value[idx].price_per_unit
            payload.total_value = q * p
          }
        }
        if (payload.is_available !== undefined) payload.is_available = Boolean(payload.is_available)
      }
      try {
        const response = await apiService.updateInventoryItem(id, payload)
        if (response.success && response.data) {
          const updated = normalizeInventoryItem(response.data)
          const index = inventoryItems.value.findIndex(item => String(item.id) === String(id))
          if (index !== -1) inventoryItems.value[index] = updated
          else inventoryItems.value = [updated, ...inventoryItems.value]
          localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
          return updated
        }
      } catch (apiError: any) {
        console.warn('API update inventory item failed:', apiError.message)
      }
      const index = inventoryItems.value.findIndex(item => String(item.id) === String(id))
      if (index !== -1) {
        inventoryItems.value[index] = {
          ...inventoryItems.value[index],
          ...updates,
          updated_at: new Date().toISOString(),
          total_value: updates.quantity != null && updates.price_per_unit != null
            ? updates.quantity * updates.price_per_unit
            : (updates.quantity != null ? updates.quantity * inventoryItems.value[index].price_per_unit : (updates.price_per_unit != null ? inventoryItems.value[index].quantity * updates.price_per_unit : inventoryItems.value[index].total_value))
        }
        localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
        return inventoryItems.value[index]
      }
      throw new Error('Inventory item not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to update inventory item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteInventoryItem = async (id: string) => {
    loading.value = true
    try {
      try {
        await apiService.deleteInventoryItem(id)
        const index = inventoryItems.value.findIndex(item => String(item.id) === String(id))
        if (index !== -1) {
          inventoryItems.value.splice(index, 1)
          localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
        }
        return true
      } catch (apiError: any) {
        console.warn('API delete inventory item failed:', apiError.message)
      }
      const index = inventoryItems.value.findIndex(item => String(item.id) === String(id))
      if (index !== -1) {
        inventoryItems.value.splice(index, 1)
        localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
        return true
      }
      throw new Error('Inventory item not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete inventory item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const adjustInventoryQuantity = async (
    inventoryItemId: string, 
    adjustmentType: 'add' | 'subtract' | 'set',
    quantityChange: number,
    reason: string,
    adjustedBy: string,
    notes?: string
  ) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = inventoryItems.value.findIndex(item => item.id === inventoryItemId)
      if (index === -1) throw new Error('Inventory item not found')
      
      const item = inventoryItems.value[index]
      const previousQuantity = item.quantity
      let newQuantity: number
      
      switch (adjustmentType) {
        case 'add':
          newQuantity = previousQuantity + quantityChange
          break
        case 'subtract':
          newQuantity = Math.max(0, previousQuantity - quantityChange)
          break
        case 'set':
          newQuantity = quantityChange
          break
        default:
          throw new Error('Invalid adjustment type')
      }
      
      // Create quantity history entry
      const historyEntry: QuantityHistory = {
        id: `${inventoryItemId}-${Date.now()}`,
        inventory_item_id: inventoryItemId,
        adjustment_type: adjustmentType,
        quantity_change: adjustmentType === 'set' ? newQuantity : quantityChange,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason,
        adjusted_by: adjustedBy,
        adjusted_at: new Date().toISOString(),
        notes
      }
      
      // Update inventory item
      inventoryItems.value[index] = {
        ...item,
        quantity: newQuantity,
        total_value: newQuantity * item.price_per_unit,
        updated_at: new Date().toISOString(),
        quantity_history: [...(item.quantity_history || []), historyEntry]
      }
      
      // Save to localStorage
      localStorage.setItem('anihan_inventory', JSON.stringify(inventoryItems.value))
      return inventoryItems.value[index]
    } catch (err: any) {
      error.value = err.message || 'Failed to adjust inventory quantity'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Waste Category Management
  const loadWasteCategories = async () => {
    loading.value = true
    try {
      try {
        const response = await apiService.getWasteCategories()
        if (response.success && response.data) {
          wasteCategories.value = (response.data as any[]).map(normalizeWasteCategory)
          localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
          return
        }
      } catch (apiError: any) {
        console.warn('API load waste categories failed, using localStorage:', apiError.message)
      }
      const storedCategories = localStorage.getItem('anihan_waste_categories')
      if (storedCategories) {
        wasteCategories.value = JSON.parse(storedCategories)
      } else {
        wasteCategories.value = [...mockWasteCategories]
        localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
      }
      if (wasteCategories.value.length === 0) {
        wasteCategories.value = [...mockWasteCategories]
        localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load waste categories'
      wasteCategories.value = [...mockWasteCategories]
      localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
    } finally {
      loading.value = false
    }
  }

  const createWasteCategory = async (categoryData: Omit<WasteCategory, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    try {
      const payload = {
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        icon: categoryData.icon,
        is_active: categoryData.is_active !== false
      }
      try {
        const response = await apiService.createWasteCategory(payload)
        if (response.success && response.data) {
          const newCategory = normalizeWasteCategory(response.data)
          wasteCategories.value = [newCategory, ...wasteCategories.value]
          localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
          return newCategory
        }
      } catch (apiError: any) {
        console.warn('API create waste category failed:', apiError.message)
      }
      const newCategory: WasteCategory = {
        id: (wasteCategories.value.length + 1).toString(),
        ...categoryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      wasteCategories.value = [newCategory, ...wasteCategories.value]
      localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
      return newCategory
    } catch (err: any) {
      error.value = err.message || 'Failed to create waste category'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWasteCategory = async (id: string, updates: Partial<WasteCategory>) => {
    loading.value = true
    try {
      const payload: Record<string, any> = { ...updates }
      if (payload.is_active !== undefined) payload.is_active = Boolean(payload.is_active)
      try {
        const response = await apiService.updateWasteCategory(id, payload)
        if (response.success && response.data) {
          const updated = normalizeWasteCategory(response.data)
          const index = wasteCategories.value.findIndex(c => String(c.id) === String(id))
          if (index !== -1) wasteCategories.value[index] = updated
          else wasteCategories.value = [updated, ...wasteCategories.value]
          localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
          return updated
        }
      } catch (apiError: any) {
        console.warn('API update waste category failed:', apiError.message)
      }
      const index = wasteCategories.value.findIndex(category => String(category.id) === String(id))
      if (index !== -1) {
        wasteCategories.value[index] = {
          ...wasteCategories.value[index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
        return wasteCategories.value[index]
      }
      throw new Error('Waste category not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to update waste category'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWasteCategory = async (id: string) => {
    loading.value = true
    try {
      try {
        await apiService.deleteWasteCategory(id)
        const index = wasteCategories.value.findIndex(c => String(c.id) === String(id))
        if (index !== -1) {
          wasteCategories.value.splice(index, 1)
          localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
        }
        return true
      } catch (apiError: any) {
        console.warn('API delete waste category failed:', apiError.message)
      }
      const index = wasteCategories.value.findIndex(category => String(category.id) === String(id))
      if (index !== -1) {
        wasteCategories.value.splice(index, 1)
        localStorage.setItem('anihan_waste_categories', JSON.stringify(wasteCategories.value))
        return true
      }
      throw new Error('Waste category not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete waste category'
      throw err
    } finally {
      loading.value = false
    }
  }


  // Product Category Management
  const loadProductCategories = async () => {
    loading.value = true
    try {
      // Check localStorage first
      const storedCategories = localStorage.getItem('anihan_product_categories')
      if (storedCategories) {
        productCategories.value = JSON.parse(storedCategories)
      } else {
        await new Promise(resolve => setTimeout(resolve, 200))
        // Keep default categories
        localStorage.setItem('anihan_product_categories', JSON.stringify(productCategories.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load product categories'
    } finally {
      loading.value = false
    }
  }

  const createProductCategory = async (categoryData: {name: string, description: string}) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newCategory = {
        id: (productCategories.value.length + 1).toString(),
        name: categoryData.name,
        description: categoryData.description
      }
      
      productCategories.value.push(newCategory)
      localStorage.setItem('anihan_product_categories', JSON.stringify(productCategories.value))
      return newCategory
    } catch (err: any) {
      error.value = err.message || 'Failed to create product category'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProductCategory = async (categoryId: string, categoryData: {name: string, description: string}) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = productCategories.value.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        productCategories.value[index] = {
          ...productCategories.value[index],
          ...categoryData
        }
        localStorage.setItem('anihan_product_categories', JSON.stringify(productCategories.value))
        return productCategories.value[index]
      }
      throw new Error('Category not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to update product category'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProductCategory = async (categoryId: string) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = productCategories.value.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        productCategories.value.splice(index, 1)
        localStorage.setItem('anihan_product_categories', JSON.stringify(productCategories.value))
        return true
      }
      throw new Error('Category not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete product category'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper function to sync vendor data for submissions
  const syncVendorDataForSubmissions = async () => {
    try {
      // Load users to get vendor data
      const storedUsers = localStorage.getItem('anihan_users')
      if (!storedUsers) return
      
      const users = JSON.parse(storedUsers)
      
      // Update submissions with vendor data
      sourceWasteSubmissions.value = sourceWasteSubmissions.value.map(submission => {
        if (!submission.vendor && submission.vendor_id) {
          const vendor = users.find(
            (user: any) => String(user.id) === String(submission.vendor_id)
          )
          if (vendor) {
            return {
              ...submission,
              vendor: {
                id: vendor.id,
                email: vendor.email,
                full_name: vendor.full_name,
                role: vendor.role,
                phone: vendor.phone,
                address: vendor.address,
                created_at: vendor.created_at,
                updated_at: vendor.updated_at,
                is_active: vendor.is_active
              }
            }
          }
        }
        return submission
      })
      
      // Save updated submissions
      localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
    } catch (error) {
      console.error('Failed to sync vendor data:', error)
    }
  }

  // Source Waste Submission Management
  const loadSourceWasteSubmissions = async () => {
    loading.value = true
    try {
      try {
        const response = await apiService.getSourceWasteSubmissions()
        if (response.success && response.data) {
          sourceWasteSubmissions.value = (response.data as any[]).map(normalizeSourceSubmission)
          localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
          await syncVendorDataForSubmissions()
          return
        }
      } catch (apiError: any) {
        console.warn('API load source waste submissions failed, using localStorage:', apiError.message)
      }
      const storedSubmissions = localStorage.getItem('anihan_source_waste_submissions')
      if (storedSubmissions) {
        try {
          const parsed = JSON.parse(storedSubmissions)
          sourceWasteSubmissions.value = Array.isArray(parsed)
            ? parsed.map(normalizeSourceSubmission)
            : []
          localStorage.setItem(
            'anihan_source_waste_submissions',
            JSON.stringify(sourceWasteSubmissions.value)
          )
        } catch {
          sourceWasteSubmissions.value = []
        }
      } else {
        sourceWasteSubmissions.value = mockSourceWasteSubmissions.map(normalizeSourceSubmission)
        localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
      }
      if (sourceWasteSubmissions.value.length === 0) {
        sourceWasteSubmissions.value = mockSourceWasteSubmissions.map(normalizeSourceSubmission)
        localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
      }
      await syncVendorDataForSubmissions()
    } catch (err: any) {
      error.value = err.message || 'Failed to load source waste submissions'
      sourceWasteSubmissions.value = mockSourceWasteSubmissions.map(normalizeSourceSubmission)
      localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
    } finally {
      loading.value = false
    }
  }

  const createSourceWasteSubmission = async (submissionData: any) => {
    loading.value = true
    try {
      let payload: Record<string, any> | FormData
      if (submissionData.image_file instanceof File) {
        const form = new FormData()
        form.append('uploadType', 'waste')
        form.append('vendor_id', String(submissionData.vendor_id ?? ''))
        form.append('category_id', String(submissionData.category_id ?? ''))
        form.append('title', submissionData.title ?? '')
        form.append('description', submissionData.description ?? '')
        form.append('quantity', String(submissionData.quantity ?? 0))
        form.append('unit', submissionData.unit ?? '')
        form.append('condition', submissionData.condition ?? '')
        form.append('location', submissionData.location ?? '')
        form.append('estimated_value', String(submissionData.estimated_value ?? 0))
        form.append('status', 'approved')
        form.append('image', submissionData.image_file)
        payload = form
      } else {
        payload = {
          vendor_id: Number(submissionData.vendor_id) || submissionData.vendor_id,
          category_id: Number(submissionData.category_id) || submissionData.category_id,
          title: submissionData.title,
          description: submissionData.description,
          quantity: Number(submissionData.quantity) || 0,
          unit: submissionData.unit,
          condition: submissionData.condition,
          location: submissionData.location,
          estimated_value: Number(submissionData.estimated_value) || 0,
          image_url: '',
          status: 'approved'
        }
      }
      const response = await apiService.createSourceWasteSubmission(payload)
      if (response.success && response.data) {
        const newSubmission = normalizeSourceSubmission(response.data)
        sourceWasteSubmissions.value = [newSubmission, ...sourceWasteSubmissions.value]
        localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
        void refreshCatalogAfterSourceSubmissionChange()
        return newSubmission
      }
      throw new Error((response as { message?: string }).message || 'Failed to save submission to the server.')
    } catch (err: any) {
      error.value = err.message || 'Failed to create source waste submission'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSourceWasteSubmission = async (id: string, updates: any) => {
    loading.value = true
    try {
      let payload: Record<string, any> | FormData
      if (updates.image_file instanceof File) {
        const form = new FormData()
        form.append('uploadType', 'waste')
        form.append('title', updates.title ?? '')
        form.append('description', updates.description ?? '')
        form.append('quantity', String(updates.quantity ?? 0))
        form.append('unit', updates.unit ?? '')
        form.append('condition', updates.condition ?? '')
        form.append('location', updates.location ?? '')
        form.append('estimated_value', String(updates.estimated_value ?? 0))
        form.append('status', updates.status ?? 'approved')
        form.append('image', updates.image_file)
        payload = form
      } else {
        const recordPayload: Record<string, any> = { ...updates }
        delete recordPayload.image_file
        delete recordPayload.image_preview
        delete recordPayload.vendor
        delete recordPayload.category
        if (recordPayload.category_id !== undefined) recordPayload.category_id = Number(recordPayload.category_id) || recordPayload.category_id
        if (recordPayload.estimated_value !== undefined) recordPayload.estimated_value = Number(recordPayload.estimated_value)
        if (recordPayload.quantity !== undefined) recordPayload.quantity = Number(recordPayload.quantity)
        payload = recordPayload
      }
      try {
        const response = await apiService.updateSourceWasteSubmission(id, payload)
        if (response.success && response.data) {
          const updated = normalizeSourceSubmission(response.data)
          const index = sourceWasteSubmissions.value.findIndex(sub => String(sub.id) === String(id))
          if (index !== -1) sourceWasteSubmissions.value[index] = updated
          else sourceWasteSubmissions.value = [updated, ...sourceWasteSubmissions.value]
          localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
          return updated
        }
      } catch (apiError: any) {
        console.warn('API update source waste submission failed:', apiError.message)
      }
      const index = sourceWasteSubmissions.value.findIndex(submission => String(submission.id) === String(id))
      if (index !== -1) {
        const category = wasteCategories.value.find(cat => cat.id === updates.category_id)
        let imageUrl = sourceWasteSubmissions.value[index].image_url
        if (updates.image_file) {
          try {
            imageUrl = await convertFileToBase64(updates.image_file) || imageUrl
          } catch (_) {}
        }
        sourceWasteSubmissions.value[index] = {
          ...sourceWasteSubmissions.value[index],
          ...updates,
          category,
          image_url: imageUrl
        }
        localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
        return sourceWasteSubmissions.value[index]
      }
      throw new Error('Source waste submission not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to update source waste submission'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSourceWasteSubmission = async (id: string) => {
    loading.value = true
    try {
      try {
        await apiService.deleteSourceWasteSubmission(id)
        const index = sourceWasteSubmissions.value.findIndex(sub => String(sub.id) === String(id))
        if (index !== -1) {
          sourceWasteSubmissions.value.splice(index, 1)
          localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
        }
        void refreshCatalogAfterSourceSubmissionChange()
        return true
      } catch (apiError: any) {
        console.warn('API delete source waste submission failed:', apiError.message)
      }
      const index = sourceWasteSubmissions.value.findIndex(submission => String(submission.id) === String(id))
      if (index !== -1) {
        sourceWasteSubmissions.value.splice(index, 1)
        localStorage.setItem('anihan_source_waste_submissions', JSON.stringify(sourceWasteSubmissions.value))
        void refreshCatalogAfterSourceSubmissionChange()
        return true
      }
      throw new Error('Source waste submission not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete source waste submission'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Real API methods for waste management
  const fetchWastes = async () => {
    // Always use localStorage data, no backend calls
    loading.value = true
    error.value = null
    try {
      await loadSubmissions()
      return { wastes: submissions.value }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch wastes'
      return null
    } finally {
      loading.value = false
    }
  }

  const submitWasteToAPI = async (wasteData: any) => {
    // Always use localStorage data, no backend calls
    loading.value = true
    error.value = null
    try {
      // Get current user ID from auth store
      const authStore = useAuthStore()
      const currentUserId = authStore.user?.id || '2'
      
      // Use mock data submission instead of API
      const newSubmission = await submitWaste({
        waste_type_id: wasteData.waste_type_id || '1',
        quantity: wasteData.quantity,
        unit: wasteData.unit,
        description: wasteData.description,
        user_id: currentUserId
      })
      
      // Refresh submissions
      await loadSubmissions()
      return { success: true, data: { waste: newSubmission } }
    } catch (err: any) {
      error.value = err.message || 'Failed to submit waste'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateWasteStatusAPI = async (id: string, statusData: any) => {
    // Always use localStorage data, no backend calls
    loading.value = true
    error.value = null
    try {
      // Use mock data update instead of API
      const updatedSubmission = await updateWasteStatus(id, statusData)
      return { success: true, data: { waste: updatedSubmission } }
    } catch (err: any) {
      error.value = err.message || 'Failed to update waste status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWasteAPI = async (id: string) => {
    // Always use localStorage data, no backend calls
    loading.value = true
    error.value = null
    try {
      // Use mock data delete instead of API
      await deleteWaste(id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete waste'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchWasteStats = async () => {
    // Always use localStorage data, no backend calls
    loading.value = true
    error.value = null
    try {
      // Use mock data stats instead of API
      const stats = getWasteStats()
      return stats
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch waste stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    submissions,
    wasteTypes,
    inventoryItems,
    wasteCategories,
    productCategories,
    sourceWasteSubmissions,
    loading,
    error,
    loadWasteTypes,
    loadSubmissions,
    submitWaste,
    updateWasteStatus,
    deleteWaste,
    getWasteStats,
    loadInventoryItems,
    addToInventory,
    updateInventoryItem,
    deleteInventoryItem,
    adjustInventoryQuantity,
    loadWasteCategories,
    createWasteCategory,
    updateWasteCategory,
    deleteWasteCategory,
    loadProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    loadSourceWasteSubmissions,
    syncVendorDataForSubmissions,
    createSourceWasteSubmission,
    updateSourceWasteSubmission,
    deleteSourceWasteSubmission,
    // Real API methods
    fetchWastes,
    submitWasteToAPI,
    updateWasteStatusAPI,
    deleteWasteAPI,
    fetchWasteStats
  }
})