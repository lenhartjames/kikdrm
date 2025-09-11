'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Play, Pause, Download, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import Oscilloscope from './Oscilloscope'
import Knob from './Knob'
import * as Tone from 'tone'

export interface KickPreviewSectionRef {
  downloadOriginal: () => Promise<void>
  downloadProcessed: () => Promise<void>
}

interface KickPreviewSectionProps {
  showSequencer?: boolean
  isPlaying?: boolean
  onPlayToggle?: () => void
  currentStep?: number
}

const KickPreviewSection = forwardRef<KickPreviewSectionRef, KickPreviewSectionProps>(({ 
  showSequencer = false, 
  isPlaying = false,
  onPlayToggle,
  currentStep = -1
}, ref) => {
  const { kickSample, isLoading, aiAnalysis, audioEffects } = useApp()
  const [volume, setVolume] = useState(75)
  const [showInfo, setShowInfo] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Parameter states - initialized from kick sample
  const [brightness, setBrightness] = useState(50)
  const [warmth, setWarmth] = useState(50)
  const [punch, setPunch] = useState(50)
  
  // ADSR envelope parameters
  const [attack, setAttack] = useState(5)
  const [decay, setDecay] = useState(80)
  const [sustain, setSustain] = useState(70)
  const [release, setRelease] = useState(50)
  
  // Tone.js nodes for real-time processing
  const playerRef = useRef<Tone.Player | null>(null)

  // Set up Tone.js audio processing chain when kick sample changes
  useEffect(() => {
    if (kickSample?.file_url) {
      // Clean up old nodes
      if (playerRef.current) playerRef.current.dispose()
      if (audioEffects.current.filter) audioEffects.current.filter.dispose()
      if (audioEffects.current.distortion) audioEffects.current.distortion.dispose()
      if (audioEffects.current.compressor) audioEffects.current.compressor.dispose()
      if (audioEffects.current.gain) audioEffects.current.gain.dispose()
      if (audioEffects.current.envelope) audioEffects.current.envelope.dispose()
      
      const audioUrl = kickSample.file_url.startsWith('http') 
        ? kickSample.file_url 
        : `${window.location.origin}${kickSample.file_url}`
      
      // Create shared Tone.js processing chain
      playerRef.current = new Tone.Player(audioUrl).sync()
      audioEffects.current.filter = new Tone.Filter({
        frequency: 2000,
        type: "lowpass",
        rolloff: -12
      })
      audioEffects.current.distortion = new Tone.Distortion({
        distortion: 0.1,
        oversample: '2x'
      })
      audioEffects.current.compressor = new Tone.Compressor({
        threshold: -30,
        ratio: 4,
        attack: 0.003,
        release: 0.1
      })
      // NOTE: AmplitudeEnvelope removed - it was gating the signal incorrectly
      // For kick drums, ADSR should modulate parameters, not gate amplitude
      audioEffects.current.envelope = null
      // Gain stage set to 2x to compensate for processing losses
      audioEffects.current.gain = new Tone.Gain(2)
      
      // Connect the chain: Player -> Filter -> Distortion -> Compressor -> Gain -> Destination
      playerRef.current.connect(audioEffects.current.filter)
      audioEffects.current.filter.connect(audioEffects.current.distortion)
      audioEffects.current.distortion.connect(audioEffects.current.compressor)
      audioEffects.current.compressor.connect(audioEffects.current.gain)
      audioEffects.current.gain.toDestination()
      
      // Also set up HTML audio element for fallback
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
        audioRef.current.volume = 0 // Mute HTML audio since we're using Tone.js
      }
      
      console.log('Tone.js audio chain set up:', audioUrl)
      console.log('Effects chain:', {
        filter: audioEffects.current.filter ? 'initialized' : 'null',
        distortion: audioEffects.current.distortion ? 'initialized' : 'null',
        compressor: audioEffects.current.compressor ? 'initialized' : 'null',
        envelope: audioEffects.current.envelope ? 'initialized' : 'null',
        gain: audioEffects.current.gain ? 'initialized' : 'null'
      })
      
      // Initialize parameters from AI analysis (if available) or kick sample
      if (aiAnalysis?.suggested_kick) {
        // Use AI suggested values (punch is already limited to 20 max, decay 60-100 in the API)
        setBrightness(aiAnalysis.suggested_kick.brightness || 50)
        setWarmth(aiAnalysis.suggested_kick.warmth || 50)
        setPunch(aiAnalysis.suggested_kick.punch || 15)
        setAttack(aiAnalysis.suggested_kick.attack || 5)
        setDecay(aiAnalysis.suggested_kick.decay || 80)
        setSustain(aiAnalysis.suggested_kick.sustain || 70)
        setRelease(aiAnalysis.suggested_kick.release || 50)
      } else if (kickSample.characteristics) {
        // Fallback to kick sample characteristics if no AI analysis
        setBrightness(kickSample.characteristics.brightness || 50)
        setWarmth(kickSample.characteristics.warmth || 50)
        setPunch(Math.min(kickSample.characteristics.punch || 15, 20)) // Limit punch to 20
        setAttack(kickSample.characteristics.attack || 5)
        setDecay(Math.max(60, Math.min(100, kickSample.characteristics.decay || 80))) // Limit decay to 60-100
        setSustain(kickSample.characteristics.sustain || 70)
        setRelease(kickSample.characteristics.release || 50)
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (playerRef.current) playerRef.current.dispose()
      if (audioEffects.current.filter) audioEffects.current.filter.dispose()
      if (audioEffects.current.distortion) audioEffects.current.distortion.dispose()
      if (audioEffects.current.compressor) audioEffects.current.compressor.dispose()
      if (audioEffects.current.envelope) audioEffects.current.envelope.dispose()
      if (audioEffects.current.gain) audioEffects.current.gain.dispose()
      // Reset refs
      audioEffects.current.filter = null
      audioEffects.current.distortion = null
      audioEffects.current.compressor = null
      audioEffects.current.envelope = null
      audioEffects.current.gain = null
    }
  }, [kickSample, aiAnalysis])

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
    // Also update Tone.js Destination volume for the sequencer
    // Convert from 0-100 to decibels (-60 to 0)
    const dbVolume = volume === 0 ? -Infinity : 20 * Math.log10(volume / 100)
    Tone.Destination.volume.value = dbVolume
  }, [volume])
  
  // Update brightness (filter frequency)
  useEffect(() => {
    if (audioEffects.current.filter) {
      // Map brightness to filter frequency (200Hz to 20kHz)
      // Using exponential mapping for perceptual linearity
      const minFreq = 200
      const maxFreq = 20000
      const freq = minFreq * Math.pow(maxFreq / minFreq, brightness / 100)
      audioEffects.current.filter.frequency.value = freq
      console.log('Playback filter frequency updated:', freq, 'Hz (brightness:', brightness, '%)')
    }
  }, [brightness, audioEffects])
  
  // Update warmth (filter resonance and type)
  useEffect(() => {
    if (audioEffects.current.filter) {
      // Adjust Q factor for warmth (0.5 to 10)
      audioEffects.current.filter.Q.value = 0.5 + (warmth / 100) * 9.5
    }
  }, [warmth, audioEffects])
  
  // Update punch (compression and distortion)
  useEffect(() => {
    if (audioEffects.current.compressor) {
      // Keep compressor settings static for consistency
      audioEffects.current.compressor.threshold.value = -30
      audioEffects.current.compressor.ratio.value = 4
    }
    if (audioEffects.current.distortion) {
      // Punch controls distortion only (max 20% as per spec)
      audioEffects.current.distortion.distortion = (punch / 100) * 0.2 // 0 to 0.2 (20% max)
    }
  }, [punch, audioEffects])
  
  // Update ADSR parameters - modulate compressor timings instead of envelope
  useEffect(() => {
    if (audioEffects.current.compressor) {
      // Attack modulates compressor attack time (1ms to 50ms)
      const attackTime = Math.max(0.001, 0.001 + (attack / 100) * 0.049)
      audioEffects.current.compressor.attack.value = attackTime
    }
  }, [attack, audioEffects])
  
  useEffect(() => {
    // Decay parameter reserved for future modulation
    // Could modulate filter sweep or other time-based effects
    console.log('Decay parameter:', decay, '(reserved for future use)')
  }, [decay, audioEffects])
  
  useEffect(() => {
    // Sustain parameter reserved for future modulation  
    // Could modulate steady-state characteristics
    console.log('Sustain parameter:', sustain, '(reserved for future use)')
  }, [sustain, audioEffects])
  
  useEffect(() => {
    if (audioEffects.current.compressor) {
      // Release modulates compressor release time (10ms to 500ms)
      const releaseTime = Math.max(0.01, 0.01 + (release / 100) * 0.49)
      audioEffects.current.compressor.release.value = releaseTime
    }
  }, [release, audioEffects])
  
  // Handle playback when isPlaying prop changes
  useEffect(() => {
    const handlePlayback = async () => {
      if (!kickSample?.file_url || !playerRef.current) return
      
      if (isPlaying) {
        await Tone.start()
        // Stop first to reset timing
        try {
          playerRef.current.stop()
        } catch (e) {
          // Ignore if not playing
        }
        // No envelope triggering since we removed amplitude envelope
        playerRef.current.start()
      } else {
        try {
          playerRef.current.stop()
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    }
    
    handlePlayback()
  }, [isPlaying, kickSample])

  const handlePlayPause = async () => {
    if (!kickSample?.file_url) return
    
    // Log current playback effects for comparison
    if (audioEffects.current.filter) {
      console.log('Current playback effects:', {
        filter: {
          frequency: audioEffects.current.filter.frequency.value,
          Q: audioEffects.current.filter.Q.value
        },
        distortion: audioEffects.current.distortion?.distortion,
        compressor: {
          threshold: audioEffects.current.compressor?.threshold.value,
          ratio: audioEffects.current.compressor?.ratio.value
        },
        gain: audioEffects.current.gain?.gain.value
      })
    }
    
    if (onPlayToggle) {
      onPlayToggle()
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    // Volume will be updated by the useEffect
  }

  const handleDownloadOriginal = async () => {
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
        link.download = `${kickSample.name || 'kick-sample'}-original.wav`
        link.click()
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } catch (error) {
        console.error('Error downloading original sample:', error)
      }
    }
  }
  
  const handleDownloadProcessed = async () => {
    if (kickSample?.file_url) {
      try {
        // Load the sample
        const audioUrl = kickSample.file_url.startsWith('http') 
          ? kickSample.file_url 
          : `${window.location.origin}${kickSample.file_url}`
        
        console.log('Processing audio URL:', audioUrl)
        
        // First fetch the audio buffer
        const response = await fetch(audioUrl)
        
        // Check response type
        const contentType = response.headers.get('content-type')
        console.log('Response content-type:', contentType)
        
        const arrayBuffer = await response.arrayBuffer()
        console.log('ArrayBuffer size:', arrayBuffer.byteLength)
        
        // Try to decode audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        let audioBuffer: AudioBuffer | null = null
        
        try {
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
          console.log('Decoded audio buffer:', {
            duration: audioBuffer.duration,
            channels: audioBuffer.numberOfChannels,
            sampleRate: audioBuffer.sampleRate,
            length: audioBuffer.length
          })
        } catch (decodeError) {
          console.error('Failed to decode audio:', decodeError)
          audioBuffer = null
        }
        
        // If audio buffer is invalid or has 0 channels, use fallback
        if (!audioBuffer || audioBuffer.numberOfChannels === 0 || audioBuffer.duration === 0) {
          console.log('Invalid audio buffer, using Tone.js fallback')
          // If decode fails, try using Tone.js to load it
          const toneBuffer = await Tone.ToneAudioBuffer.load(audioUrl)
          
          // Create a simple offline render without the Web Audio API
          const duration = 2 // Default to 2 seconds
          const sampleRate = 44100 // 44.1kHz standard sample rate
          const channels = 2
          
          console.log('Using fallback rendering with Tone.js buffer')
          
          // Create an offline context for rendering
          const offlineContext = new Tone.OfflineContext(duration, channels, sampleRate)
          
          // Set the offline context as the current context
          const previousContext = Tone.getContext()
          Tone.setContext(offlineContext)
          
          // Create offline versions of the effects chain (matching real-time chain)
          const offlinePlayer = new Tone.Player(toneBuffer).sync()
          const offlineFilter = new Tone.Filter(audioEffects.current.filter?.frequency.value || 2000, "lowpass")
          const offlineDistortion = new Tone.Distortion(audioEffects.current.distortion?.distortion || 0.1)
          const offlineCompressor = new Tone.Compressor(
            audioEffects.current.compressor?.threshold.value || -30,
            audioEffects.current.compressor?.ratio.value || 4
          )
          // No envelope - matching real-time playback
          const offlineGain = new Tone.Gain(audioEffects.current.gain?.gain.value || 2)
          
          // Set filter Q
          offlineFilter.Q.value = audioEffects.current.filter?.Q.value || 1
          
          // Set compressor attack/release from ADSR parameters
          offlineCompressor.attack.value = audioEffects.current.compressor?.attack.value || 0.003
          offlineCompressor.release.value = audioEffects.current.compressor?.release.value || 0.1
          
          // Connect everything WITHOUT envelope (matching real-time chain)
          offlinePlayer.connect(offlineFilter)
          offlineFilter.connect(offlineDistortion)
          offlineDistortion.connect(offlineCompressor)
          offlineCompressor.connect(offlineGain)
          offlineGain.toDestination()
          
          // Start playback without envelope triggering
          offlinePlayer.start(0)
          const buffer = await offlineContext.render()
          
          // Restore the previous context
          Tone.setContext(previousContext)
          
          // Convert buffer to WAV blob
          const wavBlob = await bufferToWav(buffer)
          const url = URL.createObjectURL(wavBlob)
          
          const link = document.createElement('a')
          link.href = url
          link.download = `${kickSample.name || 'kick-sample'}-processed.wav`
          link.click()
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(url), 100)
          offlinePlayer.dispose()
          offlineFilter.dispose()
          offlineDistortion.dispose()
          offlineCompressor.dispose()
          offlineGain.dispose()
          
          return // Exit early since we've handled it
        }
        
        // If we reach here, audioBuffer should be valid
        if (!audioBuffer) {
          throw new Error('Failed to load audio buffer')
        }
        
        // Calculate duration with a bit of padding for effects
        const duration = audioBuffer.duration + 0.5 // Add 0.5s for reverb/delay tail
        
        // Ensure valid channel count (1 or 2)
        const channelCount = Math.min(Math.max(audioBuffer.numberOfChannels || 2, 1), 2)
        // Default to 44.1kHz if not specified
        const sampleRate = 44100  // Always use 44.1kHz for consistency
        
        console.log('Audio info:', {
          duration: audioBuffer.duration,
          renderDuration: duration,
          channels: audioBuffer.numberOfChannels,
          useChannels: channelCount,
          sampleRate: audioBuffer.sampleRate,
          useSampleRate: sampleRate
        })
        
        console.log('Creating OfflineContext with:', duration, channelCount, sampleRate)
        
        // Try creating native OfflineAudioContext first
        let offlineContext: Tone.OfflineContext
        try {
          // Create native offline context
          const nativeOffline = new OfflineAudioContext(
            channelCount,
            Math.ceil(duration * sampleRate),
            sampleRate
          )
          console.log('Created native OfflineAudioContext successfully')
          
          // Wrap it in Tone's OfflineContext
          offlineContext = new Tone.OfflineContext(nativeOffline)
        } catch (e) {
          console.error('Failed to create native OfflineAudioContext:', e)
          // Fallback to Tone.js constructor
          offlineContext = new Tone.OfflineContext(duration, channelCount, sampleRate)
        }
        
        // Set the offline context as the current context
        const previousContext = Tone.getContext()
        Tone.setContext(offlineContext)
        
        // Create a ToneAudioBuffer from the decoded audio - no need to load since we're passing the buffer directly
        const toneBuffer = new Tone.ToneAudioBuffer(audioBuffer)
        
        // Get exact current effects parameters
        // The only thing excluded is the UI volume slider  
        const effectsParams = {
          filter: {
            frequency: audioEffects.current.filter ? audioEffects.current.filter.frequency.value : 2000,
            Q: audioEffects.current.filter ? audioEffects.current.filter.Q.value : 1
          },
          distortion: audioEffects.current.distortion ? audioEffects.current.distortion.distortion : 0.1,
          compressor: {
            threshold: audioEffects.current.compressor ? audioEffects.current.compressor.threshold.value : -30,
            ratio: audioEffects.current.compressor ? audioEffects.current.compressor.ratio.value : 4,
            attack: audioEffects.current.compressor ? audioEffects.current.compressor.attack.value : 0.003,
            release: audioEffects.current.compressor ? audioEffects.current.compressor.release.value : 0.1
          },
          gain: audioEffects.current.gain ? audioEffects.current.gain.gain.value : 2,
          knobValues: {
            brightness,
            warmth,
            punch,
            attack,
            decay,
            sustain,
            release
          }
        }
        
        console.log('Effects parameters for download:', effectsParams)
        
        // Create offline versions of the effects chain with EXACT same parameters
        const offlinePlayer = new Tone.Player(toneBuffer)
        
        // Use exact same filter settings
        const offlineFilter = new Tone.Filter({
          frequency: effectsParams.filter.frequency,
          type: "lowpass",
          Q: effectsParams.filter.Q
        })
        
        // Use exact distortion amount
        const offlineDistortion = new Tone.Distortion({
          distortion: effectsParams.distortion,
          oversample: '2x', // Match playback oversampling
          wet: 1.0 // Full wet signal like playback
        })
        
        // Use exact compressor settings including ADSR-modulated attack/release
        const offlineCompressor = new Tone.Compressor({
          threshold: effectsParams.compressor.threshold,
          ratio: effectsParams.compressor.ratio,
          attack: effectsParams.compressor.attack,
          release: effectsParams.compressor.release
        })
        
        // For kick drums, we don't use a traditional amplitude envelope that gates the signal
        // Instead, the ADSR parameters modify other characteristics
        // TODO: Implement ADSR as parameter modulation rather than amplitude gating
        
        // Use exact gain value
        const offlineGain = new Tone.Gain(effectsParams.gain)
        
        // Connect everything within the offline context (without envelope for now)
        offlinePlayer.connect(offlineFilter)
        offlineFilter.connect(offlineDistortion)
        offlineDistortion.connect(offlineCompressor)
        offlineCompressor.connect(offlineGain)
        offlineGain.toDestination()
        
        // Schedule the playback
        offlinePlayer.start(0)
        
        // Render the audio
        const buffer = await offlineContext.render()
        console.log('Rendered buffer:', buffer.length, 'samples')
        
        // Downloads should be at exact playback level (no normalization)
        // The volume slider only affects playback, not the exported file
        console.log('Download matches playback exactly (UI volume excluded)')
        
        // Verify the rendered audio has been processed
        const renderedData = buffer.getChannelData(0)
        const originalData = toneBuffer.getChannelData(0)
        
        // Calculate RMS (Root Mean Square) to compare signal levels
        const calculateRMS = (data: Float32Array) => {
          let sum = 0
          for (let i = 0; i < Math.min(data.length, 1000); i++) {
            sum += data[i] * data[i]
          }
          return Math.sqrt(sum / Math.min(data.length, 1000))
        }
        
        const originalRMS = calculateRMS(originalData)
        const processedRMS = calculateRMS(renderedData)
        
        console.log('Audio verification:', {
          originalRMS: originalRMS.toFixed(4),
          processedRMS: processedRMS.toFixed(4),
          ratio: (processedRMS / originalRMS).toFixed(2),
          isDifferent: Math.abs(originalRMS - processedRMS) > 0.001
        })
        
        // Restore the previous context
        Tone.setContext(previousContext)
        
        // Convert buffer to WAV blob
        const wavBlob = await bufferToWav(buffer)
        const url = URL.createObjectURL(wavBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${kickSample.name || 'kick-sample'}-processed.wav`
        link.click()
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100)
        offlinePlayer.dispose()
        offlineFilter.dispose()
        offlineDistortion.dispose()
        offlineCompressor.dispose()
        offlineGain.dispose()
      } catch (error) {
        console.error('Error downloading processed sample:', error)
      }
    }
  }
  
  // Helper function to convert Tone.js buffer to WAV
  const bufferToWav = async (buffer: Tone.ToneAudioBuffer): Promise<Blob> => {
    const length = buffer.length
    const sampleRate = buffer.sampleRate
    const numberOfChannels = buffer.numberOfChannels
    
    const bitDepth = 16 // WAV files are exported at 16-bit
    console.log('Converting buffer to WAV:', { 
      length, 
      sampleRate, 
      numberOfChannels,
      bitDepth: `${bitDepth}-bit`,
      duration: `${(length / sampleRate).toFixed(2)}s`
    })
    
    // Get the actual audio data
    const audioData: Float32Array[] = []
    for (let channel = 0; channel < numberOfChannels; channel++) {
      audioData.push(buffer.getChannelData(channel))
    }
    
    // Check if we have actual audio data
    const hasAudio = audioData.some(channelData => 
      Array.from(channelData).some(sample => Math.abs(sample) > 0.0001)
    )
    console.log('Has audio data:', hasAudio)
    
    // Create WAV file
    const wavLength = length * numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(wavLength)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, wavLength - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true) // 44100 Hz sample rate
    view.setUint32(28, sampleRate * numberOfChannels * 2, true) // byte rate (sampleRate * channels * bytesPerSample)
    view.setUint16(32, numberOfChannels * 2, true) // block align
    view.setUint16(34, 16, true) // 16-bit audio (CD quality)
    writeString(36, 'data')
    view.setUint32(40, length * numberOfChannels * 2, true)
    
    // Write audio data
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioData[channel][i] || 0
        const clampedSample = Math.max(-1, Math.min(1, sample))
        view.setInt16(offset, clampedSample * 0x7FFF, true)
        offset += 2
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }
  
  // Expose download functions to parent
  useImperativeHandle(ref, () => ({
    downloadOriginal: handleDownloadOriginal,
    downloadProcessed: handleDownloadProcessed
  }), [kickSample, audioEffects])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={cn("plugin-led", kickSample ? "on" : "off")} />
          <h2 className="text-xl font-semibold font-zen-dots uppercase">
            {kickSample ? kickSample.name : 'KICK OUTPUT'}
          </h2>
          {kickSample && (
            <div className="relative ml-2">
              <Info 
                className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help transition-colors"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              />
              {showInfo && (
                <div className="absolute top-6 left-0 z-50 w-80">
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-plugin-border shadow-xl">
                    <div className="font-mono text-xs space-y-2">
                      {/* AI-Defined Kick Parameters */}
                      <div className="text-plugin-display-text font-semibold">AI-DEFINED PARAMETERS</div>
                      <div>NAME: {kickSample.name}</div>
                      <div>TYPE: {aiAnalysis?.suggested_kick?.tonal_character || kickSample.characteristics?.tonal_character || 'N/A'}</div>
                      <div>BRIGHTNESS: {aiAnalysis?.suggested_kick?.brightness || kickSample.characteristics?.brightness || 0}%</div>
                      <div>WARMTH: {aiAnalysis?.suggested_kick?.warmth || kickSample.characteristics?.warmth || 0}%</div>
                      <div>PUNCH: {aiAnalysis?.suggested_kick?.punch || Math.min(kickSample.characteristics?.punch || 0, 20)}%</div>
                      <div className="mt-1 pt-1 border-t border-plugin-border/50">
                        <div className="text-muted-foreground text-[10px] mb-1">ENVELOPE</div>
                        <div>ATTACK: {aiAnalysis?.suggested_kick?.attack || kickSample.characteristics?.attack || 5}%</div>
                        <div>DECAY: {aiAnalysis?.suggested_kick?.decay || kickSample.characteristics?.decay || 80}%</div>
                        <div>SUSTAIN: {aiAnalysis?.suggested_kick?.sustain || kickSample.characteristics?.sustain || 70}%</div>
                        <div>RELEASE: {aiAnalysis?.suggested_kick?.release || kickSample.characteristics?.release || 50}%</div>
                      </div>
                      <div>TAGS: {aiAnalysis?.suggested_kick?.tags?.join(', ') || kickSample.tags?.join(', ') || 'N/A'}</div>
                      
                      {/* AI Analysis */}
                      {aiAnalysis && (
                        <>
                          <div className="border-t border-plugin-border my-2"></div>
                          <div className="text-plugin-display-text font-semibold mb-2">AI ANALYSIS</div>
                          <div className="text-muted-foreground">{aiAnalysis.ai_description}</div>
                          <div className="text-muted-foreground">MOOD: {aiAnalysis.mood_keywords?.join(', ')}</div>
                          <div className="text-muted-foreground">ENERGY: {aiAnalysis.energy}</div>
                          <div className="text-muted-foreground">TEXTURE: {aiAnalysis.texture}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Volume Slider - Top Right */}
        {kickSample && (
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">VOLUME</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-plugin-display-bg rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${volume}%, #1a1a1a ${volume}%, #1a1a1a 100%)`
              }}
            />
            <span className="text-xs font-mono w-8 text-right">{volume}</span>
          </div>
        )}
      </div>

      {/* Oscilloscope Display */}
      <div className="mb-4">
        <Oscilloscope 
          audioUrl={kickSample?.file_url}
          isPlaying={isPlaying}
          isSequencerPlaying={isPlaying}
          currentStep={currentStep}
          height={120}
        />
      </div>
      
      {/* Parameter Knobs */}
      {kickSample && (
        <div className="mb-6">
          <div className="flex items-center gap-4">
            {/* Tone Controls */}
            <div className="flex gap-4">
              <Knob
                value={brightness}
                onChange={setBrightness}
                label="BRIGHTNESS"
              />
              <Knob
                value={warmth}
                onChange={setWarmth}
                label="WARMTH"
              />
              <Knob
                value={punch}
                onChange={setPunch}
                label="PUNCH"
              />
            </div>
            
            {/* Separator */}
            <div className="h-16 w-px bg-plugin-border" />
            
            {/* ADSR Envelope Controls */}
            <div className="flex gap-4">
              <Knob
                value={attack}
                onChange={setAttack}
                label="ATTACK"
              />
              <Knob
                value={decay}
                onChange={setDecay}
                label="DECAY"
              />
              <Knob
                value={sustain}
                onChange={setSustain}
                label="SUSTAIN"
              />
              <Knob
                value={release}
                onChange={setRelease}
                label="RELEASE"
              />
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
})

KickPreviewSection.displayName = 'KickPreviewSection'

export default KickPreviewSection