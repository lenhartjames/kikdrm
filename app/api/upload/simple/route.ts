import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    // For now, let's just return a mock response to test the UI
    // This bypasses Supabase storage issues
    
    // Convert file to base64 for preview
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64Image}`

    // Mock kick sample data
    const mockSample = {
      id: 'mock-1',
      name: 'Ice Crystal',
      file_url: '/samples/ice-crystal.wav',
      duration_ms: 250,
      sample_rate: 44100,
      bit_depth: 24,
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
    }

    // Simulate some analysis
    const mockAnalysis = {
      mood_keywords: ['cold', 'crisp', 'bright'],
      energy: 'high',
      texture: 'sharp',
      color_temperature: 'cold',
      ai_description: 'This image has a cold, crisp feeling with bright tones',
      suggested_kick: {
        brightness: 85,
        warmth: 15,
        punch: 80,
        decay: 25,
        tonal_character: 'metallic',
        tags: ['cold', 'bright', 'sharp']
      }
    }

    return NextResponse.json({
      success: true,
      imageUpload: {
        id: 'mock-upload-1',
        file_url: dataUrl,
        analysis_result: mockAnalysis
      },
      matchedSample: mockSample,
      confidence: 92,
      aiAnalysis: mockAnalysis
    })

  } catch (error) {
    console.error('Simple upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload', details: error },
      { status: 500 }
    )
  }
}