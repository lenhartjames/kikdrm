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
  lineWidth = 1,
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
  const barDurationRef = useRef<number>(2) // 2 seconds for 16 steps at 136 BPM
  const wasPlayingRef = useRef<boolean>(false)

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

  // Set up Tone.js analyser once and keep it connected
  useEffect(() => {
    // Create and connect Tone.js analyser with higher resolution
    if (!toneAnalyserRef.current) {
      toneAnalyserRef.current = new Tone.Analyser('waveform', 4096)
      Tone.Destination.connect(toneAnalyserRef.current)
    }
    
    return () => {
      if (toneAnalyserRef.current) {
        toneAnalyserRef.current.dispose()
        toneAnalyserRef.current = null
      }
    }
  }, []) // Only create once on mount

  // Clear buffer only when playback starts from stopped state
  useEffect(() => {
    if (isSequencerPlaying && !wasPlayingRef.current) {
      // Starting playback - clear the buffer
      const sampleRate = 48000
      const tempo = 136
      const beatsPerBar = 4
      const secondsPerBeat = 60 / tempo
      barDurationRef.current = beatsPerBar * secondsPerBeat
      const bufferSize = Math.floor(sampleRate * barDurationRef.current * 2)
      fullBarBufferRef.current = new Float32Array(bufferSize)
      writePositionRef.current = 0
    }
    wasPlayingRef.current = isSequencerPlaying
  }, [isSequencerPlaying])

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

    let lastTime = performance.now() // More accurate timing
    const sampleRate = 48000
    const msPerSample = 1000 / (sampleRate * 2) // Account for oversampling

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      // Calculate how many samples to write based on elapsed time
      const samplesToWrite = Math.floor(deltaTime / msPerSample)
      
      // Get waveform data from Tone.js analyser
      if (toneAnalyserRef.current && fullBarBufferRef.current) {
        const waveform = toneAnalyserRef.current.getValue() as Float32Array
        
        if (waveform.length > 0 && samplesToWrite > 0) {
          // Write samples to the full bar buffer, wrapping around if needed
          for (let i = 0; i < samplesToWrite; i++) {
            const waveformPos = (i / samplesToWrite) * waveform.length
            const waveformIndex = Math.floor(waveformPos)
            const fraction = waveformPos - waveformIndex
            
            // Linear interpolation between samples for smoother waveform
            const sample1 = waveform[waveformIndex] || 0
            const sample2 = waveform[Math.min(waveformIndex + 1, waveform.length - 1)] || 0
            const interpolatedSample = sample1 + (sample2 - sample1) * fraction
            
            // Wrap around if we've filled the buffer (continuous recording)
            const bufferIndex = writePositionRef.current % fullBarBufferRef.current.length
            fullBarBufferRef.current[bufferIndex] = interpolatedSample
            writePositionRef.current++
          }
        }
      }

      // Clear canvas
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.offsetWidth, height)

      // Draw grid
      drawGrid(ctx, canvas.offsetWidth, height)

      // Draw the full bar buffer with enhanced detail
      if (fullBarBufferRef.current) {
        // Main waveform with anti-aliasing
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()

        const samplesPerPixel = fullBarBufferRef.current.length / canvas.offsetWidth
        let prevY = height / 2
        
        for (let x = 0; x < canvas.offsetWidth; x++) {
          // Average multiple samples per pixel for better representation
          const startIdx = Math.floor(x * samplesPerPixel)
          const endIdx = Math.floor((x + 1) * samplesPerPixel)
          
          let minSample = 1
          let maxSample = -1
          let avgSample = 0
          let sampleCount = 0
          
          for (let i = startIdx; i < endIdx && i < fullBarBufferRef.current.length; i++) {
            const sample = fullBarBufferRef.current[i] || 0
            minSample = Math.min(minSample, sample)
            maxSample = Math.max(maxSample, sample)
            avgSample += sample
            sampleCount++
          }
          
          if (sampleCount > 0) {
            avgSample /= sampleCount
            
            // Use consistent scaling for waveform
            const centerY = height / 2
            const amplitude = height * 0.4 // Consistent amplitude scaling
            
            // Draw min/max envelope for detail
            const minY = centerY + (minSample * amplitude)
            const maxY = centerY + (maxSample * amplitude)
            const avgY = centerY + (avgSample * amplitude)
            
            // Draw thin vertical line showing range
            if (Math.abs(maxY - minY) > 1) {
              ctx.globalAlpha = 0.4  // Slightly more visible
              ctx.beginPath()
              ctx.moveTo(x, minY)
              ctx.lineTo(x, maxY)
              ctx.stroke()
              ctx.globalAlpha = 1
            }
            
            // Main waveform line
            if (x === 0) {
              ctx.beginPath()
              ctx.moveTo(x, avgY)
            } else {
              // Smooth curve between points
              const cpx = (x - 0.5)
              const cpy = (prevY + avgY) / 2
              ctx.quadraticCurveTo(cpx, prevY, x, avgY)
            }
            
            prevY = avgY
          }
        }

        ctx.globalAlpha = 0.6  // Set dimmer opacity for playback
        ctx.stroke()

        // Add glow effect while maintaining dim opacity
        ctx.shadowBlur = 3
        ctx.shadowColor = color
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        
        // Draw progress indicator showing position in continuous recording
        if (writePositionRef.current > 0 && fullBarBufferRef.current) {
          const progressPercent = (writePositionRef.current % fullBarBufferRef.current.length) / fullBarBufferRef.current.length
          const progressX = progressPercent * canvas.offsetWidth
          
          // Subtle glow for progress line
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.3
          ctx.shadowBlur = 8
          ctx.shadowColor = color
          ctx.beginPath()
          ctx.moveTo(progressX, 0)
          ctx.lineTo(progressX, height)
          ctx.stroke()
          
          // Main progress line
          ctx.shadowBlur = 0
          ctx.globalAlpha = 0.7
          ctx.strokeStyle = color
          ctx.setLineDash([2, 4])
          ctx.beginPath()
          ctx.moveTo(progressX, 0)
          ctx.lineTo(progressX, height)
          ctx.stroke()
          ctx.setLineDash([])
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

    // Draw the full bar buffer with consistent scaling
    const samplesPerPixel = fullBarBufferRef.current.length / canvas.offsetWidth
    const centerY = height / 2
    const amplitude = height * 0.4 // Same amplitude as during playback
    let prevY = centerY
    
    // First pass: Draw the envelope (dimmer)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth * 0.5
    ctx.globalAlpha = 0.3
    
    for (let x = 0; x < canvas.offsetWidth; x++) {
      // Average multiple samples for smoother display
      const startIdx = Math.floor(x * samplesPerPixel)
      const endIdx = Math.min(startIdx + Math.ceil(samplesPerPixel), fullBarBufferRef.current.length)
      
      let minSample = 1
      let maxSample = -1
      
      for (let i = startIdx; i < endIdx; i++) {
        const sample = fullBarBufferRef.current[i] || 0
        minSample = Math.min(minSample, sample)
        maxSample = Math.max(maxSample, sample)
      }
      
      // Draw min/max envelope for detail
      if (Math.abs(maxSample - minSample) > 0.01) {
        const minY = centerY + (minSample * amplitude)
        const maxY = centerY + (maxSample * amplitude)
        ctx.beginPath()
        ctx.moveTo(x, minY)
        ctx.lineTo(x, maxY)
        ctx.stroke()
      }
    }
    
    // Second pass: Draw main waveform at FULL opacity
    ctx.globalAlpha = 1  // Full opacity for main line
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    
    prevY = centerY
    
    for (let x = 0; x < canvas.offsetWidth; x++) {
      const startIdx = Math.floor(x * samplesPerPixel)
      const endIdx = Math.min(startIdx + Math.ceil(samplesPerPixel), fullBarBufferRef.current.length)
      
      let avgSample = 0
      let count = 0
      
      for (let i = startIdx; i < endIdx; i++) {
        avgSample += fullBarBufferRef.current[i] || 0
        count++
      }
      
      if (count > 0) {
        avgSample /= count
        const avgY = centerY + (avgSample * amplitude)
        
        // Main waveform line
        if (x === 0) {
          ctx.moveTo(x, avgY)
        } else {
          // Smooth curve between points
          const cpx = (x - 0.5)
          const cpy = (prevY + avgY) / 2
          ctx.quadraticCurveTo(cpx, prevY, x, avgY)
        }
        
        prevY = avgY
      }
    }

    // Draw main stroke at full opacity
    ctx.stroke()

    // Add bright glow effect
    ctx.shadowBlur = 8
    ctx.shadowColor = color
    ctx.globalAlpha = 1
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Helper function to draw grid with beat markers
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 0.5

    // Vertical lines - 16 divisions for steps
    for (let i = 0; i <= 16; i++) {
      const x = (i / 16) * width
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines - finer grid
    for (let y = 0; y < height; y += height / 8) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
    ctx.setLineDash([])
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
        {isSequencerPlaying ? 'RECORDING' : 'HOLD'}
      </div>
    </div>
  )
}