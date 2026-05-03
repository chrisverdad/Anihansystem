import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import apiService from '@/services/api'

// Normalize user from API (id may be number)
function normalizeUser(row: any): User {
  return {
    ...row,
    id: String(row?.id ?? ''),
    is_active: row?.is_active !== undefined ? Boolean(row.is_active) : true
  }
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data - Only essential demo accounts
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@anihan.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
      phone: '+63 912 345 6789',
      address: 'Butuan City, Agusan del Norte',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      is_active: true
    },
    {
      id: '2',
      email: 'vendor@anihan.com',
      password: 'vendor123',
      full_name: 'Maria Santos',
      role: 'vendor',
      phone: '+63 912 345 6787',
      address: 'Public Market, Butuan City',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      is_active: true
    },
    {
      id: '3',
      email: 'user@anihan.com',
      password: 'user123',
      full_name: 'Pedro Garcia',
      role: 'user',
      phone: '+63 912 345 6786',
      address: 'Residential Area, Butuan City',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      is_active: true
    },
    {
      id: '4',
      email: 'vendor2@anihan.com',
      password: 'vendor123',
      full_name: 'Juan Dela Cruz',
      role: 'vendor',
      phone: '+63 912 345 6785',
      address: 'Farmers Market, Butuan City',
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
      is_active: true
    },
    {
      id: '5',
      email: 'vendor3@anihan.com',
      password: 'vendor123',
      full_name: 'Ana Rodriguez',
      role: 'vendor',
      phone: '+63 912 345 6784',
      address: 'Central Market, Butuan City',
      created_at: '2024-01-25T00:00:00Z',
      updated_at: '2024-01-25T00:00:00Z',
      is_active: true
    }
  ]

  const loadUsers = async () => {
    loading.value = true
    error.value = null
    try {
      // Prefer API (MySQL) when backend is available
      const response = await apiService.getAllUsers()
      if (response?.success && Array.isArray(response.data)) {
        users.value = response.data.map(normalizeUser)
        return
      }
    } catch (_) {
      // API failed (e.g. not logged in as admin, or server down) — use fallback
    }
    try {
      const storedUsers = localStorage.getItem('anihan_users')
      if (storedUsers) {
        users.value = JSON.parse(storedUsers)
      } else {
        users.value = [...mockUsers]
        localStorage.setItem('anihan_users', JSON.stringify(users.value))
      }
      if (users.value.length === 0) {
        users.value = [...mockUsers]
        localStorage.setItem('anihan_users', JSON.stringify(users.value))
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load users'
      users.value = [...mockUsers]
      localStorage.setItem('anihan_users', JSON.stringify(users.value))
    } finally {
      loading.value = false
    }
  }

  const getUserById = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const user = users.value.find(u => u.id === id)
      if (!user) throw new Error('User not found')
      return user
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      throw err
    }
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    loading.value = true
    error.value = null
    try {
      // Persist to backend (MySQL) so approve/reject and status changes stick
      const response = await apiService.updateUserStatus(id, updates)
      if (response?.success && response.data) {
        const updated = normalizeUser(response.data)
        const index = users.value.findIndex(u => String(u.id) === String(id))
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...updated }
        } else {
          users.value = [updated, ...users.value]
        }
        return updated
      }
      throw new Error('Failed to update user')
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
        // Save to localStorage
        localStorage.setItem('anihan_users', JSON.stringify(users.value))
        return true
      }
      throw new Error('User not found')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleUserStatus = async (id: string) => {
    try {
      const user = users.value.find(u => u.id === id)
      if (!user) throw new Error('User not found')

      return await updateUser(id, { is_active: !user.is_active })
    } catch (err: any) {
      error.value = err.message || 'Failed to toggle user status'
      throw err
    }
  }

  const getUsersByRole = async (role: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      return users.value.filter(user => user.role === role && user.is_active)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users by role'
      throw err
    }
  }

  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    error.value = null
    try {
      // Prefer API so user is stored in MySQL
      const response = await apiService.createUser({
        full_name: userData.full_name,
        email: userData.email,
        password: (userData as any).password || 'changeme123',
        role: userData.role,
        phone: userData.phone || '',
        address: userData.address || ''
      })
      if (response?.success && response.data) {
        const newUser = normalizeUser(response.data)
        users.value = [newUser, ...users.value]
        return newUser
      }
      throw new Error('Failed to create user')
    } catch (err: any) {
      error.value = err.message || 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    loadUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUsersByRole,
    createUser
  }
})