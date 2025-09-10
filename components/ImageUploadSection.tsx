'use client'

import { useState, useCallback } from 'react'
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

export default function ImageUploadSection() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { setKickSample, setIsLoading } = useApp()

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/heic']
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      alert('Please upload a valid image file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setIsLoading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      // Use AI analysis endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful:', data)
      
      // Set the matched kick sample in context
      if (data.matchedSample) {
        setKickSample(data.matchedSample)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all",
          isDragging 
            ? "border-plugin-led-on bg-plugin-led-on/10" 
            : "border-plugin-border hover:border-plugin-led-on/50",
          "cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        {uploadedImage ? (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-full object-contain"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-plugin-display-text" />
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setUploadedImage(null)
              }}
              className="plugin-button w-full"
              disabled={isUploading}
            >
              Upload Different Image
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {isUploading ? (
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-plugin-display-text" />
            ) : isDragging ? (
              <Upload className="w-12 h-12 mx-auto text-plugin-led-on" />
            ) : (
              <img 
                src="/drum.svg" 
                alt="Upload" 
                className="w-[100px] h-auto mx-auto opacity-50"
              />
            )}
            
            <div>
              <p className="text-lg font-medium">
                {isUploading 
                  ? "Processing..." 
                  : isDragging 
                  ? "Drop image here" 
                  : "Upload any image to create your own designer kick drum"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WebP, AVIF, SVG, HEIC (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}