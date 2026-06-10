/**
 * Environment Variables Validation
 * Ensures all required environment variables are set on startup
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DPO_COMPANY_TOKEN',
]

const optionalEnvVars = [
  'NEXT_PUBLIC_ERROR_TRACKING_URL',
  'NEXT_PUBLIC_ANALYTICS_ID',
]

interface EnvValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    valid: true,
    missing: [],
    warnings: [],
  }

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      result.missing.push(envVar)
      result.valid = false
    }
  }

  // Check optional environment variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      result.warnings.push(`Optional environment variable missing: ${envVar}`)
    }
  }

  // Log validation results
  if (process.env.NODE_ENV === 'development') {
    if (result.valid) {
      console.log('✓ All required environment variables are set')
    } else {
      console.error('✗ Missing required environment variables:')
      result.missing.forEach(envVar => console.error(`  - ${envVar}`))
    }

    if (result.warnings.length > 0) {
      console.warn('⚠ Optional environment variables not set:')
      result.warnings.forEach(warning => console.warn(`  - ${warning}`))
    }
  }

  return result
}

/**
 * Get environment variable with type safety
 */
export function getEnv<T = string>(key: string, defaultValue?: T): T {
  const value = process.env[key]

  if (!value && defaultValue === undefined) {
    console.warn(`Environment variable ${key} not found and no default value provided`)
    return undefined as T
  }

  return (value || defaultValue) as T
}

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Validate environment on startup
 */
if (typeof window === 'undefined') {
  // Server-side validation
  validateEnvironment()
}
