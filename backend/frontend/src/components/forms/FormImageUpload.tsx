'use client'

import React, { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Progress } from '@/components/ui/Progress'
import { FormField } from './FormField'
import { api } from '@/lib/api'
import Image from 'next/image'

interface FormImageUploadProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  maxSize?: number // em bytes
  maxFiles?: number
  multiple?: boolean
  endpoint: string
  aspectRatio?: number
}

export function FormImageUpload({
  name,
  label,
  description,
  required,
  disabled,
  className,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 1,
  multiple = false,
  endpoint,
  aspectRatio = 1
}: FormImageUploadProps) {
  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const { control, setValue } = useFormContext()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      url: null
    }))

    const updatedImages = multiple ? [...images, ...newImages] : newImages
    setImages(updatedImages)

    // Upload das imagens
    setUploading(true)
    for (const image of newImages) {
      await uploadImage(image)
    }
    setUploading(false)

    // Atualizar o valor do campo
    const imageUrls = images.map(img => img.url).filter(Boolean)
    setValue(name, multiple ? imageUrls : imageUrls[0])
  }, [images, multiple, name, setValue])

  const uploadImage = async (image: any) => {
    const formData = new FormData()
    formData.append('image', image.file)

    try {
      const response = await api.post(endpoint, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          
          setImages(prev =>
            prev.map(img =>
              img === image ? { ...img, progress } : img
            )
          )
        }
      })

      setImages(prev =>
        prev.map(img =>
          img === image ? { ...img, uploaded: true, url: response.data.url } : img
        )
      )
    } catch (error) {
      setImages(prev =>
        prev.map(img =>
          img === image ? { ...img, error: 'Erro no upload' } : img
        )
      )
    }
  }

  const removeImage = (imageToRemove: any) => {
    setImages(prev => prev.filter(img => img !== imageToRemove))
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview)
    }

    const imageUrls = images.filter(img => img !== imageToRemove).map(img => img.url).filter(Boolean)
    setValue(name, multiple ? imageUrls : imageUrls[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize,
    maxFiles,
    multiple,
    disabled: disabled || uploading
  })

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {() => (
        <div className={cn('space-y-4', className)}>
          {(!multiple || images.length < maxFiles) && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-border',
                (disabled || uploading) && 'opacity-50 cursor-not-allowed'
              )}
              style={{ aspectRatio }}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              {isDragActive ? (
                <p>Solte a imagem aqui...</p>
              ) : (
                <div>
                  <p className="text-sm mb-1">
                    Arraste e solte uma imagem aqui, ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF até {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grid de imagens */}
          {images.length > 0 && (
            <div className={cn(
              'grid gap-4',
              multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'
            )}>
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative group aspect-square border rounded-lg overflow-hidden"
                >
                  <Image
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay de progresso/erro */}
                  {image.progress !== undefined && image.progress < 100 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-3/4">
                        <Progress value={image.progress} className="h-2" />
                        <p className="text-white text-xs text-center mt-1">
                          {image.progress}%
                        </p>
                      </div>
                    </div>
                  )}

                  {image.error && (
                    <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                  )}

                  {image.uploaded && !image.error && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                    </div>
                  )}

                  {/* Botão remover */}
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </FormField>
  )
}