'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Zap, Gauge, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'

interface Car {
  id: number
  make: string
  model: string
  year: number
  price_per_day: number
  capacity: number
  transmission: string
  fuel_type: string
  image_url: string | null
  images: string[] | null
  status: string
}

export function FeaturedCars() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('cars')
          .select('id,make,model,year,price_per_day,capacity,transmission,fuel_type,image_url,images,status')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error
        setCars(data && data.length > 0 ? data : [])
      } catch {
        setCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  const getImage = (car: Car) => {
    if (car.image_url) return car.image_url
    if (car.images && car.images.length > 0) return car.images[0]
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
  }

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold mb-2 tracking-widest">LUXURY FLEET</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Vehicles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore Rwanda in style with our premium selection of luxury rental vehicles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cars.length === 0 ? (
            <div className="col-span-full flex justify-center py-12">
              <p className="text-muted-foreground">No vehicles available at this time.</p>
            </div>
          ) : (
            cars.map((car) => (
              <div key={car.id} className="card-luxury group overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative h-56 mb-4 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={getImage(car)}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {formatPrice(car.price_per_day, false)}/day
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                      Available
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 flex-grow flex flex-col">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-foreground">{car.make}</h3>
                    <p className="text-sm text-muted-foreground">{car.model} ({car.year})</p>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
                    <div className="text-center">
                      <Users className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{car.capacity} Seats</p>
                    </div>
                    <div className="text-center">
                      <Zap className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{car.transmission}</p>
                    </div>
                    <div className="text-center">
                      <Gauge className="w-4 h-4 text-accent mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{car.fuel_type}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => router.push(`/car/${car.id}`)}
                      className="flex-1 btn-luxury-ghost text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/booking?type=car&id=${car.id}`)}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          <Link href="/car-rental">
            <button className="btn-luxury-primary text-lg">Browse All Vehicles</button>
          </Link>
        </div>
      </div>
    </section>
  )
}
