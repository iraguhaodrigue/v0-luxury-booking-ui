'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Star, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'

interface Property {
  id: number
  name: string
  base_price_per_night: number
  location: string
  images: string[]
  amenities: string[]
}

export function FeaturedApartments() {
  const [apartments, setApartments] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('property_type', 'apartment')
          .limit(3)

        if (error) throw error
        if (data && data.length > 0) {
          setApartments(data)
        } else {
          setApartments([])
        }
      } catch (error) {
        console.error('[v0] Error fetching apartments:', error)
        setApartments([])
      } finally {
        setLoading(false)
      }
    }

    fetchApartments()
  }, [])

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold mb-2 tracking-widest">LUXURY APARTMENTS</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Apartments
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our premium apartment collection in Rwanda's most desirable neighborhoods
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-muted-foreground">Loading apartments...</div>
            </div>
          ) : apartments.length === 0 ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-muted-foreground">No apartments available</div>
            </div>
          ) : (
            apartments.map((apartment) => (
              <Link key={apartment.id} href={`/property/${apartment.id}`}>
                <div className="card-luxury cursor-pointer group overflow-hidden h-full flex flex-col">
                  <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={apartment.images?.[0] || 'https://images.unsplash.com/photo-1613395877297-d61eea0f6fcb?w=800&q=80'}
                      alt={apartment.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {formatPrice(apartment.base_price_per_night, false)}/night
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-block bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                        Apartment
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 flex-grow flex flex-col">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? 'fill-accent text-accent' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">4.8</span>
                      <span className="text-xs text-muted-foreground">(120+)</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-foreground line-clamp-2">
                      {apartment.name}
                    </h3>

                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{apartment.location}, Rwanda</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(apartment.amenities) &&
                        apartment.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                    </div>

                    <button className="w-full btn-luxury-ghost text-sm mt-auto">View Details</button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          <Link href="/properties?type=apartment">
            <button className="btn-luxury-primary text-lg">Explore All Apartments</button>
          </Link>
        </div>
      </div>
    </section>
  )
}
