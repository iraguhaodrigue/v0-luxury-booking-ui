'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { Loader2, ChevronLeft, ChevronRight, Users, Zap, Gauge } from 'lucide-react'
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
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

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % (car?.images?.length || 1))
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + (car?.images?.length || 1)) % (car?.images?.length || 1))
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

  // Resolve images: prefer gallery array, fall back to image_url, then placeholder
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80'
  const galleryImages: string[] = (car.images && car.images.length > 0)
    ? car.images
    : car.image_url
      ? [car.image_url]
      : [FALLBACK_IMG]

  const mainImage = galleryImages[selectedImageIndex] || FALLBACK_IMG
  const isAvailable = car.status === 'available'

  return (
    <main className="w-full">
      <Navbar />

      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/car-rental" className="inline-flex items-center text-accent hover:text-accent/80 mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Fleet
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Images */}
            <div className="space-y-3 md:space-y-4 order-2 lg:order-1">
              {/* Main Image */}
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-lg bg-muted">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}

                {/* Navigation Buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 sm:w-6 h-4 sm:h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 sm:w-6 h-4 sm:h-6" />
                    </button>
                  </>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  {isAvailable ? (
                    <span className="inline-block bg-accent text-accent-foreground px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Available
                    </span>
                  ) : (
                    <span className="inline-block bg-red-500 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Booked
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-16 sm:h-20 overflow-hidden rounded-lg border-2 transition ${
                        idx === selectedImageIndex
                          ? 'border-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
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
