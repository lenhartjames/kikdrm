'use client'

import React, { createContext, useContext, useState, useRef } from 'react'
import { KickSample, AnalysisResult } from '@/types'
import * as Tone from 'tone'

interface AudioEffectsChain {
  filter: Tone.Filter | null
  distortion: Tone.Distortion | null
  compressor: Tone.Compressor | null
  gain: Tone.Gain | null
  envelope: Tone.AmplitudeEnvelope | null
}

interface AppContextType {
  kickSample: KickSample | null
  setKickSample: (sample: KickSample | null) => void
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  aiAnalysis: any | null
  setAiAnalysis: (analysis: any | null) => void
  audioEffects: React.MutableRefObject<AudioEffectsChain>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kickSample, setKickSample] = useState<KickSample | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null)
  
  // Shared audio effects chain
  const audioEffects = useRef<AudioEffectsChain>({
    filter: null,
    distortion: null,
    compressor: null,
    gain: null,
    envelope: null
  })

  return (
    <AppContext.Provider value={{
      kickSample,
      setKickSample,
      analysisResult,
      setAnalysisResult,
      isLoading,
      setIsLoading,
      aiAnalysis,
      setAiAnalysis,
      audioEffects
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}