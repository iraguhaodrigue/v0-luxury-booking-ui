'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Car,
  Utensils,
  Heart,
  MapPin,
  ShoppingBag,
  Camera,
  Compass,
  Wine,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SERVICES as SAMPLE_SERVICES } from '@/lib/constants/rwanda-data'

interface Service {
  id: number
  name: string
  service_type: string
  description: string | null
  price_per_day: number
  is_active: boolean
}

const serviceIcons: Record<string, any> = {
  spa: Heart,
  butler: ShoppingBag,
  chef: Utensils,
  concierge: Compass,
  cleaning: Camera,
  car: Car,
  transport: Car,
  home: MapPin,
}

export function ServicesHighlight() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      if (data && data.length > 0) {
        setServices(data)
      } else {
        // Fallback to sample data if no services in database
        setServices(SAMPLE_SERVICES.slice(0, 6) as unknown as Service[])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      // Fallback to sample data on error
      setServices(SAMPLE_SERVICES.slice(0, 6) as unknown as Service[])
    } finally {
      setLoading(false)
    }
  }

  const highlightedServices = services.slice(0, 6)

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold mb-2 tracking-widest">
            PREMIUM SERVICES
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Elevate Your Experience
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From airport transfers to private chefs, our curated services make your Rwanda stay unforgettable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : highlightedServices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No services available</p>
            </div>
          ) : (
            highlightedServices.map((service) => {
              const IconComponent = serviceIcons[service.service_type] || Car
              return (
                <div
                  key={service.id}
                  className="card-luxury flex flex-col items-start group hover:bg-card/80 hover:shadow-luxury-md transition-all"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <IconComponent className="w-7 h-7 text-accent" />
                  </div>

                  <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {service.description || 'Premium service for your stay'}
                  </p>
                  <p className="text-accent font-semibold mt-auto">
                    From {(service.price_per_day / 1000).toFixed(0)}K RWF/day
                  </p>
                </div>
              )
            })
          )}
        </div>

        <div className="text-center mt-16">
          <Link href="/services">
            <button className="btn-luxury-accent text-lg">
              Explore All Services
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
