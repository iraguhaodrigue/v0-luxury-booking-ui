'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { BookingSteps } from '@/components/booking/booking-steps'
import { ServicesSelector } from '@/components/booking/services-selector'
import { BookingSummary } from '@/components/booking/booking-summary'

const bookingSteps = [
  { id: 1, title: 'Select Dates', description: 'Check-in & Check-out' },
  { id: 2, title: 'Select Room', description: 'Choose accommodation' },
  { id: 3, title: 'Services', description: 'Add extras' },
  { id: 4, title: 'Review', description: 'Confirm booking' },
  { id: 5, title: 'Payment', description: 'Complete purchase' },
]

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [selectedRoom, setSelectedRoom] = useState('deluxe')
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const rooms = [
    {
      id: 'deluxe',
      name: 'Deluxe Suite',
      price: 850,
      description: 'Spacious suite with ocean view',
      beds: 2,
      guests: 4,
    },
    {
      id: 'master',
      name: 'Master Villa',
      price: 1200,
      description: 'Entire villa with private pool',
      beds: 4,
      guests: 8,
    },
    {
      id: 'garden',
      name: 'Garden Cottage',
      price: 650,
      description: 'Cozy cottage with garden access',
      beds: 1,
      guests: 2,
    },
  ]

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  const selectedRoomData = rooms.find((r) => r.id === selectedRoom)
  const roomTotal = selectedRoomData && nights > 0 ? selectedRoomData.price * nights : 0

  const servicesTotal = selectedServices.length * 100 // Simplified for demo

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
            Follow the steps below to reserve your luxury stay
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
                    Choose your check-in and check-out dates
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

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-luxury w-full"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </div>

                {nights > 0 && (
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Duration: <span className="font-semibold text-foreground">{nights} nights</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Room */}
            {currentStep === 2 && (
              <div className="card-luxury space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                    Select Your Accommodation
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the room or villa that best suits your needs
                  </p>
                </div>

                <div className="space-y-4">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                        selectedRoom === room.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {room.name}
                        </h3>
                        <span className="text-xl font-bold text-accent">
                          ${room.price}/night
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {room.description}
                      </p>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <span>{room.beds} Bed(s)</span>
                        <span>•</span>
                        <span>Up to {room.guests} Guests</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {currentStep === 3 && (
              <div className="card-luxury">
                <ServicesSelector
                  onServicesChange={(services) => setSelectedServices(services)}
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

                  {/* Room */}
                  <div className="bg-secondary p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      Accommodation
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {selectedRoomData?.name} - ${selectedRoomData?.price}/night
                    </p>
                  </div>

                  {/* Services */}
                  {selectedServices.length > 0 && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">
                        Services
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedServices.length} service(s) selected
                      </p>
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
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="input-luxury w-full"
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
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input-luxury w-full"
                      />
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
                    (currentStep === 1 && !checkIn) ||
                    (currentStep === 2 && !selectedRoom)
                  }
                  className="btn-luxury-accent flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button className="btn-luxury-accent flex-1">
                  Confirm & Pay
                </button>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <BookingSummary
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              nights={nights}
              propertyTotal={roomTotal}
              servicesTotal={selectedServices.length * 100}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
