import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import sharp from 'sharp'
import { findBestMatch } from '@/lib/audio/sample-library'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Basic image analysis with Sharp
    const image = sharp(buffer)
    const stats = await image.stats()
    const metadata = await image.metadata()
    
    // Calculate brightness from image statistics
    const brightness = Math.round((stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length) / 2.55)
    
    // Convert image to base64 for OpenAI
    const base64Image = buffer.toString('base64')
    
    // Call OpenAI Vision API with the latest model
    console.log('Calling OpenAI Vision API with GPT-4o...')
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Latest optimized GPT-4 model with vision
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `AVAILABLE KICK DRUM SAMPLES TO CHOOSE FROM:
              Your goal is to set brightness/warmth parameters that will select the most appropriate sample.
              
              CRITICAL: Avoid defaulting to morning-mist (45/60) - it's ONLY for calm, misty, ethereal scenes.
              For energetic/electric scenes, choose higher brightness (85-95) to select laser-beam or neon-lights:
              - ice-crystal: brightness 90, warmth 10 (metallic, sharp, cold sounds)
              - frozen-lake: brightness 75, warmth 15 (crystalline, minimal)
              - arctic-wind: brightness 85, warmth 5 (airy, ethereal, cold)
              - fireplace: brightness 30, warmth 90 (warm, cozy, round bass)
              - wool-blanket: brightness 25, warmth 85 (soft, muffled, comfortable)
              - sunset-glow: brightness 45, warmth 80 (golden, smooth, nostalgic)
              - midnight: brightness 10, warmth 40 (dark, deep, heavy)
              - shadow-walker: brightness 15, warmth 35 (brooding, atmospheric)
              - deep-cave: brightness 5, warmth 30 (cavernous, vast resonance)
              - solar-flare: brightness 95, warmth 60 (explosive, powerful, bright)
              - neon-lights: brightness 88, warmth 45 (electric, vibrant, modern)
              - laser-beam: brightness 92, warmth 20 (sharp, precise, futuristic)
              - cloud-nine: brightness 40, warmth 65 (dreamy, floating, soft)
              - silk-touch: brightness 35, warmth 70 (smooth, delicate, gentle)
              - morning-mist: brightness 45, warmth 60 (ethereal, atmospheric, calm)
              
              Analyze this image and provide a detailed description focusing on:
              1. Overall mood and emotional feeling (cold, warm, aggressive, soft, etc.)
              2. Energy level (low, medium, high)
              3. Texture and visual characteristics (smooth, rough, grainy, sharp, etc.)
              4. Color temperature and dominant colors
              5. Any abstract concepts or feelings it evokes
              
              Based on this analysis, suggest what type of kick drum would match this image.
              
              CRITICAL VISUAL ANALYSIS HIERARCHY (FOLLOW IN ORDER):
              
              1. DOMINANT ENERGY SOURCE (Most Important):
              - Lightning/electricity/plasma → brightness 90-100, warmth 40-50, punch 18-20
              - Fire/lava/burning → brightness 30-40, warmth 85-95, punch 15-18
              - Ice/frost/crystal → brightness 85-95, warmth 5-15, punch 15-17
              - Water/liquid/flow → brightness 40-60, warmth 50-70, punch 8-12
              - Light beams/rays → brightness 70-85, warmth varies with color temperature
              
              2. PRIMARY COLOR TEMPERATURE:
              - Intense red/orange/yellow → warmth 70-95
              - Cool blue/cyan/white → warmth 5-30
              - Neutral green/brown/beige → warmth 40-60
              - Purple/magenta/pink → warmth 35-55
              - Black/deep gray → warmth 20-40
              
              3. TEXTURE AND MATERIAL:
              - Rough bark/stone/concrete → add 10-15 to punch
              - Smooth water/glass/metal → subtract 5-10 from punch
              - Soft fabric/clouds/fog → low punch 5-10, high decay 80-95
              - Sharp/angular/crystalline → high punch 15-20, low decay 60-70
              
              4. SPATIAL CHARACTERISTICS:
              - Vast/open/expansive → longer decay 75-95
              - Confined/tight/close → shorter decay 60-75
              - Reflective surfaces → increase brightness by 10-20
              - Absorptive materials → decrease brightness by 10-20
              
              PARAMETER GUIDELINES:
              - brightness (0-100): High frequency content, sharp/crisp vs dark/muffled
              - warmth (0-100): Low-mid harmonic density, body and fullness
              - punch (0-20, NEVER exceed 20): Transient attack envelope intensity
              
              ENVELOPE ADSR PARAMETERS:
              - attack (0-100): How quickly the sound reaches peak
                * Metallic/sharp images: Lower values (0-20) for instant attack
                * Soft/organic images: Higher values (20-50) for gradual onset
              - decay (60-100, NEVER below 60): Time from peak to sustain level
                * Calm/peaceful images: Shorter decay (60-75) for controlled sound
                * Energetic/powerful images: Longer decay (75-100) for sustained impact
              - sustain (0-100): Level held after decay
                * Minimal/clean images: Lower sustain (30-60) for punchy, short sounds
                * Dense/complex images: Higher sustain (60-90) for fuller body
              - release (0-100): Tail length after note ends
                * Tight/geometric images: Short release (10-40) for precision
                * Flowing/organic images: Long release (40-80) for natural fade
              
              SPECIFIC VISUAL SCENARIOS (MATCH PRECISELY):
              
              ELECTRIC/ENERGY:
              - Concert/club/laser lights → brightness 88-95, warmth 20-45, punch 18-20 (MUST select laser-beam or neon-lights)
              - Lightning storm → brightness 92-98, warmth 45-55, punch 19-20 (explosive, sharp)
              - Neon signs/LED → brightness 88-95, warmth 35-45, punch 17-19 (electric, vibrant)
              - Digital/glitch/screen → brightness 85-92, warmth 40-50, punch 16-18 (synthetic)
              - Purple/magenta/pink lasers → brightness 90-95, warmth 20-30, punch 18-20 (MUST select laser-beam)
              
              NATURAL PHENOMENA:
              - Sunrise/sunset on mountains → brightness 35-45, warmth 75-85, punch 12-15 (warm glow)
              - Misty forest → brightness 40-50, warmth 60-70, punch 6-10 (soft, ethereal)
              - Ice/glacier → brightness 88-95, warmth 5-12, punch 15-18 (crystalline, sharp)
              - Ocean/beach → brightness 50-65, warmth 45-60, punch 10-14 (fluid, rolling)
              
              MATERIALS/TEXTURES:
              - Tree bark/wood grain → brightness 25-35, warmth 70-80, punch 10-13 (organic, warm)
              - Glass/crystal → brightness 85-95, warmth 10-20, punch 16-19 (transparent, sharp)
              - Fabric/cloth → brightness 30-45, warmth 65-75, punch 5-8 (soft, muffled)
              - Metal/chrome → brightness 90-95, warmth 15-25, punch 18-20 (industrial, hard)
              
              COLOR DOMINANCE:
              - Dominant red/pink/magenta → adjust warmth +15-20 from base
              - Dominant blue/cyan → adjust warmth -15-20 from base
              - High contrast (light/dark) → increase punch by 3-5
              - Low contrast (similar tones) → decrease punch by 3-5
              
              Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
              {
                "mood_keywords": ["keyword1", "keyword2"],
                "energy": "low/medium/high",
                "texture": "smooth/rough/grainy/sharp",
                "color_temperature": "cold/neutral/warm",
                "ai_description": "detailed description",
                "suggested_kick": {
                  "brightness": 50,
                  "warmth": 50,
                  "punch": 15,
                  "attack": 10,
                  "decay": 80,
                  "sustain": 70,
                  "release": 50,
                  "tonal_character": "description",
                  "tags": ["tag1", "tag2"]
                }
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    console.log('OpenAI response:', completion.choices[0].message.content)

    let aiAnalysis
    try {
      // Parse the response, handling potential markdown formatting
      const content = completion.choices[0].message.content || '{}'
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiAnalysis = JSON.parse(jsonStr)
      
      // Ensure punch never exceeds 20
      if (aiAnalysis.suggested_kick && aiAnalysis.suggested_kick.punch > 20) {
        aiAnalysis.suggested_kick.punch = 20
      }
      
      // Ensure decay is between 60-100
      if (aiAnalysis.suggested_kick && aiAnalysis.suggested_kick.decay) {
        aiAnalysis.suggested_kick.decay = Math.max(60, Math.min(100, aiAnalysis.suggested_kick.decay))
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback analysis based on image brightness
      aiAnalysis = {
        mood_keywords: brightness > 60 ? ['bright', 'energetic'] : ['dark', 'moody'],
        energy: brightness > 70 ? 'high' : brightness > 40 ? 'medium' : 'low',
        texture: 'smooth',
        color_temperature: brightness > 60 ? 'warm' : 'cold',
        ai_description: `Image analyzed with brightness level of ${brightness}`,
        suggested_kick: {
          brightness: brightness,
          warmth: brightness > 50 ? 60 : 40,
          punch: brightness > 60 ? 20 : 15,
          attack: brightness > 60 ? 5 : 15,
          decay: brightness < 40 ? 80 : 65,
          sustain: brightness > 60 ? 50 : 70,
          release: brightness > 60 ? 30 : 60,
          tonal_character: brightness > 60 ? 'bright' : 'dark',
          tags: brightness > 60 ? ['bright', 'punchy'] : ['dark', 'deep']
        }
      }
    }

    // Find best matching kick sample from our library
    const { sample: bestMatch, confidence } = findBestMatch(
      aiAnalysis.suggested_kick,
      aiAnalysis.mood_keywords
    )

    // Return the analysis and matched sample
    return NextResponse.json({
      success: true,
      imageUpload: {
        id: `analysis-${Date.now()}`,
        file_url: `data:image/jpeg;base64,${base64Image}`,
        analysis_result: {
          brightness: brightness,
          mood_keywords: aiAnalysis.mood_keywords,
          ai_description: aiAnalysis.ai_description,
          energy: aiAnalysis.energy,
          texture: aiAnalysis.texture,
          color_temperature: aiAnalysis.color_temperature
        }
      },
      matchedSample: bestMatch,
      confidence: confidence,
      aiAnalysis: aiAnalysis
    })

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze image', 
        details: error.message,
        hint: 'Check if your OpenAI API key is valid and has access to GPT-4 Vision'
      },
      { status: 500 }
    )
  }
}