import { KickSample } from '@/types'

// Sample library with metadata
// Audio files can be stored locally in public/samples/ or in Supabase Storage

export const sampleLibrary: KickSample[] = [
  // Cold/Icy Samples
  {
    id: 'ice-crystal',
    name: 'Ice Crystal',
    file_url: '/api/samples/ice-crystal', // Dynamic generation endpoint
    duration_ms: 250,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['cold', 'sharp', 'metallic', 'bright', 'crisp'],
    characteristics: {
      brightness: 90,
      warmth: 10,
      punch: 85,
      decay: 20,
      frequency_center: 150,
      tonal_character: 'metallic'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'frozen-lake',
    name: 'Frozen Lake',
    file_url: '/api/samples/frozen-lake',
    duration_ms: 200,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['cold', 'deep', 'minimal', 'clean'],
    characteristics: {
      brightness: 75,
      warmth: 15,
      punch: 70,
      decay: 25,
      frequency_center: 120,
      tonal_character: 'crystalline'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'arctic-wind',
    name: 'Arctic Wind',
    file_url: '/api/samples/arctic-wind',
    duration_ms: 180,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['cold', 'airy', 'light', 'ethereal'],
    characteristics: {
      brightness: 85,
      warmth: 5,
      punch: 60,
      decay: 30,
      frequency_center: 180,
      tonal_character: 'airy'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Warm/Cozy Samples
  {
    id: 'fireplace',
    name: 'Fireplace',
    file_url: '/api/samples/fireplace',
    duration_ms: 400,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['warm', 'cozy', 'round', 'full'],
    characteristics: {
      brightness: 30,
      warmth: 90,
      punch: 65,
      decay: 70,
      frequency_center: 80,
      tonal_character: 'warm'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'wool-blanket',
    name: 'Wool Blanket',
    file_url: '/api/samples/wool-blanket',
    duration_ms: 350,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['warm', 'soft', 'muffled', 'comfortable'],
    characteristics: {
      brightness: 25,
      warmth: 85,
      punch: 50,
      decay: 65,
      frequency_center: 70,
      tonal_character: 'soft'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    file_url: '/api/samples/sunset-glow',
    duration_ms: 380,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['warm', 'golden', 'smooth', 'nostalgic'],
    characteristics: {
      brightness: 45,
      warmth: 80,
      punch: 60,
      decay: 60,
      frequency_center: 90,
      tonal_character: 'golden'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Dark/Moody Samples
  {
    id: 'midnight',
    name: 'Midnight',
    file_url: '/api/samples/midnight',
    duration_ms: 500,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['dark', 'deep', 'heavy', 'mysterious'],
    characteristics: {
      brightness: 10,
      warmth: 40,
      punch: 80,
      decay: 85,
      frequency_center: 50,
      tonal_character: 'dark'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'shadow-walker',
    name: 'Shadow Walker',
    file_url: '/api/samples/shadow-walker',
    duration_ms: 450,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['dark', 'brooding', 'atmospheric', 'cinematic'],
    characteristics: {
      brightness: 15,
      warmth: 35,
      punch: 75,
      decay: 80,
      frequency_center: 55,
      tonal_character: 'brooding'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'deep-cave',
    name: 'Deep Cave',
    file_url: '/api/samples/deep-cave',
    duration_ms: 600,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['dark', 'cavernous', 'resonant', 'vast'],
    characteristics: {
      brightness: 5,
      warmth: 30,
      punch: 70,
      decay: 95,
      frequency_center: 40,
      tonal_character: 'cavernous'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Bright/Energetic Samples
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    file_url: '/api/samples/solar-flare',
    duration_ms: 220,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['bright', 'energetic', 'explosive', 'powerful'],
    characteristics: {
      brightness: 95,
      warmth: 60,
      punch: 95,
      decay: 35,
      frequency_center: 200,
      tonal_character: 'explosive'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'neon-lights',
    name: 'Neon Lights',
    file_url: '/api/samples/neon-lights',
    duration_ms: 200,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['bright', 'electric', 'vibrant', 'modern'],
    characteristics: {
      brightness: 88,
      warmth: 45,
      punch: 85,
      decay: 30,
      frequency_center: 180,
      tonal_character: 'electric'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'laser-beam',
    name: 'Laser Beam',
    file_url: '/api/samples/laser-beam',
    duration_ms: 150,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['bright', 'sharp', 'precise', 'futuristic'],
    characteristics: {
      brightness: 92,
      warmth: 20,
      punch: 90,
      decay: 15,
      frequency_center: 220,
      tonal_character: 'laser'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Soft/Ambient Samples
  {
    id: 'cloud-nine',
    name: 'Cloud Nine',
    file_url: '/api/samples/cloud-nine',
    duration_ms: 600,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['soft', 'ambient', 'dreamy', 'floating'],
    characteristics: {
      brightness: 40,
      warmth: 65,
      punch: 30,
      decay: 90,
      frequency_center: 60,
      tonal_character: 'dreamy'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'silk-touch',
    name: 'Silk Touch',
    file_url: '/api/samples/silk-touch',
    duration_ms: 500,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['soft', 'smooth', 'delicate', 'gentle'],
    characteristics: {
      brightness: 35,
      warmth: 70,
      punch: 25,
      decay: 85,
      frequency_center: 65,
      tonal_character: 'silky'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'morning-mist',
    name: 'Morning Mist',
    file_url: '/api/samples/morning-mist',
    duration_ms: 550,
    sample_rate: 44100,
    bit_depth: 16,
    tags: ['soft', 'ethereal', 'atmospheric', 'calm'],
    characteristics: {
      brightness: 45,
      warmth: 60,
      punch: 35,
      decay: 88,
      frequency_center: 70,
      tonal_character: 'misty'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Function to find best matching sample
export function findBestMatch(
  targetCharacteristics: Partial<KickSample['characteristics']>,
  moodKeywords: string[] = []
): { sample: KickSample; confidence: number } {
  let bestSample = sampleLibrary[0]
  let bestScore = 0

  for (const sample of sampleLibrary) {
    let score = 0
    let factors = 0

    // Compare characteristics
    if (targetCharacteristics.brightness !== undefined) {
      score += 1 - Math.abs(sample.characteristics.brightness - targetCharacteristics.brightness) / 100
      factors++
    }
    if (targetCharacteristics.warmth !== undefined) {
      score += 1 - Math.abs(sample.characteristics.warmth - targetCharacteristics.warmth) / 100
      factors++
    }
    if (targetCharacteristics.punch !== undefined) {
      score += 1 - Math.abs(sample.characteristics.punch - targetCharacteristics.punch) / 100
      factors++
    }
    if (targetCharacteristics.decay !== undefined) {
      score += 1 - Math.abs(sample.characteristics.decay - targetCharacteristics.decay) / 100
      factors++
    }

    // Average the characteristic scores
    if (factors > 0) {
      score = score / factors
    }

    // Bonus for matching keywords
    const keywordMatches = sample.tags.filter(tag => 
      moodKeywords.some(keyword => 
        tag.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(tag.toLowerCase())
      )
    ).length

    score += keywordMatches * 0.1

    // Cap at 1.0
    score = Math.min(score, 1.0)

    if (score > bestScore) {
      bestScore = score
      bestSample = sample
    }
  }

  return {
    sample: bestSample,
    confidence: Math.round(bestScore * 100)
  }
}