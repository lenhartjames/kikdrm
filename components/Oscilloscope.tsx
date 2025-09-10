'use client'

import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

interface OscilloscopeProps {
  audioUrl?: string
  isPlaying?: boolean
  isSequencerPlaying?: boolean
  currentStep?: number
  color?: string
  backgroundColor?: string
  lineWidth?: number
  height?: number
}

export default function Oscilloscope({ 
  audioUrl, 
  isPlaying = false,
  isSequencerPlaying = false,
  currentStep = -1,
  color = '#00ff88',
  backgroundColor = '#0a0a0a',
  lineWidth = 2,
  height = 120
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const toneAnalyserRef = useRef<Tone.Analyser | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Store captured waveform data
  const capturedWaveformRef = useRef<Float32Array | null>(null)
  const lastStepRef = useRef<number>(-1)
  const waveformHistoryRef = useRef<Float32Array[]>([])
  const currentPositionRef = useRef<number>(0)

  // Load and decode audio
  useEffect(() => {
    if (!audioUrl) return

    const loadAudio = async () => {
      setIsLoading(true)
      try {
        // Initialize audio context if needed
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        // Fetch and decode audio
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const decodedAudio = await audioContextRef.current.decodeAudioData(arrayBuffer)
        setAudioBuffer(decodedAudio)
        
        // Set up analyser
        if (!analyserRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser()
          analyserRef.current.fftSize = 2048
          analyserRef.current.smoothingTimeConstant = 0.8
        }
      } catch (error) {
        console.error('Error loading audio for oscilloscope:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAudio()
  }, [audioUrl])

  // Draw static waveform when not playing
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current || isSequencerPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.offsetWidth, height)

    // Draw grid
    drawGrid(ctx, canvas.offsetWidth, height)

    // Draw waveform
    const channelData = audioBuffer.getChannelData(0)
    const step = Math.ceil(channelData.length / canvas.offsetWidth)
    const amp = height / 2

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()

    for (let i = 0; i < canvas.offsetWidth; i++) {
      let min = 1.0
      let max = -1.0
      
      for (let j = 0; j < step; j++) {
        const datum = channelData[(i * step) + j]
        if (datum < min) min = datum
        if (datum > max) max = datum
      }
      
      const y1 = (1 + min) * amp
      const y2 = (1 + max) * amp
      
      if (i === 0) {
        ctx.moveTo(i, y1)
      } else {
        ctx.lineTo(i, y1)
      }
      
      if (Math.abs(max - min) > 0.01) {
        ctx.lineTo(i, y2)
      }
    }

    ctx.stroke()

    // Add glow effect
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [audioBuffer, isSequencerPlaying, color, backgroundColor, lineWidth, height])

  // Set up Tone.js analyser when sequencer starts
  useEffect(() => {
    if (isSequencerPlaying) {
      // Create and connect Tone.js analyser
      if (!toneAnalyserRef.current) {
        toneAnalyserRef.current = new Tone.Analyser('waveform', 2048)
        Tone.Destination.connect(toneAnalyserRef.current)
      }
    } else {
      // Clean up Tone analyser when sequencer stops
      if (toneAnalyserRef.current) {
        toneAnalyserRef.current.dispose()
        toneAnalyserRef.current = null
      }
    }
    
    return () => {
      if (toneAnalyserRef.current) {
        toneAnalyserRef.current.dispose()
        toneAnalyserRef.current = null
      }
    }
  }, [isSequencerPlaying])

  // Detect when sequence restarts (step 0)
  useEffect(() => {
    if (currentStep === 0 && lastStepRef.current !== 0) {
      // Clear the captured waveform when sequence restarts
      waveformHistoryRef.current = []
      currentPositionRef.current = 0
    }
    lastStepRef.current = currentStep
  }, [currentStep])

  // Animate oscilloscope when playing
  useEffect(() => {
    if (!isSequencerPlaying || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      // When stopped, keep displaying the last captured waveform
      if (canvasRef.current && waveformHistoryRef.current.length > 0) {
        drawPersistentWaveform()
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const bufferLength = 2048
    const samplesPerStep = Math.floor(bufferLength / 16) // Divide buffer into 16 segments

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      
      // Get waveform data from Tone.js analyser
      if (toneAnalyserRef.current) {
        const waveform = toneAnalyserRef.current.getValue() as Float32Array
        if (waveform.length > 0) {
          // Store waveform segment
          const segment = new Float32Array(samplesPerStep)
          for (let i = 0; i < samplesPerStep; i++) {
            segment[i] = waveform[i] || 0
          }
          
          // Add to history, limiting to 16 segments
          waveformHistoryRef.current.push(segment)
          if (waveformHistoryRef.current.length > 16) {
            waveformHistoryRef.current.shift()
          }
        }
      }

      // Clear canvas
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.offsetWidth, height)

      // Draw grid
      drawGrid(ctx, canvas.offsetWidth, height)

      // Draw accumulated waveform
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
      ctx.beginPath()

      const totalSamples = waveformHistoryRef.current.length * samplesPerStep
      const sliceWidth = canvas.offsetWidth / Math.max(totalSamples, bufferLength)
      let x = 0

      // Draw all accumulated segments
      waveformHistoryRef.current.forEach((segment, segmentIndex) => {
        segment.forEach((sample, sampleIndex) => {
          const v = (sample + 1) / 2 // Convert from -1,1 to 0,1
          const y = v * height

          if (segmentIndex === 0 && sampleIndex === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        })
      })

      // If we don't have enough data, draw a line to the end
      if (x < canvas.offsetWidth) {
        ctx.lineTo(canvas.offsetWidth, height / 2)
      }

      ctx.stroke()

      // Add glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = color
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isSequencerPlaying, color, backgroundColor, lineWidth, height])

  // Helper function to draw persistent waveform when paused
  const drawPersistentWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.offsetWidth, height)

    // Draw grid
    drawGrid(ctx, canvas.offsetWidth, height)

    if (waveformHistoryRef.current.length === 0) return

    // Draw the captured waveform
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    ctx.beginPath()

    const samplesPerStep = waveformHistoryRef.current[0]?.length || 128
    const totalSamples = waveformHistoryRef.current.length * samplesPerStep
    const sliceWidth = canvas.offsetWidth / totalSamples
    let x = 0

    waveformHistoryRef.current.forEach((segment, segmentIndex) => {
      segment.forEach((sample, sampleIndex) => {
        const v = (sample + 1) / 2
        const y = v * height

        if (segmentIndex === 0 && sampleIndex === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      })
    })

    ctx.stroke()

    // Add glow effect
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Helper function to draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x < width; x += width / 10) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y < height; y += height / 4) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height, backgroundColor }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-plugin-display-text opacity-50">Loading waveform...</div>
        </div>
      )}
      {!audioUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-plugin-display-text opacity-30">No signal</div>
        </div>
      )}
      
      {/* Oscilloscope overlay decorations */}
      <div className="absolute top-1 left-1 text-[8px] text-plugin-display-text opacity-50 font-mono">
        {audioBuffer ? `${(audioBuffer.duration * 1000).toFixed(0)}ms` : '---'}
      </div>
      <div className="absolute top-1 right-1 text-[8px] text-plugin-display-text opacity-50 font-mono">
        {audioBuffer ? `${audioBuffer.sampleRate}Hz` : '---'}
      </div>
      <div className="absolute bottom-1 left-1 text-[8px] text-plugin-display-text opacity-50 font-mono">
        SCOPE
      </div>
      <div className="absolute bottom-1 right-1 text-[8px] text-plugin-display-text opacity-50 font-mono">
        {isSequencerPlaying ? `LIVE [${currentStep + 1}/16]` : 'HOLD'}
      </div>
    </div>
  )
}