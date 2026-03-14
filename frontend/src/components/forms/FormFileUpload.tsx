'use client'

<<<<<<< HEAD
import React, { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
=======
import React, { useCallback, useState, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { FormField } from './FormField'
import { api } from '@/lib/api'

interface FormFileUploadProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  accept?: Record<string, string[]>
<<<<<<< HEAD
  maxSize?: number // em bytes
=======
  maxSize?: number
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  maxFiles?: number
  multiple?: boolean
  endpoint: string
}

interface FileWithPreview extends File {
  preview?: string
  progress?: number
  error?: string
  uploaded?: boolean
  url?: string
}

export function FormFileUpload({
  name,
  label,
  description,
  required,
  disabled,
  className,
<<<<<<< HEAD
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
=======
  accept,
  maxSize = 5 * 1024 * 1024,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  multiple = false,
  endpoint
}: FormFileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
<<<<<<< HEAD
  const { control, setValue } = useFormContext()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0
    }))
=======
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setValue } = useFormContext()

  const getAcceptString = () => {
    if (!accept) return undefined
    return Object.keys(accept).join(',')
  }

  const processFiles = useCallback(async (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map(file => Object.assign(file, {
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0
    })) as FileWithPreview[]
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
    setFiles(updatedFiles)

<<<<<<< HEAD
    // Upload dos arquivos
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    setUploading(true)
    for (const file of newFiles) {
      await uploadFile(file)
    }
    setUploading(false)

<<<<<<< HEAD
    // Atualizar o valor do campo com as URLs dos arquivos
    const fileUrls = files.map(f => f.url).filter(Boolean)
=======
    const fileUrls = updatedFiles.map((f: FileWithPreview) => f.url).filter(Boolean)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    setValue(name, multiple ? fileUrls : fileUrls[0])
  }, [files, multiple, name, setValue])

  const uploadFile = async (file: FileWithPreview) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post(endpoint, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
<<<<<<< HEAD
          
          setFiles(prev =>
            prev.map(f =>
              f === file ? { ...f, progress } : f
            )
=======
          setFiles(prev =>
            prev.map(f => f === file ? { ...f, progress } : f)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          )
        }
      })

      setFiles(prev =>
<<<<<<< HEAD
        prev.map(f =>
          f === file ? { ...f, uploaded: true, url: response.data.url } : f
        )
      )
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f === file ? { ...f, error: 'Erro no upload' } : f
        )
=======
        prev.map(f => f === file ? { ...f, uploaded: true, url: response.data.url } : f)
      )
    } catch {
      setFiles(prev =>
        prev.map(f => f === file ? { ...f, error: 'Erro no upload' } : f)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      )
    }
  }

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove))
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
<<<<<<< HEAD

=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    const fileUrls = files.filter(f => f !== fileToRemove).map(f => f.url).filter(Boolean)
    setValue(name, multiple ? fileUrls : fileUrls[0])
  }

<<<<<<< HEAD
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled: disabled || uploading
  })
=======
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    if (disabled || uploading) return
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(f => !maxSize || f.size <= maxSize)
    processFiles(validFiles)
  }, [disabled, uploading, maxSize, processFiles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selectedFiles = Array.from(e.target.files).filter(f => !maxSize || f.size <= maxSize)
    processFiles(selectedFiles)
    e.target.value = ''
  }
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {() => (
        <div className={cn('space-y-4', className)}>
          <div
<<<<<<< HEAD
            {...getRootProps()}
=======
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true) }}
            onDragLeave={() => setIsDragActive(false)}
            onClick={() => !disabled && !uploading && inputRef.current?.click()}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/5' : 'border-border',
              (disabled || uploading) && 'opacity-50 cursor-not-allowed'
            )}
          >
<<<<<<< HEAD
            <input {...getInputProps()} />
=======
            <input
              ref={inputRef}
              type="file"
              accept={getAcceptString()}
              multiple={multiple}
              onChange={handleChange}
              className="hidden"
            />
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            {isDragActive ? (
              <p>Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-sm mb-1">
                  Arraste e solte arquivos aqui, ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Lista de arquivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 border rounded-lg"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
=======
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                  {file.preview ? (
                    <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                  ) : (
                    <File className="h-10 w-10 p-2 text-muted-foreground" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
<<<<<<< HEAD
                    
                    {file.progress !== undefined && file.progress < 100 && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                    
=======
                    {file.progress !== undefined && file.progress < 100 && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>

                  {file.uploaded ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : file.error ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(file)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </FormField>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
