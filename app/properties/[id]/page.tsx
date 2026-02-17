import Link from 'next/link'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { RelatedProperties } from '@/components/properties/related-properties'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  Star,
  MapPin,
  Users,
  DollarSign,
  Heart,
  Share2,
  Check,
  Wifi,
} from 'lucide-react'

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const propertyId = parseInt(params.id)

  // Fetch the specific property
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) {
    notFound()
  }

  // Fetch related properties
  const { data: relatedProperties = [] } = await supabase
    .from('properties')
    .select('*')
    .eq('property_type', property.property_type)
    .neq('id', propertyId)
    .limit(3)

  const amenities = Array.isArray(property.amenities) ? property.amenities : []

  return (
    <main className="w-full">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="relative h-96 bg-secondary rounded-lg overflow-hidden">
              <img
                src={property.image_url || 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800&q=80'}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Property Info */}
            <div className="mt-12 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-accent text-sm font-semibold mb-2 tracking-widest">
                      {property.property_type.toUpperCase()}
                    </p>
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
                          i < Math.floor(property.star_rating || 5)
                            ? 'fill-accent text-accent'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {property.star_rating || 5}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-4 border-y border-border py-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-foreground mb-1">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-bold">{property.total_rooms || 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {formatPrice(property.base_price_per_night || 0, false)}
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
                  {property.description || 'A beautiful property in Rwanda'}
                </p>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                    Amenities & Features
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Wifi className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-foreground text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
                  Property Highlights
                </h2>
                <ul className="space-y-3">
                  {amenities.map((highlight, index) => (
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
                  {formatPrice(property.base_price_per_night || 0, false)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Rwandan Francs</p>
              </div>

              {/* Booking CTA */}
              <Link href={`/booking?property=${property.id}`}>
                <button className="btn-luxury-accent w-full text-center">
                  Reserve Now
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

      {/* Related Properties */}
      {relatedProperties.length > 0 && (
        <section className="py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-12">
              Similar Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProperties.map((prop: any) => (
                <Link key={prop.id} href={`/properties/${prop.id}`}>
                  <div className="card-luxury cursor-pointer group overflow-hidden">
                    <img
                      src={prop.image_url || 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=300&q=80'}
                      alt={prop.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">{prop.name}</h3>
                      <p className="text-accent font-bold">
                        {formatPrice(prop.base_price_per_night || 0, false)}/night
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
