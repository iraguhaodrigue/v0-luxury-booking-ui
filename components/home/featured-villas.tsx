import Link from 'next/link'
import { Star, MapPin, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/server'

export async function FeaturedVillas() {
  const supabase = await createClient()
  
  // Fetch real properties from database
  const { data: villas = [] } = await supabase
    .from('properties')
    .select('*')
    .eq('property_type', 'villa')
    .limit(3)
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
          {villas.map((villa: any) => (
            <Link key={villa.id} href={`/properties/${villa.id}`}>
              <div className="card-luxury cursor-pointer group overflow-hidden h-full flex flex-col">
                {/* Image */}
                <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={villa.image_url || 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=300&q=80'}
                    alt={villa.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {formatPrice(villa.base_price_per_night || 0, false)}/night
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                      {villa.property_type}
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
                            i < Math.floor(villa.star_rating || 5)
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {villa.star_rating || 5}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-serif font-bold text-foreground line-clamp-2">
                    {villa.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{villa.location}</span>
                  </div>

                  {/* Total Rooms */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground py-2">
                    <span>{villa.total_rooms} rooms</span>
                  </div>

                  {/* Amenities tags */}
                  <div className="flex gap-2 flex-wrap">
                    {villa.amenities && Array.isArray(villa.amenities) && villa.amenities.slice(0, 3).map((amenity: string, idx: number) => (
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
          ))}
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
