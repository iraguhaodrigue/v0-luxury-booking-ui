import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedVillas } from '@/components/home/featured-villas'
import { FeaturedApartments } from '@/components/home/featured-apartments'
import { ServicesHighlight } from '@/components/home/services-highlight'

export const revalidate = 3600 // Revalidate every hour

export default async function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <HeroSection />
      <FeaturedVillas />
      <FeaturedApartments />
      <ServicesHighlight />
      <Footer />
    </main>
  )
}
