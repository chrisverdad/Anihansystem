// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

function getApiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3000'
}

class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('anihan_token')
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const isFormData = options.body instanceof FormData
    const headers: Record<string, string> = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers as Record<string, string>),
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    const config: RequestInit = {
      headers,
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Invalid response format: ${text.substring(0, 100)}`)
      }
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      return data
    } catch (error: any) {
      console.error('API Request failed:', {
        url,
        error: error.message,
        stack: error.stack
      })
      
      // Re-throw with a more descriptive message
      if (error.message) {
        throw error
      } else {
        throw new Error(`Network error: ${error.message || 'Failed to connect to server'}`)
      }
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data.token) {
      this.token = response.data.token
      localStorage.setItem('anihan_token', this.token!)
      localStorage.setItem('anihan_user', JSON.stringify(response.data.user))
    }

    return response
  }

  async register(userData: any, file?: File) {
    const formData = new FormData()
    
    // Only append defined values so backend gets valid strings (no "undefined")
    Object.keys(userData).forEach(key => {
      const val = userData[key]
      if (val !== undefined && val !== null) formData.append(key, String(val))
    })
    
    // Add file if provided
    if (file) {
      formData.append('business_license', file)
    }

    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    if (data.success && data.data.token) {
      this.token = data.data.token
      localStorage.setItem('anihan_token', this.token!)
      localStorage.setItem('anihan_user', JSON.stringify(data.data.user))
    }

    return data
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      this.token = null
      localStorage.removeItem('anihan_token')
      localStorage.removeItem('anihan_user')
    }
  }

  async getCurrentUser() {
    return await this.request('/auth/me')
  }

  async updateProfile(updates: any) {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })

    if (response.success && response.data.user) {
      localStorage.setItem('anihan_user', JSON.stringify(response.data.user))
    }

    return response
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })
  }

  // Admin methods
  async getAllUsers() {
    return await this.request(`/auth/users?_=${Date.now()}`)
  }

  async createUser(userData: { full_name: string; email: string; password: string; role: string; phone?: string; address?: string }) {
    return await this.request('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUserStatus(userId: string, statusData: any) {
    return await this.request(`/auth/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    })
  }

  async updateUser(userId: string, userData: any, profilePhoto?: File) {
    const formData = new FormData()
    
    // Add all user data to FormData
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key])
    })
    
    // Add profile photo if provided
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto)
    }

    const response = await fetch(`${this.baseURL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  async deleteUser(userId: string) {
    return await this.request(`/auth/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Products methods (cache-bust so list refreshes after add/update/delete)
  async getProducts(includeRemoved?: boolean) {
    const qs =
      includeRemoved === true
        ? `?include_removed=1&_=${Date.now()}`
        : `?_=${Date.now()}`
    return await this.request(`/products${qs}`)
  }

  /** Landing / guests: in-stock, not soft-deleted, is_public (see SQL `products.is_public`). */
  async getPublicProducts() {
    return await this.request(`/products?public=1&_=${Date.now()}`)
  }

  async getProduct(id: string, includeRemoved?: boolean) {
    const qs =
      includeRemoved === true ? `?include_removed=1` : ''
    return await this.request(`/products/${id}${qs}`)
  }

  async createProduct(productData: any, imageFile?: File) {
    const formData = new FormData();
    
    // Add all product data to FormData
    Object.keys(productData).forEach(key => {
      if (key !== 'image_file' && key !== 'image_preview') {
        formData.append(key, productData[key]);
      }
    });
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${this.baseURL}/products`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async updateProduct(id: string, productData: any, imageFile?: File) {
    const formData = new FormData();
    
    // Add all product data to FormData
    Object.keys(productData).forEach(key => {
      if (key !== 'image_file' && key !== 'image_preview') {
        formData.append(key, productData[key]);
      }
    });
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async deleteProduct(id: string) {
    return await this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async restoreProduct(id: string) {
    return await this.request(`/products/${id}/restore`, {
      method: 'POST',
    })
  }

  // Orders methods (cache-bust so list refreshes after place order)
  async getOrders(vendorId?: string | number) {
    const base = `/orders?_=${Date.now()}`
    const url =
      vendorId != null && String(vendorId).trim() !== ''
        ? `/orders?vendor_id=${encodeURIComponent(String(vendorId).trim())}&_=${Date.now()}`
        : base
    return await this.request(url)
  }

  async getOrder(id: string) {
    return await this.request(`/orders/${id}`)
  }

  async createOrder(orderData: any) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async updateOrder(id: string, orderData: any) {
    return await this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    })
  }

  async deleteOrder(id: string) {
    return await this.request(`/orders/${id}`, {
      method: 'DELETE',
    })
  }

  async getDeliveries(vendorId?: string) {
    const url =
      vendorId != null && String(vendorId).trim() !== ''
        ? `/deliveries?vendor_id=${encodeURIComponent(String(vendorId).trim())}&_=${Date.now()}`
        : `/deliveries?_=${Date.now()}`
    return await this.request(url)
  }

  async updateDelivery(id: string, body: Record<string, unknown>, vendorId?: string) {
    const qs =
      vendorId != null && String(vendorId).trim() !== ''
        ? `?vendor_id=${encodeURIComponent(String(vendorId).trim())}`
        : ''
    return await this.request(`/deliveries/${id}${qs}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  // Waste methods
  async getWasteTypes() {
    return await this.request('/waste/types')
  }

  async getWasteCategories() {
    return await this.request(`/waste/categories?_=${Date.now()}`)
  }

  async createWasteCategory(categoryData: any) {
    return await this.request('/waste/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  }

  async updateWasteCategory(id: string, categoryData: any) {
    return await this.request(`/waste/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteWasteCategory(id: string) {
    return await this.request(`/waste/categories/${id}`, {
      method: 'DELETE',
    })
  }

  async getWasteSubmissions() {
    return await this.request(`/waste/submissions?_=${Date.now()}`)
  }

  async createWasteSubmission(submissionData: any) {
    return await this.request('/waste/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    })
  }

  async updateWasteSubmission(id: string, submissionData: any) {
    return await this.request(`/waste/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    })
  }

  async deleteWasteSubmission(id: string) {
    return await this.request(`/waste/submissions/${id}`, {
      method: 'DELETE',
    })
  }

  async getSourceWasteSubmissions() {
    return await this.request(`/waste/source-submissions?_=${Date.now()}`)
  }

  async createSourceWasteSubmission(submissionData: any | FormData) {
    const body = submissionData instanceof FormData
      ? submissionData
      : JSON.stringify(submissionData)
    return await this.request('/waste/source-submissions', {
      method: 'POST',
      body,
    })
  }

  async updateSourceWasteSubmission(id: string, submissionData: any | FormData) {
    const body = submissionData instanceof FormData
      ? submissionData
      : JSON.stringify(submissionData)
    return await this.request(`/waste/source-submissions/${id}`, {
      method: 'PUT',
      body,
    })
  }

  async deleteSourceWasteSubmission(id: string) {
    return await this.request(`/waste/source-submissions/${id}`, {
      method: 'DELETE',
    })
  }

  async getInventoryItems() {
    return await this.request(`/waste/inventory?_=${Date.now()}`)
  }

  async createInventoryItem(itemData: any | FormData) {
    const body = itemData instanceof FormData ? itemData : JSON.stringify(itemData)
    return await this.request('/waste/inventory', {
      method: 'POST',
      body,
    })
  }

  async updateInventoryItem(id: string, itemData: any | FormData) {
    const body = itemData instanceof FormData ? itemData : JSON.stringify(itemData)
    return await this.request(`/waste/inventory/${id}`, {
      method: 'PUT',
      body,
    })
  }

  async deleteInventoryItem(id: string) {
    return await this.request(`/waste/inventory/${id}`, {
      method: 'DELETE',
    })
  }

  // Health lives at server root (/health), not under /api/v1
  async healthCheck() {
    const url = `${getApiOrigin()}/health`
    const response = await fetch(url)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || `Health check failed (${response.status})`)
    }
    return data
  }

  // Token management
  setToken(token: string) {
    this.token = token
    localStorage.setItem('anihan_token', token)
  }

  getToken() {
    return this.token
  }

  async uploadFile(formData: FormData) {
    const url = `${this.baseURL}/uploads`
    const headers: Record<string, string> = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`)
      }
      
      return data
    } catch (error: any) {
      console.error('File upload failed:', error.message)
      throw error
    }
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('anihan_token')
  }
}

export const apiService = new ApiService()
export default apiService
