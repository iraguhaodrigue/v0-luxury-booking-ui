'use client'

import { useEffect, useState } from 'react'
import { PropertyCard } from './property-card'
import { FilterSidebar } from './filter-sidebar'
import { SAMPLE_PROPERTIES } from '@/lib/constants/rwanda-data'
import { createClient } from '@/lib/supabase/client'

interface Property {
  id: number
  name: string
  property_type: string
  base_price_per_night: number
  location: string
  images: string[]
  amenities: string[]
  description: string
}

export function PropertyGrid() {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('properties')
          .select('*')

        if (error) throw error
        if (data && data.length > 0) {
          setAllProperties(data)
          setFilteredProperties(data)
        } else {
          // Fallback to sample data
          setAllProperties(SAMPLE_PROPERTIES as any)
          setFilteredProperties(SAMPLE_PROPERTIES as any)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        // Fallback to sample data on error
        setAllProperties(SAMPLE_PROPERTIES as any)
        setFilteredProperties(SAMPLE_PROPERTIES as any)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleFiltersChange = (filters: any) => {
    let filtered = allProperties

    // Location filter
    if (filters.location && filters.location !== '') {
      filtered = filtered.filter((prop) => prop.location === filters.location)
    }

    // Type filter
    if (filters.propertyType && filters.propertyType !== '') {
      filtered = filtered.filter((prop) => prop.property_type === filters.propertyType)
    }

    // Price filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (prop) =>
          prop.base_price_per_night >= filters.priceRange[0] &&
          prop.base_price_per_night <= filters.priceRange[1]
      )
    }

    setFilteredProperties(filtered)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center py-16">
          <div className="text-muted-foreground">Loading properties...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar onFiltersChange={handleFiltersChange} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Available Properties
            </h2>
            <p className="text-muted-foreground">
              Found {filteredProperties.length} properties
            </p>
          </div>

          {/* Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    name: property.name,
                    location: property.location,
                    price_per_night: property.base_price_per_night,
                    base_price_per_night: property.base_price_per_night,
                    rating: 4.8,
                    reviews: 120,
                    capacity: 4,
                    images: property.images,
                    amenities: property.amenities || []
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No properties found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
