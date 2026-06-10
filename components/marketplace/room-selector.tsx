'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import Image from 'next/image';
import { Users, Bed, Bath } from 'lucide-react';
import type { Room } from '@/lib/types/marketplace';

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId?: number;
  onRoomSelect: (roomId: number) => void;
}

export function RoomSelector({ rooms, selectedRoomId, onRoomSelect }: RoomSelectorProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No rooms available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Room</h3>

      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`p-4 cursor-pointer transition-all ${
            selectedRoomId === room.id
              ? 'ring-2 ring-primary bg-primary/5'
              : 'hover:shadow-md'
          }`}
          onClick={() => onRoomSelect(room.id)}
        >
          <div className="flex gap-4">
            {/* Room Image */}
            {room.images && room.images.length > 0 && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <Image
                  src={room.images[0]}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Room Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-base font-semibold">{room.name}</h4>
                  {selectedRoomId === room.id && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}

                {/* Room Amenities */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {room.capacity && (
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{room.capacity} guests</span>
                    </div>
                  )}

                  {room.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      <span>{room.bedrooms} bed{room.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {room.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath size={16} />
                      <span>{room.bathrooms} bath{room.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Per night</p>
                  <p className="text-lg font-bold">
                    ${room.price_per_night.toFixed(2)}
                  </p>
                </div>

                <Radio
                  value={room.id.toString()}
                  checked={selectedRoomId === room.id}
                  onCheckedChange={() => onRoomSelect(room.id)}
                  aria-label={`Select ${room.name}`}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
