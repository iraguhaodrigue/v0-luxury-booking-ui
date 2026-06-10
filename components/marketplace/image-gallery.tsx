'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  onImageChange?: (index: number) => void;
}

export function ImageGallery({ images, alt, onImageChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center h-96">
        <div className="text-center text-muted-foreground">
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    onImageChange?.(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full bg-secondary rounded-lg overflow-hidden h-96 sm:h-[500px]">
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover w-full h-full"
          priority
        />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              onClick={goToPrevious}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </Button>

            <Button
              onClick={goToNext}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative w-full aspect-square rounded-lg overflow-hidden transition-all ${
                currentIndex === index ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
