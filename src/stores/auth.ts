import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData } from '@/types'
import { useUsersStore } from './users'
import apiService from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isVendor = computed(() => user.value?.role === 'vendor')

  // Initialize auth from localStorage (normalize so id/role are strings)
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('anihan_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        user.value = {
          ...parsed,
          id: String(parsed?.id ?? ''),
          role: String(parsed?.role ?? 'user'),
          is_active: parsed?.is_active !== undefined ? Boolean(parsed.is_active) : true
        }
      } catch (err) {
        localStorage.removeItem('anihan_user')
        localStorage.removeItem('anihan_token')
      }
    }
  }

  const normalizeLoginUser = (u: any): User => ({
    ...u,
    id: String(u?.id ?? ''),
    role: String(u?.role ?? 'user'),
    is_active: u?.is_active !== undefined ? Boolean(u.is_active) : true
  })

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.login(credentials.email, credentials.password)

      if (response.success && response.data && response.data.user && response.data.token) {
        const normalized = normalizeLoginUser(response.data.user)
        user.value = normalized
        apiService.setToken(response.data.token)
        localStorage.setItem('anihan_user', JSON.stringify(normalized))
        return normalized
      }
      throw new Error((response as any).message || 'Login failed - invalid response')
    } catch (apiError: any) {
      console.error('API login error:', apiError)
      error.value = apiError.message || 'Login failed. Please check your credentials.'
      throw new Error(apiError.message || 'Invalid email or password')
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterData, file?: File) => {
    loading.value = true
    error.value = null

    try {
      // Call backend API so user is stored in MySQL
      const response = await apiService.register(userData, file)

      if (!response.success || !response.data) {
        throw new Error((response as any).message || 'Registration failed')
      }

      const { user: newUser, token: newToken } = response.data

      // For regular users, API returns token — log them in
      if (newUser?.role === 'user' && newToken) {
        user.value = newUser as User
        apiService.setToken(newToken)
        localStorage.setItem('anihan_user', JSON.stringify(newUser))
        localStorage.setItem('anihan_token', newToken)
      }
      // Vendors get no token until approved; user is still in MySQL

      return newUser
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      user.value = null
      localStorage.removeItem('anihan_user')
      localStorage.removeItem('anihan_token')
    } catch (err: any) {
      error.value = err.message || 'Logout failed'
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return

    loading.value = true
    try {
      const response = await apiService.updateProfile(updates)
      if (response.success && response.data?.user) {
        const normalized = normalizeLoginUser(response.data.user)
        user.value = normalized
        localStorage.setItem('anihan_user', JSON.stringify(normalized))
        return normalized
      }
      throw new Error((response as { message?: string }).message || 'Profile update failed')
    } catch (err: any) {
      error.value = err.message || 'Profile update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    error.value = null
    try {
      const response = await apiService.changePassword(currentPassword, newPassword)
      if (response.success) return response
      throw new Error((response as { message?: string }).message || 'Failed to change password')
    } catch (err: any) {
      error.value = err.message || 'Failed to change password'
      throw err
    }
  }

  const refreshUser = async () => {
    if (!isAuthenticated.value) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Load fresh user data from users store
      const usersStore = useUsersStore()
      await usersStore.loadUsers()
      
      const freshUser = usersStore.users.find(u => u.id === user.value?.id)
      if (freshUser) {
        const { password, ...userWithoutPassword } = freshUser
        user.value = userWithoutPassword as User
        localStorage.setItem('anihan_user', JSON.stringify(userWithoutPassword))
      } else {
        // User not found, logout
        await logout()
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err)
      // If refresh fails, logout user
      await logout()
    }
  }

  // Admin methods
  const getAllUsers = async () => {
    if (!isAdmin.value) throw new Error('Unauthorized')
    
    loading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const usersStore = useUsersStore()
      await usersStore.loadUsers()
      return usersStore.users
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = async (userId: string, statusData: any) => {
    if (!isAdmin.value) throw new Error('Unauthorized')
    
    loading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const usersStore = useUsersStore()
      const updatedUser = await usersStore.updateUser(userId, statusData)
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Failed to update user status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (userId: string, userData: any, profilePhoto?: File) => {
    if (!isAdmin.value) throw new Error('Unauthorized')
    
    loading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const usersStore = useUsersStore()
      
      // Handle profile photo if provided
      const updates = { ...userData }
      if (profilePhoto) {
        updates.profile_photo = URL.createObjectURL(profilePhoto)
      }
      
      const updatedUser = await usersStore.updateUser(userId, updates)
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId: string) => {
    if (!isAdmin.value) throw new Error('Unauthorized')
    
    loading.value = true
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const usersStore = useUsersStore()
      const result = await usersStore.deleteUser(userId)
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isVendor,
    login,
    register,
    logout,
    initializeAuth,
    updateProfile,
    changePassword,
    refreshUser,
    // Admin methods
    getAllUsers,
    updateUserStatus,
    updateUser,
    deleteUser
  }
})
