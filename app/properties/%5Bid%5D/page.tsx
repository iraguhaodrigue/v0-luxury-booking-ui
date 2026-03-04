import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/currency'
import { MapPin, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Property Details | Rwanda Luxury',
  description: 'View luxury property details, amenities, and book your stay',
}

async function getProperty(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    redirect('/properties')
  }
  return data
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)

  const amenitiesList = Array.isArray(property.amenities) 
    ? property.amenities 
    : (typeof property.amenities === 'string' ? JSON.parse(property.amenities) : [])

  const imageUrls = Array.isArray(property.images) ? property.images : [property.images || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80']

  return (
    <main className="w-full">
      <Navbar />

      {/* Image Gallery Section */}
      <section className="w-full bg-background">
        <ImageGallery images={imageUrls} propertyName={property.name} />
      </section>

      {/* Property Details Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span>{property.location}, {property.city}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {property.property_type}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per night</p>
                    <p className="text-3xl font-bold text-accent">
                      {formatPrice(property.base_price_per_night, false)}
                    </p>
                  </div>
                  {property.total_rooms && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total rooms</p>
                      <p className="text-3xl font-bold text-foreground">{property.total_rooms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About this property</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {amenitiesList.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        <span className="text-foreground font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="card-luxury sticky top-32 p-6">
                <h3 className="text-xl font-serif font-bold text-foreground mb-6">Reserve this property</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total price (example for 1 night)</p>
                    <p className="text-2xl font-bold text-accent">
                      {formatPrice(property.base_price_per_night, false)}
                    </p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                  asChild
                >
                  <a href={`/booking?property=${property.id}`}>Book Now</a>
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  You wont be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function ImageGallery({ images, propertyName }: { images: string[]; propertyName: string }) {
  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {images && images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Main image */}
            <div className="md:col-span-2 row-span-2">
              <div className="w-full h-96 md:h-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={images[0]}
                  alt={propertyName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Thumbnail grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {images.slice(0, 4).map((image, idx) => (
                <div key={idx} className="h-40 rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                  <img
                    src={image}
                    alt={`${propertyName} - ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {images.length > 4 && (
                <div className="h-40 rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">+{images.length - 4}</p>
                    <p className="text-xs text-muted-foreground">more photos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-96 rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No images available</p>
          </div>
        )}
      </div>
    </div>
  )
}
