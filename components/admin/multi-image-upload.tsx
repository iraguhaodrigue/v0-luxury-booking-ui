'use client'

import { useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MultiImageUploadProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  currentImages?: string[]
  label?: string
}

export function MultiImageUpload({
  onImagesChange,
  maxImages = 5,
  currentImages = [],
  label = 'Upload Images',
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const newImages: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed')
          continue
        }

        // Create data URL for preview
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string)
            
            if (newImages.length === files.length) {
              const allImages = [...images, ...newImages]
              setImages(allImages)
              onImagesChange(allImages)
            }
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      setError('Failed to process images')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      
      {/* Upload Area */}
      <div className="mb-4">
        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              {loading ? 'Processing...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} images
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading || images.length >= maxImages}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                  Main
                </span>
              )}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
