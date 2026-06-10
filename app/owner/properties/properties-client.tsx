'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Grid, List } from 'lucide-react';
import type { Property } from '@/lib/types/marketplace';

export function OwnerPropertiesClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load owner properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        // TODO: Fetch owner properties
        // const data = await getOwnerProperties(ownerId);
        // setProperties(data);
        // setFilteredProperties(data);
        console.log('[v0] Owner properties loading placeholder');
      } catch (error) {
        console.error('[v0] Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = properties.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProperties(filtered);
  }, [searchQuery, properties]);

  const handleDelete = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      // TODO: Call delete API
      // await deleteProperty(propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (error) {
      console.error('[v0] Error deleting property:', error);
    }
  };

  return (
    <div className="w-full bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search and View Toggle */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any properties yet
            </p>
            <Link href="/owner/properties/new">
              <Button className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Property
              </Button>
            </Link>
          </Card>
        )}

        {/* No Results */}
        {!loading && properties.length > 0 && filteredProperties.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No properties found matching "{searchQuery}"
            </p>
          </Card>
        )}

        {/* Properties Grid View */}
        {!loading && filteredProperties.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-secondary overflow-hidden">
                  {property.images && property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {property.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {property.city}, {property.country}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {property.property_type}
                    </Badge>
                    <span className="font-semibold">
                      ${property.base_price_per_night?.toFixed(0)}/night
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Link href={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Link href={`/owner/properties/${property.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Properties List View */}
        {!loading && filteredProperties.length > 0 && viewMode === 'list' && (
          <div className="space-y-2">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="p-4 flex items-center justify-between hover:bg-muted transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">{property.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.city}, {property.country} •{' '}
                    <Badge variant="outline" className="capitalize inline-block ml-2">
                      {property.property_type}
                    </Badge>
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold">${property.base_price_per_night?.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">per night</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/properties/${property.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/owner/properties/${property.id}/edit`}>
                    <Button size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
