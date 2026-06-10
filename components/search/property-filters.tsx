'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { LocationFilter } from './location-filter';
import type { PropertyType, PropertyFilters } from '@/lib/types/marketplace';

interface PropertyFiltersComponentProps {
  onFiltersChange?: (filters: PropertyFilters) => void;
}

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartment' },
];

export function PropertyFiltersComponent({ onFiltersChange }: PropertyFiltersComponentProps) {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>([]);
  const [guests, setGuests] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number>(0);

  const handleApplyFilters = () => {
    const newFilters: PropertyFilters = {
      ...filters,
      min_price: priceRange[0] || undefined,
      max_price: priceRange[1] || undefined,
      property_type: selectedTypes.length > 0 ? selectedTypes[0] : undefined,
      guests,
      min_rating: minRating > 0 ? minRating : undefined,
    };

    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPriceRange([0, 10000]);
    setSelectedTypes([]);
    setGuests(undefined);
    setMinRating(0);
    onFiltersChange?.({});
  };

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <LocationFilter
        selectedCountryId={filters.country_id}
        selectedCityId={filters.city_id}
        onCountryChange={(countryId) =>
          setFilters((prev) => ({ ...prev, country_id: countryId || undefined }))
        }
        onCityChange={(cityId) =>
          setFilters((prev) => ({ ...prev, city_id: cityId || undefined }))
        }
      />

      {/* Property Type Filter */}
      <Card className="p-6 space-y-4">
        <Label className="text-base font-semibold">Property Type</Label>
        <div className="space-y-3">
          {PROPERTY_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([type.value]);
                  } else {
                    setSelectedTypes([]);
                  }
                }}
              />
              <Label htmlFor={type.value} className="font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Range Filter */}
      <Card className="p-6 space-y-4">
        <Label className="text-base font-semibold">Price Range (per night)</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}</span>
        </div>
      </Card>

      {/* Number of Guests Filter */}
      <Card className="p-6 space-y-4">
        <Label htmlFor="guests" className="text-base font-semibold">
          Number of Guests
        </Label>
        <Input
          id="guests"
          type="number"
          min={1}
          value={guests || ''}
          onChange={(e) => setGuests(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Any number"
        />
      </Card>

      {/* Minimum Rating Filter */}
      <Card className="p-6 space-y-4">
        <Label className="text-base font-semibold">Minimum Rating</Label>
        <Slider
          value={[minRating]}
          onValueChange={(value) => setMinRating(value[0])}
          min={0}
          max={5}
          step={0.5}
          className="w-full"
        />
        <div className="text-sm text-muted-foreground">
          {minRating > 0 ? `${minRating}+ stars` : 'Any rating'}
        </div>
      </Card>

      {/* Filter Actions */}
      <div className="space-y-2">
        <Button onClick={handleApplyFilters} className="w-full" size="lg">
          Apply Filters
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="w-full" size="lg">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
