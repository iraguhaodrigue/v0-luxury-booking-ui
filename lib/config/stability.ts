/**
 * Global route protection configuration
 * Defines which routes require authentication and their fallback behaviors
 */

export const protectedRoutes = {
  admin: {
    path: '/admin',
    requiresAuth: true,
    fallback: '/auth/login',
    description: 'Admin dashboard access',
  },
  adminProperties: {
    path: '/admin/properties',
    requiresAuth: true,
    fallback: '/auth/login',
    description: 'Manage properties',
  },
  adminBookings: {
    path: '/admin/bookings',
    requiresAuth: true,
    fallback: '/auth/login',
    description: 'View bookings',
  },
}

/**
 * Public routes that don't require auth
 */
export const publicRoutes = [
  '/',
  '/properties',
  '/property',
  '/services',
  '/car-rental',
  '/car',
  '/booking',
  '/contact',
]

/**
 * API routes that require authentication
 */
export const protectedApiRoutes = ['/api/admin', '/api/user']

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  contact: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  booking: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
}

/**
 * Error tracking configuration
 */
export const errorTracking = {
  enabled: true,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  captureStackTrace: true,
}

/**
 * Global timeout configurations (in milliseconds)
 */
export const timeouts = {
  api: 30000, // 30 seconds
  database: 15000, // 15 seconds
  upload: 60000, // 1 minute
}

/**
 * Cache configurations
 */
export const cacheConfig = {
  properties: {
    ttl: 5 * 60, // 5 minutes
    revalidate: true,
  },
  cars: {
    ttl: 5 * 60, // 5 minutes
    revalidate: true,
  },
  services: {
    ttl: 10 * 60, // 10 minutes
    revalidate: true,
  },
}

/**
 * Fallback data for critical operations
 * Used when database is unavailable (should be minimal)
 */
export const fallbackData = {
  properties: null, // No fallback - show empty state
  cars: null, // No fallback - show empty state
  services: null, // No fallback - show empty state
}
