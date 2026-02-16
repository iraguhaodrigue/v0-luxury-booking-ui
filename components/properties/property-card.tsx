import Link from 'next/link'
import { Star, MapPin, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'

interface PropertyCardProps {
  id: number
  name: string
  location: string
  price: number
  image: string
  rating: number
  reviews: number
  capacity: number
  amenities?: string[]
}

export function PropertyCard({
  id,
  name,
  location,
  price,
  image,
  rating,
  reviews,
  capacity,
  amenities = [],
}: PropertyCardProps) {
  return (
    <Link href={`/properties/${id}`}>
      <div className="card-luxury cursor-pointer group overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
            {formatPrice(price, false)}/night
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="inline-block bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
              Premium
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
                    i < Math.floor(rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({reviews} reviews)
            </span>
          </div>

          {/* Name */}
          <h3 className="text-xl font-serif font-bold text-foreground line-clamp-2">
            {name}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Capacity */}
          <div className="flex items-center space-x-1 text-sm text-muted-foreground py-2">
            <Users className="w-4 h-4" />
            <span>Up to {capacity} guests</span>
          </div>

          {/* Quick amenities tags */}
          {amenities.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {amenities.slice(0, 2).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-secondary text-foreground px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Button */}
          <button className="w-full btn-luxury-ghost text-sm mt-auto">
            View Details
          </button>
        </div>
      </div>
    </Link>
  )
}
