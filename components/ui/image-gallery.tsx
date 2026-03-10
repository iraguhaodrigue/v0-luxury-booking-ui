'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  /** Primary single image URL (e.g. image_url from cars/services) */
  imageUrl?: string | null
  /** Gallery array (e.g. images[] from properties/cars) */
  images?: string[] | string | null
  alt: string
  /** Height class applied to the main image container, default h-96 */
  mainHeightClass?: string
}

const FALLBACK = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'

function resolveImages(imageUrl?: string | null, images?: string[] | string | null): string[] {
  // Build a de-duplicated list prioritising the gallery array, then imageUrl
  const list: string[] = []

  if (Array.isArray(images)) {
    images.forEach(img => { if (img) list.push(img) })
  } else if (typeof images === 'string' && images) {
    list.push(images)
  }

  if (imageUrl && !list.includes(imageUrl)) {
    // Prepend image_url if it's not already in the gallery
    list.unshift(imageUrl)
  }

  return list.length > 0 ? list : [FALLBACK]
}

export function ImageGallery({
  imageUrl,
  images,
  alt,
  mainHeightClass = 'h-80 sm:h-96 md:h-[480px]',
}: ImageGalleryProps) {
  const gallery = resolveImages(imageUrl, images)
  const [selected, setSelected] = useState(0)

  const prev = () => setSelected(i => (i - 1 + gallery.length) % gallery.length)
  const next = () => setSelected(i => (i + 1) % gallery.length)

  return (
    <div className="w-full space-y-3">
      {/* Main image */}
      <div className={`relative w-full ${mainHeightClass} overflow-hidden rounded-xl bg-secondary`}>
        <img
          key={gallery[selected]}
          src={gallery[selected]}
          alt={`${alt} — image ${selected + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />

        {/* Prev / Next arrows — only when multiple images */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter badge */}
        {gallery.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {selected + 1} / {gallery.length}
          </div>
        )}
      </div>

      {/* Thumbnails — only when more than 1 image */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => setSelected(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                idx === selected
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
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
