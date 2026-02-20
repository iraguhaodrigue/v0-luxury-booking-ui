'use client'

import { useState } from 'react'
import { PropertyCard } from './property-card'
import { FilterSidebar } from './filter-sidebar'
import { SAMPLE_PROPERTIES } from '@/lib/constants/rwanda-data'

export function PropertyGrid() {
  const [filteredProperties, setFilteredProperties] = useState(SAMPLE_PROPERTIES)

  const handleFiltersChange = (filters: any) => {
    let filtered = SAMPLE_PROPERTIES

    // Location filter
    if (filters.location && filters.location !== '') {
      filtered = filtered.filter((prop) => prop.location === filters.location)
    }

    // Type filter
    if (filters.propertyType && filters.propertyType !== '') {
      filtered = filtered.filter((prop) => prop.type === filters.propertyType)
    }

    // Price filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (prop) =>
          prop.price_per_night >= filters.priceRange[0] &&
          prop.price_per_night <= filters.priceRange[1]
      )
    }

    setFilteredProperties(filtered)
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
                  property={property}
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
