'use client'

import { useRouter } from 'next/navigation'
import { Star, MapPin, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'

interface PropertyCardProps {
  property: {
    id: number
    name: string
    location: string
    price_per_night?: number
    base_price_per_night?: number
    images: string[] | string
    rating?: number
    reviews?: number
    capacity?: number
    amenities?: string[]
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter()

  if (!property) return null
  
  const { id, name, location, images, capacity = 2, amenities = [] } = property
  const price = property.price_per_night || property.base_price_per_night || 0
  const rating = property.rating || 4.5
  const reviews = property.reviews || 0
  const imageUrl = Array.isArray(images) ? images[0] : images

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/booking?type=property&id=${id}`)
  }
  
  return (
    <div className="card-luxury group overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 sm:h-56 md:h-64 mb-3 sm:mb-4 overflow-hidden rounded-lg block">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-accent text-accent-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
          {formatPrice(price, false)}/night
        </div>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span className="inline-block bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
            Premium
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 sm:space-y-3 flex-grow flex flex-col">
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 sm:w-4 h-3 sm:h-4 ${
                  i < Math.floor(rating)
                    ? 'fill-accent text-accent'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {rating}
          </span>
          <span className="text-xs text-muted-foreground">
            ({reviews})
          </span>
        </div>

        {/* Name */}
        <h3 className="text-base sm:text-lg md:text-xl font-serif font-bold text-foreground line-clamp-2">
          {name}
        </h3>

        {/* Location */}
        <div className="flex items-center space-x-1 text-muted-foreground">
          <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm">{location}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground py-1 sm:py-2">
          <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span>Up to {capacity} guests</span>
        </div>

        {/* Quick amenities tags */}
        {amenities.length > 0 && (
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            {amenities.slice(0, 2).map((amenity, idx) => (
              <span
                key={idx}
                className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-auto pt-3">
          <button onClick={() => router.push(`/properties/${id}`)} className="flex-1 btn-luxury-ghost text-xs sm:text-sm">
            View Details
          </button>
          <button onClick={handleBooking} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

