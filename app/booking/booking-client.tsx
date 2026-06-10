'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/currency'
import { DateRangePicker } from '@/components/marketplace/date-range-picker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

interface BookingFormData {
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

export function BookingClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<BookingFormData>({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  })

  const propertyId = searchParams.get('id')
  const bookingType = searchParams.get('type')
  const subtype = searchParams.get('subtype')

  useEffect(() => {
    if (!propertyId || !bookingType) {
      setError('Invalid booking parameters. Please start from a property page.')
    }
  }, [propertyId, bookingType])

  const handleDateRangeChange = (checkIn: string, checkOut: string) => {
    setFormData(prev => ({
      ...prev,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    }))
  }

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.checkInDate || !formData.checkOutDate) {
        throw new Error('Please select check-in and check-out dates')
      }

      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('Please fill in all required fields')
      }

      // Create booking via API
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: parseInt(propertyId!),
          bookingType,
          subtype,
          checkInDate: new Date(formData.checkInDate),
          checkOutDate: new Date(formData.checkOutDate),
          numberOfGuests: formData.numberOfGuests,
          guestName: `${formData.firstName} ${formData.lastName}`,
          guestEmail: formData.email,
          guestPhone: formData.phone,
          specialRequests: formData.specialRequests,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const { bookingId } = await response.json()
      router.push(`/booking/confirmation?booking=${bookingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!propertyId || !bookingType) {
    return (
      <section className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Invalid booking request'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-6">
            Go Back
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Complete Your Booking</h1>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Fill in your information to complete the booking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Travel Dates</h3>
                <DateRangePicker
                  onRangeChange={handleDateRangeChange}
                  value={{
                    from: formData.checkInDate ? new Date(formData.checkInDate) : undefined,
                    to: formData.checkOutDate ? new Date(formData.checkOutDate) : undefined,
                  }}
                />
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={e => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                  required
                />
              </div>

              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={e => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={e => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <textarea
                  id="requests"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={4}
                  value={formData.specialRequests}
                  onChange={e => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requests or requirements?"
                />
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                You won't be charged until the property owner confirms your booking
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
