'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Star, MapPin, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { SAMPLE_PROPERTIES } from '@/lib/constants/rwanda-data'
import { createClient } from '@/lib/supabase/client'

interface Property {
  id: number
  name: string
  base_price_per_night: number
  location: string
  images: string[]
  amenities: string[]
}

export function FeaturedVillas() {
  const [villas, setVillas] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('property_type', 'villa')
          .eq('is_active', true)
          .limit(3)

        if (error) throw error
        if (data && data.length > 0) {
          setVillas(data)
        } else {
          // Fallback to sample data if no database villas found
          const sampleVillas = SAMPLE_PROPERTIES.filter((p) => p.type === 'villa').slice(0, 3)
          setVillas(sampleVillas as unknown as Property[])
        }
      } catch (error) {
        console.error('Error fetching villas:', error)
        // Fallback to sample data on error
        const sampleVillas = SAMPLE_PROPERTIES.filter((p) => p.type === 'villa').slice(0, 3)
        setVillas(sampleVillas as unknown as Property[])
      } finally {
        setLoading(false)
      }
    }

    fetchVillas()
  }, [])

export function FeaturedVillas() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold mb-2 tracking-widest">
            LUXURY VILLAS
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Rwanda Villas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most prestigious villa collection across Rwanda's most stunning locations
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-muted-foreground">Loading villas...</div>
            </div>
          ) : villas.length === 0 ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-muted-foreground">No villas available</div>
            </div>
          ) : (
            villas.map((villa) => (
              <Link key={villa.id} href={`/properties/${villa.id}`}>
                <div className="card-luxury cursor-pointer group overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={villa.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'}
                      alt={villa.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {formatPrice(villa.base_price_per_night, false)}/night
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-block bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                        Villa
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 flex-grow flex flex-col">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4
                                ? 'fill-accent text-accent'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        4.8
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (120+)
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-serif font-bold text-foreground line-clamp-2">
                      {villa.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{villa.location}, Rwanda</span>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(villa.amenities) && villa.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-secondary text-foreground px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Button */}
                    <button className="w-full btn-luxury-ghost text-sm mt-auto">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/properties?type=villa">
            <button className="btn-luxury-primary text-lg">
              Browse All Villas
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
