'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize2, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ImageItem {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
  width?: number
  height?: number
}

interface ImageGalleryProps {
  images: ImageItem[]
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: number
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
  showCaptions?: boolean
  lightbox?: boolean
  downloadable?: boolean
  onImageClick?: (image: ImageItem) => void
  className?: string
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6'
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: ''
}

export function ImageGallery({
  images,
  columns = 4,
  gap = 4,
  aspectRatio = 'square',
  showCaptions = false,
  lightbox = true,
  downloadable = false,
  onImageClick,
  className
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleImageClick = (image: ImageItem, index: number) => {
    if (lightbox) {
      setSelectedImage(image)
      setCurrentIndex(index)
    }
    onImageClick?.(image)
  }

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const handleDownload = async (image: ImageItem) => {
    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = image.alt || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
    }
  }

  return (
    <>
      <div className={cn(
        'grid',
        gridCols[columns],
        `gap-${gap}`,
        className
      )}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-lg',
              aspectRatios[aspectRatio]
            )}
            onClick={() => handleImageClick(image, index)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="h-6 w-6 text-white" />
            </div>

            {/* Caption */}
            {showCaptions && image.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm truncate">{image.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          {downloadable && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 text-white hover:bg-white/20"
              onClick={() => handleDownload(selectedImage)}
            >
              <Download className="h-6 w-6" />
            </Button>
          )}

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              className="object-contain"
            />

            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                {selectedImage.title && (
                  <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-sm opacity-90">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-50'
                  )}
                  onClick={() => {
                    setCurrentIndex(index)
                    setSelectedImage(image)
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

// Galeria simples (sem lightbox)
ImageGallery.Simple = function SimpleGallery({
  images,
  columns = 4,
  className
}: Omit<ImageGalleryProps, 'lightbox' | 'downloadable'>) {
  return (
    <ImageGallery
      images={images}
      columns={columns}
      lightbox={false}
      className={className}
    />
  )
}

// Galeria com layout de mosaico
ImageGallery.Masonry = function MasonryGallery({
  images,
  className
}: Omit<ImageGalleryProps, 'columns' | 'gap' | 'aspectRatio'>) {
  // Implementar layout masonry
  return (
    <div className={cn('columns-2 md:columns-3 lg:columns-4 gap-4', className)}>
      {images.map((image) => (
        <div key={image.id} className="mb-4 break-inside-avoid">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width || 400}
              height={image.height || 300}
              className="w-full h-auto"
            />
          </div>
        </div>
      ))}
    </div>
  )
}