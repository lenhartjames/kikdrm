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
  
  // Store captured waveform data for full bar
  const capturedWaveformRef = useRef<Float32Array | null>(null)
  const lastStepRef = useRef<number>(-1)
  const fullBarBufferRef = useRef<Float32Array | null>(null)
  const writePositionRef = useRef<number>(0)
  const barDurationRef = useRef<number>(2) // 2 seconds for 16 steps at 120 BPM

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
        toneAnalyserRef.current = new Tone.Analyser('waveform', 256)
        Tone.Destination.connect(toneAnalyserRef.current)
      }
      
      // Initialize full bar buffer
      const sampleRate = 44100
      const tempo = 120 // BPM
      const beatsPerBar = 4
      const secondsPerBeat = 60 / tempo
      barDurationRef.current = beatsPerBar * secondsPerBeat
      const bufferSize = Math.floor(sampleRate * barDurationRef.current)
      
      if (!fullBarBufferRef.current || fullBarBufferRef.current.length !== bufferSize) {
        fullBarBufferRef.current = new Float32Array(bufferSize)
        writePositionRef.current = 0
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

  // Detect when sequence restarts (step 0) and initialize buffer
  useEffect(() => {
    if (currentStep === 0 && lastStepRef.current !== 0) {
      // Clear and reinitialize the buffer for new bar
      const sampleRate = 44100
      const bufferSize = Math.floor(sampleRate * barDurationRef.current) // Full bar buffer
      fullBarBufferRef.current = new Float32Array(bufferSize)
      writePositionRef.current = 0
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
      if (canvasRef.current && fullBarBufferRef.current) {
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

    let lastTime = Date.now()
    const sampleRate = 44100
    const msPerSample = 1000 / sampleRate

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      // Calculate how many samples to write based on elapsed time
      const samplesToWrite = Math.floor(deltaTime / msPerSample)
      
      // Get waveform data from Tone.js analyser
      if (toneAnalyserRef.current && fullBarBufferRef.current) {
        const waveform = toneAnalyserRef.current.getValue() as Float32Array
        
        if (waveform.length > 0 && samplesToWrite > 0) {
          // Write samples to the full bar buffer
          for (let i = 0; i < samplesToWrite && writePositionRef.current < fullBarBufferRef.current.length; i++) {
            const waveformIndex = Math.floor((i / samplesToWrite) * waveform.length)
            fullBarBufferRef.current[writePositionRef.current] = waveform[waveformIndex] || 0
            writePositionRef.current++
          }
        }
      }

      // Clear canvas
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.offsetWidth, height)

      // Draw grid
      drawGrid(ctx, canvas.offsetWidth, height)

      // Draw the full bar buffer
      if (fullBarBufferRef.current) {
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.beginPath()

        const samplesPerPixel = fullBarBufferRef.current.length / canvas.offsetWidth
        
        for (let x = 0; x < canvas.offsetWidth; x++) {
          const sampleIndex = Math.floor(x * samplesPerPixel)
          const sample = fullBarBufferRef.current[sampleIndex] || 0
          const y = ((sample + 1) / 2) * height
          
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()

        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.stroke()
        ctx.shadowBlur = 0
        
        // Draw progress indicator
        if (currentStep >= 0) {
          const progressX = (currentStep / 16) * canvas.offsetWidth
          ctx.strokeStyle = color
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.moveTo(progressX, 0)
          ctx.lineTo(progressX, height)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isSequencerPlaying, currentStep, color, backgroundColor, lineWidth, height])

  // Helper function to draw persistent waveform when paused
  const drawPersistentWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas || !fullBarBufferRef.current) return
    
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

    // Draw the full bar buffer
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    ctx.beginPath()

    const samplesPerPixel = fullBarBufferRef.current.length / canvas.offsetWidth
    
    for (let x = 0; x < canvas.offsetWidth; x++) {
      const sampleIndex = Math.floor(x * samplesPerPixel)
      const sample = fullBarBufferRef.current[sampleIndex] || 0
      const y = ((sample + 1) / 2) * height
      
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

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