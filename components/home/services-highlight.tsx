'use client'

import Link from 'next/link'
import {
  Car,
  Utensils,
  Sparkles,
  Plane,
  ShoppingBag,
  Wand2,
} from 'lucide-react'

const services = [
  {
    icon: Car,
    title: 'Premium Car Rental',
    description: 'Luxury vehicles at your disposal for seamless travel',
  },
  {
    icon: Utensils,
    title: 'Private Chef Services',
    description: 'World-class culinary experiences tailored to your taste',
  },
  {
    icon: Sparkles,
    title: 'Spa & Wellness',
    description: 'Rejuvenate with our premium spa and wellness treatments',
  },
  {
    icon: Plane,
    title: 'Airport Transfers',
    description: 'VIP ground transportation with professional drivers',
  },
  {
    icon: ShoppingBag,
    title: 'Personal Shopping',
    description: 'Exclusive shopping experiences in luxury destinations',
  },
  {
    icon: Wand2,
    title: 'Housekeeping',
    description: 'Premium cleaning and maintenance services available',
  },
]

export function ServicesHighlight() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Premium Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhance your stay with our curated collection of luxury services and experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="card-luxury flex flex-col items-start group hover:bg-card/50"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-7 h-7 text-accent" />
                </div>

                <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {service.description}
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
