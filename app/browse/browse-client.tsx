'use client';

import { useState, useEffect } from 'react';
import { getAllProperties } from '@/lib/services/marketplace.service';
import { PropertyCard } from '@/components/marketplace/property-card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Property } from '@/lib/types/marketplace';

export function BrowsePageClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [displayCount, setDisplayCount] = useState(12);

  // Load properties and wishlist
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load wishlist
        const saved = localStorage.getItem('kiluva_wishlist');
        if (saved) {
          try {
            setWishlist(JSON.parse(saved));
          } catch (error) {
            console.error('[v0] Error loading wishlist:', error);
          }
        }

        // Load properties
        const result = await getAllProperties();
        setProperties(result.properties || []);
      } catch (error) {
        console.error('[v0] Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle wishlist toggle
  const handleWishlistToggle = (propertyId: number) => {
    const newWishlist = wishlist.includes(propertyId)
      ? wishlist.filter((id) => id !== propertyId)
      : [...wishlist, propertyId];

    setWishlist(newWishlist);
    localStorage.setItem('kiluva_wishlist', JSON.stringify(newWishlist));
  };

  const displayedProperties = properties.slice(0, displayCount);
  const hasMore = displayCount < properties.length;

  return (
    <div className="w-full bg-background">
      {/* Hero Section */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            Browse Our Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover handpicked luxury properties from around the world. From exclusive villas to
            boutique hotels, find your perfect getaway.
          </p>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {loading ? 'Loading properties...' : `${properties.length} properties available`}
            </h2>
            <Link href="/search" className="text-primary hover:underline text-sm">
              Use advanced search to filter
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading luxury properties...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && properties.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">Check back soon for new listings</p>
              <Link href="/">
                <Button variant="outline">Go to Home</Button>
              </Link>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isWishlisted={wishlist.includes(property.id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button
                    onClick={() => setDisplayCount((prev) => prev + 12)}
                    variant="outline"
                    size="lg"
                  >
                    Load More Properties
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {properties.length > 0 && (
        <section className="bg-secondary py-12 md:py-16 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Use our advanced search filters to narrow down your options and find the perfect
              property for your next getaway.
            </p>
            <Link href="/search">
              <Button size="lg">Advanced Search</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
