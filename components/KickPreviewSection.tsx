'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import Oscilloscope from './Oscilloscope'

interface KickPreviewSectionProps {
  showSequencer?: boolean
  isPlaying?: boolean
  onPlayToggle?: () => void
}

export default function KickPreviewSection({ 
  showSequencer = false, 
  isPlaying = false,
  onPlayToggle 
}: KickPreviewSectionProps) {
  const { kickSample, isLoading } = useApp()
  const [volume, setVolume] = useState(75)
  const [showInfo, setShowInfo] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Set up audio when kick sample changes
  useEffect(() => {
    
    // Set up audio source when kick sample changes
    if (kickSample?.file_url && audioRef.current) {
      const audioUrl = kickSample.file_url.startsWith('http') 
        ? kickSample.file_url 
        : `${window.location.origin}${kickSample.file_url}`
      audioRef.current.src = audioUrl
      audioRef.current.load()
      audioRef.current.volume = volume / 100
      console.log('Audio source set to:', audioUrl)
    }
  }, [kickSample, volume])

  const handlePlayPause = async () => {
    if (!kickSample?.file_url) return
    
    if (audioRef.current) {
      // Set the audio source if not already set
      if (audioRef.current.src !== kickSample.file_url && !audioRef.current.src.endsWith(kickSample.file_url)) {
        // For relative URLs, prepend the base URL
        const audioUrl = kickSample.file_url.startsWith('http') 
          ? kickSample.file_url 
          : `${window.location.origin}${kickSample.file_url}`
        audioRef.current.src = audioUrl
        audioRef.current.load()
      }
      
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        try {
          await audioRef.current.play()
        } catch (error) {
          console.error('Error playing audio:', error)
        }
      }
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  const handleDownload = async () => {
    if (kickSample?.file_url) {
      try {
        // For API routes, we need to fetch the audio first
        const audioUrl = kickSample.file_url.startsWith('http') 
          ? kickSample.file_url 
          : `${window.location.origin}${kickSample.file_url}`
        
        const response = await fetch(audioUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${kickSample.name || 'kick-sample'}.wav`
        link.click()
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } catch (error) {
        console.error('Error downloading sample:', error)
      }
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className={cn("plugin-led", kickSample ? "on" : "off")} />
        <h2 className="text-xl font-semibold">
          {kickSample ? kickSample.name : 'KICK OUTPUT'}
        </h2>
      </div>

      {/* Oscilloscope Display with Hover Info */}
      <div 
        className="mb-4 relative"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        <Oscilloscope 
          audioUrl={kickSample?.file_url}
          isPlaying={isPlaying}
          isSequencerPlaying={isPlaying}
          height={120}
        />
        
        {/* Sample Info Overlay */}
        {kickSample && (
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none",
              showInfo ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-plugin-border/50">
              <div className="font-mono text-xs space-y-1 text-plugin-display-text">
                <div>NAME: {kickSample.name || 'PROCESSING...'}</div>
                <div>TYPE: {kickSample.characteristics?.tonal_character || 'ANALYZING...'}</div>
                <div>BRIGHTNESS: {kickSample.characteristics?.brightness || 50}</div>
                <div>WARMTH: {kickSample.characteristics?.warmth || 50}</div>
                <div>PUNCH: {kickSample.characteristics?.punch || 50}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls - Right under oscilloscope */}
      {kickSample && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onPlayToggle}
            className="plugin-button flex items-center gap-2 px-6"
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="plugin-button flex items-center gap-2"
            disabled={isLoading}
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD</span>
          </button>

          <div className="flex-1" />

          {/* Volume Control - Same style as tempo/swing */}
          <div className="flex items-center gap-3">
            <label className="text-xs">VOLUME</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-plugin-display-bg rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-plugin-led-on"
            />
            <div className="plugin-display px-2 py-1 min-w-[3rem] text-center">
              <span className="font-mono text-xs">{volume}%</span>
            </div>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onEnded={() => {
          if (isPlaying && onPlayToggle) {
            onPlayToggle()
          }
        }}
        onError={(e) => {
          console.error('Audio error:', e)
          if (isPlaying && onPlayToggle) {
            onPlayToggle()
          }
        }}
        onLoadedData={() => console.log('Audio loaded successfully')}
        onCanPlay={() => console.log('Audio ready to play')}
        preload="auto"
        className="hidden"
      />
    </div>
  )
}