/**
 * Advanced Search Service
 * Handles full-text search, filtering, and faceted search for properties and products
 */

import { createClient } from '@/lib/supabase/client'

export interface SearchFilters {
  query?: string
  minPrice?: number
  maxPrice?: number
  category?: string
  country?: string
  rating?: number
  amenities?: string[]
  type?: 'property' | 'product'
  offset?: number
  limit?: number
}

export interface SearchResult {
  id: number
  name: string
  description: string
  price: number
  image: string
  type: 'property' | 'product'
  rating?: number
  location?: string
}

export const searchService = {
  /**
   * Search properties and products with advanced filtering
   */
  async search(filters: SearchFilters): Promise<SearchResult[]> {
    const supabase = createClient()
    const {
      query,
      minPrice,
      maxPrice,
      category,
      country,
      offset = 0,
      limit = 20,
    } = filters

    let propertiesQuery = supabase
      .from('properties')
      .select('id, name, description, base_price_per_night, image_url, average_rating, location')
      .eq('is_active', true)

    let productsQuery = supabase
      .from('products')
      .select('id, name, description, price, image_url, rating, shop:shops(name)')
      .eq('is_active', true)

    // Apply price filters
    if (minPrice !== undefined) {
      propertiesQuery = propertiesQuery.gte('base_price_per_night', minPrice)
      productsQuery = productsQuery.gte('price', minPrice)
    }

    if (maxPrice !== undefined) {
      propertiesQuery = propertiesQuery.lte('base_price_per_night', maxPrice)
      productsQuery = productsQuery.lte('price', maxPrice)
    }

    // Apply location/country filter
    if (country) {
      propertiesQuery = propertiesQuery.ilike('country', `%${country}%`)
    }

    // Apply category filter for products
    if (category && filters.type === 'product') {
      productsQuery = productsQuery.eq('category', category)
    }

    // Apply search query (full-text search)
    if (query) {
      propertiesQuery = propertiesQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      )
      productsQuery = productsQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    const [propertiesResult, productsResult] = await Promise.all([
      propertiesQuery.range(offset, offset + limit - 1),
      productsQuery.range(offset, offset + limit - 1),
    ])

    const results: SearchResult[] = []

    if (propertiesResult.data) {
      results.push(
        ...propertiesResult.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.base_price_per_night,
          image: p.image_url,
          type: 'property' as const,
          rating: p.average_rating,
          location: p.location,
        }))
      )
    }

    if (productsResult.data) {
      results.push(
        ...productsResult.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image_url,
          type: 'product' as const,
          rating: p.rating,
        }))
      )
    }

    return results
  },

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    const supabase = createClient()

    const { data: properties } = await supabase
      .from('properties')
      .select('name')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(limit)

    const { data: products } = await supabase
      .from('products')
      .select('name')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(limit)

    const suggestions = new Set<string>()
    properties?.forEach(p => suggestions.add(p.name))
    products?.forEach(p => suggestions.add(p.name))

    return Array.from(suggestions).slice(0, limit)
  },

  /**
   * Get search facets for filtering
   */
  async getFacets(): Promise<{
    categories: string[]
    countries: string[]
    priceRanges: { min: number; max: number }[]
  }> {
    const supabase = createClient()

    const { data: categories } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .distinct()

    const { data: countries } = await supabase
      .from('properties')
      .select('country')
      .eq('is_active', true)
      .distinct()

    return {
      categories: categories?.map(c => c.category).filter(Boolean) || [],
      countries: countries?.map(c => c.country).filter(Boolean) || [],
      priceRanges: [
        { min: 0, max: 100 },
        { min: 100, max: 500 },
        { min: 500, max: 1000 },
        { min: 1000, max: 5000 },
      ],
    }
  },
}
