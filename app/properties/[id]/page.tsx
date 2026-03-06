'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { PropertyGallery } from '@/components/properties/property-gallery'
import { RelatedProperties } from '@/components/properties/related-properties'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { formatPrice } from '@/lib/utils/currency'
import { SAMPLE_PROPERTIES } from '@/lib/constants/rwanda-data'
import {
  Star,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Heart,
  Share2,
  Check,
  Wifi,
  Utensils,
  Sparkles,
} from 'lucide-react'

// Map Rwanda data to display format
const propertyDataMap = SAMPLE_PROPERTIES.reduce(
  (acc, prop) => {
    acc[prop.id] = {
      ...prop,
      amenityIcons: prop.amenities.slice(0, 6).map((name) => ({
        icon: name.includes('Pool') ? Sparkles : name.includes('Chef') ? Utensils : Wifi,
        name,
      })),
      highlights: prop.amenities,
    }
    return acc
  },
  {} as Record<number, any>
)

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const propertyId = parseInt(id)
  const property = propertyDataMap[propertyId] || propertyDataMap[1]
  
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  const totalPrice = nights > 0 ? property.price_per_night * nights : 0

  return (
    <main className="w-full">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <PropertyGallery images={property.images} title={property.name} />

            {/* Property Info */}
            <div className="mt-12 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-accent text-sm font-semibold mb-2 tracking-widest">
                      {property.type.toUpperCase()}
                    </p>
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                      {property.name}
                    </h1>
                    <div className="flex items-center space-x-1 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{property.location}, Rwanda</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-3 hover:bg-secondary rounded-lg transition-colors">
                      <Heart className="w-6 h-6 text-foreground" />
                    </button>
                    <button className="p-3 hover:bg-secondary rounded-lg transition-colors">
                      <Share2 className="w-6 h-6 text-foreground" />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(property.rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {property.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({property.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-4 border-y border-border py-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-foreground mb-1">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-bold">{property.capacity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Max Guests</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {formatPrice(property.price_per_night, false)}
                  </div>
                  <p className="text-sm text-muted-foreground">Per Night</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">RWF</div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
                  About This Property
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenityIcons.map((amenity: any, index: number) => {
                    const Icon = amenity.icon
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-foreground text-sm">{amenity.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
                  Property Highlights
                </h2>
                <ul className="space-y-3">
                  {property.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-luxury sticky top-32 space-y-6">
              {/* Price */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price per night</p>
                <p className="text-3xl font-serif font-bold text-accent">
                  {formatPrice(property.price_per_night, false)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Rwandan Francs</p>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="input-luxury w-full text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input-luxury w-full text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-luxury w-full text-sm"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Pricing Breakdown */}
              {nights > 0 && (
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatPrice(property.price_per_night, false)} × {nights} nights
                    </span>
                    <span className="text-foreground font-semibold">
                      {formatPrice(totalPrice, false)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service fee</span>
                    <span>{formatPrice(Math.round(totalPrice * 0.05), false)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-accent">
                      {formatPrice(totalPrice + Math.round(totalPrice * 0.05), false)}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <Link href={`/booking?property=${property.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}>
                <button className="btn-luxury-accent w-full text-center">
                  {nights > 0 ? 'Continue to Booking' : 'Select Dates to Book'}
                </button>
              </Link>

              {/* Additional Info */}
              <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">
                <p>
                  You won't be charged yet. Review your details before completing your booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Guest Reviews</h2>
              <ReviewsList itemId={String(property.id)} itemType="property" />
            </div>
            <div>
              <ReviewForm
                itemId={String(property.id)}
                itemType="property"
                itemName={property.name}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Properties */}
      <RelatedProperties
        currentPropertyId={property.id}
        properties={SAMPLE_PROPERTIES}
        propertyType={property.type}
      />

      <Footer />
    </main>
  )
}
