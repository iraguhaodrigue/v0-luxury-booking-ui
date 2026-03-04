import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, Users, DollarSign, Check } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/currency'

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>
}

async function getProperty(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !data) {
      console.error('[v0] Property not found:', id, error)
      return null
    }

    return data
  } catch (error) {
    console.error('[v0] Error fetching property:', error)
    return null
  }
}

export async function generateMetadata({ params }: PropertyDetailsPageProps) {
  const resolvedParams = await params
  const property = await getProperty(resolvedParams.id)

  if (!property) {
    return {
      title: 'Property Not Found | Rwanda Luxury Hospitality',
      description: 'The property you are looking for does not exist.',
    }
  }

  return {
    title: `${property.name} | Rwanda Luxury Hospitality`,
    description: property.description || `${property.name} in ${property.location}, Rwanda`,
  }
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const resolvedParams = await params
  const property = await getProperty(resolvedParams.id)

  if (!property) {
    notFound()
  }

  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
      ? property.amenities.split(',').map((a: string) => a.trim())
      : []

  const images = Array.isArray(property.images) ? property.images : [property.images || '']

  return (
    <main className="w-full">
      <Navbar />

      {/* Image Gallery */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[500px] md:h-[600px]">
          {/* Main Image */}
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-lg">
            <img
              src={images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'}
              alt={property.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Thumbnail Images */}
          {images.slice(1, 5).map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg hidden md:block">
              <img
                src={image}
                alt={`${property.name} - ${index + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Property Details */}
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
                      {property.name}
                    </h1>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{property.location}, {property.country}</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Heart className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {amenitiesList.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map((amenity, index) => (
                      <div key={index} className="flex items-center text-foreground">
                        <Check className="w-5 h-5 text-accent mr-3" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms/Capacity */}
              {property.total_rooms && (
                <div className="mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Capacity</h2>
                  <div className="flex items-center text-lg text-muted-foreground">
                    <Users className="w-5 h-5 mr-3 text-accent" />
                    <span>{property.total_rooms} rooms available</span>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="card-luxury sticky top-20 space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Price per night</div>
                  <div className="text-4xl font-serif font-bold text-foreground">
                    {formatPrice(property.base_price_per_night, false)}
                  </div>
                </div>

                <div className="border-t border-muted pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Experience luxury in {property.location}. Premium amenities and world-class service included.
                  </p>
                </div>

                <Link href={`/booking?property=${property.id}`} className="w-full block">
                  <Button className="w-full py-6 text-lg font-semibold">
                    Book Now
                  </Button>
                </Link>

                <div className="text-xs text-muted-foreground text-center">
                  You won't be charged yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
