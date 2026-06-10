'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface PropertyImage {
  id: number
  image_url: string
  thumbnail_url?: string
  display_order: number
  is_primary: boolean
}

interface PropertyGalleryProps {
  propertyId: number
  images?: PropertyImage[]
  title: string
}

export function PropertyGallery({ propertyId, images = [], title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null)

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0])
    }
  }, [images])

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    setSelectedImage(images[currentIndex === 0 ? images.length - 1 : currentIndex - 1])
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
    setSelectedImage(images[currentIndex === images.length - 1 ? 0 : currentIndex + 1])
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
    setSelectedImage(images[index])
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center h-96">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden h-96 md:h-[500px] group">
        {selectedImage && (
          <>
            <img
              src={selectedImage.image_url}
              alt={title}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index ? 'border-accent' : 'border-transparent hover:border-accent/50'
              }`}
            >
              <img
                src={img.thumbnail_url || img.image_url}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
