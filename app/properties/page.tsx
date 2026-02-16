import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { PropertyGrid } from '@/components/properties/property-grid'

export const metadata = {
  title: 'Browse Properties | Rwanda Luxury',
  description: 'Explore our curated collection of luxury villas, hotels, and apartments across Rwanda',
}

export default function PropertiesPage() {
  return (
    <main className="w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent text-sm font-semibold mb-2 tracking-widest">
            CURATED COLLECTION
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Luxury Properties in Rwanda
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover premium villas, hotel rooms, and apartments across Rwanda's most beautiful locations including Kigali, Rubavu, Musanze, and Huye.
          </p>
        </div>
      </section>

      {/* Property Grid */}
      <PropertyGrid />

      <Footer />
    </main>
  )
}
