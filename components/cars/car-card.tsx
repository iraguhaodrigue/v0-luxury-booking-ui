import { Users, Zap, Gauge } from 'lucide-react'

interface CarCardProps {
  id: number
  name: string
  model: string
  price: number
  image: string
  seats: number
  transmission: string
  power: string
  available: boolean
  description?: string
}

export function CarCard({
  id,
  name,
  model,
  price,
  image,
  seats,
  transmission,
  power,
  available,
  description,
}: CarCardProps) {
  return (
    <div className="card-luxury group overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative h-56 mb-4 overflow-hidden rounded-lg">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
            {name}
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
            <p className="text-xs text-muted-foreground">{seats} Seats</p>
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
            <p className="text-xs text-muted-foreground">{power}</p>
          </div>
        </div>

        {/* Price & Button */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold text-accent">${price}</span>
            <span className="text-sm text-muted-foreground">/day</span>
          </div>
          <button
            disabled={!available}
            className={`w-full py-3 rounded-md font-semibold transition-all duration-300 ${
              available
                ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-luxury hover:shadow-luxury-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {available ? 'Add to Booking' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  )
}
