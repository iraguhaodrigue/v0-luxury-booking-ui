import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/currency'
import { MapPin, Users, Check, Heart, Share2, Star } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

async function getProperty(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', parseInt(id, 10))
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const property = await getProperty(id)
  if (!property) {
    return { title: 'Property Not Found | Rwanda Luxury Hospitality' }
  }
  return {
    title: `${property.name} | Rwanda Luxury Hospitality`,
    description: property.description || `${property.name} in ${property.location}, Rwanda`,
  }
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) notFound()

  const amenities: string[] = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
    ? property.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
    : []

  const images: string[] = Array.isArray(property.images)
    ? property.images
    : property.images
    ? [property.images]
    : []

  const price = property.base_price_per_night ?? property.price_per_night ?? 0

  return (
    <main className="w-full">
      <Navbar />

      {/* Image Gallery */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[540px]">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-lg">
            <img
              src={
                images[0] ||
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'
              }
              alt={property.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="overflow-hidden rounded-lg hidden md:block">
              <img
                src={img}
                alt={`${property.name} photo ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  {property.property_type && (
                    <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">
                      {property.property_type}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 text-balance">
                    {property.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{property.location}{property.country ? `, ${property.country}` : ', Rwanda'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Save property">
                    <Heart className="w-6 h-6 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Share property">
                    <Share2 className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 border-y border-border py-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-5 h-5 text-accent" />
                    <span className="text-2xl font-bold text-foreground">
                      {property.capacity ?? property.total_rooms ?? '—'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {property.capacity ? 'Max Guests' : 'Rooms'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {formatPrice(price, false)}
                  </div>
                  <p className="text-sm text-muted-foreground">Per Night</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'fill-accent text-accent' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">4.8 Rating</p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-foreground text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking card */}
            <div className="lg:col-span-1">
              <div className="card-luxury sticky top-20 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price per night</p>
                  <p className="text-4xl font-serif font-bold text-foreground">
                    {formatPrice(price, false)}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground border-t border-border pt-4">
                  Experience luxury in {property.location}. Premium amenities and world-class service included.
                </p>

                <Link href={`/booking?type=property&id=${property.id}`} className="block">
                  <Button className="w-full py-6 text-lg font-semibold">Book Now</Button>
                </Link>

                <p className="text-xs text-muted-foreground text-center">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
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

      <Footer />
    </main>
  )
}
