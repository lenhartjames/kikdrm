// Utility to generate kick drum samples using Web Audio API
// This creates synthetic kick drums with different characteristics

export interface KickParameters {
  pitch: number // Starting frequency in Hz (30-200)
  decay: number // Decay time in seconds (0.1-2)
  punch: number // Attack punch (0-1)
  tone: number // Tone/harmonics (0-1)
  distortion: number // Distortion amount (0-1)
}

export function generateKickSample(
  context: AudioContext,
  params: KickParameters
): AudioBuffer {
  const sampleRate = context.sampleRate
  const duration = params.decay
  const length = sampleRate * duration
  
  // Create buffer
  const buffer = context.createBuffer(1, length, sampleRate)
  const channel = buffer.getChannelData(0)
  
  // Generate kick drum waveform
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    
    // Pitch envelope (drops from high to low)
    const pitchEnv = params.pitch * Math.pow(0.1, t * 2)
    
    // Amplitude envelope
    const ampEnv = Math.pow(1 - t / duration, 2 + params.punch * 3)
    
    // Generate the waveform
    let sample = Math.sin(2 * Math.PI * pitchEnv * t)
    
    // Add harmonics for tone
    if (params.tone > 0) {
      sample += Math.sin(4 * Math.PI * pitchEnv * t) * params.tone * 0.3
      sample += Math.sin(8 * Math.PI * pitchEnv * t) * params.tone * 0.1
    }
    
    // Apply distortion
    if (params.distortion > 0) {
      sample = Math.tanh(sample * (1 + params.distortion * 4))
    }
    
    // Apply envelope and store
    channel[i] = sample * ampEnv * 0.95
  }
  
  return buffer
}

// Preset kick drum characteristics
export const kickPresets = {
  // Cold/Icy
  iceCrystal: { pitch: 150, decay: 0.25, punch: 0.85, tone: 0.1, distortion: 0.2 },
  frozenLake: { pitch: 120, decay: 0.2, punch: 0.7, tone: 0.15, distortion: 0.1 },
  arcticWind: { pitch: 180, decay: 0.18, punch: 0.6, tone: 0.05, distortion: 0.05 },
  
  // Warm/Cozy
  fireplace: { pitch: 80, decay: 0.4, punch: 0.65, tone: 0.7, distortion: 0.3 },
  woolBlanket: { pitch: 70, decay: 0.35, punch: 0.5, tone: 0.6, distortion: 0.2 },
  sunsetGlow: { pitch: 90, decay: 0.38, punch: 0.6, tone: 0.5, distortion: 0.25 },
  
  // Dark/Moody
  midnight: { pitch: 50, decay: 0.5, punch: 0.8, tone: 0.3, distortion: 0.4 },
  shadowWalker: { pitch: 55, decay: 0.45, punch: 0.75, tone: 0.35, distortion: 0.35 },
  deepCave: { pitch: 40, decay: 0.6, punch: 0.7, tone: 0.25, distortion: 0.5 },
  
  // Bright/Energetic
  solarFlare: { pitch: 200, decay: 0.22, punch: 0.95, tone: 0.4, distortion: 0.6 },
  neonLights: { pitch: 180, decay: 0.2, punch: 0.85, tone: 0.5, distortion: 0.4 },
  laserBeam: { pitch: 220, decay: 0.15, punch: 0.9, tone: 0.2, distortion: 0.3 },
  
  // Soft/Ambient
  cloudNine: { pitch: 60, decay: 0.6, punch: 0.3, tone: 0.8, distortion: 0.1 },
  silkTouch: { pitch: 65, decay: 0.5, punch: 0.25, tone: 0.7, distortion: 0.05 },
  morningMist: { pitch: 70, decay: 0.55, punch: 0.35, tone: 0.75, distortion: 0.08 }
}

// Convert AudioBuffer to WAV file blob
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length
  const sampleRate = buffer.sampleRate
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
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, length * 2, true)
  
  // Convert float samples to 16-bit PCM
  const channelData = buffer.getChannelData(0)
  let offset = 44
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, sample * 0x7FFF, true)
    offset += 2
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}