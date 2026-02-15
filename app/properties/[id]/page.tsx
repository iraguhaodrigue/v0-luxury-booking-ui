'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { PropertyGallery } from '@/components/properties/property-gallery'
import {
  Star,
  MapPin,
  Bed,
  Bath,
  Wifi,
  AirVent,
  DollarSign,
  Calendar,
  Users,
  Heart,
  Share2,
  Check,
} from 'lucide-react'

const propertyData = {
  1: {
    name: 'Mediterranean Escape',
    location: 'Santorini, Greece',
    price: 850,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    ],
    rating: 4.9,
    reviews: 247,
    beds: 4,
    baths: 3,
    description:
      'A stunning Mediterranean villa nestled on the cliffs of Santorini with breathtaking views of the Aegean Sea. This luxurious property features modern amenities combined with traditional Greek architecture.',
    amenities: [
      { icon: Wifi, name: 'High-Speed WiFi' },
      { icon: AirVent, name: 'Air Conditioning' },
      { icon: Calendar, name: 'Smart Climate Control' },
      { icon: DollarSign, name: 'Smart Lock' },
      { icon: Users, name: '24/7 Concierge' },
      { icon: Heart, name: 'Premium Linens' },
    ],
    highlights: [
      'Infinity pool with sea views',
      'Private beach access',
      'State-of-the-art kitchen',
      'Home theater system',
      'Steam room and sauna',
      'Spa bath',
    ],
  },
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = propertyData[params.id as keyof typeof propertyData] || propertyData[1]
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
  const totalPrice = nights > 0 ? property.price * nights : 0

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
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                      {property.name}
                    </h1>
                    <div className="flex items-center space-x-1 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{property.location}</span>
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
                    <Bed className="w-5 h-5" />
                    <span className="text-2xl font-bold">{property.beds}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-foreground mb-1">
                    <Bath className="w-5 h-5" />
                    <span className="text-2xl font-bold">{property.baths}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    ${property.price}
                  </div>
                  <p className="text-sm text-muted-foreground">Per Night</p>
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
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => {
                    const Icon = amenity.icon
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-foreground">{amenity.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
                  Highlights
                </h2>
                <ul className="space-y-2">
                  {property.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
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
                <p className="text-3xl font-serif font-bold text-foreground">
                  ${property.price}
                </p>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Check-in
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
                    Check-out
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
                    Guests
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
                    <option value="5">5+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Pricing Breakdown */}
              {nights > 0 && (
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${property.price} × {nights} nights
                    </span>
                    <span className="text-foreground font-semibold">
                      ${totalPrice}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-accent">
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <Link href="/booking">
                <button className="btn-luxury-accent w-full text-center">
                  Book Now
                </button>
              </Link>

              {/* Additional Info */}
              <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">
                <p>
                  You won't be charged yet. Review your details before completing
                  your booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
