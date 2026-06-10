'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, Users } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '@/lib/types/marketplace';

interface PropertyCardProps {
  property: Property;
  onWishlistToggle?: (propertyId: number) => void;
  isWishlisted?: boolean;
}

export function PropertyCard({ property, onWishlistToggle, isWishlisted }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/placeholder-property.jpg';

  const propertyType = property.property_type
    ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
    : 'Property';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div
        className="relative w-full h-64 overflow-hidden bg-secondary"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          className={`object-cover w-full h-full transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Wishlist Button */}
        <button
          onClick={() => onWishlistToggle?.(property.id)}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            size={20}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>

        {/* Property Type Badge */}
        <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground">
          {propertyType}
        </Badge>

        {/* Rating Badge */}
        {property.star_rating && (
          <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{property.star_rating.toFixed(1)}</span>
            {property.total_reviews && (
              <span className="text-xs text-muted-foreground">({property.total_reviews})</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Location */}
        <div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{property.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin size={16} />
            <span className="line-clamp-1">
              {property.city || property.location}
              {property.country && `, ${property.country}`}
            </span>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rooms Info */}
        {property.total_rooms && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{property.total_rooms} room{property.total_rooms !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-xl font-bold text-foreground">
              ${property.base_price_per_night.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/night</span>
            </p>
          </div>
          <Link href={`/properties/${property.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
