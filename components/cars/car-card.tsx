'use client'

import { Users, Zap, Gauge } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CarCardProps {
  id: number
  make?: string
  model?: string
  price_per_day?: number
  price?: number
  image_url?: string
  images?: string[] | string
  image?: string
  capacity?: number
  seats?: number
  transmission?: string
  fuel_type?: string
  status?: string
  power?: string
  available?: boolean
  description?: string
}

export function CarCard(car: CarCardProps) {
  const router = useRouter()

  if (!car || !car.id) return null

  const {
    id,
    make = 'Unknown',
    model = 'Vehicle',
    price_per_day,
    price,
    image_url,
    images,
    image,
    capacity = 5,
    seats,
    transmission = 'Automatic',
    fuel_type = 'Petrol',
    status = 'available',
    power = 'Standard',
    available = status === 'available',
    description,
  } = car

  // Priority: image_url (DB primary) → images array → image field → fallback
  const FALLBACK = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'
  let imageUrl = FALLBACK
  if (image_url) {
    imageUrl = image_url
  } else if (images) {
    imageUrl = Array.isArray(images) ? (images[0] || FALLBACK) : images
  } else if (image) {
    imageUrl = image
  }

  const finalPrice = price_per_day || price || 0
  const finalCapacity = capacity || seats || 5

  const handleCardClick = () => {
    router.push(`/car/${id}`)
  }

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/booking?type=car&id=${id}`)
  }

  return (
    <div 
      className="card-luxury group overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-luxury-lg transition-shadow duration-300"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-56 mb-4 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          {available ? (
            <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Available
            </span>
          ) : (
            <span className="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Booked
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 flex-grow flex flex-col">
        {/* Name & Model */}
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">
            {make}
          </h3>
          <p className="text-sm text-muted-foreground">{model}</p>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">{finalCapacity} Seats</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">{transmission}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Gauge className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">{fuel_type}</p>
          </div>
        </div>

        {/* Price & Button */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold text-accent">${finalPrice}</span>
            <span className="text-sm text-muted-foreground">/day</span>
          </div>
          <button
            onClick={handleBookClick}
            disabled={!available}
            className={`w-full py-3 rounded-md font-semibold transition-all duration-300 ${
              available
                ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-luxury hover:shadow-luxury-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {available ? 'Book Now' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  )
}
