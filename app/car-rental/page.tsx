import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { CarCard } from '@/components/cars/car-card'

const cars = [
  {
    id: 1,
    name: 'Tesla Model S',
    model: 'Electric Sedan',
    price: 250,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    seats: 5,
    transmission: 'Electric',
    power: '450 HP',
    available: true,
    description: 'Luxury electric sedan with autopilot',
  },
  {
    id: 2,
    name: 'Mercedes-Benz S-Class',
    model: 'Luxury Sedan',
    price: 280,
    image: 'https://images.unsplash.com/photo-1552546661-3c1c8e8b5c3c?w=600&q=80',
    seats: 5,
    transmission: 'Automatic',
    power: '500 HP',
    available: true,
    description: 'Premium executive sedan with all amenities',
  },
  {
    id: 3,
    name: 'BMW 7 Series',
    model: 'Executive Sedan',
    price: 270,
    image: 'https://images.unsplash.com/photo-1527893917519-4b9c1d2fe3d0?w=600&q=80',
    seats: 5,
    transmission: 'Automatic',
    power: '530 HP',
    available: true,
    description: 'Advanced luxury technology and comfort',
  },
  {
    id: 4,
    name: 'Porsche 911',
    model: 'Sports Car',
    price: 350,
    image: 'https://images.unsplash.com/photo-1552546661-3c1c8e8b5c3d?w=600&q=80',
    seats: 2,
    transmission: 'Automatic',
    power: '510 HP',
    available: true,
    description: 'Iconic sports car with exhilarating performance',
  },
  {
    id: 5,
    name: 'Rolls-Royce Ghost',
    model: 'Ultra-Luxury Sedan',
    price: 400,
    image: 'https://images.unsplash.com/photo-1552546661-3c1c8e8b5c3e?w=600&q=80',
    seats: 5,
    transmission: 'Automatic',
    power: '563 HP',
    available: false,
    description: 'The ultimate luxury driving experience',
  },
  {
    id: 6,
    name: 'Range Rover',
    model: 'Luxury SUV',
    price: 320,
    image: 'https://images.unsplash.com/photo-1552546661-3c1c8e8b5c3f?w=600&q=80',
    seats: 7,
    transmission: 'Automatic',
    power: '518 HP',
    available: true,
    description: 'Premium SUV with off-road capabilities',
  },
]

export const metadata = {
  title: 'Car Rental | Luxury Stays',
  description: 'Rent luxury vehicles to complement your premium stay',
}

export default function CarRentalPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <CarCard key={car.id} {...car} />
            ))}
          </div>
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
                <span className="text-2xl">🚗</span>
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
                <span className="text-2xl">👔</span>
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
                <span className="text-2xl">🛡️</span>
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
