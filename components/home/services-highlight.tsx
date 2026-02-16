'use client'

import Link from 'next/link'
import {
  Car,
  Utensils,
  Heart,
  MapPin,
  ShoppingBag,
  Camera,
  Compass,
  Wine,
} from 'lucide-react'
import { SERVICES } from '@/lib/constants/rwanda-data'

const serviceIcons: Record<string, any> = {
  car: Car,
  utensils: Utensils,
  heart: Heart,
  'shopping-bag': ShoppingBag,
  camera: Camera,
  compass: Compass,
  'wine-glass': Wine,
  home: MapPin,
}

export function ServicesHighlight() {
  const highlightedServices = SERVICES.slice(0, 6)

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
          {highlightedServices.map((service) => {
            const IconComponent = serviceIcons[service.icon] || Car
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
                  {service.description}
                </p>
                <p className="text-accent font-semibold mt-auto">
                  From {(service.price / 1000).toFixed(0)}K RWF
                </p>
              </div>
            )
          })}
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
