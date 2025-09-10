import { NextRequest, NextResponse } from 'next/server'
import { kickPresets, generateKickSample, audioBufferToWav } from '@/lib/audio/sample-generator'

// Map sample IDs to their preset configurations
const samplePresetMap: Record<string, keyof typeof kickPresets> = {
  'ice-crystal': 'iceCrystal',
  'frozen-lake': 'frozenLake',
  'arctic-wind': 'arcticWind',
  'fireplace': 'fireplace',
  'wool-blanket': 'woolBlanket',
  'sunset-glow': 'sunsetGlow',
  'midnight': 'midnight',
  'shadow-walker': 'shadowWalker',
  'deep-cave': 'deepCave',
  'solar-flare': 'solarFlare',
  'neon-lights': 'neonLights',
  'laser-beam': 'laserBeam',
  'cloud-nine': 'cloudNine',
  'silk-touch': 'silkTouch',
  'morning-mist': 'morningMist'
}

// Cache generated samples in memory (for development)
const sampleCache = new Map<string, Blob>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sampleId = params.id
    
    // Check if we have a preset for this ID
    const presetKey = samplePresetMap[sampleId]
    if (!presetKey) {
      return NextResponse.json(
        { error: 'Sample not found' },
        { status: 404 }
      )
    }

    // Check cache first
    if (sampleCache.has(sampleId)) {
      const cachedBlob = sampleCache.get(sampleId)!
      const arrayBuffer = await cachedBlob.arrayBuffer()
      
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': arrayBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        }
      })
    }

    // Generate the sample
    const preset = kickPresets[presetKey]
    
    // Create an offline audio context for generation
    const OfflineAudioContext = (globalThis as any).OfflineAudioContext || 
                                (globalThis as any).webkitOfflineAudioContext

    if (!OfflineAudioContext) {
      // Fallback: return a simple synthetic WAV
      const wavBlob = createSimpleSyntheticKick(preset)
      sampleCache.set(sampleId, wavBlob)
      
      const arrayBuffer = await wavBlob.arrayBuffer()
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': arrayBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000',
        }
      })
    }

    // Use Web Audio API to generate
    const sampleRate = 44100
    const duration = preset.decay
    const context = new OfflineAudioContext(1, sampleRate * duration, sampleRate)
    
    const buffer = generateKickSample(context, preset)
    const wavBlob = audioBufferToWav(buffer)
    
    // Cache the result
    sampleCache.set(sampleId, wavBlob)
    
    const arrayBuffer = await wavBlob.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000',
      }
    })

  } catch (error) {
    console.error('Error generating sample:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample' },
      { status: 500 }
    )
  }
}

// Simple server-side kick drum synthesis (no Web Audio API required)
function createSimpleSyntheticKick(preset: typeof kickPresets.iceCrystal): Blob {
  const sampleRate = 44100
  const duration = preset.decay
  const length = Math.floor(sampleRate * duration)
  
  // Create WAV header and data
  const arrayBuffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(arrayBuffer)
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // Mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * 2, true)
  
  // Generate kick drum waveform
  let offset = 44
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    
    // Pitch envelope (drops from high to low)
    const pitchEnv = preset.pitch * Math.pow(0.05, t * 3)
    
    // Amplitude envelope
    const ampEnv = Math.pow(1 - t / duration, 1.5 + preset.punch * 2)
    
    // Generate the waveform
    let sample = Math.sin(2 * Math.PI * pitchEnv * t)
    
    // Add some harmonics for character
    if (preset.tone > 0) {
      sample += Math.sin(4 * Math.PI * pitchEnv * t) * preset.tone * 0.3
      sample += Math.sin(6 * Math.PI * pitchEnv * t) * preset.tone * 0.15
    }
    
    // Simple distortion
    if (preset.distortion > 0) {
      const drive = 1 + preset.distortion * 3
      sample = Math.tanh(sample * drive) / Math.tanh(drive)
    }
    
    // Apply envelope and convert to 16-bit PCM
    const finalSample = Math.max(-1, Math.min(1, sample * ampEnv * 0.9))
    view.setInt16(offset, finalSample * 0x7FFF, true)
    offset += 2
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}