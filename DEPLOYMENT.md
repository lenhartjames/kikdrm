# Deployment Instructions for IMG→KIK

## Vercel Deployment

### Prerequisites
1. A Vercel account
2. Vercel CLI installed (`npm install -g vercel`)

### Environment Variables Required

The following environment variables need to be set in Vercel:

- `OPENAI_API_KEY` - Your OpenAI API key for GPT-4 Vision
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Manual Deployment Steps

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. When prompted, set up the environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable listed above

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select the GitHub repository: `lenhartjames/kikdrm`
4. Configure the environment variables
5. Click "Deploy"

### GitHub Repository

The code is available at: https://github.com/lenhartjames/kikdrm

### Local Development

To run locally with environment variables:

1. Copy `.env.local.example` to `.env.local`
2. Fill in your environment variables
3. Run `npm install`
4. Run `npm run dev`

The app will be available at http://localhost:3000