'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { BookingSteps } from '@/components/booking/booking-steps'
import { ServicesSelector } from '@/components/booking/services-selector'
import { BookingSummary } from '@/components/booking/booking-summary'
import { formatPrice } from '@/lib/utils/currency'
import { logger } from '@/lib/utils/logger'
import { SERVICES } from '@/lib/constants/rwanda-data'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { querySelectors } from '@/lib/utils/query-optimizations'

const bookingSteps = [
  { id: 1, title: 'Dates', description: 'Check-in & Check-out' },
  { id: 2, title: 'Guest', description: 'Number of guests' },
  { id: 3, title: 'Services', description: 'Add extras' },
  { id: 4, title: 'Review', description: 'Confirm booking' },
  { id: 5, title: 'Payment', description: 'Complete purchase' },
]

interface BookableItem {
  id: number | string
  name: string
  description?: string | null
  images?: string[]
  image?: string
  base_price_per_night?: number
  price_per_day?: number
  location?: string
  capacity?: number
  seats?: number
  transmission?: string
  fuel_type?: string
  make?: string
  model?: string
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'property' // property, car, service
  const id = searchParams.get('id')

  const [currentStep, setCurrentStep] = useState(1)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [item, setItem] = useState<BookableItem | null>(null)
  const [loading, setLoading] = useState(!id) // Only load if id is provided
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchItem()
    }
  }, [id, type])

  const fetchItem = async () => {
    try {
      if (!id) {
        setError('No item selected')
        setLoading(false)
        return
      }

      logger.info(`Fetching ${type} with id: ${id}`)
      const supabase = createClient()

      let query

      if (type === 'car') {
        query = supabase.from('cars').select('id,make,model,year,price_per_day,capacity,transmission,fuel_type,images,description').eq('id', id)
      } else if (type === 'service') {
        query = supabase.from('services').select('id,name,price_per_day,description').eq('id', id)
      } else {
        // default to property
        query = supabase.from('properties').select('id,name,base_price_per_night,description,images,location').eq('id', id)
      }

      const { data, error: fetchError } = await query.single()

      if (fetchError || !data) {
        logger.warn(`${type} not found: ${id}`)
        setError(`${type} not found`)
        setItem(null)
      } else {
        logger.success(`${type} loaded: ${data.name || data.make}`)
        setItem(data as BookableItem)
        setError(null)
      }
    } catch (err) {
      logger.error(`Error fetching ${type}`, err)
      setError(`Failed to load ${type}`)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  const getItemPrice = () => {
    if (!item) return 0
    if (type === 'property' && item.base_price_per_night) {
      return item.base_price_per_night * nights
    } else if ((type === 'car' || type === 'service') && item.price_per_day) {
      return item.price_per_day * nights
    }
    return 0
  }

  const itemTotal = getItemPrice()

  const servicesTotal = selectedServices.reduce((sum, serviceId) => {
    const service = SERVICES.find((s) => s.id === serviceId)
    return sum + (service?.price_per_day || 0) * nights
  }, 0)

  const handleNextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <main className="w-full">
      <Navbar />

      <div className="bg-secondary py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            Complete Your Booking
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Follow the steps below to confirm your luxury reservation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading {type} details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !item) && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              {error || 'Item Not Found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The {type} you are trying to book doesn't exist or has been removed.
            </p>
            <div className="space-x-4">
              <Link href={type === 'car' ? '/car-rental' : type === 'service' ? '/services' : '/properties'}>
                <Button>Browse {type === 'car' ? 'Cars' : type === 'service' ? 'Services' : 'Properties'}</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Booking Form */}
        {!loading && item && (
          <>
            {/* Selected Item Card */}
            <div className="mb-8 card-luxury">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {/* Image */}
                <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name || `${item.make} ${item.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                    {item.name || `${item.make} ${item.model}`}
                  </h3>

                  {/* Type-specific details */}
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    {type === 'property' && item.location && (
                      <p>Location: {item.location}</p>
                    )}
                    {type === 'car' && (
                      <>
                        <p>Year: {item.year}</p>
                        <p>Capacity: {item.capacity} seats</p>
                        <p>Transmission: {item.transmission}</p>
                        <p>Fuel: {item.fuel_type}</p>
                      </>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent">
                      ${item.base_price_per_night || item.price_per_day || 0}
                    </span>
                    <span className="text-muted-foreground">
                      /{type === 'property' ? 'night' : 'day'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <BookingSteps steps={bookingSteps} currentStep={currentStep} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Step 1: Select Dates */}
                {currentStep === 1 && (
                  <div className="card-luxury space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                        When would you like to stay?
                      </h2>
                      <p className="text-muted-foreground">
                        Choose your check-in and check-out dates
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total nights: {nights}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Guests */}
                {currentStep === 2 && (
                  <div className="card-luxury space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                        How many guests?
                      </h2>
                      <p className="text-muted-foreground">
                        Let us know your party size
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Services */}
                {currentStep === 3 && (
                  <div className="card-luxury space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                        Add Services
                      </h2>
                      <p className="text-muted-foreground">
                        Enhance your stay with our premium services
                      </p>
                    </div>
                    <ServicesSelector selected={selectedServices} onSelect={setSelectedServices} />
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="card-luxury space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                        Review Your Booking
                      </h2>
                      <p className="text-muted-foreground">
                        Please review your booking details before payment
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="border-b border-border pb-4">
                        <p className="text-sm text-muted-foreground">Item</p>
                        <p className="font-semibold">{item.name || `${item.make} ${item.model}`}</p>
                      </div>
                      <div className="border-b border-border pb-4">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">
                          {checkIn} to {checkOut} ({nights} nights)
                        </p>
                      </div>
                      <div className="border-b border-border pb-4">
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-semibold">{guests}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <div className="card-luxury space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                        Payment Details
                      </h2>
                      <p className="text-muted-foreground">
                        Complete your booking with secure payment
                      </p>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg text-center">
                      <p className="text-muted-foreground">Payment integration coming soon</p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {currentStep > 1 && (
                    <Button onClick={handlePrevStep} variant="outline">
                      Previous
                    </Button>
                  )}
                  {currentStep < 5 && (
                    <Button onClick={handleNextStep} className="ml-auto">
                      Next
                    </Button>
                  )}
                  {currentStep === 5 && (
                    <Button className="ml-auto">
                      Complete Booking
                    </Button>
                  )}
                </div>
              </div>

              {/* Sidebar Summary */}
              <div>
                <div className="card-luxury sticky top-4">
                  <h3 className="text-lg font-serif font-bold text-foreground mb-6">
                    Booking Summary
                  </h3>

                  <div className="space-y-3 border-b border-border pb-4 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item</span>
                      <span className="font-semibold">${itemTotal}</span>
                    </div>
                    {servicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Services</span>
                        <span className="font-semibold">${servicesTotal}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-accent">
                      ${itemTotal + servicesTotal}
                    </span>
                  </div>

                  <Button className="w-full">
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Parameters - Show Browse Options */}
        {!loading && !id && !error && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              What would you like to book?
            </h2>
            <p className="text-muted-foreground mb-8">
              Select an item from our offerings to get started
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/properties">
                <Button className="w-full">Villas & Apartments</Button>
              </Link>
              <Link href="/car-rental">
                <Button className="w-full">Cars</Button>
              </Link>
              <Link href="/services">
                <Button className="w-full">Services</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Back Home</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full">
          <Navbar />
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
          </div>
        </main>
      }
    >
      <BookingPageContent />
    </Suspense>
  )
}
