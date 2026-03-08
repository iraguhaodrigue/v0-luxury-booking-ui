import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { CarCard } from '@/components/cars/car-card'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { querySelectors } from '@/lib/utils/query-optimizations'
import { Car, UserCheck, ShieldCheck } from 'lucide-react'

async function fetchCars() {
  try {
    logger.info('Fetching cars from database')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cars')
      .select(querySelectors.carsListing)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching cars from database', error)
      return []
    }

    if (!data || data.length === 0) {
      logger.info('No cars found in database')
      return []
    }

    logger.success(`Retrieved ${data.length} cars from database`)
    return data
  } catch (error) {
    logger.error('Exception while fetching cars', error)
    return []
  }
}

export const metadata = {
  title: 'Car Rental | Luxury Stays',
  description: 'Rent luxury vehicles to complement your premium stay',
}

export default async function CarRentalPage() {
  const cars = await fetchCars()
  return (
    <main className="w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 text-balance">
            Luxury Car Rental
          </h1>
          <p className="text-xl text-white/90 font-light max-w-2xl">
            Explore in style with our exclusive fleet of premium vehicles
          </p>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Our Fleet
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Choose from our curated selection of luxury vehicles, each
              maintained to the highest standards
            </p>
          </div>

          {/* Cars Grid */}
          {cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <CarCard key={car.id} {...car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No cars available at this time. Please check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">
            Why Choose Our Car Rental?
          </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Premium Fleet
              </h3>
              <p className="text-muted-foreground">
                Hand-selected luxury vehicles maintained to the highest standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Professional Drivers
              </h3>
              <p className="text-muted-foreground">
                Expert drivers available or self-drive options for complete freedom
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Complete Coverage
              </h3>
              <p className="text-muted-foreground">
                Comprehensive insurance and 24/7 roadside support included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-primary-foreground mb-6">
            Complete Your Luxury Experience
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Combine our luxury accommodations with a premium vehicle to create the
            perfect travel experience
          </p>
          <button className="btn-luxury-accent">
            Book a Vehicle
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
