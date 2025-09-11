export interface KickSample {
  id: string
  name: string
  file_url: string
  duration_ms: number
  sample_rate: number
  bit_depth: number
  tags: string[]
  characteristics: {
    brightness: number // 0-100
    warmth: number // 0-100
    punch: number // 0-100
    decay: number // 0-100
    frequency_center: number // Hz
    tonal_character: string
    attack?: number // 0-100
    sustain?: number // 0-100
    release?: number // 0-100
  }
  embedding?: number[]
  created_at: string
  updated_at: string
}

export interface ImageUpload {
  id: string
  user_id?: string
  file_url: string
  metadata: Record<string, any>
  analysis_result: {
    dominant_colors: string[]
    temperature: number // Kelvin
    brightness: number // 0-100
    contrast: number // 0-100
    mood_keywords: string[]
    ai_description: string
  }
  matched_sample_id?: string
  created_at: string
}

export interface SequencerPattern {
  steps: boolean[]
  velocity: number[]
  tempo: number
  swing: number
}

export interface ImageCharacteristics {
  colorTemperature: number // Kelvin
  brightness: number // 0-100
  contrast: number // 0-100
  dominantColors: string[]
  mood: string[]
  texture: 'smooth' | 'rough' | 'grainy' | 'sharp'
  energy: 'low' | 'medium' | 'high'
}

export interface AnalysisResult {
  imageCharacteristics: ImageCharacteristics
  matchedSample: KickSample
  confidence: number
  alternativeSamples?: KickSample[]
}