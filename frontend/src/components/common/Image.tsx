'use client'

import React, { useState } from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onLoad'> {
  src: string
  alt: string
  width?: number
  height?: number
<<<<<<< HEAD
=======
  size?: number
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  fill?: boolean
  sizes?: string
  quality?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fallbackSrc?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  showSkeleton?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function Image({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  quality = 75,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  fallbackSrc = '/images/placeholder.jpg',
  objectFit = 'cover',
  showSkeleton = true,
  className,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(showSkeleton)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
    onError?.()
  }

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }[objectFit]

  return (
    <div className={cn('relative', fill && 'w-full h-full', className)}>
      {isLoading && (
        <Skeleton className={cn(
          'absolute inset-0 z-10',
          fill ? 'w-full h-full' : 'rounded-md'
        )} />
      )}
      
      <NextImage
        src={error ? fallbackSrc : src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFitClass
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

// Imagem com fallback para avatar
Image.Avatar = function AvatarImage({
  src,
  alt,
  name,
  size = 40,
  className,
  ...props
}: ImageProps & { name?: string }) {
  const [error, setError] = useState(false)

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (error || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-primary/10 text-primary font-medium rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        {getInitials(name)}
      </div>
    )
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      onError={() => setError(true)}
      {...props}
    />
  )
}

// Imagem com overlay
Image.WithOverlay = function ImageWithOverlay({
  src,
  alt,
  overlay,
  className,
  ...props
}: ImageProps & { overlay: React.ReactNode }) {
  return (
    <div className="relative group">
      <Image src={src} alt={alt} className={className} {...props} />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {overlay}
      </div>
    </div>
  )
}

// Imagem com zoom (lightbox)
Image.Zoomable = function ZoomableImage(props: ImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className="cursor-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        <Image {...props} />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <Image
              {...props}
              fill
              className="object-contain"
              showSkeleton={false}
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}