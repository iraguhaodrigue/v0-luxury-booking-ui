'use client'

import Link from 'next/link'
import { PropertyCard } from './property-card'

interface RelatedPropertiesProps {
  currentPropertyId: number
  properties: any[]
  propertyType?: string
}

export function RelatedProperties({
  currentPropertyId,
  properties,
  propertyType,
}: RelatedPropertiesProps) {
  // Filter out current property and optionally filter by type
  let filtered = properties.filter((p) => p.id !== currentPropertyId)

  if (propertyType) {
    filtered = filtered.filter((p) => p.type === propertyType)
  }

  // Get up to 4 related properties
  const related = filtered.slice(0, 4)

  if (related.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          More Luxury Properties
        </h2>
        <p className="text-muted-foreground mb-8">
          Discover other exceptional properties in Rwanda
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="hover:opacity-90 transition-opacity"
            >
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/properties">
            <button className="btn-luxury-accent">
              View All Properties
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
