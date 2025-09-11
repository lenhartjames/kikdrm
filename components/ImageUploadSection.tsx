'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, Image as ImageIcon, Loader2, Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

const sampleImages = [
  { path: '/images/valentin-bonjour-TIdqm0Cl8UA-unsplash.jpg', name: 'Sample 1' },
  { path: '/images/chris-lawton-6tfO1M8_gas-unsplash.jpg', name: 'Sample 2' },
  { path: '/images/daniel-j-schwarz-GXkAYdrZeAA-unsplash.jpg', name: 'Sample 3' },
  { path: '/images/joshua-earle-dcPsuxrAy7E-unsplash.jpg', name: 'Sample 4' },
  { path: '/images/liam-pozz-Iwo1GuxCeGg-unsplash.jpg', name: 'Sample 5' },
  { path: '/images/nick-fancher-8NEB-3bNydw-unsplash.jpg', name: 'Sample 6' }
]

export default function ImageUploadSection() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { setKickSample, setIsLoading, setAiAnalysis } = useApp()

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

  const handleSampleImage = async (imagePath: string) => {
    try {
      setIsUploading(true)
      setIsLoading(true)
      
      // Fetch the image as a blob
      const response = await fetch(imagePath)
      const blob = await response.blob()
      const file = new File([blob], imagePath.split('/').pop() || 'sample.jpg', { type: 'image/jpeg' })
      
      handleFile(file)
    } catch (error) {
      console.error('Error loading sample image:', error)
      setIsUploading(false)
      setIsLoading(false)
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
      
      // Store AI analysis for the info tooltip
      if (data.aiAnalysis) {
        setAiAnalysis(data.aiAnalysis)
      }
      
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
                  <img 
                    src="/drum.svg" 
                    alt="Processing" 
                    className="w-16 h-auto opacity-90 animate-pulse"
                    style={{
                      filter: 'drop-shadow(0 0 8px #00ff88)'
                    }}
                  />
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
                  : "Design your own kick drum"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isUploading || isDragging 
                  ? "Supports JPG, PNG, WebP, AVIF, SVG, HEIC (max 10MB)"
                  : "Upload an image to create something that is one-of-a-kind or click one of the images to try it out first."}
              </p>
              
              {!isUploading && !isDragging && (
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      document.getElementById('file-input')?.click()
                    }}
                    className="plugin-button flex items-center gap-2 px-4 py-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                  
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        // Request camera permission and open camera
                        const stream = await navigator.mediaDevices.getUserMedia({ 
                          video: { 
                            facingMode: 'environment' // Use back camera on mobile
                          } 
                        })
                        streamRef.current = stream
                        setShowCamera(true)
                        
                        // Wait for video element to be rendered
                        setTimeout(() => {
                          if (videoRef.current) {
                            videoRef.current.srcObject = stream
                          }
                        }, 100)
                      } catch (error) {
                        console.error('Camera access denied:', error)
                        // Fallback to file input with capture attribute
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.capture = 'environment'
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement
                          if (target.files?.[0]) {
                            handleFile(target.files[0])
                          }
                        }
                        input.click()
                      }
                    }}
                    className="plugin-button flex items-center gap-2 px-4 py-2"
                    disabled={isUploading}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Sample Images Grid */}
      <div className="mt-8">
        <div className="grid grid-cols-6 gap-2">
          {sampleImages.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleImage(sample.path)}
              className="relative group aspect-square rounded-lg overflow-hidden border border-plugin-border hover:border-plugin-led-on/50 transition-all"
              disabled={isUploading}
            >
              <img 
                src={sample.path}
                alt={sample.name}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => {
                // Stop camera stream
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop())
                  streamRef.current = null
                }
                setShowCamera(false)
              }}
              className="absolute -top-12 right-0 text-white hover:text-plugin-led-on"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="bg-plugin-panel rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full"
              />
              
              <div className="p-4 flex justify-center">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      // Create canvas and capture photo
                      const canvas = document.createElement('canvas')
                      canvas.width = videoRef.current.videoWidth
                      canvas.height = videoRef.current.videoHeight
                      const ctx = canvas.getContext('2d')
                      if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0)
                        
                        // Convert to blob and handle as file
                        canvas.toBlob((blob) => {
                          if (blob) {
                            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
                            handleFile(file)
                            
                            // Stop camera and close modal
                            if (streamRef.current) {
                              streamRef.current.getTracks().forEach(track => track.stop())
                              streamRef.current = null
                            }
                            setShowCamera(false)
                          }
                        }, 'image/jpeg', 0.95)
                      }
                    }
                  }}
                  className="plugin-button px-8 py-3 flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}