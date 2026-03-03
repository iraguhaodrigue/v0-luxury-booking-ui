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
import { SAMPLE_PROPERTIES, SERVICES } from '@/lib/constants/rwanda-data'
import { createClient } from '@/lib/supabase/client'

const bookingSteps = [
  { id: 1, title: 'Dates', description: 'Check-in & Check-out' },
  { id: 2, title: 'Guest', description: 'Number of guests' },
  { id: 3, title: 'Services', description: 'Add extras' },
  { id: 4, title: 'Review', description: 'Confirm booking' },
  { id: 5, title: 'Payment', description: 'Complete purchase' },
]

interface Property {
  id: number
  name: string
  base_price_per_night: number
  description: string | null
  images: string[]
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const propertyId = parseInt(searchParams.get('property') || '1')
  const initialCheckIn = searchParams.get('checkIn') || ''
  const initialCheckOut = searchParams.get('checkOut') || ''
  const initialGuests = searchParams.get('guests') || '2'

  const [currentStep, setCurrentStep] = useState(1)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState(initialGuests)
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error || !data) {
        // Fallback to sample data
        const sample = SAMPLE_PROPERTIES.find((p) => p.id === propertyId) || SAMPLE_PROPERTIES[0]
        setProperty(sample as any)
      } else {
        setProperty(data)
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      const sample = SAMPLE_PROPERTIES.find((p) => p.id === propertyId) || SAMPLE_PROPERTIES[0]
      setProperty(sample as any)
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
  const roomTotal = property && nights > 0 ? property.base_price_per_night * nights : 0

  const servicesTotal = selectedServices.reduce((sum, serviceId) => {
    const service = SERVICES.find((s) => s.id === serviceId)
    return sum + (service?.price || 0)
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
            Follow the steps below to reserve your luxury stay in Rwanda
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                    Choose your check-in and check-out dates for {property.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="input-luxury w-full"
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Duration: <span className="font-semibold text-foreground">{nights} nights</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: <span className="font-semibold text-accent">{formatPrice(roomTotal, false)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Guests */}
            {currentStep === 2 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                    How many guests?
                  </h2>
                  <p className="text-muted-foreground">
                    This property accommodates up to {property.capacity} guests
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-luxury w-full text-lg"
                  >
                    {[...Array(Math.min(property.capacity, 10))].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1} Guest{i !== 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <h3 className="font-semibold text-foreground mb-2">Property Details</h3>
                  <p className="text-sm text-muted-foreground">{property.description}</p>
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {currentStep === 3 && (
              <div className="card-luxury">
                <ServicesSelector
                  onServicesChange={(serviceIds) => setSelectedServices(serviceIds)}
                  initialServices={selectedServices}
                />
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                    Review Your Booking
                  </h2>

                  {/* Property */}
                  <div className="bg-secondary p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      Property
                    </h3>
                    <p className="text-muted-foreground text-sm">{property.name}</p>
                    <p className="text-muted-foreground text-sm">{property.location}, Rwanda</p>
                  </div>

                  {/* Dates */}
                  <div className="bg-secondary p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      Dates
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {checkIn && checkOut
                        ? `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()} (${nights} nights)`
                        : 'Not selected'}
                    </p>
                  </div>

                  {/* Guests */}
                  <div className="bg-secondary p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      Guests
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {guests} guest{guests !== '1' ? 's' : ''}
                    </p>
                  </div>

                  {/* Services */}
                  {selectedServices.length > 0 && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3">
                        Selected Services
                      </h3>
                      <div className="space-y-2">
                        {selectedServices.map((serviceId) => {
                          const service = SERVICES.find((s) => s.id === serviceId)
                          return (
                            <div key={serviceId} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{service?.name}</span>
                              <span className="text-foreground font-semibold">
                                {formatPrice(service?.price || 0, false)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
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
                  <p className="text-muted-foreground mb-6">
                    Enter your payment information to complete the booking
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input-luxury w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="input-luxury w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="input-luxury w-full"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="input-luxury w-full"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="input-luxury w-full"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="btn-luxury-ghost flex-1"
                >
                  Back
                </button>
              )}
              {currentStep < 5 ? (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && (!checkIn || !checkOut)) ||
                    (currentStep === 2 && !guests)
                  }
                  className="btn-luxury-accent flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <Link href={`/confirmation?property=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`}>
                  <button className="btn-luxury-accent w-full">
                    Complete Booking
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <BookingSummary
              property={{
                name: property.name,
                location: property.location,
                pricePerNight: property.price_per_night,
                image: property.images[0],
              }}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              nights={nights}
              propertyTotal={roomTotal}
              servicesTotal={servicesTotal}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  )
}
