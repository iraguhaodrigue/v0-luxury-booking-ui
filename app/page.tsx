import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedVillas } from '@/components/home/featured-villas'
import { FeaturedApartments } from '@/components/home/featured-apartments'
import { FeaturedCars } from '@/components/home/featured-cars'
import { ServicesHighlight } from '@/components/home/services-highlight'

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <HeroSection />
      <FeaturedVillas />
      <FeaturedApartments />
      <FeaturedCars />
      <ServicesHighlight />
      <Footer />
    </main>
  )
}
