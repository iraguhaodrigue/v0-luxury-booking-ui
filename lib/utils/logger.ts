/**
 * Global logger utility for consistent logging across the application
 * Helps with debugging and production monitoring
 */

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[v0] ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },

  error: (message: string, error?: any) => {
    console.error(`[v0] ❌ ${message}`, error ? JSON.stringify(error, null, 2) : '')
  },

  warn: (message: string, data?: any) => {
    console.warn(`[v0] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },

  success: (message: string, data?: any) => {
    console.log(`[v0] ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[v0] 🐛 ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  },
}

/**
 * Format error message for user display
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error

  if (error?.message) return error.message

  if (error?.error) return error.error

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Safe API call wrapper with automatic error handling
 */
export const safeApiCall = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'API call failed'
): Promise<T> => {
  try {
    const result = await fn()
    return result ?? fallback
  } catch (error) {
    logger.error(errorMessage, error)
    return fallback
  }
}

/**
 * Retry logic for failed operations
 */
export const retryOperation = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      logger.warn(`Retry attempt ${attempt}/${maxRetries} failed`, error)
      if (attempt === maxRetries) throw error
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }
  return null
}

/**
 * Validate required fields
 */
export const validateRequired = (data: Record<string, any>, fields: string[]): boolean => {
  for (const field of fields) {
    if (!data[field]) {
      logger.warn(`Required field missing: ${field}`)
      return false
    }
  }
  return true
}
