// Optimized query helpers for database performance
// Only select needed columns to reduce data transfer

export const querySelectors = {
  // Properties - minimal set for listings
  propertiesListing: 'id,name,base_price_per_night,images,location,property_type,city,status',
  
  // Properties - full for detail pages
  propertiesFull: 'id,name,base_price_per_night,description,images,location,city,country,property_type,total_rooms,amenities,is_active,created_at',
  
  // Cars - minimal set for listings (include image_url as primary image source)
  carsListing: 'id,make,model,year,price_per_day,capacity,transmission,fuel_type,image_url,images,status',
  
  // Cars - full for detail pages (description column does NOT exist in cars table)
  carsFull: 'id,make,model,year,price_per_day,capacity,transmission,fuel_type,image_url,images,status,created_at,color,mileage_limit,license_plate',
  
  // Services - minimal set for listings
  servicesListing: 'id,name,service_type,category,price_per_day,description,image_url,is_active',
  
  // Services - full for detail pages
  servicesFull: 'id,name,service_type,category,price_per_day,description,image_url,max_guests_per_day,is_active,created_at',
  
  // Messages - for admin view
  messagesAdmin: 'id,name,sender_email,message,read_by_admin,created_at',
}

// Cached query results with TTL
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const queryCache = new QueryCache()

// Optimized query builder
export const createOptimizedQuery = (supabase: any, table: string, selector: string) => {
  return supabase
    .from(table)
    .select(selector, { count: 'estimated' })
}

// Helper to handle double fetches
export const memoizeQuery = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> => {
  // Check cache first
  const cached = queryCache.get<T>(key)
  if (cached) {
    console.log(`[v0] Cache hit for ${key}`)
    return cached
  }

  console.log(`[v0] Cache miss for ${key}, fetching...`)
  const data = await fetcher()
  queryCache.set(key, data, ttlSeconds)
  return data
}
