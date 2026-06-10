'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import type { Booking } from '@/lib/types/marketplace';

interface OwnerBookingListProps {
  bookings: Booking[];
  onViewDetails?: (bookingId: number) => void;
}

export function OwnerBookingList({ bookings, onViewDetails }: OwnerBookingListProps) {
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

  if (bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No bookings yet</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{booking.guest?.full_name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.guest?.email || 'No email'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium">{booking.property?.name || 'Unknown'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {booking.check_in_date
                    ? format(new Date(booking.check_in_date), 'MMM dd, yyyy')
                    : 'N/A'}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {booking.check_out_date
                    ? format(new Date(booking.check_out_date), 'MMM dd, yyyy')
                    : 'N/A'}
                </p>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(booking.status || 'pending')}>
                  {(booking.status || 'pending').charAt(0).toUpperCase() +
                    (booking.status || 'pending').slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold">
                ${booking.total_price?.toFixed(2) || '0.00'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(booking.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
