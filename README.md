# KickMatch - AI-Powered Image to Kick Drum Matcher

An innovative application that analyzes uploaded images and matches them to appropriate kick drum samples using AI vision analysis and audio synthesis.

## Features

- **Image Upload & Analysis**: Upload images in various formats (JPG, PNG, WebP, AVIF, SVG, HEIC)
- **AI-Powered Matching**: Uses GPT-4 Vision to analyze mood, texture, and characteristics
- **100+ Kick Drum Library**: Curated collection of kick samples with detailed metadata
- **Step Sequencer**: 32-step drum machine interface for pattern creation
- **Audio Plugin Aesthetic**: Professional audio plugin-inspired UI design
- **Real-time Playback**: Preview and download matched samples instantly

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom audio plugin theme
- **Database**: Supabase (PostgreSQL + Vector embeddings)
- **AI/ML**: OpenAI GPT-4 Vision via Vercel AI SDK
- **Audio**: Tone.js, Web Audio API
- **Image Processing**: Sharp, ExifReader

## Prerequisites

1. Node.js 18+ and npm
2. OpenAI API key
3. Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env.local` file with your credentials:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the contents of `supabase/schema.sql`

3. Seed the kick drum samples:
   - Run the contents of `supabase/seed.sql`

4. Create a storage bucket:
   - Go to Storage in Supabase dashboard
   - Create a new bucket called "images"
   - Set it to public

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
img-to-kik/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── upload/        # Image upload & AI analysis
│   ├── globals.css        # Global styles & plugin theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ImageUploadSection.tsx
│   ├── KickPreviewSection.tsx
│   └── StepSequencer.tsx
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   └── utils.ts          # Helper functions
├── types/                # TypeScript definitions
├── public/               # Static assets
│   └── samples/          # Kick drum audio files
└── supabase/             # Database schema & seeds
```

## How It Works

1. **Image Upload**: User uploads an image through drag-and-drop or file selection
2. **Metadata Extraction**: EXIF data and color information extracted using Sharp
3. **AI Analysis**: GPT-4 Vision analyzes mood, texture, energy, and suggests kick characteristics
4. **Matching Algorithm**: Compares AI suggestions with kick drum library metadata
5. **Sample Selection**: Returns the best matching kick drum with confidence score
6. **Playback & Download**: User can preview, download, and use the sample in the sequencer

## Development Notes

### Adding Kick Drum Samples

1. Place audio files in `public/samples/`
2. Update `supabase/seed.sql` with metadata
3. Run the seed script in Supabase SQL editor

### Customizing the Matching Algorithm

Edit the matching logic in `app/api/upload/route.ts`:
- Adjust weight factors for different characteristics
- Add new matching criteria
- Implement embedding-based similarity search

### UI Theme Customization

Modify the plugin aesthetic in:
- `tailwind.config.ts` - Color scheme and theme extensions
- `app/globals.css` - Component styles and animations

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Production Checklist

- [ ] Set up production Supabase instance
- [ ] Configure CORS and security headers
- [ ] Enable rate limiting on API routes
- [ ] Set up monitoring and analytics
- [ ] Optimize image and audio file sizes
- [ ] Implement caching strategy

## Future Enhancements

- Multi-sample layering
- MIDI export functionality
- User accounts and saved projects
- Social sharing features
- VST plugin version
- Mobile app development

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.