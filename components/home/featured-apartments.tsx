import Link from 'next/link'
import { Star, MapPin, Bed, Bath } from 'lucide-react'

const apartments = [
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
  },
]

export function FeaturedApartments() {
  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Apartments
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Urban sophistication meets comfort in our curated city apartments
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apartments.map((apt) => (
            <Link key={apt.id} href={`/properties/${apt.id}`}>
              <div className="card-luxury cursor-pointer group overflow-hidden">
                {/* Image */}
                <div className="relative h-56 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={apt.image}
                    alt={apt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    ${apt.price}/night
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
                            i < Math.floor(apt.rating)
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {apt.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({apt.reviews})
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-serif font-bold text-foreground">
                    {apt.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{apt.location}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Bed className="w-4 h-4" />
                      <span>{apt.beds} Beds</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bath className="w-4 h-4" />
                      <span>{apt.baths} Baths</span>
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
              View All Apartments
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
