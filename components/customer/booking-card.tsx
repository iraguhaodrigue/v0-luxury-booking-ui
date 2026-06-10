'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Booking } from '@/lib/types/marketplace';

interface BookingCardProps {
  booking: Booking;
  onMessage?: (bookingId: number) => void;
  onReview?: (propertyId: number) => void;
}

export function BookingCard({ booking, onMessage, onReview }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const canReview = booking.status === 'completed';
  const isUpcoming = booking.check_in_date && new Date(booking.check_in_date) > new Date();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Property Image */}
        <div className="relative h-48 md:h-auto md:col-span-1 bg-secondary">
          {booking.property?.images && booking.property.images.length > 0 ? (
            <Image
              src={booking.property.images[0]}
              alt={booking.property.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="col-span-1 md:col-span-3 p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {booking.property?.name || 'Property'}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin size={16} />
                <span className="text-sm">
                  {booking.property?.city}, {booking.property?.country}
                </span>
              </div>
            </div>
            <Badge className={getStatusColor(booking.status || 'pending')}>
              {getStatusLabel(booking.status || 'pending')}
            </Badge>
          </div>

          {/* Dates */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <span>
                {booking.check_in_date && format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                {' – '}
                {booking.check_out_date && format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
              </span>
            </div>

            {booking.number_of_guests && (
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-muted-foreground" />
                <span>
                  {booking.number_of_guests} guest
                  {booking.number_of_guests !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total Price</p>
              <p className="text-2xl font-bold text-foreground">
                ${booking.total_price?.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2">
              {booking.property?.id && canReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview?.(booking.property!.id)}
                >
                  <Star size={16} className="mr-1" />
                  Leave Review
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage?.(booking.id)}
              >
                <MessageSquare size={16} className="mr-1" />
                Message
              </Button>
              {isUpcoming && (
                <Link href={`/booking/${booking.id}`}>
                  <Button size="sm">View Details</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
