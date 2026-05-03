// Image utility functions for handling blob URLs and image management

/**
 * Check if a URL is a blob URL
 */
export const isBlobUrl = (url: string): boolean => {
  return Boolean(url && url.startsWith('blob:'))
}

/**
 * Check if a URL is a data URL (base64)
 */
export const isDataUrl = (url: string): boolean => {
  return Boolean(url && url.startsWith('data:'))
}

/**
 * Check if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  return !isBlobUrl(url) && (url.startsWith('http') || url.startsWith('/') || isDataUrl(url))
}

/**
 * Get a safe fallback image URL
 */
export const getFallbackImageUrl = (): string => {
  return '/placeholder-image.svg'
}

/**
 * Convert file to base64 data URL
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Create a temporary blob URL for preview (should not be stored)
 */
export const createPreviewBlobUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

/**
 * Revoke a blob URL to free memory
 */
export const revokeBlobUrl = (url: string): void => {
  if (isBlobUrl(url)) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Clean up blob URLs from an object recursively
 */
export const cleanupBlobUrls = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanupBlobUrls(item))
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (key.includes('image') || key.includes('photo') || key.includes('url')) {
        // Check if this is an image-related field
        if (typeof value === 'string' && isBlobUrl(value)) {
          cleaned[key] = getFallbackImageUrl()
        } else {
          cleaned[key] = cleanupBlobUrls(value)
        }
      } else {
        cleaned[key] = cleanupBlobUrls(value)
      }
    }
    return cleaned
  }
  
  return obj
}

/**
 * Migrate blob URLs in localStorage data
 */
export const migrateBlobUrlsInStorage = (): void => {
  const keys = Object.keys(localStorage)
  let totalFixed = 0

  keys.forEach(key => {
    if (key.startsWith('anihan_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '')
        if (Array.isArray(data)) {
          let hasUpdates = false
          data.forEach(item => {
            const cleaned = cleanupBlobUrls(item)
            if (JSON.stringify(cleaned) !== JSON.stringify(item)) {
              Object.assign(item, cleaned)
              hasUpdates = true
              totalFixed++
            }
          })
          if (hasUpdates) {
            localStorage.setItem(key, JSON.stringify(data))
          }
        }
      } catch (e) {
        // Skip non-JSON data
      }
    }
  })

  if (totalFixed > 0) {
    console.log(`✅ Fixed ${totalFixed} broken blob URLs in localStorage`)
  }
}

/**
 * Get a safe image URL, replacing blob URLs with fallback.
 * Delegates to getImageUrl so /uploads/... paths hit the API origin (not the Vite dev server).
 */
export const getSafeImageUrl = (url?: string): string => {
  if (!url || !String(url).trim()) return getFallbackImageUrl()
  if (isBlobUrl(url)) return getFallbackImageUrl()
  return getImageUrl(url)
}

/**
 * Get backend origin (no trailing slash)
 */
export function getBackendOrigin(): string {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) return base.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
  return 'http://localhost:3000'
}

/**
 * Get full URL for a document path (e.g. /uploads/users/file.pdf) so it opens from backend
 */
export function getDocumentUrl(path?: string): string {
  if (!path || String(path).trim() === '') return ''
  const raw = String(path).trim().replace(/\\/g, '/')
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const normalized = raw.startsWith('/') ? raw : `/${raw}`
  return `${getBackendOrigin()}${normalized}`
}

/** Max length for data URLs we trust (DB often truncates to 500; valid base64 images are much longer) */
const MAX_SAFE_DATA_URL_LENGTH = 600

/**
 * Get the full image URL - converts relative paths to backend URLs
 * Returns placeholder for truncated/invalid data URLs (e.g. from VARCHAR(500) DB column)
 */
export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || String(imageUrl).trim() === '') return getFallbackImageUrl()
  let raw = String(imageUrl).trim().replace(/\\/g, '/')
  if (raw.startsWith('uploads/')) raw = `/${raw}`

  // Served from Vite public/, not the API — avoid prefixing with backend origin
  if (
    raw === '/placeholder-image.svg' ||
    raw === '/placeholder-image.png' ||
    raw === 'placeholder-image.svg' ||
    raw === 'placeholder-image.png'
  ) {
    return raw.startsWith('/') ? raw : `/${raw}`
  }

  // If it's already a full URL (http/https), return as is
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw
  }
  
  // If it's a blob URL, return as is
  if (isBlobUrl(raw)) {
    return raw
  }
  
  // Data URL: use only if likely complete (not truncated by DB). Truncated base64 causes ERR_INVALID_URL.
  if (isDataUrl(raw)) {
    if (raw.length <= MAX_SAFE_DATA_URL_LENGTH) return getFallbackImageUrl()
    return raw
  }
  
  // Bare filename (no path) - assume /images/ so backend can serve from public/photos
  const hasPath = raw.includes('/')
  const normalized = raw.startsWith('/') ? raw : (hasPath ? `/${raw}` : `/images/${raw}`)
  
  // For relative paths, use the backend URL (photos, images, uploads)
  if (normalized.startsWith('/photos/') || normalized.startsWith('/images/') || normalized.startsWith('/uploads/')) {
    const backendUrl = getBackendOrigin()
    const pathParts = normalized.split('/').filter(Boolean)
    const filename = pathParts[pathParts.length - 1]
    const encodedFilename = encodeURIComponent(filename)
    const encodedPath = pathParts.slice(0, -1).join('/') + '/' + encodedFilename
    return `${backendUrl}/${encodedPath}`
  }
  
  return `${getBackendOrigin()}${normalized}`
}