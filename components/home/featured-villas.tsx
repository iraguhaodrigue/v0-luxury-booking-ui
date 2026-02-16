import Link from 'next/link'
import { Star, MapPin, Bed, Bath, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { SAMPLE_PROPERTIES } from '@/lib/constants/rwanda-data'

const villas = SAMPLE_PROPERTIES.filter((p) => p.type === 'villa').slice(0, 3)

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
          {villas.map((villa) => (
            <Link key={villa.id} href={`/properties/${villa.id}`}>
              <div className="card-luxury cursor-pointer group overflow-hidden h-full flex flex-col">
                {/* Image */}
                <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={villa.images[0]}
                    alt={villa.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {formatPrice(villa.price_per_night, false)}/night
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
                            i < Math.floor(villa.rating)
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {villa.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({villa.reviews})
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

                  {/* Capacity and amenities */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground py-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Up to {villa.capacity} guests</span>
                    </div>
                  </div>

                  {/* Amenities tags */}
                  <div className="flex gap-2 flex-wrap">
                    {villa.amenities.slice(0, 3).map((amenity, idx) => (
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
