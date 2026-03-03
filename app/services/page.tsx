import Link from 'next/link'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { ServiceCard } from '@/components/services/service-card'
import { createClient } from '@/lib/supabase/server'
import { Loader2 } from 'lucide-react'
import { SERVICES } from '@/lib/constants/rwanda-data'

export const metadata = {
  title: 'Premium Services | Rwanda Luxury Hospitality',
  description:
    'Enhance your luxury vacation in Rwanda with our exclusive premium services. Airport transfers, private chefs, spa, and more.',
}

async function fetchServices() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching services:', error)
      return SERVICES
    }

    return data && data.length > 0 ? data : SERVICES
  } catch (error) {
    console.error('Error in fetchServices:', error)
    return SERVICES
  }
}

export default async function ServicesPage() {
  const services = await fetchServices()
  return (
    <main className="w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1566909114-f6e7ad7d3136?w=1600&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 text-balance">
            Premium Services for Rwanda
          </h1>
          <p className="text-xl text-white/90 font-light max-w-2xl">
            Enhance your luxury stay with our exclusive collection of world-class
            Rwanda-based hospitality services
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-muted-foreground text-center">
              All prices in Rwandan Francs (RWF)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
                icon={service.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif font-bold text-2xl text-accent mb-2">
                {SERVICES.length}+
              </h3>
              <p className="text-muted-foreground">Premium services available</p>
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-accent mb-2">24/7</h3>
              <p className="text-muted-foreground">Available on-demand</p>
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-accent mb-2">Expert</h3>
              <p className="text-muted-foreground">Professional staff</p>
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-accent mb-2">Local</h3>
              <p className="text-muted-foreground">Rwanda expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-primary-foreground mb-6">
            Ready to Elevate Your Stay?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Combine our luxury accommodations with premium services for an
            unforgettable Rwanda experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <button className="btn-luxury-accent w-full sm:w-auto">
                Explore Properties
              </button>
            </Link>
            <Link href="/contact">
              <button className="btn-luxury-ghost text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
