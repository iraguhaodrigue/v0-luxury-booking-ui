'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, ArrowRight, Star } from 'lucide-react';
import type { Property } from '@/lib/types/marketplace';

interface WishlistCardProps {
  property: Property;
  onRemove?: (propertyId: number) => void;
}

export function WishlistCard({ property, onRemove }: WishlistCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Property Image */}
        <div className="relative h-48 md:h-auto md:col-span-1 bg-secondary">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="col-span-1 md:col-span-3 p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin size={16} />
                <span className="text-sm">
                  {property.city}, {property.country}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {property.property_type}
            </Badge>
          </div>

          {/* Info Row */}
          <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
            {property.description && (
              <p className="line-clamp-2">{property.description}</p>
            )}

            {property.star_rating && (
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">
                  {property.star_rating.toFixed(1)}
                </span>
                {property.total_reviews && (
                  <span>({property.total_reviews} reviews)</span>
                )}
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-foreground">
                ${property.base_price_per_night?.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground">/night</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove?.(property.id)}
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </Button>
              <Link href={`/properties/${property.id}`}>
                <Button>
                  View
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
