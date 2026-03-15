import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/currency'
import { MapPin, Users, Check, Heart, Share2, Star, BedDouble, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

interface Room {
  id: number
  property_id: number
  name: string
  room_type: string | null
  capacity: number | null
  price_per_night: number | null
  description: string | null
  amenities: string[] | string | null
  images: string[] | string | null
  is_available: boolean | null
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

async function getRooms(propertyId: number): Promise<Room[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .order('price_per_night', { ascending: true })
    return (data as Room[]) || []
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const property = await getProperty(id)
  if (!property) return { title: 'Property Not Found | KILUVA' }
  return {
    title: `${property.name} | KILUVA`,
    description: property.description || `${property.name} in ${property.location}, Rwanda`,
  }
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { id } = await params
  const [property, rooms] = await Promise.all([getProperty(id), getRooms(parseInt(id, 10))])

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
  const availableRooms = rooms.filter(r => r.is_available !== false)

  return (
    <main className="w-full">
      <Navbar />

      {/* Image Gallery */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[540px]">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-lg">
            <img
              src={images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'}
              alt={property.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          {images.slice(1, 5).map((img: string, i: number) => (
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

            {/* ── Main content ── */}
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
                  <p className="text-sm text-muted-foreground">{property.capacity ? 'Max Guests' : 'Rooms'}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{formatPrice(price, false)}</div>
                  <p className="text-sm text-muted-foreground">Per Night</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-accent text-accent' : 'text-muted'}`} />
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
                    {amenities.map((amenity: string, i: number) => (
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

              {/* ── Rooms section ── */}
              {availableRooms.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Individual Rooms</h2>
                    <span className="text-sm text-muted-foreground">
                      {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRooms.map((room) => {
                      const roomImages: string[] = Array.isArray(room.images)
                        ? room.images
                        : room.images
                        ? [room.images as string]
                        : []
                      const roomAmenities: string[] = Array.isArray(room.amenities)
                        ? room.amenities
                        : typeof room.amenities === 'string'
                        ? (room.amenities as string).split(',').map((a) => a.trim()).filter(Boolean)
                        : []

                      return (
                        <div key={room.id} className="card-luxury hover:shadow-luxury-md transition-all border border-border rounded-xl overflow-hidden p-0">
                          {/* Room image */}
                          <div className="h-44 overflow-hidden">
                            <img
                              src={roomImages[0] || images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'}
                              alt={room.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-5 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-serif font-bold text-lg text-foreground">{room.name}</h3>
                                {room.room_type && (
                                  <p className="text-xs text-accent font-semibold uppercase tracking-wide mt-0.5">
                                    {room.room_type}
                                  </p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-foreground">
                                  {formatPrice(room.price_per_night ?? 0, false)}
                                </p>
                                <p className="text-xs text-muted-foreground">per night</p>
                              </div>
                            </div>

                            {room.capacity && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>Up to {room.capacity} guest{room.capacity !== 1 ? 's' : ''}</span>
                              </div>
                            )}

                            {room.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                            )}

                            {roomAmenities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {roomAmenities.slice(0, 3).map((a, i) => (
                                  <span key={i} className="text-xs bg-secondary text-foreground px-2 py-1 rounded-full">
                                    {a}
                                  </span>
                                ))}
                                {roomAmenities.length > 3 && (
                                  <span className="text-xs text-muted-foreground px-2 py-1">
                                    +{roomAmenities.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            <Link
                              href={`/booking?type=property&id=${property.id}&room_id=${room.id}&room_name=${encodeURIComponent(room.name)}&subtype=room`}
                              className="block"
                            >
                              <Button className="w-full flex items-center gap-2" variant="outline">
                                <BedDouble className="w-4 h-4" />
                                Book This Room
                                <ArrowRight className="w-4 h-4 ml-auto" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Booking card ── */}
            <div className="lg:col-span-1">
              <div className="card-luxury sticky top-20 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {availableRooms.length > 0 ? 'Entire property from' : 'Price per night'}
                  </p>
                  <p className="text-4xl font-serif font-bold text-foreground">
                    {formatPrice(price, false)}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground border-t border-border pt-4">
                  {availableRooms.length > 0
                    ? `Book the entire ${property.name} for exclusive use, or select an individual room above.`
                    : `Experience ${property.location} in comfort with premium amenities included.`}
                </p>

                <Link href={`/booking?type=property&id=${property.id}&subtype=full_property`} className="block">
                  <Button className="w-full py-6 text-lg font-semibold">
                    {availableRooms.length > 0 ? 'Book Entire Property' : 'Book Now'}
                  </Button>
                </Link>

                {availableRooms.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    or scroll up to book an individual room
                  </p>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  You won't be charged yet
                </p>

                {/* Room count badge */}
                {availableRooms.length > 0 && (
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-3">
                    <BedDouble className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      {availableRooms.length} individual room{availableRooms.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                )}
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
