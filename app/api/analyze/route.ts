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
              text: `Analyze this image and provide a detailed description focusing on:
              1. Overall mood and emotional feeling (cold, warm, aggressive, soft, etc.)
              2. Energy level (low, medium, high)
              3. Texture and visual characteristics (smooth, rough, grainy, sharp, etc.)
              4. Color temperature and dominant colors
              5. Any abstract concepts or feelings it evokes
              
              Based on this analysis, suggest what type of kick drum would match this image.
              Consider characteristics like: brightness (0-100), warmth (0-100), punch (0-100), decay (0-100), and tonal character.
              
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
                  "punch": 50,
                  "decay": 50,
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
          punch: brightness > 60 ? 80 : 60,
          decay: brightness < 40 ? 70 : 40,
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