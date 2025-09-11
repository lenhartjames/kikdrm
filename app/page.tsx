'use client'

import { useState, useRef, useEffect } from 'react'
import ImageUploadSection from '@/components/ImageUploadSection'
import KickPreviewSection, { KickPreviewSectionRef } from '@/components/KickPreviewSection'
import StepSequencer from '@/components/StepSequencer'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { RotateCcw, ChevronDown, ChevronUp, Play, Pause, Download, FileAudio, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function MainInterface() {
  const { kickSample, setKickSample, setAnalysisResult, setAiAnalysis } = useApp()
  const [showSequencer, setShowSequencer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const kickPreviewRef = useRef<KickPreviewSectionRef>(null)

  const handleStartOver = () => {
    setKickSample(null)
    setAnalysisResult(null)
    setAiAnalysis(null)
    setShowSequencer(false)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    if (kickSample && !showSequencer) {
      setShowSequencer(true)
    }
    setIsPlaying(!isPlaying)
  }
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHowItWorks) {
        setShowHowItWorks(false)
      }
    }
    
    if (showHowItWorks) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showHowItWorks])

  return (
    <main className="min-h-screen bg-plugin-bg p-4 sm:p-8 flex items-center justify-center relative">
      {/* Logo in top left */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <img 
          src="/kik-drm-logo.svg" 
          alt="IMG → KIK" 
          className="h-8 w-auto"
        />
      </div>
      
      <div className="w-full max-w-4xl">
        
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
                ref={kickPreviewRef}
                showSequencer={showSequencer}
                isPlaying={isPlaying}
                onPlayToggle={handlePlay}
                currentStep={currentStep}
              />

              {/* Expandable Sequencer - Inside Card */}
              {showSequencer && (
                <div className="mt-6 border-t border-plugin-border pt-6">
                  <StepSequencer 
                    isPlaying={isPlaying}
                    onPlayToggle={handlePlay}
                    onStepChange={setCurrentStep}
                  />
                </div>
              )}
              
              {/* Playback Controls - Always at bottom */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={handlePlay}
                  className={cn(
                    "plugin-button p-2 transition-colors",
                    isPlaying && "bg-plugin-led-on/20 border-plugin-led-on text-plugin-led-on hover:bg-plugin-led-on/30"
                  )}
                  disabled={!kickSample}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                
                <div className="flex items-center gap-2 border-l border-plugin-border pl-4 ml-2">
                  <button
                    onClick={() => kickPreviewRef.current?.downloadOriginal()}
                    className="plugin-button flex items-center gap-2 px-3 py-2"
                    disabled={!kickSample}
                    title="Download Original"
                  >
                    <FileAudio className="w-4 h-4" />
                    <span className="text-xs">Original</span>
                  </button>
                  
                  <button
                    onClick={() => kickPreviewRef.current?.downloadProcessed()}
                    className="plugin-button flex items-center gap-2 px-3 py-2"
                    disabled={!kickSample}
                    title="Download with Effects"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs">With FX</span>
                  </button>
                </div>

                <div className="flex-1" />
              </div>
            </>
          )}
        </div>
        
        {/* How does this work? Link - At the very bottom */}
        <div className="mt-8 flex justify-center">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
            onClick={() => setShowHowItWorks(true)}
          >
            <HelpCircle className="w-3 h-3" />
            How does this work?
          </button>
        </div>
        
        {/* How It Works Modal */}
        {showHowItWorks && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowHowItWorks(false)}
          >
            <div 
              className="relative w-full max-w-3xl max-h-[90vh] bg-black/95 rounded-lg border border-plugin-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowHowItWorks(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[90vh] p-6">
                  <h3 className="text-plugin-display-text font-semibold mb-4 font-zen-dots uppercase">KIK DRM DESIGNER OVERVIEW</h3>
                  <div className="font-mono text-xs space-y-3 text-muted-foreground">
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">SIGNAL FLOW & ANALYSIS</div>
                      <p>The system employs GPT-4o vision model to analyze uploaded images, extracting visual characteristics that map to audio parameters. The AI selects from 15 pre-recorded kick samples based on brightness (high-frequency content), warmth (low-mid harmonic density), and punch (distortion amount, max 20%). The selected sample is then processed through the DSP chain with AI-suggested parameters.</p>
                    </div>
                    
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">DSP CHAIN ARCHITECTURE</div>
                      <p>Audio processing utilizes Tone.js Web Audio API with a serial effects chain: Source → Biquad Filter (12dB/oct LPF, 200Hz-20kHz) → Waveshaper Distortion (0-20% drive, 2x oversampling) → Dynamics Compressor (-30dB threshold, 4:1 ratio, ADSR-modulated attack/release) → Gain Stage (2x linear, +6dB) → Master Bus. No amplitude envelope is used - ADSR parameters modulate compressor timings instead.</p>
                    </div>
                    
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">PARAMETER MAPPING</div>
                      <p>BRIGHTNESS: Controls filter cutoff frequency via exponential scaling (200Hz to 20kHz range), affecting spectral centroid and harmonic overtones.</p>
                      <p>WARMTH: Adjusts filter resonance (Q factor 0.5-8) emphasizing fundamental frequency and lower harmonics (80-250Hz range).</p>
                      <p>PUNCH: Controls waveshaper distortion amount (0-20% maximum), introducing odd-order harmonics and soft saturation.</p>
                      <p>ATTACK: Modulates compressor attack time (1ms-50ms), controls transient shaping.</p>
                      <p>DECAY: Range constrained to 60-100% for optimal kick drum characteristics.</p>
                      <p>SUSTAIN: Reserved for future parameter modulation.</p>
                      <p>RELEASE: Modulates compressor release time (10ms-500ms), affects tail characteristics.</p>
                    </div>
                    
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">SAMPLE MATCHING ALGORITHM</div>
                      <p>The system maintains a library of 15 core kick samples (ice-crystal, fireplace, midnight, solar-flare, etc.) with pre-defined characteristics. The AI knows these samples and their parameters, then uses a weighted Euclidean distance algorithm to match its suggested brightness/warmth/punch values to select the most appropriate sample. The selected sample is then processed through the effects chain.</p>
                    </div>
                    
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">AUDIO SPECIFICATIONS</div>
                      <p>PLAYBACK: Real-time processing at system sample rate (typically 48kHz), 32-bit float internal processing, zero-latency monitoring via Web Audio context.</p>
                      <p>EXPORT ORIGINAL: Unprocessed source file, 44.1kHz/16-bit PCM WAV, preserving original transient fidelity.</p>
                      <p>EXPORT PROCESSED: Offline render through identical DSP chain, 44.1kHz/16-bit PCM WAV, no normalization applied, exact reproduction of playback signal path excluding UI volume control, maintaining bit-for-bit accuracy of effects processing.</p>
                    </div>
                    
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">OSCILLOSCOPE VISUALIZATION</div>
                      <p>Real-time waveform display using 2048-sample FFT window, 60fps canvas rendering with persistence decay, RMS amplitude scaling at 45% viewport height, providing visual feedback of transient response and harmonic content.</p>
                    </div>
                    
                    <div>
                      <div className="text-plugin-display-text font-semibold mb-1">SEQUENCER ENGINE</div>
                      <p>16-step pattern sequencer with per-step velocity (0-100%), microsecond-accurate scheduling via Web Audio clock, swing timing via alternating 16th note delays, BPM range 60-200 with sample-accurate sync.</p>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}
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