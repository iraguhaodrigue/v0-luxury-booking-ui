'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ImageGallery, RoomSelector, ReviewDisplay } from '@/components/marketplace';
import { MapPin, Users, Heart, Share2, Check, BedDouble } from 'lucide-react';
import type { Property, Review } from '@/lib/types/marketplace';

interface PropertyDetailClientProps {
  property: Property;
  reviews: Review[];
}

export function PropertyDetailClient({ property, reviews }: PropertyDetailClientProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kiluva_wishlist');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        setWishlist(list);
        setIsWishlisted(list.includes(property.id));
      } catch (error) {
        console.error('[v0] Error loading wishlist:', error);
      }
    }
  }, [property.id]);

  const handleWishlistToggle = () => {
    const newList = isWishlisted
      ? wishlist.filter((id) => id !== property.id)
      : [...wishlist, property.id];

    setWishlist(newList);
    setIsWishlisted(!isWishlisted);
    localStorage.setItem('kiluva_wishlist', JSON.stringify(newList));
  };

  const amenities = property.amenities || [];
  const images = property.images || [];
  const availableRooms = (property.rooms || []).filter((r) => r.is_available !== false);
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

  return (
    <div className="w-full bg-background">
      {/* Image Gallery Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {images && images.length > 0 ? (
            <ImageGallery images={images} alt={property.name} />
          ) : (
            <div className="bg-secondary rounded-lg h-96 flex items-center justify-center text-muted-foreground">
              No images available
            </div>
          )}
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12 md:py-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {property.property_type && (
                    <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">
                      {property.property_type}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 text-balance">
                    {property.name}
                  </h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>
                      {property.location || 'Location'}
                      {property.country && `, ${property.country}`}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWishlistToggle}
                    aria-label="Save property"
                  >
                    <Heart
                      className="w-6 h-6"
                      fill={isWishlisted ? 'currentColor' : 'none'}
                      color={isWishlisted ? '#ef4444' : 'currentColor'}
                    />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Share property">
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 border-y border-border py-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-5 h-5 text-accent" />
                    <span className="text-2xl font-bold text-foreground">
                      {property.total_rooms || '—'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    ${property.base_price_per_night?.toFixed(0) || '—'}
                  </div>
                  <p className="text-sm text-muted-foreground">Per Night</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {averageRating ? averageRating.toFixed(1) : '—'}
                  </div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {amenities && amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-foreground text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Section */}
              {availableRooms && availableRooms.length > 0 && (
                <div>
                  <RoomSelector
                    rooms={availableRooms}
                    selectedRoomId={selectedRoomId}
                    onRoomSelect={setSelectedRoomId}
                  />
                </div>
              )}

              {/* Reviews Section */}
              {reviews && reviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Guest Reviews</h2>
                  <ReviewDisplay reviews={reviews} averageRating={averageRating} />
                </div>
              )}
            </div>

            {/* Booking Card Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 p-6 space-y-6">
                {/* Price */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {availableRooms && availableRooms.length > 0
                      ? 'Entire property from'
                      : 'Price per night'}
                  </p>
                  <p className="text-4xl font-serif font-bold text-foreground">
                    ${property.base_price_per_night?.toFixed(0) || '0'}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground border-t border-border pt-4">
                  {availableRooms && availableRooms.length > 0
                    ? `Book the entire ${property.name} for exclusive use, or select an individual room above.`
                    : `Experience ${property.location} in luxury and comfort with premium amenities.`}
                </p>

                {/* CTA Button */}
                <Link
                  href={`/booking?type=property&id=${property.id}&subtype=full_property`}
                  className="block"
                >
                  <Button className="w-full py-6 text-lg font-semibold">
                    {availableRooms && availableRooms.length > 0
                      ? 'Book Entire Property'
                      : 'Book Now'}
                  </Button>
                </Link>

                {/* Helper Text */}
                <p className="text-xs text-muted-foreground text-center">
                  You won&apos;t be charged yet
                </p>

                {/* Room Badge */}
                {availableRooms && availableRooms.length > 0 && (
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-3">
                    <BedDouble className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
