'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/currency'
import { Search, Filter, ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  rating: number
  shop: { id: number; name: string }
}

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food', 'Crafts', 'Services', 'Other']

export function ShopBrowseClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (selectedCategory !== 'All') params.append('category', selectedCategory)

        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('[v0] Error fetching products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, selectedCategory])

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Shop Local</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover products and services from local sellers across the continent
          </p>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category === 'All' && <Filter className="w-4 h-4 mr-2" />}
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <>
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-80 bg-secondary/50 animate-pulse" />
              ))}
            </>
          ) : products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="relative h-48 bg-secondary/50 overflow-hidden">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex-1 p-4 flex flex-col">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2">{product.name}</h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>

                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
                    </div>

                    <div className="mt-auto">
                      <p className="text-sm text-muted-foreground mb-2">From {product.shop.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-accent">{formatPrice(product.price, false)}</p>
                        <Button size="sm" variant="outline" className="gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-muted-foreground">No products found</p>
              <Button variant="outline" onClick={() => setSearch('')} className="mt-4">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
