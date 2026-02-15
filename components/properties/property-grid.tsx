'use client'

import { useState } from 'react'
import { PropertyCard } from './property-card'
import { FilterSidebar } from './filter-sidebar'

const allProperties = [
  {
    id: 1,
    name: 'Mediterranean Escape',
    location: 'Santorini, Greece',
    price: 850,
    image: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=600&q=80',
    rating: 4.9,
    reviews: 247,
    beds: 4,
    baths: 3,
    amenities: ['Pool', 'WiFi'],
  },
  {
    id: 2,
    name: 'Tropical Paradise',
    location: 'Bali, Indonesia',
    price: 650,
    image: 'https://images.unsplash.com/photo-1551821440-e5b88667fab0?w=600&q=80',
    rating: 4.8,
    reviews: 189,
    beds: 5,
    baths: 4,
    amenities: ['Pool', 'Spa'],
  },
  {
    id: 3,
    name: 'Alpine Luxury Retreat',
    location: 'Swiss Alps, Switzerland',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1631049307038-da8ec40ed52d?w=600&q=80',
    rating: 5.0,
    reviews: 156,
    beds: 6,
    baths: 5,
    amenities: ['Gym', 'WiFi'],
  },
  {
    id: 4,
    name: 'Coastal Villa Deluxe',
    location: 'Maldives',
    price: 950,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    rating: 4.9,
    reviews: 312,
    beds: 4,
    baths: 3,
    amenities: ['Pool', 'Beach Access'],
  },
  {
    id: 5,
    name: 'Manhattan Penthouse',
    location: 'New York, USA',
    price: 750,
    image: 'https://images.unsplash.com/photo-1512917774080-9a485dc1d1fb?w=600&q=80',
    rating: 4.8,
    reviews: 198,
    beds: 3,
    baths: 2,
    amenities: ['Gym', 'WiFi'],
  },
  {
    id: 6,
    name: 'Parisian Elegance',
    location: 'Paris, France',
    price: 680,
    image: 'https://images.unsplash.com/photo-1468824357382-a7db1d6ef206?w=600&q=80',
    rating: 4.9,
    reviews: 224,
    beds: 2,
    baths: 2,
    amenities: ['WiFi', 'Kitchen'],
  },
  {
    id: 7,
    name: 'Tokyo Metropolitan',
    location: 'Tokyo, Japan',
    price: 620,
    image: 'https://images.unsplash.com/photo-1486346150496-3e25e0e86d80?w=600&q=80',
    rating: 4.7,
    reviews: 156,
    beds: 2,
    baths: 1,
    amenities: ['WiFi', 'Parking'],
  },
  {
    id: 8,
    name: 'Dubai Marina Suite',
    location: 'Dubai, UAE',
    price: 890,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    rating: 4.9,
    reviews: 287,
    beds: 3,
    baths: 3,
    amenities: ['Pool', 'Gym'],
  },
]

export function PropertyGrid() {
  const [filteredProperties, setFilteredProperties] = useState(allProperties)

  const handleFiltersChange = (filters: any) => {
    let filtered = allProperties

    // Price filter
    filtered = filtered.filter(
      (prop) =>
        prop.price >= filters.priceRange[0] && prop.price <= filters.priceRange[1]
    )

    // Bedrooms filter
    if (filters.bedrooms.length > 0) {
      filtered = filtered.filter((prop) =>
        filters.bedrooms.includes(String(prop.beds))
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
              Properties
            </h2>
            <p className="text-muted-foreground">
              Found {filteredProperties.length} properties
            </p>
          </div>

          {/* Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
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
