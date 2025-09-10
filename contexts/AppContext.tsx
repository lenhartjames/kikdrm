'use client'

import React, { createContext, useContext, useState } from 'react'
import { KickSample, AnalysisResult } from '@/types'

interface AppContextType {
  kickSample: KickSample | null
  setKickSample: (sample: KickSample | null) => void
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kickSample, setKickSample] = useState<KickSample | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AppContext.Provider value={{
      kickSample,
      setKickSample,
      analysisResult,
      setAnalysisResult,
      isLoading,
      setIsLoading
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