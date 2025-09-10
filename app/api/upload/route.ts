import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import ExifReader from 'exifreader'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

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

    // Extract EXIF metadata
    let metadata = {}
    try {
      const tags = ExifReader.load(buffer)
      metadata = {
        make: tags['Make']?.description,
        model: tags['Model']?.description,
        dateTime: tags['DateTime']?.description,
        exposureTime: tags['ExposureTime']?.description,
        fNumber: tags['FNumber']?.description,
        iso: tags['ISOSpeedRatings']?.description,
        focalLength: tags['FocalLength']?.description,
        whiteBalance: tags['WhiteBalance']?.description,
        colorSpace: tags['ColorSpace']?.description,
      }
    } catch (exifError) {
      console.log('Could not extract EXIF data:', exifError)
    }

    // Analyze image with Sharp
    const image = sharp(buffer)
    const stats = await image.stats()
    const metadata_sharp = await image.metadata()
    
    // Calculate color temperature and other characteristics
    const dominantChannel = stats.channels.reduce((prev, current) => 
      (prev.mean > current.mean) ? prev : current
    )
    
    const imageCharacteristics = {
      width: metadata_sharp.width,
      height: metadata_sharp.height,
      format: metadata_sharp.format,
      channels: metadata_sharp.channels,
      density: metadata_sharp.density,
      hasAlpha: metadata_sharp.hasAlpha,
      brightness: Math.round((stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length) / 2.55),
      dominantColors: stats.channels.map(ch => ({
        mean: ch.mean,
        min: ch.min,
        max: ch.max
      })),
      isGrayscale: stats.isOpaque
    }

    // Convert image to base64 for AI analysis
    const base64Image = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64Image}`

    // Analyze with GPT-4 Vision
    const aiResponse = await generateText({
      model: openai('gpt-4-turbo'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and provide a detailed description focusing on:
              1. Overall mood and emotional feeling (cold, warm, aggressive, soft, etc.)
              2. Energy level (low, medium, high)
              3. Texture and visual characteristics (smooth, rough, grainy, sharp, etc.)
              4. Color temperature and dominant colors
              5. Any abstract concepts or feelings it evokes
              
              Based on this analysis, suggest what type of kick drum would match this image.
              Consider characteristics like: brightness, warmth, punch, decay, and tonal character.
              
              Return your response as a JSON object with the following structure:
              {
                "mood_keywords": ["keyword1", "keyword2", ...],
                "energy": "low/medium/high",
                "texture": "smooth/rough/grainy/sharp",
                "color_temperature": "cold/neutral/warm",
                "ai_description": "detailed description",
                "suggested_kick": {
                  "brightness": 0-100,
                  "warmth": 0-100,
                  "punch": 0-100,
                  "decay": 0-100,
                  "tonal_character": "description",
                  "tags": ["tag1", "tag2", ...]
                }
              }`
            },
            {
              type: 'image',
              image: dataUrl
            }
          ]
        }
      ],
      temperature: 0.7
    })

    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(aiResponse.text)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      aiAnalysis = {
        mood_keywords: ['neutral'],
        energy: 'medium',
        texture: 'smooth',
        color_temperature: 'neutral',
        ai_description: aiResponse.text,
        suggested_kick: {
          brightness: 50,
          warmth: 50,
          punch: 50,
          decay: 50,
          tonal_character: 'neutral',
          tags: ['general']
        }
      }
    }

    // Store in Supabase
    const supabase = await createServerSupabaseClient()
    
    // Upload image to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    // Find matching kick sample based on AI analysis
    const { data: kickSamples, error: fetchError } = await supabase
      .from('kick_samples')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    if (fetchError) {
      console.error('Error fetching kick samples:', fetchError)
    }

    // Simple matching algorithm based on characteristics
    let bestMatch = null
    let bestScore = -1

    if (kickSamples && kickSamples.length > 0) {
      for (const sample of kickSamples) {
        const characteristics = sample.characteristics as any
        const suggested = aiAnalysis.suggested_kick
        
        // Calculate similarity score
        const brightnessDiff = Math.abs(characteristics.brightness - suggested.brightness) / 100
        const warmthDiff = Math.abs(characteristics.warmth - suggested.warmth) / 100
        const punchDiff = Math.abs(characteristics.punch - suggested.punch) / 100
        const decayDiff = Math.abs(characteristics.decay - suggested.decay) / 100
        
        const score = 1 - (brightnessDiff + warmthDiff + punchDiff + decayDiff) / 4
        
        // Check for matching tags
        const tagBonus = sample.tags.filter((tag: string) => 
          suggested.tags.includes(tag) || 
          aiAnalysis.mood_keywords.includes(tag)
        ).length * 0.1
        
        const finalScore = Math.min(score + tagBonus, 1)
        
        if (finalScore > bestScore) {
          bestScore = finalScore
          bestMatch = sample
        }
      }
    }

    // Save analysis to database
    const { data: imageUpload, error: dbError } = await supabase
      .from('image_uploads')
      .insert({
        file_url: publicUrl,
        metadata: {
          ...metadata,
          ...imageCharacteristics
        },
        analysis_result: {
          dominant_colors: imageCharacteristics.dominantColors,
          temperature: aiAnalysis.color_temperature === 'cold' ? 5500 : 
                       aiAnalysis.color_temperature === 'warm' ? 3200 : 4100,
          brightness: imageCharacteristics.brightness,
          contrast: 50, // Could calculate this from stats
          mood_keywords: aiAnalysis.mood_keywords,
          ai_description: aiAnalysis.ai_description
        },
        matched_sample_id: bestMatch?.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return NextResponse.json({
      success: true,
      imageUpload,
      matchedSample: bestMatch,
      confidence: Math.round(bestScore * 100),
      aiAnalysis
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}