'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import Image from 'next/image'

interface ProductCardProps {
  id: number
  name: string
  description?: string
  price: number
  image?: string
  rating?: number
  reviewCount?: number
  inStock: boolean
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  rating = 5,
  reviewCount = 0,
  inStock,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      })

      if (response.ok) {
        // Show success toast or feedback
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/shop/products/${id}`}>
        <div className="relative h-48 overflow-hidden bg-secondary">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <div>
          <Link href={`/shop/products/${id}`}>
            <h3 className="font-semibold text-foreground hover:text-accent line-clamp-2">
              {name}
            </h3>
          </Link>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {reviewCount} reviews
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatPrice(price)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'fill-accent text-accent' : ''}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
