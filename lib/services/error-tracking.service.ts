/**
 * Error Tracking Service
 * Centralized error logging and reporting
 */

export interface ErrorLog {
  id: string
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

class ErrorTracker {
  private errors: ErrorLog[] = []
  private maxErrors = 100

  /**
   * Log an error
   */
  logError(
    message: string,
    error?: Error | unknown,
    context?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    const errorLog: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      timestamp: new Date(),
      severity,
      resolved: false,
    }

    this.errors.push(errorLog)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}] ${message}`, error, context)
    }

    // Send to error tracking service (Sentry, Rollbar, etc.)
    this.sendToExternalService(errorLog)

    return errorLog.id
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: Record<string, any>) {
    return this.logError(message, undefined, context, 'low')
  }

  /**
   * Log a critical error
   */
  logCritical(message: string, error?: Error | unknown, context?: Record<string, any>) {
    return this.logError(message, error, context, 'critical')
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorLog[] {
    return [...this.errors]
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: string): ErrorLog[] {
    return this.errors.filter(e => e.severity === severity)
  }

  /**
   * Resolve an error
   */
  resolveError(id: string) {
    const error = this.errors.find(e => e.id === id)
    if (error) {
      error.resolved = true
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = []
  }

  /**
   * Send error to external service
   */
  private async sendToExternalService(errorLog: ErrorLog) {
    try {
      // Send to your error tracking service
      // Example: Sentry, Rollbar, Datadog, etc.
      if (process.env.NEXT_PUBLIC_ERROR_TRACKING_URL) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_TRACKING_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorLog),
        })
      }
    } catch (error) {
      console.error('[v0] Failed to send error to tracking service:', error)
    }
  }
}

export const errorTracker = new ErrorTracker()

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.logError(
      event.message,
      event.error,
      { filename: event.filename, lineno: event.lineno },
      'high'
    )
  })

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.logError(
      'Unhandled Promise Rejection',
      event.reason,
      undefined,
      'high'
    )
  })
}
