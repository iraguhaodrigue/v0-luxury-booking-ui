import { notFound } from 'next/navigation'
import { getPropertyById, getReviewsByProperty } from '@/lib/services/marketplace.service'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { PropertyDetailClient } from './property-detail-client'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const propertyId = parseInt(id)
  
  try {
    const property = await getPropertyById(propertyId)
    if (!property) return { title: 'Property Not Found | KILUVA' }
    
    return {
      title: `${property.name} | KILUVA`,
      description: property.description || `${property.name} in ${property.location}`,
      openGraph: {
        title: property.name,
        description: property.description,
        images: property.images && property.images.length > 0 ? [property.images[0]] : [],
      },
    }
  } catch {
    return { title: 'Property Not Found | KILUVA' }
  }
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params
  const propertyId = parseInt(id)

  try {
    const [property, reviews] = await Promise.all([
      getPropertyById(propertyId),
      getReviewsByProperty(propertyId),
    ])

    if (!property) {
      notFound()
    }

    return (
      <main className="w-full">
        <Navbar />
        <PropertyDetailClient property={property} reviews={reviews} />
        <Footer />
      </main>
    )
  } catch (error) {
    console.error('[v0] Error loading property:', error)
    notFound()
  }
}
}
