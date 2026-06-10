'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchProperties } from '@/lib/services/marketplace.service';
import { PropertyFiltersComponent } from '@/components/search/property-filters';
import { PropertyCard } from '@/components/marketplace/property-card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PropertyFilters, Property } from '@/lib/types/marketplace';

export function SearchPageClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kiluva_wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (error) {
        console.error('[v0] Error loading wishlist:', error);
      }
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchProperties(newFilters);
      setProperties(results.properties || []);
    } catch (error) {
      console.error('[v0] Search error:', error);
      setError('Failed to search properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle wishlist toggle
  const handleWishlistToggle = (propertyId: number) => {
    const newWishlist = wishlist.includes(propertyId)
      ? wishlist.filter((id) => id !== propertyId)
      : [...wishlist, propertyId];

    setWishlist(newWishlist);
    localStorage.setItem('kiluva_wishlist', JSON.stringify(newWishlist));
  };

  return (
    <div className="w-full bg-background">
      {/* Hero Section */}
      <section className="bg-secondary py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Explore Global Properties
          </h1>
          <p className="text-lg text-muted-foreground">
            Find your perfect accommodation worldwide on KILUVA
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <PropertyFiltersComponent onFiltersChange={handleFilterChange} />
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              {hasSearched && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {loading ? 'Searching...' : `${properties.length} properties found`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Object.keys(filters).length > 0 && (
                      <button
                        onClick={() => {
                          setFilters({});
                          setProperties([]);
                          setHasSearched(false);
                        }}
                        className="text-primary hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Searching properties...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6 text-center">
                  <p className="text-destructive font-medium">{error}</p>
                  <Button
                    onClick={() => handleFilterChange(filters)}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && hasSearched && properties.length === 0 && (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No properties found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    onClick={() => {
                      setFilters({});
                      setProperties([]);
                      setHasSearched(false);
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Properties Grid */}
              {!loading && properties.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isWishlisted={wishlist.includes(property.id)}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>
              )}

              {/* Initial State */}
              {!hasSearched && (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready to explore?
                  </h3>
                  <p className="text-muted-foreground">
                    Use the filters on the left to find your perfect property
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
