import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { PropertyGrid } from '@/components/properties/property-grid'

export const metadata = {
  title: 'Browse Properties | Luxury Stays',
  description: 'Explore our curated collection of luxury villas and apartments worldwide',
}

export default function PropertiesPage() {
  return (
    <main className="w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Discover Our Properties
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse through our exclusive collection of luxury villas and apartments
            carefully selected from around the world.
          </p>
        </div>
      </section>

      {/* Property Grid */}
      <PropertyGrid />

      <Footer />
    </main>
  )
}
