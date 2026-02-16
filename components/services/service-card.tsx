import { ReactNode } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/currency'

interface ServiceCardProps {
  icon?: ReactNode
  title: string
  description: string
  details?: string[]
  price: number
  duration: string
  image?: string
}

export function ServiceCard({
  icon,
  title,
  description,
  details,
  price,
  duration,
  image,
}: ServiceCardProps) {
  return (
    <div className="card-luxury h-full flex flex-col group overflow-hidden">
      {/* Image or Icon Background */}
      {image ? (
        <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : icon ? (
        <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          {icon}
        </div>
      ) : null}

      {/* Content */}
      <h3 className="text-xl font-serif font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {description}
      </p>

      {/* Details */}
      {details && details.length > 0 && (
        <ul className="space-y-2 mb-6 flex-grow">
          {details.map((detail, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
              <span className="text-accent font-bold mt-0.5">•</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Price & CTA */}
      <div className="border-t border-border pt-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting at</p>
            <p className="text-2xl font-bold text-accent">
              {formatPrice(price, false)}
            </p>
            <p className="text-xs text-muted-foreground">{duration}</p>
          </div>
        </div>
        <button className="w-full btn-luxury-ghost text-sm">
          Learn More
        </button>
      </div>
    </div>
  )
}
