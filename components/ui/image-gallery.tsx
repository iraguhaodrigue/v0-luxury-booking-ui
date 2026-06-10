'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  alt: string
  mainImageHeight?: string
  showThumbnails?: boolean
  className?: string
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'

export function ImageGallery({ 
  images, 
  alt, 
  mainImageHeight = 'h-[500px]',
  showThumbnails = true,
  className = ''
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Ensure we always have at least one image
  const galleryImages = images.length > 0 ? images : [FALLBACK_IMAGE]
  const currentImage = galleryImages[selectedIndex] || FALLBACK_IMAGE

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className={`relative w-full ${mainImageHeight} bg-secondary rounded-lg overflow-hidden group`}>
        <img
          src={currentImage}
          alt={`${alt} - ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Navigation Buttons */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 sm:w-6 h-4 sm:h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 sm:w-6 h-4 sm:h-6" />
            </button>
          </>
        )}

        {/* Counter */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-border hover:border-muted-foreground'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
