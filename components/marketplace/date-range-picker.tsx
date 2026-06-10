'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  checkInDate?: Date;
  checkOutDate?: Date;
  onCheckInChange: (date: Date | undefined) => void;
  onCheckOutChange: (date: Date | undefined) => void;
  minDate?: Date;
}

export function DateRangePicker({
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
  minDate = new Date(),
}: DateRangePickerProps) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  // Calculate number of nights
  const nights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const handleCheckInSelect = (date: Date | undefined) => {
    onCheckInChange(date);
    setCheckInOpen(false);

    // Auto-set check-out to next day if not set
    if (date && !checkOutDate) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      onCheckOutChange(nextDay);
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (date && checkInDate && date <= checkInDate) {
      // Don't allow check-out before check-in
      return;
    }
    onCheckOutChange(date);
    setCheckOutOpen(false);
  };

  return (
    <Card className="p-6 space-y-4">
      <Label className="text-base font-semibold">Select Dates</Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check-in Date */}
        <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkInDate ? format(checkInDate, 'MMM dd, yyyy') : 'Check-in'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkInDate}
              onSelect={handleCheckInSelect}
              disabled={(date) => date < minDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Check-out Date */}
        <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={!checkInDate}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOutDate ? format(checkOutDate, 'MMM dd, yyyy') : 'Check-out'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOutDate}
              onSelect={handleCheckOutSelect}
              disabled={(date) =>
                !checkInDate ? true : date <= checkInDate || date < minDate
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Nights Display */}
      {nights > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm font-semibold">
            {nights} night{nights !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            {checkInDate && format(checkInDate, 'MMM dd')} –{' '}
            {checkOutDate && format(checkOutDate, 'MMM dd, yyyy')}
          </p>
        </div>
      )}
    </Card>
  );
}
