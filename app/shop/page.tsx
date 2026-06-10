import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { getProducts } from '@/lib/services/marketplace.service'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <main className="w-full">
      <Navbar />

      {/* Hero */}
      <section className="bg-secondary py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            KILUVA Shop
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover curated products and services from across Africa
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-6">
                No products available yet
              </p>
              <Link href="/browse">
                <Button variant="outline">Browse Properties Instead</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price || 0}
                  image={product.image_url}
                  inStock={product.stock > 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
