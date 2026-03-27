import Link from 'next/link'
import { MapPin, Spa, Utensils, Navigation, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/server'

const serviceIcons: Record<string, any> = {
  spa: Spa,
  dining: Utensils,
  tour: Navigation,
  transport: Truck,
}

export async function ServicesHighlight() {
  const supabase = await createClient()
  
  // Fetch services from database
  const { data: services = [] } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .limit(6)

  if (!services || services.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Premium Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Services coming soon. Check back later!
            </p>
          </div>
        </div>
      </section>
    )
  }

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
            From airport transfers to private dining, our curated services make your Rwanda stay unforgettable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any) => {
            const IconComponent = serviceIcons[service.service_type] || Spa
            return (
              <Link key={service.id} href={`/services/${service.id}`}>
                <div className="group cursor-pointer">
                  <div className="bg-secondary rounded-lg p-8 text-center hover:bg-primary/10 transition-colors h-full flex flex-col items-center justify-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-4 group-hover:bg-accent/30 transition-colors">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description || 'Premium service'}
                    </p>
                    <p className="text-lg font-bold text-accent mb-3">
                      {formatPrice(service.price_per_day || 0, false)}/day
                    </p>
                    {service.category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/services">
            <button className="btn-luxury">
              Explore All Services
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
