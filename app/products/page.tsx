'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface Property {
  id: number
  name: string
  property_type: string
  base_price_per_night: number
  images: string[]
}

interface Car {
  id: number
  make: string
  model: string
  price_per_day: number
  images: string[]
}

interface Service {
  id: number
  name: string
  price_per_day: number
}

export default function ProductSelectionPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('properties')

  useEffect(() => {
    fetchAllProducts()
  }, [])

  const fetchAllProducts = async () => {
    try {
      const supabase = createClient()

      // Fetch properties
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('id, name, property_type, base_price_per_night, images')
        .eq('status', 'available')
        .limit(50)

      if (!propsError && propsData) {
        setProperties(propsData)
      }

      // Fetch cars
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('id, make, model, price_per_day, images')
        .eq('status', 'available')
        .limit(50)

      if (!carsError && carsData) {
        setCars(carsData)
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price_per_day')
        .limit(50)

      if (!servicesError && servicesData) {
        setServices(servicesData)
      }
    } catch (error) {
      console.error('[v0] Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const villas = properties.filter((p) => p.property_type === 'villa')
  const apartments = properties.filter((p) => p.property_type === 'apartment')

  return (
    <main className="w-full">
      <Navbar />

      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Select Your Booking
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Choose from our available properties, vehicles, and services
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-12 border-b border-border overflow-x-auto">
                <button
                  onClick={() => setActiveTab('villas')}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === 'villas'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Villas {villas.length > 0 && `(${villas.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('apartments')}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === 'apartments'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Apartments {apartments.length > 0 && `(${apartments.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('cars')}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === 'cars'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Cars {cars.length > 0 && `(${cars.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === 'services'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Services {services.length > 0 && `(${services.length})`}
                </button>
              </div>

              {/* Content */}
              <div>
                {/* Villas */}
                {activeTab === 'villas' && (
                  <div>
                    {villas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {villas.map((villa) => (
                          <ProductCard key={villa.id} product={villa} type="property" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No villas available at this time.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Apartments */}
                {activeTab === 'apartments' && (
                  <div>
                    {apartments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {apartments.map((apt) => (
                          <ProductCard key={apt.id} product={apt} type="property" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No apartments available at this time.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cars */}
                {activeTab === 'cars' && (
                  <div>
                    {cars.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.map((car) => (
                          <ProductCard key={car.id} product={car} type="car" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No cars available at this time.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Services */}
                {activeTab === 'services' && (
                  <div>
                    {services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No services available at this time.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function ProductCard({ product, type }: { product: any; type: 'property' | 'car' }) {
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'
  const name = type === 'property' ? product.name : `${product.make} ${product.model}`
  const price = type === 'property' ? product.base_price_per_night : product.price_per_day
  const priceLabel = type === 'property' ? '/night' : '/day'

  return (
    <div className="card-luxury overflow-hidden h-full flex flex-col hover:shadow-luxury-lg transition">
      <div className="relative h-48 overflow-hidden rounded-lg bg-muted mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-serif font-bold text-foreground mb-2">{name}</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-accent">${price}</span>
          <span className="text-sm text-muted-foreground">{priceLabel}</span>
        </div>
      </div>
      <button className="mt-6 w-full bg-accent text-accent-foreground py-3 rounded-md font-semibold hover:bg-accent/90">
        Select
      </button>
    </div>
  )
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="card-luxury overflow-hidden h-full flex flex-col hover:shadow-luxury-lg transition">
      <h3 className="text-lg font-serif font-bold text-foreground mb-4">{service.name}</h3>
      <div className="flex-grow">
        <div className="flex items-baseline justify-between mb-6">
          <span className="text-2xl font-bold text-accent">${service.price_per_day}</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
      </div>
      <button className="mt-auto w-full bg-accent text-accent-foreground py-3 rounded-md font-semibold hover:bg-accent/90">
        Add to Booking
      </button>
    </div>
  )
}
