'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as Tone from 'tone'
import { useApp } from '@/contexts/AppContext'

interface StepSequencerProps {
  isPlaying?: boolean
  onPlayToggle?: () => void
  onStepChange?: (step: number) => void
}

export default function StepSequencer({ isPlaying = false, onPlayToggle, onStepChange }: StepSequencerProps) {
  const { kickSample } = useApp()
  const [currentStep, setCurrentStep] = useState(-1)
  const [tempo, setTempo] = useState(136)
  const [swing, setSwing] = useState(0)
  // Initialize with 4-on-the-floor pattern (16 steps, kicks on 1, 5, 9, 13)
  const [pattern, setPattern] = useState<boolean[]>(() => {
    const initialPattern = new Array(16).fill(false)
    initialPattern[0] = true  // Beat 1
    initialPattern[4] = true  // Beat 2
    initialPattern[8] = true  // Beat 3
    initialPattern[12] = true // Beat 4
    return initialPattern
  })
  const [velocity, setVelocity] = useState<number[]>(new Array(16).fill(0.8))
  
  const sequenceRef = useRef<Tone.Sequence | null>(null)
  const synthRef = useRef<Tone.MembraneSynth | null>(null)
  const patternRef = useRef(pattern)
  const velocityRef = useRef(velocity)
  
  // Update refs when values change
  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])
  
  useEffect(() => {
    velocityRef.current = velocity
  }, [velocity])

  useEffect(() => {
    // Initialize Tone.js synth
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: {
        type: "sine"
      },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: "exponential"
      }
    }).toDestination()
    
    console.log('MembraneSynth initialized and connected to destination')

    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.stop()
        sequenceRef.current.dispose()
      }
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  // Handle play/pause when prop changes
  useEffect(() => {
    const handlePlayback = async () => {
      if (isPlaying) {
        console.log('Starting playback...')
        // Clean up any existing sequence first
        if (sequenceRef.current) {
          sequenceRef.current.stop()
          sequenceRef.current.dispose()
          sequenceRef.current = null
        }
        
        await Tone.start()
        console.log('Tone started, Transport state:', Tone.Transport.state)
        
        // Create sequence for 16 steps
        sequenceRef.current = new Tone.Sequence(
          (time, step) => {
            setCurrentStep(step)
            if (onStepChange) {
              onStepChange(step)
            }
            if (patternRef.current[step] && synthRef.current) {
              console.log(`Triggering step ${step} at time ${time}`)
              // Schedule the trigger slightly ahead to avoid timing conflicts
              synthRef.current.triggerAttackRelease(
                "C1", 
                "8n", 
                time, 
                velocityRef.current[step]
              )
            }
          },
          Array.from({ length: 16 }, (_, i) => i),
          "16n"
        )
        
        sequenceRef.current.start(0)
        Tone.Transport.stop()
        Tone.Transport.position = 0
        Tone.Transport.start()
        console.log('Transport started, state:', Tone.Transport.state)
      } else if (!isPlaying && sequenceRef.current) {
        console.log('Stopping playback...')
        Tone.Transport.stop()
        Tone.Transport.position = 0
        sequenceRef.current.stop()
        sequenceRef.current.dispose()
        sequenceRef.current = null
        setCurrentStep(-1)
        if (onStepChange) {
          onStepChange(-1)
        }
      }
    }
    
    handlePlayback()
  }, [isPlaying]) // Remove pattern and velocity from dependencies to avoid restarts

  const handleReset = () => {
    setPattern(new Array(16).fill(false))
    setVelocity(new Array(16).fill(0.8))
    setCurrentStep(-1)
  }

  const handleRandomize = () => {
    const newPattern = Array.from({ length: 16 }, () => Math.random() > 0.7)
    const newVelocity = Array.from({ length: 16 }, () => 0.5 + Math.random() * 0.5)
    setPattern(newPattern)
    setVelocity(newVelocity)
  }

  const toggleStep = (index: number) => {
    const newPattern = [...pattern]
    newPattern[index] = !newPattern[index]
    setPattern(newPattern)
  }

  const handleVelocityChange = (index: number, value: number) => {
    const newVelocity = [...velocity]
    newVelocity[index] = value
    setVelocity(newVelocity)
  }

  // Calculate animation duration based on BPM (one pulse per beat)
  const pulseDuration = 60 / tempo // seconds per beat
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className={cn("plugin-led", isPlaying ? "on" : "off")} 
            style={isPlaying ? {
              animation: `pulse-led ${pulseDuration}s linear infinite`
            } : undefined}
          />
          <h2 className="text-lg font-semibold">STEP SEQUENCER</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">PATTERN</span>
          <div className="plugin-display px-2 py-1">
            <span className="font-mono text-xs">
              {String(currentStep + 1).padStart(2, '0')}/16
            </span>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center gap-4 mb-6">
        
        <button
          onClick={handleReset}
          className="plugin-button p-2"
          title="Reset Pattern"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleRandomize}
          className="plugin-button p-2"
          title="Randomize Pattern"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Tempo Control */}
        <div className="flex items-center gap-3">
          <label className="text-xs">TEMPO</label>
          <input
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-24 h-2 bg-plugin-display-bg rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-plugin-led-on"
          />
          <div className="plugin-display px-2 py-1 min-w-[3rem] text-center">
            <span className="font-mono text-xs">{tempo}</span>
          </div>
        </div>

        {/* Swing Control */}
        <div className="flex items-center gap-3">
          <label className="text-xs">SWING</label>
          <input
            type="range"
            min="0"
            max="100"
            value={swing}
            onChange={(e) => setSwing(parseInt(e.target.value))}
            className="w-24 h-2 bg-plugin-display-bg rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-plugin-led-on"
          />
          <div className="plugin-display px-2 py-1 min-w-[3rem] text-center">
            <span className="font-mono text-xs">{swing}%</span>
          </div>
        </div>
      </div>

      {/* Step Grid */}
      <div className="space-y-2">
        {/* Beat markers */}
        <div className="flex gap-1">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 text-center text-[10px]",
                i % 4 === 0 ? "text-plugin-display-text" : "text-muted-foreground"
              )}
            >
              {i % 4 === 0 ? (i / 4 + 1) : '·'}
            </div>
          ))}
        </div>

        {/* Step buttons - Single row */}
        <div className="flex gap-1">
          {pattern.map((active, index) => (
            <button
              key={index}
              onClick={() => toggleStep(index)}
              className={cn(
                "flex-1 aspect-square min-w-[20px] border border-plugin-border rounded transition-all",
                "bg-gradient-to-b from-plugin-panel to-plugin-bg",
                active && "bg-plugin-led-on border-plugin-led-on shadow-led",
                currentStep === index && "ring-2 ring-plugin-led-on"
              )}
            />
          ))}
        </div>

        {/* Velocity controls */}
        <div className="mt-4 pt-4 border-t border-plugin-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">VELOCITY</span>
            <div className="flex-1 h-px bg-plugin-border" />
          </div>
          
          <div className="flex gap-1">
            {velocity.map((vel, index) => (
              <div
                key={index}
                className="flex-1 h-6 bg-plugin-display-bg rounded-sm relative overflow-hidden cursor-pointer"
                onClick={() => {
                  const newVel = vel > 0.5 ? 0.3 : 0.8
                  handleVelocityChange(index, newVel)
                }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-plugin-led-on/30 transition-all"
                  style={{ height: `${vel * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Info */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="plugin-display">
          <div className="font-mono text-xs space-y-1">
            <div>STEPS: {pattern.filter(Boolean).length}/16</div>
            <div>DENSITY: {Math.round((pattern.filter(Boolean).length / 16) * 100)}%</div>
          </div>
        </div>
        <div className="plugin-display">
          <div className="font-mono text-xs space-y-1">
            <div>TIME: 4/4</div>
            <div>LENGTH: 1 BAR</div>
          </div>
        </div>
        <div className="plugin-display">
          <div className="font-mono text-xs space-y-1">
            <div>MODE: LOOP</div>
            <div>CHANNEL: KICK</div>
          </div>
        </div>
      </div>
    </div>
  )
}