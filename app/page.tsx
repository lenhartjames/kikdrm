'use client'

import { useState } from 'react'
import ImageUploadSection from '@/components/ImageUploadSection'
import KickPreviewSection from '@/components/KickPreviewSection'
import StepSequencer from '@/components/StepSequencer'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

function MainInterface() {
  const { kickSample, setKickSample, setAnalysisResult } = useApp()
  const [showSequencer, setShowSequencer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleStartOver = () => {
    setKickSample(null)
    setAnalysisResult(null)
    setShowSequencer(false)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    if (kickSample && !showSequencer) {
      setShowSequencer(true)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <main className="min-h-screen bg-plugin-bg p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/kik-drm-logo.svg" 
            alt="IMG → KIK" 
            className="h-16 w-auto"
          />
        </div>
        
        {/* Header with Start Over */}
        {kickSample && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleStartOver}
              className="plugin-button flex items-center gap-2 px-4 py-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="plugin-panel p-6 sm:p-8">
          {/* Show upload if no kick sample, otherwise show output */}
          {!kickSample ? (
            <ImageUploadSection />
          ) : (
            <>
              <KickPreviewSection 
                showSequencer={showSequencer}
                isPlaying={isPlaying}
                onPlayToggle={handlePlay}
              />

              {/* Expandable Sequencer - Inside Card */}
              {showSequencer && (
                <div className="mt-6 border-t border-plugin-border pt-6">
                  <StepSequencer 
                    isPlaying={isPlaying}
                    onPlayToggle={handlePlay}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <MainInterface />
    </AppProvider>
  )
}