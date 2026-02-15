import Link from 'next/link'
import { Star, MapPin, Bed, Bath } from 'lucide-react'

const villas = [
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
  },
]

export function FeaturedVillas() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Villas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our hand-picked collection of the most luxurious villas around the world
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {villas.map((villa) => (
            <Link key={villa.id} href={`/properties/${villa.id}`}>
              <div className="card-luxury cursor-pointer group overflow-hidden">
                {/* Image */}
                <div className="relative h-56 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={villa.image}
                    alt={villa.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    ${villa.price}/night
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
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
                  <h3 className="text-lg font-serif font-bold text-foreground">
                    {villa.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{villa.location}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Bed className="w-4 h-4" />
                      <span>{villa.beds} Beds</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bath className="w-4 h-4" />
                      <span>{villa.baths} Baths</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="w-full btn-luxury-ghost text-sm mt-4">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/properties">
            <button className="btn-luxury-primary text-lg">
              Explore All Properties
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
