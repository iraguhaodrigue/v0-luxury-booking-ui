'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, MoreHorizontal, Eye, Copy } from 'lucide-react';
import type { Property } from '@/lib/types/marketplace';

interface OwnerPropertyListProps {
  properties: Property[];
  onDelete?: (propertyId: number) => void;
  onEdit?: (propertyId: number) => void;
}

export function OwnerPropertyList({
  properties,
  onDelete,
  onEdit,
}: OwnerPropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (properties.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No properties yet</p>
        <Link href="/owner/properties/new">
          <Button>Create First Property</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow
              key={property.id}
              className={selectedProperty === property.id ? 'bg-muted' : ''}
            >
              <TableCell className="font-medium">
                <Link
                  href={`/properties/${property.id}`}
                  className="text-primary hover:underline"
                >
                  {property.name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{property.city}</p>
                  <p className="text-xs text-muted-foreground">{property.country}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {property.property_type}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold">
                ${property.base_price_per_night?.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor('active')}>Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium">
                  {property.total_bookings || 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/properties/${property.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Public Page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onEdit?.(property.id);
                        setSelectedProperty(property.id);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(property.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
