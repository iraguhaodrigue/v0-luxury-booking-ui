/**
 * Analytics Service
 * Track user events, conversions, and platform metrics
 */

export interface AnalyticsEvent {
  event: string
  userId?: string
  properties?: Record<string, any>
  timestamp?: Date
}

export const analyticsService = {
  /**
   * Track page view
   */
  trackPageView(path: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    this.trackEvent('page_view', {
      path,
      title: document.title,
      ...properties,
    })
  },

  /**
   * Track user event
   */
  trackEvent(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...properties,
      },
    }

    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    if (window.gtag) {
      window.gtag('event', event, properties)
    }

    console.log('[Analytics]', event, properties)
  },

  /**
   * Track property view
   */
  trackPropertyView(propertyId: number, propertyName: string) {
    this.trackEvent('property_viewed', {
      propertyId,
      propertyName,
    })
  },

  /**
   * Track product view
   */
  trackProductView(productId: number, productName: string) {
    this.trackEvent('product_viewed', {
      productId,
      productName,
    })
  },

  /**
   * Track booking started
   */
  trackBookingStarted(propertyId: number, checkInDate: string, checkOutDate: string) {
    this.trackEvent('booking_started', {
      propertyId,
      checkInDate,
      checkOutDate,
    })
  },

  /**
   * Track booking completed
   */
  trackBookingCompleted(bookingId: number, amount: number) {
    this.trackEvent('booking_completed', {
      bookingId,
      amount,
    })
  },

  /**
   * Track product added to cart
   */
  trackAddToCart(productId: number, productName: string, price: number) {
    this.trackEvent('add_to_cart', {
      productId,
      productName,
      price,
    })
  },

  /**
   * Track search
   */
  trackSearch(query: string, resultCount: number) {
    this.trackEvent('search', {
      query,
      resultCount,
    })
  },

  /**
   * Track user signup
   */
  trackSignup(userType: 'buyer' | 'seller') {
    this.trackEvent('signup', {
      userType,
    })
  },

  /**
   * Track user login
   */
  trackLogin(userType: 'buyer' | 'seller') {
    this.trackEvent('login', {
      userType,
    })
  },

  /**
   * Set user properties
   */
  setUserProperties(userId: string, properties: Record<string, any>) {
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        ...properties,
      })
    }
  },
}

// Global type augmentation for analytics
declare global {
  interface Window {
    gtag?: Function
  }
}
