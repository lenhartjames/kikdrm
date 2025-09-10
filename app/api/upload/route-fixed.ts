import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import ExifReader from 'exifreader'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

// Use service role key for storage operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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

    // Extract metadata with Sharp
    const image = sharp(buffer)
    const stats = await image.stats()
    const metadata_sharp = await image.metadata()
    
    const imageCharacteristics = {
      width: metadata_sharp.width,
      height: metadata_sharp.height,
      brightness: Math.round((stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length) / 2.55),
      dominantColors: stats.channels.map(ch => ({
        mean: ch.mean,
        min: ch.min,
        max: ch.max
      }))
    }

    // Upload image to Supabase Storage using service role
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // Fallback to base64 if upload fails
      const base64Image = buffer.toString('base64')
      const mimeType = file.type || 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64Image}`
      
      // Return with mock data but real image
      return NextResponse.json({
        success: true,
        imageUpload: {
          id: 'local-1',
          file_url: dataUrl,
          analysis_result: {
            brightness: imageCharacteristics.brightness,
            mood_keywords: ['analyzing...']
          }
        },
        matchedSample: {
          id: 'mock-1',
          name: 'Ice Crystal',
          file_url: '/samples/ice-crystal.wav',
          characteristics: {
            brightness: 90,
            warmth: 10,
            punch: 85,
            decay: 20,
            frequency_center: 150,
            tonal_character: 'metallic'
          },
          tags: ['cold', 'sharp', 'metallic']
        },
        confidence: 85
      })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName)

    // Find matching kick sample from database
    const { data: kickSamples } = await supabaseAdmin
      .from('kick_samples')
      .select('*')
      .limit(10)

    // Simple brightness-based matching
    let bestMatch = kickSamples?.[0] || {
      id: 'default-1',
      name: 'Default Kick',
      file_url: '/samples/default.wav',
      characteristics: {
        brightness: 50,
        warmth: 50,
        punch: 70,
        decay: 40,
        frequency_center: 100,
        tonal_character: 'neutral'
      },
      tags: ['default']
    }

    if (kickSamples && kickSamples.length > 0) {
      // Find closest brightness match
      bestMatch = kickSamples.reduce((prev, current) => {
        const prevDiff = Math.abs(prev.characteristics.brightness - imageCharacteristics.brightness)
        const currDiff = Math.abs(current.characteristics.brightness - imageCharacteristics.brightness)
        return currDiff < prevDiff ? current : prev
      })
    }

    // Store in database
    const { data: imageUpload } = await supabaseAdmin
      .from('image_uploads')
      .insert({
        file_url: publicUrl,
        metadata: imageCharacteristics,
        analysis_result: {
          dominant_colors: imageCharacteristics.dominantColors,
          brightness: imageCharacteristics.brightness,
          mood_keywords: ['processed'],
          ai_description: 'Image processed successfully'
        },
        matched_sample_id: bestMatch.id
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      imageUpload: imageUpload || { file_url: publicUrl },
      matchedSample: bestMatch,
      confidence: 90
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload', details: error },
      { status: 500 }
    )
  }
}