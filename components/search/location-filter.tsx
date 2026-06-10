'use client';

import { useState, useEffect } from 'react';
import { getCountries, getCitiesByCountry } from '@/lib/services/marketplace.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Country, City } from '@/lib/types/marketplace';

interface LocationFilterProps {
  onCountryChange?: (countryId: number | null) => void;
  onCityChange?: (cityId: number | null) => void;
  selectedCountryId?: number | null;
  selectedCityId?: number | null;
}

export function LocationFilter({
  onCountryChange,
  onCityChange,
  selectedCountryId,
  selectedCityId,
}: LocationFilterProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error('[v0] Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (selectedCountryId) {
        try {
          const data = await getCitiesByCountry(selectedCountryId);
          setCities(data);
        } catch (error) {
          console.error('[v0] Error fetching cities:', error);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [selectedCountryId]);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select
          value={selectedCountryId?.toString() || ''}
          onValueChange={(value) => {
            const countryId = value ? parseInt(value) : null;
            onCountryChange?.(countryId);
            setCities([]);
            onCityChange?.(null);
          }}
          disabled={loading}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder={loading ? 'Loading countries...' : 'Select a country'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id.toString()}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCountryId && (
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Select
            value={selectedCityId?.toString() || ''}
            onValueChange={(value) => {
              const cityId = value ? parseInt(value) : null;
              onCityChange?.(cityId);
            }}
            disabled={cities.length === 0}
          >
            <SelectTrigger id="city">
              <SelectValue
                placeholder={cities.length === 0 ? 'No cities available' : 'Select a city'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </Card>
  );
}
