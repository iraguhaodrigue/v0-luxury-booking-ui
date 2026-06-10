/**
 * SEO Utilities
 * Generate meta tags, structured data, and SEO-optimized content
 */

export interface SEOMetadata {
  title: string
  description: string
  image?: string
  url?: string
  type?: string
}

/**
 * Generate Open Graph tags
 */
export function generateOGTags(metadata: SEOMetadata) {
  return {
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:image': metadata.image || 'https://kiluva.com/og-image.png',
    'og:url': metadata.url,
    'og:type': metadata.type || 'website',
  }
}

/**
 * Generate Twitter Card tags
 */
export function generateTwitterTags(metadata: SEOMetadata) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.image,
    'twitter:site': '@KILUVA',
  }
}

/**
 * Generate JSON-LD structured data
 */
export function generateStructuredData(
  type: 'Property' | 'Product' | 'Organization' | 'Event',
  data: Record<string, any>
) {
  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return `<script type="application/ld+json">${JSON.stringify(baseStructure)}</script>`
}

/**
 * Generate property structured data
 */
export function generatePropertySchema(property: {
  id: number
  name: string
  description: string
  price: number
  location: string
  image: string
  rating: number
  reviewCount: number
}) {
  return generateStructuredData('Property', {
    name: property.name,
    description: property.description,
    image: property.image,
    priceRange: `$${property.price}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: property.rating,
      reviewCount: property.reviewCount,
    },
  })
}

/**
 * Generate product structured data
 */
export function generateProductSchema(product: {
  name: string
  description: string
  price: number
  image: string
  rating: number
  reviewCount: number
  seller: string
}) {
  return generateStructuredData('Product', {
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    seller: {
      '@type': 'Organization',
      name: product.seller,
    },
  })
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Generate meta description (max 160 chars)
 */
export function generateMetaDescription(text: string): string {
  const maxLength = 160
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Check SEO score
 */
export function calculateSEOScore(metadata: SEOMetadata): {
  score: number
  issues: string[]
} {
  const issues: string[] = []
  let score = 100

  // Check title
  if (!metadata.title) {
    issues.push('Missing page title')
    score -= 20
  } else if (metadata.title.length < 30) {
    issues.push('Title is too short (min 30 characters)')
    score -= 5
  } else if (metadata.title.length > 60) {
    issues.push('Title is too long (max 60 characters)')
    score -= 5
  }

  // Check description
  if (!metadata.description) {
    issues.push('Missing meta description')
    score -= 20
  } else if (metadata.description.length < 120) {
    issues.push('Description is too short (min 120 characters)')
    score -= 5
  } else if (metadata.description.length > 160) {
    issues.push('Description is too long (max 160 characters)')
    score -= 5
  }

  // Check image
  if (!metadata.image) {
    issues.push('Missing OG image')
    score -= 10
  }

  return { score: Math.max(0, score), issues }
}
