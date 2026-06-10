/**
 * KILUVA Platform Configuration
 * Central configuration for the luxury booking and marketplace platform
 */

export const kiluvConfig = {
  // App metadata
  app: {
    name: 'KILUVA',
    description: 'Africa\'s premiere luxury booking and marketplace platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: 'support@kiluva.com',
  },

  // Feature flags
  features: {
    bookings: true,
    marketplace: true,
    messaging: true,
    payments: true,
    admin: true,
    analytics: true,
  },

  // Payment configuration
  payment: {
    provider: 'dpo-group',
    currency: 'USD',
    serviceFee: 0.1, // 10% service fee
    minBookingAmount: 50,
  },

  // Booking configuration
  booking: {
    minStay: 1,
    maxStay: 365,
    cancellationDays: 7, // Days before booking to allow free cancellation
    confirmationTimeout: 48, // Hours for owner to confirm
  },

  // Search configuration
  search: {
    pageSize: 20,
    maxDistance: 100, // km
    sortOptions: ['relevance', 'price-low', 'price-high', 'rating', 'newest'],
  },

  // Admin configuration
  admin: {
    approvalRequired: true,
    verificationRequired: true,
    maxUploadSize: 10 * 1024 * 1024, // 10MB
  },

  // Security configuration
  security: {
    passwordMinLength: 8,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Rate limiting
  rateLimit: {
    searchLimit: 100, // requests per minute
    apiLimit: 1000, // requests per minute
    uploadLimit: 10, // uploads per hour
  },

  // Regions/Countries
  regions: [
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'GH', name: 'Ghana', currency: 'GHS' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
    { code: 'UG', name: 'Uganda', currency: 'UGX' },
    { code: 'RW', name: 'Rwanda', currency: 'RWF' },
    { code: 'ET', name: 'Ethiopia', currency: 'ETB' },
  ],

  // Amenities
  amenities: [
    'WiFi',
    'Kitchen',
    'Air Conditioning',
    'Washer',
    'Dryer',
    'Parking',
    'Elevator',
    'Swimming Pool',
    'Gym',
    'TV',
    'Microwave',
    'Dishwasher',
    'Heating',
    'Terrace',
    'Garden',
  ],

  // Product categories
  productCategories: [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Handicrafts',
    'Home & Garden',
    'Beauty & Health',
    'Sports & Outdoors',
    'Services',
    'Books & Media',
    'Other',
  ],

  // Booking types
  bookingTypes: ['nightly', 'weekly', 'monthly'],

  // Sorting options
  sortBy: [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
  ],
}

export default kiluvConfig
