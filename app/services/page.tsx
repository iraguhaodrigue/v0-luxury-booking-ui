import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { ServiceCard } from '@/components/services/service-card'
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
    icon: Plane,
    title: 'Airport Transfer',
    description:
      'Arrive in style with our premium ground transportation service. Professional drivers, luxury vehicles, and seamless service.',
    details: [
      'VIP driver service',
      'Luxury vehicle options',
      'Real-time tracking',
      'Meet & greet service',
    ],
    price: 150,
    duration: 'Per transfer',
    image: 'https://images.unsplash.com/photo-1566909114-f6e7ad7d3136?w=600&q=80',
  },
  {
    icon: Wand2,
    title: 'Housekeeping',
    description:
      'Experience immaculate cleanliness with our professional housekeeping team. Daily cleaning, laundry, and maintenance.',
    details: [
      'Daily cleaning service',
      'Laundry & ironing',
      'Restocking amenities',
      'Maintenance checks',
    ],
    price: 100,
    duration: 'Per day',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  },
  {
    icon: Utensils,
    title: 'Private Chef',
    description:
      'Indulge in world-class culinary experiences prepared by our private chefs. Custom menus, dietary accommodations available.',
    details: [
      'Custom menu planning',
      'International cuisine',
      'Dietary accommodations',
      'Wine pairing service',
    ],
    price: 250,
    duration: 'Per day',
    image: 'https://images.unsplash.com/photo-1495251119519-d06b96b57f48?w=600&q=80',
  },
  {
    icon: Sparkles,
    title: 'Spa & Wellness',
    description:
      'Rejuvenate your mind and body with our premium spa and wellness treatments. In-villa services available.',
    details: [
      'Massage therapy',
      'Yoga sessions',
      'Meditation classes',
      'Wellness consultations',
    ],
    price: 200,
    duration: 'Per session',
    image: 'https://images.unsplash.com/photo-1544161515-81205f8abecc?w=600&q=80',
  },
  {
    icon: ShoppingBag,
    title: 'Personal Shopping Tour',
    description:
      'Discover exclusive shopping destinations with our personal shoppers. Curated experiences in luxury markets.',
    details: [
      'Expert shopping guides',
      'Exclusive boutiques access',
      'VIP treatment',
      'Delivery coordination',
    ],
    price: 120,
    duration: 'Per day',
    image: 'https://images.unsplash.com/photo-1555529669-d355764c3cf2?w=600&q=80',
  },
  {
    icon: Car,
    title: 'Luxury Car Rental',
    description:
      'Drive in elegance with our fleet of premium vehicles. Professional drivers or self-drive options available.',
    details: [
      'Premium vehicle selection',
      'Professional drivers',
      'Insurance included',
      '24/7 roadside support',
    ],
    price: 180,
    duration: 'Per day',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
  },
]

export const metadata = {
  title: 'Premium Services | Luxury Stays',
  description: 'Enhance your luxury vacation with our exclusive premium services',
}

export default function ServicesPage() {
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
            Premium Services
          </h1>
          <p className="text-xl text-white/90 font-light max-w-2xl">
            Enhance your luxury stay with our exclusive collection of world-class
            services
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                details={service.details}
                price={service.price}
                duration={service.duration}
                image={service.image}
              />
            ))}
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
            Combine our luxury accommodations with premium services for an unforgettable
            experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-luxury-accent">
              Explore Properties
            </button>
            <button className="btn-luxury-ghost text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
