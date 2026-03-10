'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { ImageGallery } from '@/components/ui/image-gallery'
import { BackButton } from '@/components/ui/back-button'
import { Loader2, Users, Zap, Gauge } from 'lucide-react'
import Link from 'next/link'

interface Car {
  id: number
  make: string
  model: string
  year: number
  price_per_day: number
  image_url: string | null   // primary single image from DB
  images: string[] | null    // gallery images
  capacity: number
  transmission: string
  fuel_type: string
  status: string
  color?: string
  mileage_limit?: number
  license_plate?: string
}

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const carId = parseInt(params.id as string)

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCar()
  }, [carId])

  const fetchCar = async () => {
    try {
      logger.info(`Fetching car: ${carId}`)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cars')
        .select('id,make,model,year,price_per_day,capacity,transmission,fuel_type,image_url,images,status,color,mileage_limit,license_plate')
        .eq('id', carId)
        .single()

      if (error || !data) {
        logger.warn(`Car not found: ${carId}`)
        setError('Car not found')
        setCar(null)
      } else {
        logger.success(`Car loaded: ${data.make} ${data.model}`)
        setCar(data)
        setError(null)
      }
    } catch (err) {
      logger.error('Error fetching car', err)
      setError('Failed to load car details')
      setCar(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = () => {
    router.push(`/booking?type=car&id=${carId}`)
  }

  if (loading) {
    return (
      <main className="w-full">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading car details...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !car) {
    return (
      <main className="w-full">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Car Not Found</h2>
            <p className="text-muted-foreground mb-6">The car you're looking for doesn't exist or has been removed.</p>
            <Link href="/car-rental">
              <button className="bg-accent text-accent-foreground px-6 py-3 rounded-md font-semibold hover:bg-accent/90">
                Back to Fleet
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const isAvailable = car.status === 'available'

  return (
    <main className="w-full">
      <Navbar />

      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton label="Back to Fleet" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-8">
            {/* Images */}
            <div className="order-2 lg:order-1">
              <ImageGallery
                imageUrl={car.image_url}
                images={car.images}
                alt={`${car.make} ${car.model}`}
                mainHeightClass="h-64 sm:h-80 md:h-96 lg:h-[480px]"
              />
            </div>

            {/* Details */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
                  {car.make}
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground">{car.model} ({car.year})</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-secondary p-3 sm:p-4 rounded-lg text-center">
                  <Users className="w-5 sm:w-6 h-5 sm:h-6 text-accent mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Capacity</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{car.capacity}</p>
                </div>
                <div className="bg-secondary p-3 sm:p-4 rounded-lg text-center">
                  <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-accent mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Transmission</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{car.transmission}</p>
                </div>
                <div className="bg-secondary p-3 sm:p-4 rounded-lg text-center">
                  <Gauge className="w-5 sm:w-6 h-5 sm:h-6 text-accent mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Fuel Type</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{car.fuel_type}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2 sm:space-y-3 border-t border-b border-border py-4 sm:py-6">
                {car.color && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-semibold text-foreground">{car.color}</span>
                  </div>
                )}
                {car.license_plate && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">License Plate:</span>
                    <span className="font-semibold text-foreground">{car.license_plate}</span>
                  </div>
                )}
                {car.mileage_limit && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Mileage Limit:</span>
                    <span className="font-semibold text-foreground">{car.mileage_limit} km/day</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-semibold ${isAvailable ? 'text-accent' : 'text-red-500'}`}>
                    {isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>
              </div>

              {/* Price & Booking */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-bold text-accent">${car.price_per_day}</span>
                  <span className="text-base sm:text-lg text-muted-foreground">/day</span>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={!isAvailable}
                  className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 ${
                    isAvailable
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-luxury hover:shadow-luxury-md'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isAvailable ? 'Book This Car' : 'Not Available'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
