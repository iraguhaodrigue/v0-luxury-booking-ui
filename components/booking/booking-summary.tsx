'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils/currency'
import { MapPin, Calendar, Users, DollarSign, Home } from 'lucide-react'

interface BookingSummaryProps {
  property?: {
    name: string
    location: string
    pricePerNight: number
    image?: string
  }
  checkIn?: string
  checkOut?: string
  guests?: string
  nights?: number
  propertyTotal?: number
  servicesTotal?: number
  onBooking?: () => void
}

export function BookingSummary({
  property,
  checkIn,
  checkOut,
  guests,
  nights = 0,
  propertyTotal = 0,
  servicesTotal = 0,
  onBooking,
}: BookingSummaryProps) {
  const total = propertyTotal + servicesTotal
  const taxesAndFees = Math.round(total * 0.1)
  const grandTotal = total + taxesAndFees

  return (
    <div className="card-luxury sticky top-32 space-y-6">
      {/* Property Image & Info */}
      {property && (
        <div>
          {property.image && (
            <img
              src={property.image}
              alt={property.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
          )}
          <h3 className="font-serif font-bold text-foreground text-lg mb-2">
            {property.name}
          </h3>
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>{property.location}, Rwanda</span>
          </div>
        </div>
      )}

      {/* Booking Details */}
      <div className="space-y-3 border-t border-b border-border py-4">
        {checkIn && (
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Check-in</span>
            </div>
            <span className="text-foreground font-semibold text-sm">
              {new Date(checkIn).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {checkOut && (
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Check-out</span>
            </div>
            <span className="text-foreground font-semibold text-sm">
              {new Date(checkOut).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {guests && (
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Guests</span>
            </div>
            <span className="text-foreground font-semibold text-sm">
              {guests}
            </span>
          </div>
        )}

        {nights > 0 && (
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Duration</span>
            </div>
            <span className="text-foreground font-semibold text-sm">
              {nights} night{nights !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        {propertyTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Property</span>
            <span className="text-foreground font-semibold">
              {formatPrice(propertyTotal, false)}
            </span>
          </div>
        )}

        {servicesTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Services</span>
            <span className="text-foreground font-semibold">
              {formatPrice(servicesTotal, false)}
            </span>
          </div>
        )}

        {total > 0 && (
          <>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-semibold">
                  {formatPrice(total, false)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee (10%)</span>
                <span className="text-foreground font-semibold">
                  {formatPrice(taxesAndFees, false)}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">
                    {formatPrice(grandTotal, false)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rwandan Francs
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA Button */}
      {onBooking ? (
        <button onClick={onBooking} className="btn-luxury-accent w-full text-center">
          Continue to Payment
        </button>
      ) : (
        <Link href="/booking">
          <button className="btn-luxury-accent w-full text-center">
            Proceed to Booking
          </button>
        </Link>
      )}

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Free cancellation up to 48 hours before check-in
      </p>
    </div>
  )
}
